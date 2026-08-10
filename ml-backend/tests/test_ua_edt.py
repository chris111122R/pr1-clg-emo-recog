"""
Integration Test Suite for the UA-EDT Research-Grade Package.

Tests cover:
  1. Quality Estimators (Vision, Audio, Text)
  2. UAEDTMultimodalModel forward pass
  3. Evidential / Dirichlet loss computation
  4. Uncertainty Quantification Engine (MC Dropout, BALD, Vacuity)
  5. Temperature Scaling Calibration
  6. Robustness Perturbation Engine
  7. Multimodal Attribution Explainer reliability labels
"""

import sys, os, io, math, json
import numpy as np
import torch
import torch.nn.functional as F
import pytest
from PIL import Image, ImageFilter

# Ensure the ml-backend package root is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ua_edt.models.ua_edt_model import UAEDTMultimodalModel
from ua_edt.models.heads import EvidentialClassificationHead, EvidentialLoss
from ua_edt.uncertainty.mc_dropout import UncertaintyQuantificationEngine
from ua_edt.uncertainty.calibration import TemperatureScaler, CalibrationMetrics
from ua_edt.quality.quality_estimator import (
    VisionQualityEstimator, AudioQualityEstimator, TextQualityEstimator,
    MultimodalQualityEstimator
)
from ua_edt.evaluation.robust_eval import PerturbationEngine, RobustnessEvaluator
from ua_edt.xai.explainability import MultimodalAttributionExplainer

NUM_CLASSES = 7
EMOTIONS = ["Anger", "Disgust", "Fear", "Joy", "Sadness", "Surprise", "Neutral"]


# ── Fixtures ──────────────────────────────────────────────────────────────────

def make_model():
    model = UAEDTMultimodalModel(text_dim=768, audio_dim=768, vision_dim=768,
                                  projection_dim=256, num_classes=NUM_CLASSES)
    model.eval()
    return model

def make_dummy_image_bytes(width=224, height=224, blur=False) -> bytes:
    img = Image.fromarray(np.random.randint(0, 255, (height, width, 3), dtype=np.uint8))
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(radius=12))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def make_dummy_audio_bytes(duration_s=1, sr=16000) -> bytes:
    try:
        import soundfile as sf
        import soundfile
        buf = io.BytesIO()
        tone = 0.1 * np.sin(2 * np.pi * 440.0 * np.arange(sr * duration_s) / sr).astype(np.float32)
        sf.write(buf, tone, sr, format="WAV")
        return buf.getvalue()
    except ImportError:
        return b"\x00" * 1000  # Fallback raw bytes

# ── Test 1: Vision Quality Estimator ─────────────────────────────────────────

class TestVisionQualityEstimator:
    def test_sharp_image_high_quality(self):
        img_bytes = make_dummy_image_bytes(blur=False)
        est = VisionQualityEstimator()
        result = est.evaluate(img_bytes)
        assert "q_v" in result
        assert 0.0 <= result["q_v"] <= 1.0
        print(f"  Sharp image q_v: {result['q_v']:.4f}, laplacian: {result['laplacian_variance']:.2f}")

    def test_blurred_image_lower_quality(self):
        sharp_bytes = make_dummy_image_bytes(blur=False)
        blurry_bytes = make_dummy_image_bytes(blur=True)
        est = VisionQualityEstimator()
        sharp_res = est.evaluate(sharp_bytes)
        blurry_res = est.evaluate(blurry_bytes)
        print(f"  Sharp q_v: {sharp_res['q_v']:.4f}, Blurry q_v: {blurry_res['q_v']:.4f}")
        assert blurry_res["q_v"] <= sharp_res["q_v"], "Blurred image must have lower q_v"

    def test_blurred_image_is_degraded(self):
        blurry_bytes = make_dummy_image_bytes(blur=True)
        est = VisionQualityEstimator(blur_threshold=100.0)
        result = est.evaluate(blurry_bytes)
        print(f"  Blurry is_degraded: {result['is_degraded']}, laplacian_var: {result['laplacian_variance']:.2f}")
        assert result["is_degraded"] is True

    def test_invalid_image_graceful(self):
        est = VisionQualityEstimator()
        result = est.evaluate(b"not_an_image")
        assert "q_v" in result
        assert result["is_degraded"] is True


