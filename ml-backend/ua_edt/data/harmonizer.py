"""
ua_edt.data.harmonizer
======================
Publication-grade dataset harmonization module for multimodal emotion recognition.

Implements:
  1. UnifiedEmotionHarmonizer     — Cross-dataset label mapping to 7-class taxonomy.
  2. ClassBalancedFocalLoss       — CB-Focal loss with Effective Number of Samples weighting.
  3. MMDLoss                      — Maximum Mean Discrepancy domain adaptation loss.
  4. SoftLabelConstructor         — Valence/arousal → quadrant soft-label distributions.

Supported Datasets & Label Spaces
----------------------------------
  IEMOCAP   : {ang, exc, fru, hap, neu, sad, sur}          → 7-class taxonomy
  CMU-MOSEI : {anger, disgust, fear, happy, sad, surprise} + continuous (v, a)
  CREMA-D   : {ANG, DIS, FEA, HAP, NEU, SAD}               → 7-class taxonomy
  AffectNet : {0:Neutral,1:Happy,2:Sad,3:Surprise,4:Fear,5:Disgust,6:Anger,7:Contempt}
                → 7-class taxonomy (Contempt merged into Disgust)

Unified Taxonomy Index (API-facing order preserved from legacy codebase)
------------------------------------------------------------------------
  0: Joy       (maps to Happiness / Happy / hap / exc)
  1: Sadness   (maps to sad / SAD)
  2: Anger     (maps to ang / ANG / anger)
  3: Fear      (maps to fea / FEA / fear)
  4: Surprise  (maps to sur / surprise / Surprise)
  5: Disgust   (maps to dis / DIS / disgust / Contempt)
  6: Neutral   (maps to neu / NEU / Neutral)

NOTE: The API-facing label `Joy` is synonymous with `Happiness` across all datasets.
      This preserves backward compatibility with existing endpoint contracts.

References
----------
  - Kollias, D. et al., "Deep Affect Prediction in-the-Wild", ECCV 2020.
  - Zadeh, A. et al., "CMU-MOSI / CMU-MOSEI", ACL 2016 / NAACL 2018.
  - Cao, H. et al., "CREMA-D", TAFF 2014.
  - Busso, C. et al., "IEMOCAP", Journal on Language Resources and Evaluation, 2008.
  - Cui, Y. et al., "Class-Balanced Loss Based on Effective Number of Samples", CVPR 2019.
  - Gretton, A. et al., "A Kernel Two-Sample Test", JMLR 2012.
"""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

# ── Unified 7-Class Taxonomy ─────────────────────────────────────────────────

UNIFIED_EMOTIONS: List[str] = [
    "Joy",       # idx 0 — synonymous with Happiness
    "Sadness",   # idx 1
    "Anger",     # idx 2
    "Fear",      # idx 3
    "Surprise",  # idx 4
    "Disgust",   # idx 5
    "Neutral",   # idx 6
]

UNIFIED_EMOTION_TO_IDX: Dict[str, int] = {e: i for i, e in enumerate(UNIFIED_EMOTIONS)}
NUM_CLASSES: int = len(UNIFIED_EMOTIONS)

# ── Per-Dataset Raw-Label → Unified Taxonomy Maps ────────────────────────────

# IEMOCAP: original categorical labels
_IEMOCAP_MAP: Dict[str, int] = {
    "hap": 0,   # happiness → Joy
    "exc": 0,   # excited   → Joy (strong positive valence)
    "sad": 1,   # sadness   → Sadness
    "ang": 2,   # anger     → Anger
    "fru": 2,   # frustrated→ Anger (highest categorical overlap per literature)
    "fea": 3,   # fear      → Fear
    "sur": 4,   # surprise  → Surprise
    "dis": 5,   # disgust   → Disgust
    "neu": 6,   # neutral   → Neutral
    "oth": 6,   # other     → Neutral (fallback)
}

# CMU-MOSEI: 6-class categorical labels
_MOSEI_CATEGORICAL_MAP: Dict[str, int] = {
    "happy":    0,
    "happiness": 0,
    "sad":      1,
    "sadness":  1,
    "anger":    2,
    "angry":    2,
    "fear":     3,
    "fearful":  3,
    "surprise": 4,
    "disgust":  5,
    "disgusted": 5,
    "neutral":  6,
}

# CREMA-D: 6-class uppercase labels
_CREMAD_MAP: Dict[str, int] = {
    "HAP": 0,
    "SAD": 1,
    "ANG": 2,
    "FEA": 3,
    "DIS": 5,
    "NEU": 6,
}

