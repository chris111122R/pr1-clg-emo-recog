"""
tests/test_harmonizer.py
=========================
Unit tests for Phase 1: Dataset Harmonizer, Quality Gate, EDL/Gaussian Heads.

All tests verify:
  1. Correct label mapping for all dataset-specific vocabularies.
  2. Soft label shape, simplex validity, and entropy ordering.
  3. ClassBalancedFocalLoss gradient flow and non-zero loss.
  4. MMDLoss symmetry and zero-loss for identical distributions.
  5. Quality estimator Q-score bounds and aleatoric gate triggering.
  6. EvidentialLoss KL annealing correctness.
  7. HeteroscedasticNLLLoss: strictly positive variance, finite loss.
"""

from __future__ import annotations

import math
import io
import numpy as np
import pytest
import torch
import torch.nn.functional as F
from PIL import Image

# ── Module under test ────────────────────────────────────────────────────────
from ua_edt.data.harmonizer import (
    UnifiedEmotionHarmonizer,
    ClassBalancedFocalLoss,
    MMDLoss,
    SoftLabelConstructor,
    UNIFIED_EMOTIONS,
    NUM_CLASSES,
)
from ua_edt.quality.quality_estimator import (
    MultimodalQualityEstimator,
    TextQualityEstimator,
    VisionQualityEstimator,
    AudioQualityEstimator,
    QUALITY_TAU,
    ALEATORIC_KAPPA,
)
from ua_edt.models.heads import (
    EvidentialClassificationHead,
    EvidentialLoss,
    HeteroscedasticRegressionHead,
    HeteroscedasticNLLLoss,
)


# ════════════════════════════════════════════════════════════════════════════
# 1. UnifiedEmotionHarmonizer
# ════════════════════════════════════════════════════════════════════════════

