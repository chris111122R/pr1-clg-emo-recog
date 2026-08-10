import torch
import pytest
from services.model_pipeline import MultiModalAttentionFusion
from services.uncertainty_estimator import UncertaintyEstimator
from services.explainability_engine import ExplainabilityEngine
from services.intervention_engine import InterventionEngine

def test_multimodal_attention_fusion_shapes():
    # Setup fusion model
    model = MultiModalAttentionFusion(
        text_dim=768,
        audio_dim=768,
        vision_dim=768,
        projection_dim=256,
        num_classes=7
    )
    model.eval()
    
    # Test batch size of 2
    text_emb = torch.randn(2, 768)
    audio_emb = torch.randn(2, 768)
    vision_emb = torch.randn(2, 768)
    
    # Test full multimodal forward pass
    out = model(text_emb, audio_emb, vision_emb)
    assert out.shape == (2, 7)
    
    # Test missing modalities (e.g. text only)
    out_text = model(text_emb=text_emb, audio_emb=None, vision_emb=None)
    assert out_text.shape == (2, 7)
    
    # Test missing modalities (e.g. audio + vision only)
    out_audio_vision = model(text_emb=None, audio_emb=audio_emb, vision_emb=vision_emb)
    assert out_audio_vision.shape == (2, 7)

def test_uncertainty_estimator_mc_dropout():
    model = MultiModalAttentionFusion(num_classes=7)
    estimator = UncertaintyEstimator(temperature=1.15)
    
    text_emb = torch.randn(1, 768)
    
    # Run MC Dropout
    probs, confidence, uncertainty = estimator.estimate_uncertainty_mc(
        model, text_emb=text_emb, num_samples=10
    )
    
    # Assert probability bounds
    assert len(probs) == 7
    assert abs(torch.sum(probs).item() - 1.0) < 1e-4
    assert 0.0 <= confidence <= 100.0
    assert 0.0 <= uncertainty <= 100.0

def test_explainability_outputs():
    engine = ExplainabilityEngine()
    
    # Test text attribution
    text = "I feel incredibly happy and excited today"
    res = engine.explain_text(text, "Joy")
    assert "attributions" in res
    assert "key_factors" in res
    assert any(item["token"] == "happy" for item in res["attributions"])
    
    # Test vision attribution
    res_img = engine.explain_vision(b"mock_bytes", "Joy")
    assert "region_attributions" in res_img
    assert res_img["region_attributions"]["mouth_region_weight"] == 0.65

def test_intervention_generation():
    engine = InterventionEngine()
    
    # Standard intervention for Sadness
    res = engine.generate_intervention("Sadness", 85.0, 10.0, "Low")
    assert "recommendation" in res
    assert "CBT" in res["evidence_base"]
    assert "crisis" not in res["recommendation"]
    
    # High risk escalation
    res_high = engine.generate_intervention("Sadness", 85.0, 10.0, "High")
    assert "CRITICAL ELEVATION" in res_high["recommendation"]
    
    # High uncertainty fallback
    res_uncertain = engine.generate_intervention("Sadness", 30.0, 80.0, "Low")
    assert res_uncertain["intervention_type"] == "Data Clarification Request"
