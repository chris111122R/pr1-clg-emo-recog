import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Tuple, Optional

class UncertaintyEstimator:
    """
    Handles Monte Carlo Dropout and Temperature Scaling to calibrate confidence 
    and output uncertainty scores.
    """
    def __init__(self, temperature: float = 1.0):
        self.temperature = temperature

    def set_temperature(self, val: float):
        """Sets calibrated scaling temperature."""
        self.temperature = max(0.1, val)

    def calibrate_logits(self, logits: torch.Tensor) -> torch.Tensor:
        """Applies temperature scaling to raw model logits."""
        return logits / self.temperature

    def enable_dropout_only(self, model: nn.Module):
        """Forces dropout layers to stay active during inference mode."""
        for m in model.modules():
            if m.__class__.__name__.startswith('Dropout'):
                m.train()

    def estimate_uncertainty_mc(self, 
                               model: nn.Module, 
                               *args, 
                               num_samples: int = 15,
                               **kwargs) -> Tuple[torch.Tensor, float, float]:
        """
        Runs Monte Carlo Dropout to estimate model confidence and prediction uncertainty.
        
        Args:
            model: PyTorch neural network module.
            num_samples: Number of forward passes.
            *args, **kwargs: Forward inputs (embeddings, etc.).
        
        Returns:
            mean_probs: The calibrated probabilities tensor.
            confidence_score: Maximum probability percentage.
            uncertainty_score: Normalized predictive entropy percentage.
        """
        model.eval()
        self.enable_dropout_only(model)
        
        all_logits = []
        with torch.no_grad():
            for _ in range(num_samples):
                logits = model(*args, **kwargs)
                all_logits.append(logits)
                
        # Stack: Shape (num_samples, batch_size, num_classes)
        stacked_logits = torch.stack(all_logits, dim=0)
        
        # Apply temperature calibration to raw logits
        calibrated_logits = self.calibrate_logits(stacked_logits)
        
        # Softmax: Shape (num_samples, batch_size, num_classes)
        probs = F.softmax(calibrated_logits, dim=-1)
        
        # Calculate mean probability distribution: Shape (batch_size, num_classes)
        mean_probs = torch.mean(probs, dim=0)[0]
        
        # Calculate predictive entropy as a measure of model uncertainty
        # Entropy = -sum(p * log(p))
        entropy = -torch.sum(mean_probs * torch.log(mean_probs + 1e-9)).item()
        
        # Normalized entropy: max entropy for C classes is ln(C).
        # Assuming 7 classes (Joy, Sadness, Anger, Fear, Surprise, Disgust, Neutral), max is ln(7) = 1.9459
        num_classes = mean_probs.shape[-1]
        max_entropy = torch.log(torch.tensor(float(num_classes))).item()
        normalized_uncertainty = min(entropy / max_entropy, 1.0)
        
        max_prob, _ = torch.max(mean_probs, dim=-1)
        
        confidence_score = max_prob.item() * 100
        uncertainty_score = normalized_uncertainty * 100
        
        return mean_probs, confidence_score, uncertainty_score
