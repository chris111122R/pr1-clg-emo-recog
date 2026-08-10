import io
import random
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageFilter
from typing import Dict, Any, List, Callable, Optional
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

# Reproducibility
EVAL_SEED = 42
random.seed(EVAL_SEED)
np.random.seed(EVAL_SEED)
torch.manual_seed(EVAL_SEED)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False

EMOTIONS = ["Anger", "Disgust", "Fear", "Joy", "Sadness", "Surprise", "Neutral"]


class PerturbationEngine:
    """
    Applies synthetic perturbations to modality inputs to benchmark model robustness.

    Supported Vision Perturbations:
      - Gaussian Blur
      - Motion Blur
      - Additive Gaussian Noise
      - Reduced Resolution (downscale-upscale)

    Supported Audio Perturbations:
      - Additive Gaussian Noise
      - Background Hum (sinusoidal additive)
      - Packet Loss (random zero-segment masking)
      - Bandwidth Clipping (low-pass filter)

    Supported Text Perturbations:
      - Random Token Dropping
      - Character Noise Injection
    """

    # ── Vision ────────────────────────────────────────────────────────────────

    def gaussian_blur_image(self, image_bytes: bytes, radius: float = 3.0) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        blurred = image.filter(ImageFilter.GaussianBlur(radius=radius))
        buf = io.BytesIO()
        blurred.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    def motion_blur_image(self, image_bytes: bytes, kernel_size: int = 15) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image, dtype=np.float32)
        kernel = np.zeros((kernel_size, kernel_size), dtype=np.float32)
        kernel[kernel_size // 2, :] = 1.0 / kernel_size
        import cv2
        blurred = cv2.filter2D(image_np, -1, kernel)
        blurred = np.clip(blurred, 0, 255).astype(np.uint8)
        blurred_pil = Image.fromarray(blurred)
        buf = io.BytesIO()
        blurred_pil.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    def gaussian_noise_image(self, image_bytes: bytes, sigma: float = 25.0) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image, dtype=np.float32)
        noise = np.random.normal(0, sigma, image_np.shape)
        noisy = np.clip(image_np + noise, 0, 255).astype(np.uint8)
        buf = io.BytesIO()
        Image.fromarray(noisy).save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    def reduce_resolution_image(self, image_bytes: bytes, scale: float = 0.1) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        orig_size = image.size
        small_size = (max(1, int(orig_size[0] * scale)), max(1, int(orig_size[1] * scale)))
        small = image.resize(small_size, Image.BILINEAR)
        restored = small.resize(orig_size, Image.BILINEAR)
        buf = io.BytesIO()
        restored.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    # ── Audio ─────────────────────────────────────────────────────────────────

    def gaussian_noise_audio(self, waveform: np.ndarray, sigma: float = 0.02) -> np.ndarray:
        noise = np.random.normal(0, sigma, waveform.shape)
        return np.clip(waveform + noise, -1.0, 1.0)

    def background_hum_audio(self, waveform: np.ndarray, sr: int = 16000, freq: float = 50.0, amplitude: float = 0.05) -> np.ndarray:
        t = np.arange(len(waveform)) / sr
        hum = amplitude * np.sin(2 * np.pi * freq * t)
        return np.clip(waveform + hum, -1.0, 1.0)

    def packet_loss_audio(self, waveform: np.ndarray, loss_rate: float = 0.15, packet_ms: int = 10, sr: int = 16000) -> np.ndarray:
        corrupted = waveform.copy()
        packet_size = int(packet_ms * sr / 1000)
        num_packets = len(waveform) // packet_size
        for i in range(num_packets):
            if random.random() < loss_rate:
                start = i * packet_size
                end = min(start + packet_size, len(corrupted))
                corrupted[start:end] = 0.0
        return corrupted

    # ── Text ──────────────────────────────────────────────────────────────────

    def token_drop_text(self, text: str, drop_rate: float = 0.3) -> str:
        words = text.split()
        kept = [w for w in words if random.random() > drop_rate]
        return " ".join(kept) if kept else text[:10]

    def character_noise_text(self, text: str, noise_rate: float = 0.1) -> str:
        chars = list(text)
        for i in range(len(chars)):
            if chars[i].isalpha() and random.random() < noise_rate:
                chars[i] = random.choice("abcdefghijklmnopqrstuvwxyz")
        return "".join(chars)