# AffectNet: integer class IDs 0-7 (7=Contempt merged into Disgust)
_AFFECTNET_MAP: Dict[int, int] = {
    0: 6,  # Neutral   → Neutral
    1: 0,  # Happy     → Joy
    2: 1,  # Sad       → Sadness
    3: 4,  # Surprise  → Surprise
    4: 3,  # Fear      → Fear
    5: 5,  # Disgust   → Disgust
    6: 2,  # Anger     → Anger
    7: 5,  # Contempt  → Disgust (closest categorical match)
}

# GoEmotions (simplified 6-class variant used in text pipeline)
_GOEMO_MAP: Dict[str, int] = {
    "joy":      0,
    "love":     0,
    "sadness":  1,
    "anger":    2,
    "fear":     3,
    "surprise": 4,
    "disgust":  5,
    "neutral":  6,
    "optimism": 0,  # positive → Joy
    "grief":    1,  # grief → Sadness
    "nervousness": 3,  # nervousness → Fear
}

# Valence-Arousal quadrant mapping (CMU-MOSEI / AffectNet continuous targets)
# Quadrant assignment via standard Russell circumplex model:
#   Q1 (v>0, a>0): Joy/Excitement → Joy
#   Q2 (v<0, a>0): Anger/Fear     → Anger (dominant by |a|) or Fear (dominant by |v|)
#   Q3 (v<0, a<0): Sadness/Disgust→ Sadness
#   Q4 (v>0, a<0): Neutral/Calm   → Neutral
_VALENCE_THRESHOLD: float = 0.0
_AROUSAL_THRESHOLD: float = 0.0


# ── UnifiedEmotionHarmonizer ─────────────────────────────────────────────────