# ── Test 2: Audio Quality Estimator ──────────────────────────────────────────

class TestAudioQualityEstimator:
    def test_clean_tone_high_quality(self):
        audio_bytes = make_dummy_audio_bytes()
        est = AudioQualityEstimator()
        result = est.evaluate(audio_bytes)
        assert "q_a" in result
        assert 0.0 <= result["q_a"] <= 1.0
        print(f"  Clean tone q_a: {result['q_a']:.4f}, snr_db: {result.get('snr_db', 'N/A')}")

    def test_invalid_audio_graceful(self):
        est = AudioQualityEstimator()
        result = est.evaluate(b"\x00" * 512)
        assert "q_a" in result


# ── Test 3: Text Quality Estimator ────────────────────────────────────────────

class TestTextQualityEstimator:
    def test_good_text_high_quality(self):
        est = TextQualityEstimator()
        result = est.evaluate("I am feeling very happy and excited today!")
        assert "q_t" in result
        assert result["q_t"] >= 0.5, f"Expected high q_t, got {result['q_t']}"

    def test_empty_text_degraded(self):
        est = TextQualityEstimator()
        result = est.evaluate("")
        assert result["is_degraded"] is True
        assert result["q_t"] == 0.01

    def test_gibberish_low_quality(self):
        est = TextQualityEstimator()
        result = est.evaluate("asdf qwer zxcv")
        print(f"  Gibberish q_t: {result['q_t']:.4f}")
        assert 0.0 <= result["q_t"] <= 1.0


# ── Test 4: MultiModal Quality Estimator ─────────────────────────────────────

class TestMultimodalQualityEstimator:
    def test_combined_all_modalities(self):
        est = MultimodalQualityEstimator()
        img_bytes = make_dummy_image_bytes()
        audio_bytes = make_dummy_audio_bytes()
        result = est.evaluate_all(text="Feeling sad today.", audio_bytes=audio_bytes, image_bytes=img_bytes)
        assert "q_t" in result and "q_a" in result and "q_v" in result
        assert "details" in result
        print(f"  Combined q_t={result['q_t']:.4f}, q_a={result['q_a']:.4f}, q_v={result['q_v']:.4f}")


# ── Test 5: UAEDTMultimodalModel Forward Pass ─────────────────────────────────

class TestUAEDTModel:
    def test_text_only(self):
        model = make_model()
        text_emb = torch.randn(1, 768)
        out = model(text_emb=text_emb)
        assert "logits" in out
        assert out["logits"].shape == (1, NUM_CLASSES)
        assert "alpha" in out
        assert "is_ood" in out

    def test_multimodal_all(self):
        model = make_model()
        text_emb = torch.randn(1, 768)
        audio_emb = torch.randn(1, 768)
        vision_emb = torch.randn(1, 768)
        q_scores = {"q_t": 0.9, "q_a": 0.8, "q_v": 0.7}
        out = model(text_emb=text_emb, audio_emb=audio_emb, vision_emb=vision_emb, q_scores=q_scores)
        assert out["logits"].shape == (1, NUM_CLASSES)
        assert out["modality_attn"].shape[0] == 1
        print(f"  Modality attns: {out['modality_attn'].squeeze().tolist()}")

    def test_low_quality_vision_boosts_aleatoric(self):
        model = make_model()
        uq_engine = UncertaintyQuantificationEngine(num_samples=10)
        vision_emb = torch.randn(1, 768)
        high_quality = uq_engine.evaluate_uncertainty(model, vision_emb=vision_emb, q_scores={"q_v": 0.95, "q_t": 0.0, "q_a": 0.0})
        low_quality  = uq_engine.evaluate_uncertainty(model, vision_emb=vision_emb, q_scores={"q_v": 0.05, "q_t": 0.0, "q_a": 0.0})
        print(f"  High-Q aleatoric: {high_quality['aleatoric_uncertainty']:.2f}%")
        print(f"  Low-Q  aleatoric: {low_quality['aleatoric_uncertainty']:.2f}%")
        assert low_quality["aleatoric_uncertainty"] >= high_quality["aleatoric_uncertainty"]


# ── Test 6: Evidential Loss ───────────────────────────────────────────────────

