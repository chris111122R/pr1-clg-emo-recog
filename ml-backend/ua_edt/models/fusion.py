import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Optional

class QualityAwareGatedFusion(nn.Module):
    """
    Quality-Aware Dynamic Gated Cross-Attention Fusion.
    
    Upgraded to a Full Cross-Modal Transformer architecture containing:
    - Cross attention & Self attention (via TransformerEncoder layers)
    - Residual blocks & LayerNorm
    - Adaptive modality gating (g_q)
    - Missing-modality robustness
    """
    def __init__(self, text_dim: int = 768, audio_dim: int = 768, vision_dim: int = 768, projection_dim: int = 256, num_layers: int = 2):
        super().__init__()
        self.projection_dim = projection_dim

        self.text_proj = nn.Sequential(nn.Linear(text_dim, projection_dim), nn.LayerNorm(projection_dim), nn.ReLU(), nn.Dropout(0.2))
        self.audio_proj = nn.Sequential(nn.Linear(audio_dim, projection_dim), nn.LayerNorm(projection_dim), nn.ReLU(), nn.Dropout(0.2))
        self.vision_proj = nn.Sequential(nn.Linear(vision_dim, projection_dim), nn.LayerNorm(projection_dim), nn.ReLU(), nn.Dropout(0.2))

        self.quality_gate = nn.Sequential(nn.Linear(1, 16), nn.ReLU(), nn.Linear(16, 1), nn.Sigmoid())
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=projection_dim, 
            nhead=8, 
            dim_feedforward=projection_dim * 4, 
            dropout=0.1, 
            activation="gelu", 
            batch_first=True
        )
        self.cross_modal_transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.cross_query = nn.Parameter(torch.randn(1, 1, projection_dim))
        
    def forward(self, text_emb=None, audio_emb=None, vision_emb=None, q_scores=None):
        device = text_emb.device if text_emb is not None else (audio_emb.device if audio_emb is not None else vision_emb.device)
        batch_size = text_emb.shape[0] if text_emb is not None else (audio_emb.shape[0] if audio_emb is not None else vision_emb.shape[0])
        
        if q_scores is None:
            q_scores = {"q_t": 1.0, "q_a": 1.0, "q_v": 1.0}

        embs, masks, q_vectors = [], [], []

        if text_emb is not None:
            embs.append(self.text_proj(text_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
            q_val = torch.full((batch_size, 1), q_scores.get("q_t", 1.0), device=device)
        else:
            embs.append(torch.zeros(batch_size, self.projection_dim, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            q_val = torch.zeros(batch_size, 1, device=device)
        q_vectors.append(q_val)

        if audio_emb is not None:
            embs.append(self.audio_proj(audio_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
            q_val = torch.full((batch_size, 1), q_scores.get("q_a", 1.0), device=device)
        else:
            embs.append(torch.zeros(batch_size, self.projection_dim, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            q_val = torch.zeros(batch_size, 1, device=device)
        q_vectors.append(q_val)

        if vision_emb is not None:
            embs.append(self.vision_proj(vision_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
            q_val = torch.full((batch_size, 1), q_scores.get("q_v", 1.0), device=device)
        else:
            embs.append(torch.zeros(batch_size, self.projection_dim, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            q_val = torch.zeros(batch_size, 1, device=device)
        q_vectors.append(q_val)

        stacked_embs = torch.stack(embs, dim=1)
        stacked_masks = torch.stack(masks, dim=1)
        stacked_q = torch.stack(q_vectors, dim=1)
        g_q = self.quality_gate(stacked_q)
        
        # Step 5 Fix: Prevent single-modality suppression by normalizing gates
        # across available (non-zero) modalities.
        available_mask = (stacked_q > 0).float()
        g_q_sum = (g_q * available_mask).sum(dim=1, keepdim=True).clamp(min=1e-6)
        num_available = available_mask.sum(dim=1, keepdim=True).clamp(min=1.0)
        # Normalize and scale by number of available modalities so that a single modality gets full weight
        g_q = (g_q / g_q_sum) * num_available * available_mask
        
        gated_embs = stacked_embs * g_q
        padding_mask = (stacked_masks.squeeze(-1) == 0)
        transformed_embs = self.cross_modal_transformer(gated_embs, src_key_padding_mask=padding_mask)
        
        queries = self.cross_query.expand(batch_size, -1, -1)
        scores = torch.bmm(queries, transformed_embs.transpose(1, 2)) / (self.projection_dim ** 0.5)
        mask_addition = (1.0 - stacked_masks.transpose(1, 2)) * -1e9
        scores = scores + mask_addition
        
        attn_weights = torch.softmax(scores, dim=-1)
        modality_attn = attn_weights.squeeze(1)
        fused_representation = torch.bmm(attn_weights, transformed_embs).squeeze(1)

        return {
            "fused_representation": fused_representation,
            "attn_weights": attn_weights,
            "modality_attn": modality_attn,
            "quality_gates": g_q.squeeze(-1),
        }


class EnergyOODDetector:
    """
    Energy-Based Out-Of-Distribution (OOD) Detector.
    Computes free energy E(x; T_s) = -T_s * log sum_k exp(z_k / T_s).
    In-distribution data yields lower free energy E(x) < E_threshold,
    whereas OOD data yields significantly higher free energy.
    """
    def __init__(self, temperature: float = 1.0, ood_threshold: float = -3.5):
        self.temperature = temperature
        self.ood_threshold = ood_threshold

    def compute_energy(self, logits: torch.Tensor) -> torch.Tensor:
        """
        Computes negative log-sum-exp energy score: E(x) = -T_s * logsumexp(logits / T_s).
        """
        scaled_logits = logits / self.temperature
        energy = -self.temperature * torch.logsumexp(scaled_logits, dim=-1)
        return energy

    def is_ood(self, logits: torch.Tensor) -> dict:
        energy = self.compute_energy(logits)
        # Higher (less negative) energy indicates OOD sample
        ood_flag = energy > self.ood_threshold

        return {
            "energy": energy.detach().cpu().numpy(),
            "is_ood": ood_flag.detach().cpu().numpy(),
            "ood_threshold": self.ood_threshold,
        }