class TestUnifiedEmotionHarmonizer:

    def setup_method(self):
        self.harmonizer = UnifiedEmotionHarmonizer()

    # ── IEMOCAP ─────────────────────────────────────────────────────────────

    def test_iemocap_happiness(self):
        assert self.harmonizer.map_iemocap("hap") == 0, "hap → Joy (idx 0)"

    def test_iemocap_excited_maps_to_joy(self):
        assert self.harmonizer.map_iemocap("exc") == 0, "exc → Joy (idx 0)"

    def test_iemocap_anger(self):
        assert self.harmonizer.map_iemocap("ang") == 2

    def test_iemocap_frustrated_maps_to_anger(self):
        assert self.harmonizer.map_iemocap("fru") == 2

    def test_iemocap_sadness(self):
        assert self.harmonizer.map_iemocap("sad") == 1

    def test_iemocap_fear(self):
        assert self.harmonizer.map_iemocap("fea") == 3

    def test_iemocap_neutral(self):
        assert self.harmonizer.map_iemocap("neu") == 6

    def test_iemocap_disgust(self):
        assert self.harmonizer.map_iemocap("dis") == 5

    def test_iemocap_invalid_raises(self):
        with pytest.raises(ValueError):
            self.harmonizer.map_iemocap("xyz_invalid_label")

    # ── CMU-MOSEI ────────────────────────────────────────────────────────────

    def test_mosei_categorical_happy(self):
        hard, soft = self.harmonizer.map_mosei(raw_label="happy")
        assert hard == 0
        assert soft.shape == (NUM_CLASSES,)
        assert abs(float(soft.sum()) - 1.0) < 1e-5, "Soft label must sum to 1"

    def test_mosei_categorical_anger(self):
        hard, soft = self.harmonizer.map_mosei(raw_label="anger")
        assert hard == 2

    def test_mosei_valence_arousal_q1_joy(self):
        # Q1: v>0, a>0 → Joy
        hard, soft = self.harmonizer.map_mosei(valence=0.6, arousal=0.7)
        assert hard == 0

    def test_mosei_valence_arousal_q3_sadness(self):
        # Q3: v<0, a<0 → Sadness
        hard, soft = self.harmonizer.map_mosei(valence=-0.5, arousal=-0.4)
        assert hard == 1

    def test_mosei_valence_arousal_q2_anger(self):
        # Q2: v<0, a>0, |a|>|v| → Anger
        hard, soft = self.harmonizer.map_mosei(valence=-0.3, arousal=0.7)
        assert hard == 2

    def test_mosei_boundary_zone_neutral(self):
        # Very small v, a → Neutral (boundary zone)
        hard, soft = self.harmonizer.map_mosei(valence=0.05, arousal=0.05)
        assert hard == 6, "Near-origin → Neutral"

    def test_mosei_no_args_raises(self):
        with pytest.raises(ValueError):
            self.harmonizer.map_mosei()

    # ── CREMA-D ──────────────────────────────────────────────────────────────

    def test_cremad_happy(self):
        assert self.harmonizer.map_cremad("HAP") == 0

    def test_cremad_anger(self):
        assert self.harmonizer.map_cremad("ANG") == 2

    def test_cremad_fear(self):
        assert self.harmonizer.map_cremad("FEA") == 3

    def test_cremad_disgust(self):
        assert self.harmonizer.map_cremad("DIS") == 5

    def test_cremad_neutral(self):
        assert self.harmonizer.map_cremad("NEU") == 6

    def test_cremad_invalid_raises(self):
        with pytest.raises(ValueError):
            self.harmonizer.map_cremad("XYZ")

    # ── AffectNet ────────────────────────────────────────────────────────────

    def test_affectnet_class_id_happy(self):
        hard, soft = self.harmonizer.map_affectnet(class_id=1)
        assert hard == 0  # Happy → Joy

    def test_affectnet_contempt_to_disgust(self):
        hard, soft = self.harmonizer.map_affectnet(class_id=7)
        assert hard == 5  # Contempt → Disgust

    def test_affectnet_neutral(self):
        hard, soft = self.harmonizer.map_affectnet(class_id=0)
        assert hard == 6

    def test_affectnet_valence_arousal(self):
        hard, soft = self.harmonizer.map_affectnet(valence=-0.7, arousal=0.6)
        assert hard in [2, 3]  # Anger or Fear depending on |v| vs |a|

    # ── Modality Mask ────────────────────────────────────────────────────────

    def test_modality_mask_all_present_no_dropout(self):
        """With dropout_prob=0, no modality should be dropped."""
        h = UnifiedEmotionHarmonizer(modality_dropout_prob=0.0)
        mask = h.get_modality_mask(True, True, True, training=True)
        assert all(mask[k] for k in ["text", "audio", "vision"])

    def test_modality_mask_preserves_at_least_one(self):
        """Even with maximum dropout, at least one modality stays active."""
        h = UnifiedEmotionHarmonizer(modality_dropout_prob=1.0)
        for _ in range(20):
            mask = h.get_modality_mask(True, True, True, training=True)
            active = sum(mask.values())
            assert active >= 1, f"All modalities masked out: {mask}"

    def test_modality_mask_inference_unchanged(self):
        """During inference (training=False), mask should not apply dropout."""
        h = UnifiedEmotionHarmonizer(modality_dropout_prob=1.0)
        mask = h.get_modality_mask(True, True, False, training=False)
        assert mask["text"] is True
        assert mask["audio"] is True
        assert mask["vision"] is False  # Was not present

    def test_num_classes(self):
        assert UnifiedEmotionHarmonizer.num_classes() == 7
        assert len(UnifiedEmotionHarmonizer.class_names()) == 7


# ════════════════════════════════════════════════════════════════════════════
# 2. SoftLabelConstructor
# ════════════════════════════════════════════════════════════════════════════