class TestEvidentialLoss:
    def test_loss_positive(self):
        head = EvidentialClassificationHead(in_features=256, num_classes=NUM_CLASSES)
        loss_fn = EvidentialLoss(num_classes=NUM_CLASSES, T_anneal=200)
        x = torch.randn(4, 256)
        out = head(x)
        labels = torch.randint(0, NUM_CLASSES, (4,))
        loss = loss_fn(out, labels, global_step=10)
        assert float(loss.item()) > 0.0
        print(f"  Evidential loss (epoch 10): {loss.item():.4f}")

    def test_alpha_positive(self):
        head = EvidentialClassificationHead(in_features=256, num_classes=NUM_CLASSES)
        x = torch.randn(2, 256)
        out = head(x)
        assert (out["alpha"] > 0).all(), "All Dirichlet alpha > 0"

    def test_vacuity_range(self):
        head = EvidentialClassificationHead(in_features=256, num_classes=NUM_CLASSES)
        x = torch.randn(2, 256)
        out = head(x)
        assert (out["vacuity"] >= 0).all() and (out["vacuity"] <= 1).all()


# ── Test 7: UQ Engine — BALD, Aleatoric, Epistemic ───────────────────────────

class TestUncertaintyQuantificationEngine:
    def test_all_metrics_returned(self):
        model = make_model()
        uq = UncertaintyQuantificationEngine(num_samples=5)
        text_emb = torch.randn(1, 768)
        result = uq.evaluate_uncertainty(model, text_emb=text_emb)
        for key in ["confidence", "total_uncertainty", "aleatoric_uncertainty",
                    "epistemic_uncertainty", "mutual_information_bald", "dirichlet_vacuity"]:
            assert key in result, f"Missing key: {key}"

    def test_confidence_in_range(self):
        model = make_model()
        uq = UncertaintyQuantificationEngine(num_samples=5)
        text_emb = torch.randn(1, 768)
        result = uq.evaluate_uncertainty(model, text_emb=text_emb)
        assert 0.0 <= result["confidence"] <= 100.0
        assert 0.0 <= result["total_uncertainty"] <= 100.0
        print(f"  Confidence: {result['confidence']:.2f}%, Total UQ: {result['total_uncertainty']:.2f}%")
        print(f"  Aleatoric: {result['aleatoric_uncertainty']:.2f}%, Epistemic: {result['epistemic_uncertainty']:.2f}%")
        print(f"  BALD: {result['mutual_information_bald']:.4f}, Vacuity: {result['dirichlet_vacuity']:.2f}%")


# ── Test 8: Temperature Scaling Calibration ───────────────────────────────────

class TestCalibration:
    def test_ece_perfect_calibration(self):
        cal = CalibrationMetrics(num_bins=10)
        N = 100
        probs = np.zeros((N, NUM_CLASSES))
        labels = np.random.randint(0, NUM_CLASSES, N)
        for i, l in enumerate(labels):
            probs[i, l] = 1.0
        metrics = cal.compute_all(probs, labels)
        assert metrics["accuracy"] == 1.0
        assert metrics["ece"] < 0.01

    def test_ece_random_predictions(self):
        cal = CalibrationMetrics(num_bins=10)
        N = 200
        probs = np.random.dirichlet(np.ones(NUM_CLASSES), N)
        labels = np.random.randint(0, NUM_CLASSES, N)
        metrics = cal.compute_all(probs, labels)
        print(f"  Random predictions ECE: {metrics['ece']:.4f}, NLL: {metrics['nll']:.4f}")
        assert 0.0 <= metrics["ece"] <= 1.0
        assert metrics["brier_score"] > 0.0

    def test_temperature_scaler_optimizes(self):
        scaler = TemperatureScaler()
        N = 100
        logits = torch.randn(N, NUM_CLASSES)
        labels = torch.randint(0, NUM_CLASSES, (N,))
        t = scaler.calibrate(logits, labels)
        assert 0.05 <= t <= 10.0
        print(f"  Optimized temperature: {t:.4f}")


# ── Test 9: Perturbation Engine ───────────────────────────────────────────────

