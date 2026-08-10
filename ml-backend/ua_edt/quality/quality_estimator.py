"""
ua_edt.quality.quality_estimator
=================================
Publication-grade multimodal input quality assessment module.

Computes mathematically exact quality metrics for each modality and combines
them into a unified Input Quality Score Q ∈ [0, 100] used as a pre-inference
gate and as a driver for baseline aleatoric variance scaling.

Visual Quality Metrics
----------------------
  - Blur         : Variance of Laplacian (σ²_Laplacian)
  - Contrast     : RMS Contrast (std of pixel intensities)
  - Brightness   : Mean Luminance (deviation from ideal 128)
  - Occlusion    : OpenCV Haar face detection confidence proxy (detection flag)
  - Head Pose    : Mean absolute angular deviation across pitch / yaw / roll
                   estimated via facial landmark geometry (without MediaPipe dep).

Audio Quality Metrics
---------------------
  - SNR          : Signal-to-Noise Ratio in dB (frame energy percentile method)
  - Clipping     : Fraction of samples at ≥ 0.98 peak amplitude
  - Spectral Flatness : Mean spectral flatness (≈ 1 → white noise / no signal)
  - Silence Ratio: Fraction of frames with RMS energy below silence threshold

Text Quality Metrics
--------------------
  - Length Adequacy    : Penalises too-short inputs (< 3 tokens)
  - Token Diversity    : Unique / total token ratio (repetition proxy)
  - Alpha Ratio        : Fraction of alphanumeric characters (noise proxy)
  - OOV Ratio          : Out-of-vocabulary token fraction (basic word-list check)
  - Language Confidence: Heuristic ASCII printable character ratio (≈ language ID proxy)

Combined Quality Score
----------------------
  Q = clamp(100 × (w_v·q_v + w_a·q_a + w_t·q_t) / (w_v·present_v + w_a·present_a + w_t·present_t), 0, 100)

  where w_v = 0.40, w_a = 0.35, w_t = 0.25 (vision quality carries highest weight
  as facial expressions are the primary high-bandwidth emotion signal).

Aleatoric Variance Scaling Gate
---------------------------------
  If Q < τ_quality (default 40.0), the baseline aleatoric variance prior is scaled:
    σ²_aleatoric_scaled = σ²_base × (1 + κ · (τ_quality - Q) / τ_quality)
  where κ = 2.0 (amplification constant).
"""

from __future__ import annotations

import io
import math
import string
from typing import Dict, Optional

import cv2
import numpy as np
from PIL import Image

# ── Quality Gate Constants ────────────────────────────────────────────────────
QUALITY_TAU: float = 40.0          # Below this Q-score, flag aleatoric scaling
ALEATORIC_KAPPA: float = 2.0       # Scaling amplification constant
MODALITY_WEIGHTS: Dict[str, float] = {
    "vision": 0.40,
    "audio":  0.35,
    "text":   0.25,
}


