import torch
import torch.nn as nn
from typing import Dict, Any, Optional

class CrossModalTransformerFusion(nn.Module):
    def __init__(self, d_model=256, nhead=8, num_layers=3):
        super().__init__()
        self.d_model = d_model
        
        # Adaptive modality weights
        self.modality_weights = nn.Parameter(torch.ones(5))
        
        # Transformer for self/cross attention across modalities
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Gated Multimodal Unit logic can be represented through the residual connections in transformer
        self.layer_norm = nn.LayerNorm(d_model)

    def forward(self, text_emb, image_emb, face_emb, audio_emb, video_emb):
        # Stack available modalities
        # Handle missing modalities by passing zero-tensors (handled by extract_raw_features fallback)
        embs_provided = [e for e in [text_emb, image_emb, face_emb, audio_emb, video_emb] if e is not None]
        if not embs_provided:
            raise ValueError("At least one modality must be provided")
        batch_size = embs_provided[0].shape[0]
        device = embs_provided[0].device
        
        embs = [
            text_emb if text_emb is not None else torch.zeros(batch_size, self.d_model, device=device),
            image_emb if image_emb is not None else torch.zeros(batch_size, self.d_model, device=device),
            face_emb if face_emb is not None else torch.zeros(batch_size, self.d_model, device=device),
            audio_emb if audio_emb is not None else torch.zeros(batch_size, self.d_model, device=device),
            video_emb if video_emb is not None else torch.zeros(batch_size, self.d_model, device=device)
        ]
        
        # Apply adaptive modality weights
        weights = torch.softmax(self.modality_weights, dim=0)
        weighted_embs = [emb * w for emb, w in zip(embs, weights)]
        
        # (Batch, 5, d_model)
        stacked = torch.stack(weighted_embs, dim=1) 
        
        # Transformer Self/Cross attention
        transformed = self.transformer(stacked)
        
        # Pool to single representation (Mean pooling across modalities)
        fused = transformed.mean(dim=1)
        fused = self.layer_norm(fused)
        
        return fused, weights


class MultiTaskHeads(nn.Module):
    def __init__(self, in_features=256):
        super().__init__()
        self.goemotions_head = nn.Linear(in_features, 28)
        self.emotic_head = nn.Linear(in_features, 26)
        self.fer_head = nn.Linear(in_features, 8)
        self.vad_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Linear(128, 3) # Valence, Arousal, Dominance
        )
        self.aleatoric_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Linear(128, 3) # Variance for VAD
        )
        # Evidential outputs alpha for Dirichlet distribution (must be > 1)
        self.evidential_head = nn.Sequential(
            nn.Linear(in_features, 28), # Using GoEmotions as primary for evidential
            nn.Softplus()
        )

    def forward(self, fused_rep):
        return {
            "goemotions": self.goemotions_head(fused_rep),
            "emotic": self.emotic_head(fused_rep),
            "fer": self.fer_head(fused_rep),
            "vad": self.vad_head(fused_rep),
            "aleatoric_var": torch.exp(self.aleatoric_head(fused_rep)), # Must be positive
            "evidential_alpha": self.evidential_head(fused_rep) + 1.0 # Dirichlet alpha > 1
        }

class UAEDTMultimodalModel(nn.Module):
    def __init__(self, d_model=256):
        super().__init__()
        
        # Projectors to convert from backbone dims (1024/768) to d_model (256)
        self.text_proj = nn.Linear(1024, d_model)
        self.image_proj = nn.Linear(1024, d_model)
        self.face_proj = nn.Linear(768, d_model)
        self.audio_proj = nn.Linear(1024, d_model)
        self.video_proj = nn.Linear(768, d_model)
        
        self.fusion = CrossModalTransformerFusion(d_model=d_model)
        self.heads = MultiTaskHeads(in_features=d_model)

    def forward(self, text_emb=None, image_emb=None, face_emb=None, audio_emb=None, video_emb=None):
        # Project embeddings
        p_text = self.text_proj(text_emb) if text_emb is not None else None
        p_image = self.image_proj(image_emb) if image_emb is not None else None
        p_face = self.face_proj(face_emb) if face_emb is not None else None
        p_audio = self.audio_proj(audio_emb) if audio_emb is not None else None
        p_video = self.video_proj(video_emb) if video_emb is not None else None
        
        # Fuse
        fused_vec, modality_weights = self.fusion(p_text, p_image, p_face, p_audio, p_video)
        
        # Multi-task heads
        outputs = self.heads(fused_vec)
        outputs["fused_representation"] = fused_vec
        outputs["modality_weights"] = modality_weights
        
        return outputs