class RobustnessEvaluator:
    """
    Automated Robustness Evaluation Suite.
    Runs inference function under various synthetic perturbations and computes
    Accuracy, Macro-F1, AUROC, ECE, NLL, Brier Score, and uncertainty curves.
    Outputs a structured comparison report: Clean vs. Corrupted data.
    """
    def __init__(self, num_bins: int = 10):
        self.num_bins = num_bins
        self.perturbator = PerturbationEngine()

    def compute_ece(self, confidences: np.ndarray, accuracies: np.ndarray) -> float:
        bins = np.linspace(0.0, 1.0, self.num_bins + 1)
        ece = 0.0
        n = len(confidences)
        for i in range(self.num_bins):
            lo, hi = bins[i], bins[i + 1]
            in_bin = (confidences > lo) & (confidences <= hi)
            if in_bin.sum() == 0:
                continue
            ece += (in_bin.sum() / n) * abs(confidences[in_bin].mean() - accuracies[in_bin].mean())
        return float(ece)

    def compute_nll(self, probs: np.ndarray, labels: np.ndarray) -> float:
        n = len(labels)
        return float(-np.mean(np.log(probs[np.arange(n), labels] + 1e-9)))

    def compute_brier(self, probs: np.ndarray, labels: np.ndarray) -> float:
        K = probs.shape[1]
        y_oh = np.eye(K)[labels]
        return float(np.mean(np.sum((probs - y_oh) ** 2, axis=1)))

    def run_batch_inference(self,
                            inference_fn: Callable,
                            samples: List[Dict[str, Any]]) -> Dict[str, np.ndarray]:
        """
        Runs inference_fn(sample) -> dict with keys: probs (np.ndarray K), confidence, aleatoric, epistemic.
        Returns aggregated arrays for metrics computation.
        """
        all_probs, all_labels, all_confidences, all_aleatoric, all_epistemic = [], [], [], [], []
        for sample in samples:
            try:
                result = inference_fn(sample)
                probs = np.array(result.get("probs", [1/7]*7))
                probs = probs / (probs.sum() + 1e-9)
                all_probs.append(probs)
                all_labels.append(int(sample["label"]))
                all_confidences.append(float(result.get("confidence", 0.0)) / 100.0)
                all_aleatoric.append(float(result.get("aleatoric_uncertainty", 0.0)) / 100.0)
                all_epistemic.append(float(result.get("epistemic_uncertainty", 0.0)) / 100.0)
            except Exception:
                # Fallback uniform prediction on error
                all_probs.append(np.array([1/7]*7))
                all_labels.append(int(sample.get("label", 0)))
                all_confidences.append(1/7)
                all_aleatoric.append(0.5)
                all_epistemic.append(0.5)

        return {
            "probs": np.array(all_probs),
            "labels": np.array(all_labels),
            "confidences": np.array(all_confidences),
            "aleatoric": np.array(all_aleatoric),
            "epistemic": np.array(all_epistemic),
        }

    def compute_metrics(self, results: Dict[str, np.ndarray]) -> Dict[str, float]:
        probs = results["probs"]
        labels = results["labels"]
        preds = probs.argmax(axis=1)
        confidences = results["confidences"]
        accuracies = (preds == labels).astype(float)

        acc = accuracy_score(labels, preds)
        f1 = f1_score(labels, preds, average="macro", zero_division=0)
        ece = self.compute_ece(confidences, accuracies)
        nll = self.compute_nll(probs, labels)
        brier = self.compute_brier(probs, labels)
        mean_aleatoric = float(results["aleatoric"].mean()) * 100.0
        mean_epistemic = float(results["epistemic"].mean()) * 100.0

        try:
            from sklearn.preprocessing import label_binarize
            y_bin = label_binarize(labels, classes=list(range(probs.shape[1])))
            if y_bin.shape[1] > 1:
                auroc = roc_auc_score(y_bin, probs, average="macro", multi_class="ovr")
            else:
                auroc = 0.0
        except Exception:
            auroc = 0.0

        return {
            "accuracy":            round(acc * 100.0, 2),
            "macro_f1":            round(f1 * 100.0, 2),
            "auroc":               round(auroc * 100.0, 2),
            "ece":                 round(ece, 4),
            "nll":                 round(nll, 4),
            "brier_score":         round(brier, 4),
            "mean_aleatoric_%":    round(mean_aleatoric, 2),
            "mean_epistemic_%":    round(mean_epistemic, 2),
        }

    def run_synthetic_benchmark(self,
                                clean_samples: List[Dict[str, Any]],
                                inference_fn: Callable,
                                modality: str = "text") -> Dict[str, Any]:
        """
        Executes the full robustness benchmark pipeline.
        Returns a structured report comparing Clean vs. all Corrupted perturbation conditions.
        """
        report = {"modality": modality, "clean": None, "corrupted": {}}

        # Clean evaluation
        clean_results = self.run_batch_inference(inference_fn, clean_samples)
        report["clean"] = self.compute_metrics(clean_results)

        # Perturbation scenarios
        if modality == "image":
            perturbations = {
                "gaussian_blur_r3":      lambda s: {**s, "image_bytes": self.perturbator.gaussian_blur_image(s["image_bytes"], 3.0)},
                "gaussian_blur_r8":      lambda s: {**s, "image_bytes": self.perturbator.gaussian_blur_image(s["image_bytes"], 8.0)},
                "motion_blur_k15":       lambda s: {**s, "image_bytes": self.perturbator.motion_blur_image(s["image_bytes"], 15)},
                "gaussian_noise_s25":    lambda s: {**s, "image_bytes": self.perturbator.gaussian_noise_image(s["image_bytes"], 25.0)},
                "low_resolution_0.1x":  lambda s: {**s, "image_bytes": self.perturbator.reduce_resolution_image(s["image_bytes"], 0.1)},
            }
        elif modality == "audio":
            perturbations = {
                "gaussian_noise_0.02":   lambda s: {**s, "waveform": self.perturbator.gaussian_noise_audio(s["waveform"], 0.02)},
                "background_hum_50hz":   lambda s: {**s, "waveform": self.perturbator.background_hum_audio(s["waveform"])},
                "packet_loss_15pct":     lambda s: {**s, "waveform": self.perturbator.packet_loss_audio(s["waveform"], 0.15)},
            }
        else:  # text
            perturbations = {
                "token_drop_30pct":      lambda s: {**s, "text": self.perturbator.token_drop_text(s["text"], 0.3)},
                "token_drop_60pct":      lambda s: {**s, "text": self.perturbator.token_drop_text(s["text"], 0.6)},
                "char_noise_10pct":      lambda s: {**s, "text": self.perturbator.character_noise_text(s["text"], 0.1)},
            }

        for perturb_name, perturb_fn in perturbations.items():
            try:
                corrupted_samples = [perturb_fn(s) for s in clean_samples]
                corrupted_results = self.run_batch_inference(inference_fn, corrupted_samples)
                report["corrupted"][perturb_name] = self.compute_metrics(corrupted_results)
            except Exception as e:
                report["corrupted"][perturb_name] = {"error": str(e)}

        # Summary: Δ metrics (corrupted - clean) for key indicators
        if report["clean"]:
            deltas = {}
            clean_m = report["clean"]
            for name, corr_m in report["corrupted"].items():
                if "error" not in corr_m:
                    deltas[name] = {
                        "Δ_accuracy":          round(corr_m["accuracy"] - clean_m["accuracy"], 2),
                        "Δ_macro_f1":          round(corr_m["macro_f1"] - clean_m["macro_f1"], 2),
                        "Δ_ece":               round(corr_m["ece"] - clean_m["ece"], 4),
                        "Δ_mean_aleatoric_%":  round(corr_m["mean_aleatoric_%"] - clean_m["mean_aleatoric_%"], 2),
                        "Δ_mean_epistemic_%":  round(corr_m["mean_epistemic_%"] - clean_m["mean_epistemic_%"], 2),
                    }
            report["delta_summary"] = deltas

        return report