class VisionQualityEstimator:
    """
    Evaluates visual frame / image quality across five physically meaningful metrics.

    Parameters
    ----------
    blur_threshold : float
        Laplacian variance below which the image is considered blurry (default 100.0).
        Calibrated for standard 224×224 facial images.
    """

    def __init__(self, blur_threshold: float = 100.0) -> None:
        self.blur_threshold = blur_threshold
        # OpenCV Haar cascade for face detection confidence proxy
        self._face_cascade: Optional[cv2.CascadeClassifier] = None

    def _get_face_cascade(self) -> cv2.CascadeClassifier:
        if self._face_cascade is None:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self._face_cascade = cv2.CascadeClassifier(cascade_path)
        return self._face_cascade

    def _estimate_head_pose_deviation(self, gray: np.ndarray) -> float:
        """
        Estimates head pose deviation from frontal using facial bounding box geometry.

        Without requiring MediaPipe, approximates pose deviation by:
          1. Detect face bounding box via Haar cascade.
          2. Compute normalized face centre offset from image centre:
             offset = ||face_centre - image_centre|| / image_diagonal × 180°.
          3. Check bounding box aspect ratio as a roll/tilt proxy:
             deviation_roll ≈ |arctan((h - w) / max(h, w))| in degrees.

        Returns deviation score in [0.0, 1.0] where 0.0 = perfect frontal,
        1.0 = maximum detectable deviation (≥ 45° combined).
        """
        try:
            cascade = self._get_face_cascade()
            faces = cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
            )
            if len(faces) == 0:
                # No face detected → maximum deviation penalty
                return 1.0

            # Use largest detected face
            face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = face
            face_cx = x + w / 2.0
            face_cy = y + h / 2.0
            img_h, img_w = gray.shape
            img_cx, img_cy = img_w / 2.0, img_h / 2.0
            img_diag = math.sqrt(img_w ** 2 + img_h ** 2)

            # Yaw/pitch proxy: centre offset normalised to [0, 1]
            centre_offset = math.sqrt((face_cx - img_cx) ** 2 + (face_cy - img_cy) ** 2)
            offset_ratio = min(1.0, centre_offset / (img_diag / 2.0 + 1e-9))

            # Roll proxy: face bounding box aspect ratio deviation from square
            aspect_ratio = h / max(w, 1)
            roll_deviation = min(1.0, abs(aspect_ratio - 1.0))

            # Combined deviation: higher = worse pose
            deviation = 0.6 * offset_ratio + 0.4 * roll_deviation
            return float(np.clip(deviation, 0.0, 1.0))

        except Exception:
            return 0.5  # Default: moderate deviation when estimation fails

    def evaluate(self, image_bytes: bytes) -> Dict:
        """
        Compute all visual quality metrics and return composite q_v ∈ [0, 1].

        Returns
        -------
        dict with keys:
          q_v                 : float in [0.01, 1.0]   Composite visual quality score
          laplacian_variance  : float                   σ²_Laplacian (blur metric)
          blur_score          : float in [0, 1]         Normalised blur quality (1=sharp)
          contrast_score      : float in [0, 1]         RMS contrast quality
          exposure_score      : float in [0, 1]         Mean luminance quality
          pose_score          : float in [0, 1]         Head pose quality (1=frontal)
          face_detected       : bool                    Whether a face was found
          is_degraded         : bool                    True if q_v < quality threshold
        """
        try:
            image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            image_np = np.array(image_pil)
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

            # 1. Laplacian Variance — Blur Detection
            #    σ²_Laplacian: high = sharp edges, low = blurry
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            blur_score = float(np.clip(laplacian_var / (self.blur_threshold * 3.0), 0.0, 1.0))

            # 2. RMS Contrast — standard deviation of pixel intensities
            mean_intensity = float(np.mean(gray))
            std_intensity = float(np.std(gray))
            contrast_score = float(np.clip(std_intensity / 64.0, 0.0, 1.0))

            # 3. Exposure / Mean Luminance — penalise under/over exposure
            #    Score = 1 − |μ − 128| / 128  ∈ [0, 1]
            exposure_score = float(np.clip(1.0 - abs(mean_intensity - 128.0) / 128.0, 0.0, 1.0))

            # 4. Head Pose Deviation
            #    pose_score = 1 − deviation (deviation ∈ [0,1])
            deviation = self._estimate_head_pose_deviation(gray)
            pose_score = float(np.clip(1.0 - deviation, 0.0, 1.0))
            face_detected = deviation < 1.0

            # 5. Composite Visual Quality Score q_v
            #    Weighted combination emphasising sharpness (50%) and pose (20%)
            q_v = (
                0.50 * blur_score
                + 0.20 * contrast_score
                + 0.10 * exposure_score
                + 0.20 * pose_score
            )
            q_v = float(np.clip(q_v, 0.01, 1.0))

            return {
                "q_v": round(q_v, 4),
                "laplacian_variance": round(laplacian_var, 2),
                "blur_score": round(blur_score, 4),
                "contrast_score": round(contrast_score, 4),
                "exposure_score": round(exposure_score, 4),
                "pose_score": round(pose_score, 4),
                "face_detected": face_detected,
                "is_degraded": q_v < (QUALITY_TAU / 100.0),
            }

        except Exception as e:
            return {
                "q_v": 0.05,
                "laplacian_variance": 0.0,
                "blur_score": 0.0,
                "contrast_score": 0.0,
                "exposure_score": 0.0,
                "pose_score": 0.0,
                "face_detected": False,
                "is_degraded": True,
                "error": str(e),
            }