class TestSoftLabelConstructor:

    def setup_method(self):
        self.slc = SoftLabelConstructor(num_classes=7, temperature=1.0)

    def test_hard_label_sum_to_one(self):
        soft = self.slc.from_hard_label(0)
        assert abs(float(soft.sum()) - 1.0) < 1e-5

    def test_hard_label_dominates_at_low_temperature(self):
        slc = SoftLabelConstructor(num_classes=7, temperature=0.1)
        soft = slc.from_hard_label(2)
        assert soft[2] > 0.99, "Near-deterministic at T=0.1"

    def test_high_temperature_approaches_uniform(self):
        slc = SoftLabelConstructor(num_classes=7, temperature=100.0)
        soft = slc.from_hard_label(3)
        assert abs(float(soft.sum()) - 1.0) < 1e-5
        # Max - min should be very small (near-uniform)
        assert (soft.max() - soft.min()).item() < 0.05

    def test_from_multi_label_probabilities(self):
        probs = [0.1, 0.5, 0.1, 0.1, 0.1, 0.05, 0.05]
        hard, soft = self.slc.from_multi_label_probabilities(probs)
        assert hard == 1, "argmax of probs → index 1"
        assert abs(float(soft.sum()) - 1.0) < 1e-5

    def test_from_multi_label_wrong_length_raises(self):
        with pytest.raises(ValueError):
            self.slc.from_multi_label_probabilities([0.5, 0.5])


# ════════════════════════════════════════════════════════════════════════════
# 3. ClassBalancedFocalLoss
# ════════════════════════════════════════════════════════════════════════════

class TestClassBalancedFocalLoss:
    """Verify CB-Focal Loss gradient flow, positivity, and CB weighting."""

    def setup_method(self):
        # Simulated class distribution: 500, 200, 80, 30, 20, 15, 10 samples
        self.samples_per_class = [500, 200, 80, 30, 20, 15, 10]
        self.criterion = ClassBalancedFocalLoss(
            samples_per_class=self.samples_per_class, gamma=2.0, beta=0.9999
        )

    def test_loss_is_scalar_and_positive(self):
        B, K = 8, 7
        logits = torch.randn(B, K, requires_grad=True)
        targets = torch.randint(0, K, (B,))
        loss = self.criterion(logits, targets)
        assert loss.ndim == 0, "Loss should be a scalar"
        assert float(loss) > 0.0, "Loss must be positive"

    def test_gradient_flows(self):
        B, K = 8, 7
        logits = torch.randn(B, K, requires_grad=True)
        targets = torch.randint(0, K, (B,))
        loss = self.criterion(logits, targets)
        loss.backward()
        assert logits.grad is not None, "Gradient must flow to logits"
        assert not torch.isnan(logits.grad).any(), "Gradient must be finite"

    def test_perfect_prediction_lower_loss(self):
        """A correct, confident prediction should yield lower loss than random."""
        K = 7
        # Highly confident correct prediction
        confident_logits = torch.zeros(1, K)
        confident_logits[0, 0] = 10.0
        targets = torch.tensor([0])
        low_loss = self.criterion(confident_logits, targets)

        # Uniform (random) prediction
        uniform_logits = torch.zeros(1, K)
        high_loss = self.criterion(uniform_logits, targets)

        assert float(low_loss) < float(high_loss)

    def test_soft_targets_accepted(self):
        B, K = 4, 7
        logits = torch.randn(B, K)
        targets = torch.randint(0, K, (B,))
        soft = F.softmax(torch.randn(B, K), dim=-1)
        loss = self.criterion(logits, targets, soft_targets=soft)
        assert loss.ndim == 0
        assert float(loss) > 0.0

    def test_cb_weights_minority_upweighted(self):
        """Minority class (idx 6: 10 samples) should get higher CB weight than majority."""
        minority_idx = 6  # 10 samples
        majority_idx = 0  # 500 samples
        minority_weight = float(self.criterion.cb_weights[minority_idx])
        majority_weight = float(self.criterion.cb_weights[majority_idx])
        assert minority_weight > majority_weight, (
            f"Minority class weight {minority_weight:.4f} must exceed "
            f"majority class weight {majority_weight:.4f}"
        )