class UnifiedEmotionHarmonizer:
    """
    Converts heterogeneous dataset-specific labels into the unified 7-class taxonomy.

    Supports:
      - IEMOCAP   categorical string labels
      - CMU-MOSEI categorical string labels AND continuous (valence, arousal) pairs
      - CREMA-D   uppercase categorical string labels
      - AffectNet integer class IDs 0-7 AND continuous (valence, arousal) pairs
      - GoEmotions simplified text labels

    Parameters
    ----------
    soft_label_temperature : float
        Temperature for smoothing hard → soft label distributions (default 1.0 = hard).
        Values < 1.0 sharpen; > 1.0 smooth (label smoothing effect).
    modality_dropout_prob : float
        Probability of randomly masking a modality during training for missing-modality
        robustness. Applied per-sample in `get_modality_mask()`.
    """

    def __init__(
        self,
        soft_label_temperature: float = 1.0,
        modality_dropout_prob: float = 0.15,
    ) -> None:
        self.soft_label_temperature = soft_label_temperature
        self.modality_dropout_prob = modality_dropout_prob
        self.soft_label_constructor = SoftLabelConstructor(
            num_classes=NUM_CLASSES,
            temperature=soft_label_temperature,
        )

    # ── Primary mapping interface ────────────────────────────────────────────

    def map_iemocap(self, raw_label: str) -> int:
        """Map IEMOCAP string label to unified taxonomy index."""
        key = raw_label.strip().lower()
        if key not in _IEMOCAP_MAP:
            raise ValueError(
                f"Unknown IEMOCAP label '{raw_label}'. "
                f"Valid labels: {list(_IEMOCAP_MAP.keys())}"
            )
        return _IEMOCAP_MAP[key]

    def map_mosei(
        self,
        raw_label: Optional[str] = None,
        valence: Optional[float] = None,
        arousal: Optional[float] = None,
    ) -> Tuple[int, torch.Tensor]:
        """
        Map CMU-MOSEI label to unified taxonomy.

        If `raw_label` is provided, performs categorical mapping.
        If `valence` + `arousal` are provided, performs quadrant-based continuous mapping.
        When both are present, categorical mapping takes priority.

        Returns
        -------
        hard_label : int
            Integer class index in [0, NUM_CLASSES-1].
        soft_label : torch.Tensor, shape (NUM_CLASSES,)
            Soft probability distribution over all classes.
        """
        if raw_label is not None:
            key = raw_label.strip().lower()
            hard = _MOSEI_CATEGORICAL_MAP.get(key, 6)  # default → Neutral
            soft = self.soft_label_constructor.from_hard_label(hard)
            return hard, soft

        if valence is not None and arousal is not None:
            return self._valence_arousal_to_label(valence, arousal)

        raise ValueError("map_mosei requires either raw_label or (valence, arousal).")

    def map_cremad(self, raw_label: str) -> int:
        """Map CREMA-D uppercase string label to unified taxonomy index."""
        key = raw_label.strip().upper()
        if key not in _CREMAD_MAP:
            raise ValueError(
                f"Unknown CREMA-D label '{raw_label}'. "
                f"Valid labels: {list(_CREMAD_MAP.keys())}"
            )
        return _CREMAD_MAP[key]

    def map_affectnet(
        self,
        class_id: Optional[int] = None,
        valence: Optional[float] = None,
        arousal: Optional[float] = None,
    ) -> Tuple[int, torch.Tensor]:
        """
        Map AffectNet class ID or continuous (valence, arousal) to unified taxonomy.

        AffectNet provides both discrete class IDs and continuous annotations.
        When class_id is provided, integer mapping is used; continuous mapping is used
        only for image-only samples without discrete labels.

        Returns
        -------
        hard_label : int
        soft_label : torch.Tensor, shape (NUM_CLASSES,)
        """
        if class_id is not None:
            hard = _AFFECTNET_MAP.get(int(class_id), 6)
            soft = self.soft_label_constructor.from_hard_label(hard)
            return hard, soft

        if valence is not None and arousal is not None:
            return self._valence_arousal_to_label(valence, arousal)

        raise ValueError("map_affectnet requires either class_id or (valence, arousal).")

    def map_goemo(self, raw_label: str) -> int:
        """Map GoEmotions simplified label to unified taxonomy index."""
        key = raw_label.strip().lower()
        return _GOEMO_MAP.get(key, 6)  # default → Neutral

    # ── Continuous → discrete mapping ────────────────────────────────────────

    def _valence_arousal_to_label(
        self, valence: float, arousal: float
    ) -> Tuple[int, torch.Tensor]:
        """
        Russell Circumplex Model quadrant → unified class mapping.

        Quadrant logic:
          Q1 (v≥0, a≥0): Joy (high positive energy)
          Q2 (v<0,  a≥0): Anger (dominant) or Fear (if |v| > |a|)
          Q3 (v<0,  a<0): Sadness (dominant) or Disgust (if |v| > 0.5)
          Q4 (v≥0, a<0):  Neutral (low arousal positive valence)

        Additionally constructs a Gaussian-weighted soft label reflecting uncertainty
        at quadrant boundaries (|v| + |a| < 0.3 → high Neutral weight).
        """
        v = float(valence)
        a = float(arousal)
        abs_v, abs_a = abs(v), abs(a)

        # Boundary zone: near-neutral if both are small
        is_boundary = (abs_v + abs_a) < 0.3

        if is_boundary:
            hard = 6  # Neutral
        elif v >= _VALENCE_THRESHOLD and a >= _AROUSAL_THRESHOLD:
            hard = 0  # Joy
        elif v < _VALENCE_THRESHOLD and a >= _AROUSAL_THRESHOLD:
            # Q2: high arousal negative valence
            if abs_v > abs_a:
                hard = 3  # Fear (more negative valence than arousal)
            else:
                hard = 2  # Anger (high arousal dominates)
        elif v < _VALENCE_THRESHOLD and a < _AROUSAL_THRESHOLD:
            # Q3: low arousal negative valence
            if abs_v > 0.5:
                hard = 5  # Disgust (strong negative valence)
            else:
                hard = 1  # Sadness
        else:
            # Q4: positive valence, low arousal
            hard = 6  # Neutral / Calm

        # Soft label: Gaussian weighting centered on hard label
        # Boundary uncertainty → higher entropy soft label
        boundary_scale = 1.0 + (0.3 - min(abs_v + abs_a, 0.3)) * 3.0  # in [1, 1.9]
        soft = self.soft_label_constructor.from_hard_label(
            hard, temperature_override=self.soft_label_temperature * boundary_scale
        )
        return hard, soft

    # ── Missing-modality masking ─────────────────────────────────────────────

    def get_modality_mask(
        self,
        has_text: bool,
        has_audio: bool,
        has_vision: bool,
        training: bool = True,
    ) -> Dict[str, bool]:
        """
        Returns a boolean mask indicating active modalities.

        During training, applies random modality dropout with probability
        `modality_dropout_prob` to each modality independently (at least one
        modality is always kept active).

        Parameters
        ----------
        has_* : bool   — Whether the modality is physically present in the sample.
        training : bool — Whether to apply stochastic dropout.

        Returns
        -------
        Dict[str, bool] with keys 'text', 'audio', 'vision'.
        """
        mask = {
            "text": has_text,
            "audio": has_audio,
            "vision": has_vision,
        }

        if training:
            active_before = [k for k, v in mask.items() if v]
            # Randomly drop modalities, ensuring at least one remains
            for key in active_before:
                if np.random.random() < self.modality_dropout_prob:
                    remaining_active = [k for k, v in mask.items() if v and k != key]
                    if len(remaining_active) > 0:
                        mask[key] = False

        return mask

    # ── Dataset info ─────────────────────────────────────────────────────────

    @staticmethod
    def class_names() -> List[str]:
        """Returns the unified 7-class taxonomy labels."""
        return list(UNIFIED_EMOTIONS)

    @staticmethod
    def num_classes() -> int:
        """Returns the number of unified emotion classes."""
        return NUM_CLASSES