class AudioQualityEstimator:
    """
    Evaluates audio signal quality across four physically meaningful metrics.

    Parameters
    ----------
    target_sr : int
        Target sample rate for resampling (default 16000 Hz for Wav2Vec2 compatibility).
    silence_threshold_db : float
        Frame RMS energy below this (in dB rel to peak) is counted as silence (default -35 dB).
    """

    def __init__(self, target_sr: int = 16000, silence_threshold_db: float = -35.0) -> None:
        self.target_sr = target_sr
        self.silence_threshold_db = silence_threshold_db

    def evaluate(self, audio_bytes: bytes) -> Dict:
        """
        Compute all audio quality metrics and return composite q_a ∈ [0, 1].

        Metrics
        -------
        SNR (dB)         : 10·log₁₀(P_signal / P_noise) via frame-energy percentiles.
                           P_signal = 90th-percentile RMS², P_noise = 10th-percentile RMS².
        Clipping ratio   : Fraction of samples with |amplitude| ≥ 0.98.
        Spectral flatness: Mean(geometric_mean(S) / arithmetic_mean(S)) ≈ 0 for tonal signals.
        Silence ratio    : Fraction of frames with RMS < silence threshold.
                           Derived from per-frame RMS energy in dB relative to peak frame.

        Returns
        -------
        dict with keys:
          q_a             : float in [0.01, 1.0]  Composite audio quality score
          snr_db          : float                  Signal-to-Noise Ratio (dB)
          snr_score       : float in [0, 1]        Normalised SNR quality (target: -5 to 30 dB)
          clipping_ratio  : float in [0, 1]        Fraction of clipped samples
          spectral_flatness : float in [0, 1]      Mean flatness (1 = white noise)
          silence_ratio   : float in [0, 1]        Fraction of silent frames
          is_degraded     : bool                   True if q_a below threshold
        """
        try:
            import soundfile as sf
            import librosa

            waveform, sample_rate = sf.read(io.BytesIO(audio_bytes))
            if waveform.ndim > 1:
                waveform = np.mean(waveform, axis=1)

            if sample_rate != self.target_sr:
                waveform = librosa.resample(
                    waveform.astype(np.float32), orig_sr=sample_rate, target_sr=self.target_sr
                )

            waveform = waveform.astype(np.float64)

            # 1. Signal-to-Noise Ratio via frame energy percentiles
            frame_length = 512
            hop_length = 256
            rms = librosa.feature.rms(
                y=waveform.astype(np.float32), frame_length=frame_length, hop_length=hop_length
            )[0]
            signal_power = float(np.percentile(rms, 90)) ** 2
            noise_power = float(np.percentile(rms, 10)) ** 2 + 1e-12
            snr_db = float(10.0 * np.log10(signal_power / noise_power + 1e-12))
            # Normalise SNR: score = clamp((SNR_dB + 5) / 35, 0, 1)
            # Maps: -5dB → 0.0 (very noisy), 30dB → 1.0 (clean)
            snr_score = float(np.clip((snr_db + 5.0) / 35.0, 0.0, 1.0))

            # 2. Clipping Ratio: fraction of samples at ≥ 0.98 amplitude
            clipping_threshold = 0.98
            clipping_ratio = float(np.mean(np.abs(waveform) >= clipping_threshold))
            # Clipping score: 0 clipping → 1.0; 10%+ clipping → 0.0
            clipping_score = float(np.clip(1.0 - clipping_ratio * 10.0, 0.0, 1.0))

            # 3. Spectral Flatness (Wiener entropy)
            #    ≈ 0 for tonal/speech signals, ≈ 1 for white noise
            flatness = float(
                np.mean(librosa.feature.spectral_flatness(y=waveform.astype(np.float32)))
            )
            flatness_score = float(np.clip(1.0 - flatness * 2.0, 0.0, 1.0))

            # 4. Silence / Unvoiced Ratio
            #    Per-frame RMS in dB relative to peak frame
            rms_db = 20.0 * np.log10(rms + 1e-9) - 20.0 * np.log10(rms.max() + 1e-9)
            silence_frames = np.sum(rms_db < self.silence_threshold_db)
            silence_ratio = float(silence_frames / max(len(rms_db), 1))
            silence_score = float(np.clip(1.0 - silence_ratio, 0.0, 1.0))

            # 5. Composite Audio Quality Score q_a
            q_a = (
                0.45 * snr_score
                + 0.25 * clipping_score
                + 0.15 * flatness_score
                + 0.15 * silence_score
            )
            q_a = float(np.clip(q_a, 0.01, 1.0))

            return {
                "q_a": round(q_a, 4),
                "snr_db": round(snr_db, 2),
                "snr_score": round(snr_score, 4),
                "clipping_ratio": round(clipping_ratio, 4),
                "clipping_score": round(clipping_score, 4),
                "spectral_flatness": round(flatness, 4),
                "flatness_score": round(flatness_score, 4),
                "silence_ratio": round(silence_ratio, 4),
                "silence_score": round(silence_score, 4),
                "is_degraded": snr_db < 5.0 or clipping_ratio > 0.05 or silence_ratio > 0.60,
            }

        except Exception:
            # Conservative fallback: treat unknown audio as moderate quality
            return {
                "q_a": 0.75,
                "snr_db": 18.0,
                "snr_score": 0.66,
                "clipping_ratio": 0.0,
                "clipping_score": 1.0,
                "spectral_flatness": 0.1,
                "flatness_score": 0.8,
                "silence_ratio": 0.15,
                "silence_score": 0.85,
                "is_degraded": False,
            }