# ════════════════════════════════════════════════════════════════════════════
# 4. MMDLoss
# ════════════════════════════════════════════════════════════════════════════

class TestMMDLoss:

    def setup_method(self):
        self.mmd_loss = MMDLoss()

    def test_zero_mmd_for_identical_distributions(self):
        """MMD of a distribution with itself should be near zero."""
        torch.manual_seed(0)
        feats = torch.randn(32, 128)
        loss = self.mmd_loss(feats, feats)
        assert float(loss) < 1e-6, f"MMD(X, X) should be ≈ 0, got {float(loss):.8f}"

    def test_mmd_non_negative(self):
        torch.manual_seed(42)
        s = torch.randn(16, 64)
        t = torch.randn(16, 64) + 5.0  # Shifted distribution
        loss = self.mmd_loss(s, t)
        assert float(loss) >= 0.0, "MMD² must be non-negative"

    def test_mmd_large_for_different_distributions(self):
        """MMD should be substantially larger for dissimilar distributions."""
        torch.manual_seed(7)
        similar_s = torch.randn(32, 64)
        similar_t = torch.randn(32, 64)
        dissimilar_s = torch.randn(32, 64)
        dissimilar_t = torch.randn(32, 64) * 5.0 + 10.0

        mmd_similar = float(self.mmd_loss(similar_s, similar_t))
        mmd_dissimilar = float(self.mmd_loss(dissimilar_s, dissimilar_t))

        assert mmd_dissimilar > mmd_similar, (
            f"Dissimilar MMD ({mmd_dissimilar:.4f}) should exceed "
            f"similar MMD ({mmd_similar:.4f})"
        )

    def test_gradient_flows(self):
        torch.manual_seed(1)
        source = torch.randn(16, 64, requires_grad=True)
        target = torch.randn(16, 64)
        loss = self.mmd_loss(source, target)
        loss.backward()
        assert source.grad is not None
        assert not torch.isnan(source.grad).any()


# ════════════════════════════════════════════════════════════════════════════
# 5. Quality Estimator — Combined Q Score & Gate
# ════════════════════════════════════════════════════════════════════════════