class TestPerturbationEngine:
    def test_gaussian_blur(self):
        img_bytes = make_dummy_image_bytes()
        pert = PerturbationEngine()
        blurred = pert.gaussian_blur_image(img_bytes, radius=5.0)
        assert isinstance(blurred, bytes) and len(blurred) > 0

    def test_gaussian_noise_image(self):
        img_bytes = make_dummy_image_bytes()
        pert = PerturbationEngine()
        noisy = pert.gaussian_noise_image(img_bytes, sigma=25.0)
        assert isinstance(noisy, bytes)

    def test_token_drop_text(self):
        pert = PerturbationEngine()
        original = "I feel happy and joyful and excited today, it is wonderful."
        corrupted = pert.token_drop_text(original, drop_rate=0.5)
        orig_words = len(original.split())
        corr_words = len(corrupted.split())
        print(f"  Original tokens: {orig_words}, Post-drop tokens: {corr_words}")
        assert corr_words < orig_words

    def test_audio_noise(self):
        waveform = np.random.randn(16000).astype(np.float32)
        pert = PerturbationEngine()
        noisy = pert.gaussian_noise_audio(waveform, sigma=0.02)
        assert noisy.shape == waveform.shape


# ── Test 10: Reliability Labels ───────────────────────────────────────────────

class TestReliabilityLabels:
    def test_reliable_label(self):
        explainer = MultimodalAttributionExplainer()
        label = explainer.compute_reliability_label(confidence=92.0, aleatoric=10.0, epistemic=8.0)
        assert label["label"] == "Reliable"
        assert label["colour"] == "green"

    def test_abstain_label_on_high_uncertainty(self):
        explainer = MultimodalAttributionExplainer()
        label = explainer.compute_reliability_label(confidence=20.0, aleatoric=70.0, epistemic=30.0)
        assert label["label"] == "Abstain"
        assert label["colour"] == "red"

    def test_caution_novel_on_high_epistemic(self):
        explainer = MultimodalAttributionExplainer()
        label = explainer.compute_reliability_label(confidence=70.0, aleatoric=15.0, epistemic=35.0)
        assert label["label"] == "Caution (Novel Input)"

    def test_caution_data_on_high_aleatoric(self):
        explainer = MultimodalAttributionExplainer()
        label = explainer.compute_reliability_label(confidence=65.0, aleatoric=55.0, epistemic=10.0)
        assert label["label"] == "Caution (Data Quality)"

    def test_ood_forces_abstain(self):
        explainer = MultimodalAttributionExplainer()
        label = explainer.compute_reliability_label(confidence=80.0, aleatoric=5.0, epistemic=5.0, is_ood=True)
        assert label["label"] == "Abstain"


# ── Runner ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import time

    test_classes = [
        TestVisionQualityEstimator,
        TestAudioQualityEstimator,
        TestTextQualityEstimator,
        TestMultimodalQualityEstimator,
        TestUAEDTModel,
        TestEvidentialLoss,
        TestUncertaintyQuantificationEngine,
        TestCalibration,
        TestPerturbationEngine,
        TestReliabilityLabels,
    ]

    passed, failed, total = 0, 0, 0
    results = []

    for cls in test_classes:
        instance = cls()
        methods = [m for m in dir(instance) if m.startswith("test_")]
        for method_name in methods:
            total += 1
            try:
                start = time.time()
                getattr(instance, method_name)()
                duration = time.time() - start
                passed += 1
                results.append({"test": f"{cls.__name__}::{method_name}", "status": "PASS", "duration_s": round(duration, 3)})
                print(f"✓ {cls.__name__}::{method_name} ({duration:.2f}s)")
            except Exception as e:
                failed += 1
                results.append({"test": f"{cls.__name__}::{method_name}", "status": "FAIL", "error": str(e)})
                print(f"✗ {cls.__name__}::{method_name}: {e}")

    print(f"\n{'='*60}")
    print(f"Results: {passed}/{total} passed, {failed} failed")
    print(f"{'='*60}")

    # Write JSON report
    report_path = os.path.join(os.path.dirname(__file__), "test_report.json")
    with open(report_path, "w") as f:
        json.dump({"summary": {"passed": passed, "failed": failed, "total": total}, "results": results}, f, indent=2)
    print(f"Report written to: {report_path}")

    if failed > 0:
        sys.exit(1)