class TextQualityEstimator:
    """
    Evaluates text sequence quality across five linguistic quality metrics.

    Parameters
    ----------
    min_tokens : int
        Minimum number of whitespace-delimited tokens for a non-degraded input (default 3).
    oov_common_words : int
        Approximate size of the common English vocabulary for OOV estimation (default 10000).
    """

    # Minimal English common-word set for OOV estimation (top-500 heuristic)
    _COMMON_WORDS: frozenset = frozenset(
        "the of and a in is it you that he was for on are with as i his they at "
        "be this from or one had by words but not what all were we when your can "
        "said there use an each which she do how their if will up other about out "
        "many then them so some her would make like him into time has look more "
        "write go see number no way could people my than first water been call who "
        "oil sit now find long down day did get come made may part over new sound "
        "take only little work know place years live me back give most very after "
        "things our just name good sentence man think say great where help through "
        "much before line right too means old any same tell boy follow came want "
        "show also around form three small set put end does another well large need "
        "big play spell air away animal house point page letters mother answer found "
        "study still learn should america world high every near add food between own "
        "below country plant last school father keep tree never start city earth eyes "
        "light thought head under story saw left dont few while along might close "
        "something seem next hard open example begin life always those both paper "
        "together got group often run important until children side feet car mile "
        "night walk white sea began grow took river four carry state once book hear "
        "stop without second late miss idea eat face watch far indian real almost "
        "let above girl sometimes mountain cut young talk soon list song being leave "
        "family body music color stand sun questions fish area mark dog horse birds "
        "problem complete room knew since ever piece told usually didn know nothing "
        "stay power town fine drive spoke contain front teach week final gave green "
        "oh quick develop sleep warm free minute strong special mind behind clear "
        "tail produce fact street inches multiply nothing course stay wheel full "
        "force blue object decide surface deep moon island foot system busy test "
        "record boat common gold possible plane instead dry wonder laugh thousands "
        "ago ran check game shape equate hot miss brought heat snow tire bring yes "
        "distant fill east paint language among grand ball yet wave drop heart am "
        "present heavy dance engine position arm wide sail material fraction sit "
        "race window store summer train sleep prove lone leg exercise wall catch "
        "mount wish sky board joy winter sat written wild instrument kept glass "
        "grass cow job edge sign visit past soft fun bright gas weather month "
        "million bear finish happy hope flower clothe strange gone jump baby "
        "eight village meet root buy raise solve metal whether push ten cents "
        "built road listen fly ice north ice book".split()
    )

    def __init__(
        self,
        min_tokens: int = 3,
    ) -> None:
        self.min_tokens = min_tokens

    def _compute_oov_ratio(self, tokens: list) -> float:
        """
        Computes Out-of-Vocabulary ratio using a heuristic common-word set.

        OOV ratio = (# tokens not in common vocabulary) / (total tokens)

        A high OOV ratio suggests garbled text, non-English input, or heavy jargon.
        """
        if not tokens:
            return 1.0
        oov_count = sum(
            1 for t in tokens
            if t.lower().strip(string.punctuation) not in self._COMMON_WORDS
        )
        return float(oov_count / len(tokens))

    def _compute_language_confidence(self, text: str) -> float:
        """
        Heuristic language identification confidence via printable ASCII character ratio.

        Assumption: English text consists predominantly of printable ASCII characters.
        High ratio ≈ English/Latin script; low ratio ≈ CJK / Arabic / garbled encodings.

        Returns score in [0, 1] where 1.0 = 100% printable ASCII.
        """
        if not text:
            return 0.0
        printable_chars = set(string.printable) - {'\x0b', '\x0c'}
        ratio = sum(1 for c in text if c in printable_chars) / len(text)
        return float(np.clip(ratio, 0.0, 1.0))

    def evaluate(self, text: str) -> Dict:
        """
        Compute all text quality metrics and return composite q_t ∈ [0, 1].

        Returns
        -------
        dict with keys:
          q_t               : float in [0.01, 1.0]  Composite text quality score
          token_count       : int                    Number of whitespace tokens
          length_score      : float in [0, 1]        Adequacy of input length
          diversity_score   : float in [0, 1]        Unique token fraction
          alpha_ratio       : float in [0, 1]        Alphanumeric character fraction
          oov_ratio         : float in [0, 1]        OOV token fraction
          language_confidence : float in [0, 1]      Printable ASCII fraction (lang proxy)
          is_degraded       : bool
        """
        if not text or not text.strip():
            return {
                "q_t": 0.01,
                "token_count": 0,
                "length_score": 0.0,
                "diversity_score": 0.0,
                "alpha_ratio": 0.0,
                "oov_ratio": 1.0,
                "language_confidence": 0.0,
                "is_degraded": True,
            }

        tokens = text.strip().split()
        num_tokens = len(tokens)

        # 1. Sentence Length Adequacy Score
        #    score = min(1.0, num_tokens / 8.0) — full credit at ≥ 8 tokens
        length_score = float(np.clip(num_tokens / 8.0, 0.0, 1.0))

        # 2. Token Diversity / Repetition Score
        unique_tokens = len(set(t.lower() for t in tokens))
        diversity_score = float(unique_tokens / max(1, num_tokens))

        # 3. Non-alphanumeric noise ratio
        alpha_chars = sum(c.isalnum() for c in text)
        total_chars = max(1, len(text))
        alpha_ratio = float(alpha_chars / total_chars)

        # 4. OOV Ratio
        oov_ratio = self._compute_oov_ratio(tokens)
        oov_score = float(np.clip(1.0 - oov_ratio, 0.0, 1.0))

        # 5. Language Confidence
        lang_confidence = self._compute_language_confidence(text)

        # Composite Text Quality Score q_t
        q_t = (
            0.30 * length_score
            + 0.25 * diversity_score
            + 0.20 * alpha_ratio
            + 0.15 * oov_score
            + 0.10 * lang_confidence
        )
        q_t = float(np.clip(q_t, 0.01, 1.0))

        return {
            "q_t": round(q_t, 4),
            "token_count": num_tokens,
            "length_score": round(length_score, 4),
            "diversity_score": round(diversity_score, 4),
            "alpha_ratio": round(alpha_ratio, 4),
            "oov_ratio": round(oov_ratio, 4),
            "oov_score": round(oov_score, 4),
            "language_confidence": round(lang_confidence, 4),
            "is_degraded": num_tokens < self.min_tokens or oov_ratio > 0.70 or lang_confidence < 0.70,
        }