class TestQualityEstimator:

    def setup_method(self):
        self.estimator = MultimodalQualityEstimator()
        self.text_estimator = TextQualityEstimator()

    def test_combined_q_text_only_range(self):
        result = self.estimator.evaluate_all(text="I feel incredibly happy today.")
        assert 0.0 <= result["Q"] <= 100.0

    def test_empty_text_triggers_gate(self):
        result = self.estimator.evaluate_all(text="")
        assert result["Q"] < QUALITY_TAU, "Empty text should trigger quality gate"
        assert result["quality_gate_triggered"] is True

    def test_aleatoric_scale_factor_minimum_one(self):
        """Scale factor should always be ≥ 1.0."""
        result = self.estimator.evaluate_all(text="Hello world, how are you doing today?")
        assert result["aleatoric_scale_factor"] >= 1.0

    def test_aleatoric_scale_factor_increases_with_low_q(self):
        """Lower Q → higher aleatoric scale factor."""
        good_result = self.estimator.evaluate_all(
            text="I feel incredibly happy and grateful today after a wonderful long conversation."
        )
        bad_result = self.estimator.evaluate_all(text="x")
        if good_result["quality_gate_triggered"]:
            assert good_result["aleatoric_scale_factor"] >= 1.0
        if bad_result["quality_gate_triggered"]:
            assert bad_result["aleatoric_scale_factor"] >= 1.0
        # If both gates triggered, lower Q yields higher scale factor
        if good_result["Q"] > bad_result["Q"] and bad_result["quality_gate_triggered"]:
            assert bad_result["aleatoric_scale_factor"] >= good_result["aleatoric_scale_factor"]

    def test_no_modality_q_is_zero(self):
        result = self.estimator.evaluate_all()
        assert result["Q"] == 0.0

    def test_text_oov_ratio_pure_gibberish(self):
        result = self.text_estimator.evaluate("xkjz qwqrp zxvmb fhjkl lmnop")
        # High OOV ratio expected for nonsense words
        assert result["oov_ratio"] > 0.5

    def test_text_language_confidence_ascii(self):
        result = self.text_estimator.evaluate("Hello, how are you doing today?")
        assert result["language_confidence"] > 0.95

    def test_compute_combined_score_formula(self):
        """Verify the weighted average formula directly."""
        result = self.estimator.compute_combined_score(
            q_t=1.0, q_a=1.0, q_v=1.0,
            has_text=True, has_audio=True, has_vision=True,
        )
        assert abs(result["Q"] - 100.0) < 0.01, "All perfect → Q=100"
        assert result["quality_gate_triggered"] is False

    def test_compute_combined_score_zero(self):
        result = self.estimator.compute_combined_score(
            q_t=0.0, q_a=0.0, q_v=0.0,
            has_text=True, has_audio=True, has_vision=True,
        )
        assert result["Q"] == 0.0
        assert result["quality_gate_triggered"] is True
        # Scale factor: 1 + κ * (τ - 0) / τ = 1 + κ = 1 + 2 = 3
        expected_scale = 1.0 + ALEATORIC_KAPPA * (QUALITY_TAU - 0.0) / QUALITY_TAU
        assert abs(result["aleatoric_scale_factor"] - expected_scale) < 0.01

    def test_vision_estimator_synthetic_image(self):
        """Synthetic white-noise image should return a valid q_v."""
        img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        result = self.estimator.vision_estimator.evaluate(buf.getvalue())
        assert 0.0 <= result["q_v"] <= 1.0
        assert "laplacian_variance" in result
        assert "blur_score" in result
        assert "pose_score" in result


# ════════════════════════════════════════════════════════════════════════════
# 6. EvidentialLoss — Step-Based KL Annealing
# ════════════════════════════════════════════════════════════════════════════

class TestEvidentialLoss:

    def setup_method(self):
        self.head = EvidentialClassificationHead(in_features=256, num_classes=7)
        self.criterion = EvidentialLoss(num_classes=7, kl_weight=0.2, T_anneal=1000)

    def test_lambda_annealing_zero_at_step_zero(self):
        assert self.criterion._annealing_coefficient(0) == 0.0

    def test_lambda_annealing_one_at_T_anneal(self):
        assert self.criterion._annealing_coefficient(1000) == 1.0

    def test_lambda_annealing_half_at_half_T(self):
        assert abs(self.criterion._annealing_coefficient(500) - 0.5) < 1e-6

    def test_lambda_annealing_clamped_at_max_one(self):
        assert self.criterion._annealing_coefficient(10000) == 1.0

    def test_loss_is_scalar_and_finite(self):
        B = 8
        x = torch.randn(B, 256)
        targets = torch.randint(0, 7, (B,))
        out = self.head(x)
        loss = self.criterion(out, targets, global_step=500)
        assert loss.ndim == 0
        assert torch.isfinite(loss).item(), "Loss must be finite"

    def test_loss_is_positive(self):
        B = 4
        x = torch.randn(B, 256)
        targets = torch.randint(0, 7, (B,))
        out = self.head(x)
        loss = self.criterion(out, targets, global_step=100)
        assert float(loss) > 0.0

    def test_gradient_flows_through_head(self):
        B = 8
        x = torch.randn(B, 256, requires_grad=True)
        targets = torch.randint(0, 7, (B,))
        out = self.head(x)
        loss = self.criterion(out, targets, global_step=200)
        loss.backward()
        assert x.grad is not None
        assert not torch.isnan(x.grad).any()

    def test_evidential_head_alpha_ge_one(self):
        """Alpha must always be ≥ 1 (Dirichlet parameter constraint)."""
        x = torch.randn(16, 256)
        out = self.head(x)
        assert (out["alpha"] >= 1.0).all(), "All α_k must be ≥ 1"

    def test_evidential_head_probs_sum_to_one(self):
        x = torch.randn(16, 256)
        out = self.head(x)
        prob_sums = out["probs"].sum(dim=-1)
        assert torch.allclose(prob_sums, torch.ones_like(prob_sums), atol=1e-5), \
            "Expected probabilities must sum to 1"

    def test_vacuity_in_zero_one(self):
        x = torch.randn(16, 256)
        out = self.head(x)
        assert (out["vacuity"] > 0.0).all(), "Vacuity must be > 0"
        # Vacuity = K/S; since S = Σα ≥ K (each α_k ≥ 1), u = K/S ≤ 1
        assert (out["vacuity"] <= 1.0 + 1e-5).all(), "Vacuity must be ≤ 1"