# ── SoftLabelConstructor ─────────────────────────────────────────────────────

class SoftLabelConstructor:
    """
    Constructs soft (smoothed) probability distributions from hard class labels.

    Two modes:
      1. Uniform label smoothing: p_k = (1-ε) * δ_{k,y} + ε / K
         Applied when temperature = 1.0 (standard label smoothing with ε=0.05).
      2. Temperature-scaled softmax over one-hot logits:
         p = Softmax(logits / T) where logits = K-dim with target logit = 1.0,
         others = 0.0.  Higher T → higher entropy / more uniform distribution.
    """

    def __init__(self, num_classes: int = NUM_CLASSES, temperature: float = 1.0, epsilon: float = 0.05) -> None:
        self.num_classes = num_classes
        self.temperature = temperature
        self.epsilon = epsilon

    def from_hard_label(
        self,
        label: int,
        temperature_override: Optional[float] = None,
    ) -> torch.Tensor:
        """
        Converts a hard integer label to a soft probability vector.

        Parameters
        ----------
        label : int                  — Ground-truth class index.
        temperature_override : float — If provided, overrides `self.temperature`.

        Returns
        -------
        soft : torch.Tensor, shape (num_classes,)  — Probability simplex.
        """
        T = temperature_override if temperature_override is not None else self.temperature

        if abs(T - 1.0) < 1e-6:
            # Standard label smoothing: p_k = (1-ε) if k==y else ε/(K-1)
            soft = torch.full((self.num_classes,), self.epsilon / (self.num_classes - 1))
            soft[label] = 1.0 - self.epsilon
            return soft

        # Temperature-scaled softmax over one-hot spike logits
        logits = torch.zeros(self.num_classes)
        logits[label] = 1.0
        soft = F.softmax(logits / T, dim=0)
        return soft

    def from_multi_label_probabilities(
        self,
        prob_vector: List[float],
    ) -> Tuple[int, torch.Tensor]:
        """
        Converts a multi-label probability vector (e.g., CMU-MOSEI sentiment scores)
        to a hard label (argmax) and soft label (normalized probability vector).

        Parameters
        ----------
        prob_vector : List[float] — Raw probability or score per class (length = num_classes).

        Returns
        -------
        hard_label : int
        soft_label : torch.Tensor, shape (num_classes,)
        """
        if len(prob_vector) != self.num_classes:
            raise ValueError(
                f"prob_vector length {len(prob_vector)} != num_classes {self.num_classes}"
            )
        t = torch.tensor(prob_vector, dtype=torch.float32)
        t = torch.clamp(t, min=0.0)
        sum_t = t.sum()
        if sum_t < 1e-9:
            # Degenerate → uniform
            soft = torch.full((self.num_classes,), 1.0 / self.num_classes)
        else:
            soft = t / sum_t
        hard = int(torch.argmax(soft).item())
        return hard, soft


# ── ClassBalancedFocalLoss ────────────────────────────────────────────────────