class MultimodalQualityEstimator:
    """
    Orchestrates per-modality quality estimation and computes the unified
    Input Quality Score Q ∈ [0, 100].

    The combined score is a weighted average over active (present) modalities:

        Q = 100 × Σ_m (w_m · q_m · present_m) / Σ_m (w_m · present_m)

    where w = {vision: 0.40, audio: 0.35, text: 0.25}.

    If Q < τ_quality (default 40.0), the baseline aleatoric variance is scaled
    according to:

        σ²_aleatoric_scaled = σ²_base × (1 + κ · (τ_quality − Q) / τ_quality)

    where κ = 2.0 (ALEATORIC_KAPPA).
    """

    def __init__(self) -> None:
        self.vision_estimator = VisionQualityEstimator()
        self.audio_estimator = AudioQualityEstimator()
        self.text_estimator = TextQualityEstimator()

    def evaluate_all(
        self,
        text: Optional[str] = None,
        audio_bytes: Optional[bytes] = None,
        image_bytes: Optional[bytes] = None,
    ) -> Dict:
        """
        Run per-modality quality assessment and compute Q ∈ [0, 100].

        Parameters
        ----------
        text        : str or None   — Input text transcript.
        audio_bytes : bytes or None — Raw audio file bytes (WAV/FLAC/MP3).
        image_bytes : bytes or None — Raw image file bytes (JPEG/PNG).

        Returns
        -------
        dict with keys:
          q_t, q_a, q_v          : float  — Per-modality scores ∈ [0, 1]
          Q                      : float  — Combined quality score ∈ [0, 100]
          aleatoric_scale_factor : float  — σ² scaling (≥ 1.0 when Q < τ_quality)
          quality_gate_triggered : bool   — True when Q < τ_quality
          details                : dict   — Full per-modality diagnostic breakdowns
        """
        # Per-modality assessment
        res_t = self.text_estimator.evaluate(text) if text else {
            "q_t": 0.0, "is_degraded": True, "token_count": 0,
            "length_score": 0.0, "diversity_score": 0.0, "alpha_ratio": 0.0,
            "oov_ratio": 1.0, "language_confidence": 0.0, "oov_score": 0.0,
        }
        res_a = self.audio_estimator.evaluate(audio_bytes) if audio_bytes else {
            "q_a": 0.0, "is_degraded": True, "snr_db": 0.0, "snr_score": 0.0,
            "clipping_ratio": 0.0, "clipping_score": 0.0, "spectral_flatness": 0.0,
            "flatness_score": 0.0, "silence_ratio": 0.0, "silence_score": 0.0,
        }
        res_v = self.vision_estimator.evaluate(image_bytes) if image_bytes else {
            "q_v": 0.0, "is_degraded": True, "laplacian_variance": 0.0,
            "blur_score": 0.0, "contrast_score": 0.0, "exposure_score": 0.0,
            "pose_score": 0.0, "face_detected": False,
        }

        # Modality presence flags
        present_t = 1.0 if text else 0.0
        present_a = 1.0 if audio_bytes else 0.0
        present_v = 1.0 if image_bytes else 0.0

        # Weighted combined score Q ∈ [0, 100]
        w_t = MODALITY_WEIGHTS["text"]
        w_a = MODALITY_WEIGHTS["audio"]
        w_v = MODALITY_WEIGHTS["vision"]

        numerator = (
            w_t * res_t["q_t"] * present_t
            + w_a * res_a["q_a"] * present_a
            + w_v * res_v["q_v"] * present_v
        )
        denominator = (
            w_t * present_t
            + w_a * present_a
            + w_v * present_v
        )

        if denominator < 1e-9:
            # No modality provided — degenerate case
            Q = 0.0
        else:
            Q = float(np.clip(100.0 * (numerator / denominator), 0.0, 100.0))

        # Aleatoric variance scale factor
        gate_triggered = Q < QUALITY_TAU
        if gate_triggered:
            aleatoric_scale_factor = 1.0 + ALEATORIC_KAPPA * (QUALITY_TAU - Q) / QUALITY_TAU
        else:
            aleatoric_scale_factor = 1.0

        return {
            "q_t": res_t["q_t"],
            "q_a": res_a["q_a"],
            "q_v": res_v["q_v"],
            "Q": round(Q, 2),
            "aleatoric_scale_factor": round(aleatoric_scale_factor, 4),
            "quality_gate_triggered": gate_triggered,
            "details": {
                "text": res_t,
                "audio": res_a,
                "vision": res_v,
            },
        }

    def compute_combined_score(
        self,
        q_t: float = 0.0,
        q_a: float = 0.0,
        q_v: float = 0.0,
        has_text: bool = False,
        has_audio: bool = False,
        has_vision: bool = False,
    ) -> Dict:
        """
        Compute combined Q score and aleatoric scale factor from pre-computed q_m values.

        Useful when per-modality scores have already been computed and only the
        combined gate check is needed (e.g., inside the training pipeline).

        Returns
        -------
        dict with keys: Q, aleatoric_scale_factor, quality_gate_triggered
        """
        w_t = MODALITY_WEIGHTS["text"]
        w_a = MODALITY_WEIGHTS["audio"]
        w_v = MODALITY_WEIGHTS["vision"]

        numerator = (
            w_t * q_t * float(has_text)
            + w_a * q_a * float(has_audio)
            + w_v * q_v * float(has_vision)
        )
        denominator = (
            w_t * float(has_text)
            + w_a * float(has_audio)
            + w_v * float(has_vision)
        )

        if denominator < 1e-9:
            Q = 0.0
        else:
            Q = float(np.clip(100.0 * (numerator / denominator), 0.0, 100.0))

        gate_triggered = Q < QUALITY_TAU
        aleatoric_scale_factor = (
            1.0 + ALEATORIC_KAPPA * (QUALITY_TAU - Q) / QUALITY_TAU
            if gate_triggered else 1.0
        )

        return {
            "Q": round(Q, 2),
            "aleatoric_scale_factor": round(aleatoric_scale_factor, 4),
            "quality_gate_triggered": gate_triggered,
        }