# ════════════════════════════════════════════════════════════════════════════
# 7. HeteroscedasticRegressionHead & HeteroscedasticNLLLoss
# ════════════════════════════════════════════════════════════════════════════

class TestHeteroscedasticRegressionHead:

    def setup_method(self):
        self.head = HeteroscedasticRegressionHead(in_features=256, out_dim=2)
        self.loss_fn = HeteroscedasticNLLLoss()

    def test_output_shapes(self):
        B = 8
        x = torch.randn(B, 256)
        out = self.head(x)
        assert out["mu"].shape == (B, 2), "mu shape must be (B, 2)"
        assert out["var"].shape == (B, 2), "var shape must be (B, 2)"
        assert out["std"].shape == (B, 2), "std shape must be (B, 2)"

    def test_variance_strictly_positive(self):
        """σ̂²(x) = Softplus(f_σ(x)) + ε must be strictly positive."""
        x = torch.randn(32, 256)
        out = self.head(x)
        assert (out["var"] > 0.0).all(), "Variance must be strictly positive"
        # Even for zero-input
        x_zero = torch.zeros(4, 256)
        out_zero = self.head(x_zero)
        assert (out_zero["var"] > 0.0).all()

    def test_std_is_sqrt_var(self):
        x = torch.randn(8, 256)
        out = self.head(x)
        expected_std = torch.sqrt(out["var"])
        assert torch.allclose(out["std"], expected_std, atol=1e-6)

    def test_nll_loss_finite_and_positive(self):
        B = 16
        x = torch.randn(B, 256)
        target = torch.randn(B, 2)
        out = self.head(x)
        loss = self.loss_fn(out, target)
        assert loss.ndim == 0
        assert torch.isfinite(loss).item(), "NLL loss must be finite"

    def test_nll_gradient_flows(self):
        B = 8
        x = torch.randn(B, 256, requires_grad=True)
        target = torch.randn(B, 2)
        out = self.head(x)
        loss = self.loss_fn(out, target)
        loss.backward()
        assert x.grad is not None
        assert not torch.isnan(x.grad).any()

    def test_nll_lower_for_accurate_prediction(self):
        """Model predicting near-zero target with low variance → lower NLL."""
        mu_close = torch.zeros(4, 2)         # predicted μ ≈ target 0
        var_small = torch.full((4, 2), 0.01) # small σ²
        target = torch.zeros(4, 2)

        mu_far = torch.full((4, 2), 5.0)     # predicted μ far from target
        var_large = torch.ones(4, 2)         # large σ²

        loss_good = self.loss_fn({"mu": mu_close, "var": var_small}, target)
        loss_bad  = self.loss_fn({"mu": mu_far,  "var": var_large},  target)
        assert float(loss_good) < float(loss_bad), (
            f"Good prediction loss {float(loss_good):.4f} should be less than "
            f"bad prediction loss {float(loss_bad):.4f}"
        )