class ClassBalancedFocalLoss(nn.Module):
    """
    Class-Balanced Focal Loss with Effective Number of Samples weighting.

    Combines:
      1. Focal Loss  — Down-weights easy examples to focus on hard misclassifications.
         FL(p_t) = -(1 - p_t)^γ * log(p_t)
      2. Class-Balanced Weighting — Re-weights per-class loss by the Effective
         Number of Samples (EN), which accounts for data overlap in finite sets:
         EN(n) = (1 - β^n) / (1 - β),  where β = (N - 1) / N (N = total samples).

    The combined loss is:
      L_CB-Focal = CB_weight_c * FL(p_c),  averaged over the batch.

    Parameters
    ----------
    samples_per_class : List[int]
        Number of training samples per class in the unified taxonomy order.
    gamma : float
        Focal loss exponent (default 2.0). Higher values focus more on hard examples.
    beta : float
        Smoothing factor for Effective Number computation (default 0.9999).
        β close to 1 → EN ≈ n (sample count). β = 0 → EN = 1 (uniform).
    reduction : str
        'mean' (default) or 'sum'.
    label_smoothing : float
        Label smoothing epsilon applied to the target distribution (default 0.05).

    References
    ----------
    Cui, Y. et al., "Class-Balanced Loss Based on Effective Number of Samples",
    Proceedings of CVPR, 2019.  https://arxiv.org/abs/1901.05555
    """

    def __init__(
        self,
        samples_per_class: List[int],
        gamma: float = 2.0,
        beta: float = 0.9999,
        reduction: str = "mean",
        label_smoothing: float = 0.05,
    ) -> None:
        super().__init__()
        self.gamma = gamma
        self.beta = beta
        self.reduction = reduction
        self.label_smoothing = label_smoothing
        self.num_classes = len(samples_per_class)

        # Compute Effective Number of Samples per class
        effective_num = torch.tensor(
            [self._effective_number(n) for n in samples_per_class], dtype=torch.float32
        )
        # CB weights: inversely proportional to effective number, normalized to sum to K
        cb_weights = (1.0 - beta) / (1.0 - effective_num.clamp(min=1e-9))
        cb_weights = cb_weights / cb_weights.sum() * self.num_classes

        # Register as buffer (moves to device with .to())
        self.register_buffer("cb_weights", cb_weights)

    def _effective_number(self, n: int) -> float:
        """EN(n) = (1 - β^n) / (1 - β)."""
        if n <= 0:
            return 1.0
        return (1.0 - math.pow(self.beta, n)) / (1.0 - self.beta)

    def forward(
        self,
        logits: torch.Tensor,
        targets: torch.Tensor,
        soft_targets: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Compute Class-Balanced Focal Loss.

        Parameters
        ----------
        logits : torch.Tensor, shape (B, K)
            Raw (un-normalized) model logits.
        targets : torch.Tensor, shape (B,)
            Hard integer class labels.
        soft_targets : torch.Tensor, shape (B, K), optional
            If provided, used instead of one-hot hard labels (supports soft label training).

        Returns
        -------
        loss : torch.Tensor, scalar
        """
        B, K = logits.shape
        device = logits.device

        # Construct target distribution
        if soft_targets is not None:
            t = soft_targets.to(device)
        else:
            # Label smoothing: uniform blend with one-hot
            t = torch.zeros(B, K, device=device)
            t.scatter_(1, targets.view(-1, 1).to(device), 1.0)
            t = t * (1.0 - self.label_smoothing) + self.label_smoothing / K

        # Compute softmax probabilities and focal weights
        probs = F.softmax(logits.float(), dim=-1).clamp(min=1e-9)

        # p_t for each sample: probability of the true class (for focal modulation)
        # When using soft targets, use the expected probability: Σ_k t_k * p_k
        if soft_targets is not None:
            p_t = (probs * t).sum(dim=-1)  # shape (B,)
        else:
            p_t = probs[torch.arange(B, device=device), targets.to(device)]  # shape (B,)

        focal_weight = (1.0 - p_t) ** self.gamma  # shape (B,)

        # Cross-entropy with soft targets: -Σ_k t_k * log(p_k)
        log_probs = torch.log(probs)
        ce_per_sample = -(t * log_probs).sum(dim=-1)  # shape (B,)

        # Per-sample CB weight from the predicted class (hard target idx)
        if soft_targets is not None:
            class_idx = torch.argmax(t, dim=-1)
        else:
            class_idx = targets.to(device)

        sample_cb_weights = self.cb_weights.to(device)[class_idx]  # shape (B,)

        # Combined CB-Focal loss per sample
        loss_per_sample = sample_cb_weights * focal_weight * ce_per_sample

        if self.reduction == "mean":
            return loss_per_sample.mean()
        elif self.reduction == "sum":
            return loss_per_sample.sum()
        else:
            return loss_per_sample


# ── MMDLoss ──────────────────────────────────────────────────────────────────

class MMDLoss(nn.Module):
    """
    Maximum Mean Discrepancy (MMD) Loss for Domain Adaptation.

    Minimizing MMD forces the feature distributions of two dataset domains
    (source and target) to align in the reproducing kernel Hilbert space (RKHS),
    removing dataset-specific acquisition biases.

    The unbiased estimator of MMD² with Gaussian RBF kernel:

        MMD²(X_s, X_t) = E[k(x_s, x_s')] - 2·E[k(x_s, x_t)] + E[k(x_t, x_t')]

    where k(x, y) = exp(-||x - y||² / (2σ²)).

    Multi-kernel MMD uses a mixture of kernels with bandwidths σ ∈ {0.5, 1.0, 2.0, 4.0}
    for better distribution matching.

    Parameters
    ----------
    kernel_bandwidths : List[float]
        Gaussian RBF kernel bandwidths (σ values). Default: [0.5, 1.0, 2.0, 4.0].

    References
    ----------
    Gretton, A. et al., "A Kernel Two-Sample Test", JMLR, 2012.
    Long, M. et al., "Learning Transferable Features with Deep Adaptation Networks", ICML 2015.
    """

    def __init__(self, kernel_bandwidths: Optional[List[float]] = None) -> None:
        super().__init__()
        self.kernel_bandwidths = kernel_bandwidths or [0.5, 1.0, 2.0, 4.0, 8.0]

    def _gaussian_kernel(
        self,
        x: torch.Tensor,
        y: torch.Tensor,
        bandwidth: float,
    ) -> torch.Tensor:
        """
        Computes Gaussian RBF kernel matrix K(x, y).

        K_{ij} = exp(-||x_i - y_j||² / (2σ²))

        Parameters
        ----------
        x : torch.Tensor, shape (N, D)
        y : torch.Tensor, shape (M, D)
        bandwidth : float  — σ (standard deviation of the Gaussian kernel).

        Returns
        -------
        K : torch.Tensor, shape (N, M)
        """
        # ||x_i - y_j||² = ||x_i||² + ||y_j||² - 2·x_i^T·y_j
        xx = (x * x).sum(dim=1, keepdim=True)   # (N, 1)
        yy = (y * y).sum(dim=1, keepdim=True)   # (M, 1)
        xy = x @ y.t()                           # (N, M)
        sq_dist = xx + yy.t() - 2.0 * xy        # (N, M)
        sq_dist = sq_dist.clamp(min=0.0)         # Numerical stability
        return torch.exp(-sq_dist / (2.0 * bandwidth ** 2))

    def forward(
        self,
        source_features: torch.Tensor,
        target_features: torch.Tensor,
    ) -> torch.Tensor:
        """
        Compute the multi-kernel Maximum Mean Discrepancy loss.

        Parameters
        ----------
        source_features : torch.Tensor, shape (N_s, D)
            Feature representations from source domain (e.g., IEMOCAP).
        target_features : torch.Tensor, shape (N_t, D)
            Feature representations from target domain (e.g., CMU-MOSEI).

        Returns
        -------
        mmd_loss : torch.Tensor, scalar ≥ 0
            Estimated MMD² value (lower → more similar distributions).
        """
        mmd_sq: torch.Tensor = torch.tensor(0.0, device=source_features.device)

        for bw in self.kernel_bandwidths:
            # Kernel matrices
            K_ss = self._gaussian_kernel(source_features, source_features, bw)
            K_tt = self._gaussian_kernel(target_features, target_features, bw)
            K_st = self._gaussian_kernel(source_features, target_features, bw)

            N_s = source_features.shape[0]
            N_t = target_features.shape[0]

            # Unbiased MMD² estimator (zero diagonal for within-domain terms)
            K_ss_no_diag = K_ss - torch.diag(K_ss.diag())
            K_tt_no_diag = K_tt - torch.diag(K_tt.diag())

            e_ss = K_ss_no_diag.sum() / max(N_s * (N_s - 1), 1)
            e_tt = K_tt_no_diag.sum() / max(N_t * (N_t - 1), 1)
            e_st = K_st.sum() / max(N_s * N_t, 1)

            mmd_sq = mmd_sq + e_ss + e_tt - 2.0 * e_st

        # Average over number of kernels; clamp to ≥ 0 for numerical stability
        mmd_sq = (mmd_sq / len(self.kernel_bandwidths)).clamp(min=0.0)
        return mmd_sq
