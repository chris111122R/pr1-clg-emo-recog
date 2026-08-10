import torch
import torch.nn.functional as F
import numpy as np

class OODDetector:
    def __init__(self, temperature=1.0):
        self.temperature = temperature
        
    def energy_score(self, logits):
        """Energy-based OOD detection."""
        energy = -self.temperature * torch.logsumexp(logits / self.temperature, dim=-1)
        return energy

    def msp_score(self, logits):
        """Maximum Softmax Probability (MSP)."""
        probs = F.softmax(logits, dim=-1)
        msp, _ = torch.max(probs, dim=-1)
        return 1.0 - msp # Lower MSP means more likely OOD
        
    def odin_score(self, logits):
        """ODIN score (Temperature scaled MSP)."""
        probs = F.softmax(logits / self.temperature, dim=-1)
        odin, _ = torch.max(probs, dim=-1)
        return 1.0 - odin

    def evaluate_all(self, logits):
        e_score = self.energy_score(logits)[0].item()
        m_score = self.msp_score(logits)[0].item()
        o_score = self.odin_score(logits)[0].item()
        
        # Heuristic fusion of OOD metrics
        is_ood = e_score > 10.0 or m_score > 0.8
        
        return {
            "energy_score": e_score,
            "msp_score": m_score,
            "odin_score": o_score,
            "is_ood": is_ood
        }
