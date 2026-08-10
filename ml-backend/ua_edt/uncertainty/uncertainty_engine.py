import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class UncertaintyQuantificationEngine:
    def __init__(self, num_samples: int = 30, temperature: float = 1.0):
        self.num_samples = num_samples
        self.temperature = temperature

    def enable_dropout_only(self, model: nn.Module):
        for m in model.modules():
            if isinstance(m, (nn.Dropout, nn.Dropout2d, nn.Dropout3d)):
                m.train()

    def evaluate_uncertainty(self, model: nn.Module, text_emb=None, audio_emb=None, vision_emb=None, video_emb=None, q_scores=None) -> dict:
        model.eval()
        self.enable_dropout_only(model)

        mc_probs = []
        mc_logits = []
        mc_alpha = []
        mc_aleatoric_var = []

        with torch.no_grad():
            for _ in range(self.num_samples):
                out = model(text_emb=text_emb, audio_emb=audio_emb, face_emb=None, image_emb=vision_emb, video_emb=video_emb)
                logits = out["goemotions"] / self.temperature
                probs = F.softmax(logits, dim=-1)
                
                mc_probs.append(probs)
                mc_logits.append(logits)
                mc_alpha.append(out["evidential_alpha"])
                mc_aleatoric_var.append(out["aleatoric_var"])

        stacked_probs = torch.stack(mc_probs, dim=0)
        
        # Mean Predictive Distribution P_bar(c|x)
        mean_probs = torch.mean(stacked_probs, dim=0)[0]
        max_prob, predicted_idx = torch.max(mean_probs, dim=-1)

        # Predictive Entropy H[P(y|x)] (Total Uncertainty)
        num_classes = mean_probs.shape[-1]
        max_entropy = np.log(num_classes)
        predictive_entropy = -torch.sum(mean_probs * torch.log(mean_probs + 1e-9)).item()
        
        # Aleatoric Uncertainty (Expected Data Entropy + Regression Aleatoric Var)
        per_sample_entropy = -torch.sum(stacked_probs * torch.log(stacked_probs + 1e-9), dim=-1)
        expected_sample_entropy = torch.mean(per_sample_entropy, dim=0)[0].item()
        
        mean_regression_var = torch.mean(torch.stack(mc_aleatoric_var, dim=0), dim=0)[0].mean().item()
        normalized_aleatoric = min(100.0, ((expected_sample_entropy / max_entropy) + (mean_regression_var * 0.1)) * 100.0)

        # Epistemic Uncertainty (Mutual Information)
        mutual_info = max(0.0, predictive_entropy - expected_sample_entropy)
        normalized_epistemic = min(100.0, (mutual_info / max_entropy) * 100.0)

        # Dirichlet Evidential Bounds
        mean_alpha = torch.mean(torch.stack(mc_alpha, dim=0), dim=0)[0]
        S = torch.sum(mean_alpha).item()
        vacuity = num_classes / S
        
        return {
            "prediction_idx": predicted_idx.item(),
            "confidence": round(max_prob.item() * 100.0, 2),
            "total_uncertainty": round(min(100.0, normalized_aleatoric + normalized_epistemic), 2),
            "aleatoric_uncertainty": round(normalized_aleatoric, 2),
            "epistemic_uncertainty": round(normalized_epistemic, 2),
            "predictive_entropy": round(predictive_entropy, 4),
            "mutual_information_bald": round(mutual_info, 4),
            "dirichlet_vacuity": round(vacuity * 100.0, 2),
            "mean_probs": mean_probs.detach().cpu().numpy()
        }

class DeepEnsembleManager:
    """Manages 5 independent models for deep ensemble epistemic UQ."""
    def __init__(self, models: list):
        self.models = models # List of 5 pre-loaded models
        
    def evaluate(self, **kwargs):
        ensemble_probs = []
        with torch.no_grad():
            for model in self.models:
                model.eval()
                out = model(**kwargs)
                probs = F.softmax(out["goemotions"], dim=-1)
                ensemble_probs.append(probs)
        
        stacked_probs = torch.stack(ensemble_probs, dim=0)
        mean_probs = torch.mean(stacked_probs, dim=0)
        variance = torch.var(stacked_probs, dim=0).mean().item()
        
        return {
            "mean_probs": mean_probs,
            "epistemic_variance": variance
        }
