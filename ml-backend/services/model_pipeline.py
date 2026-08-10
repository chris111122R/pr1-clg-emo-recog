import torch
import torch.nn as nn
from transformers import AutoModel, AutoConfig
from typing import Dict, Any, Optional

class MultiModalAttentionFusion(nn.Module):
    """
    Attention-based fusion model. 
    Combines text, audio, and visual embeddings using cross-attention,
    learning adaptive weights, and handles missing modalities gracefully.
    """
    def __init__(self, text_dim: int = 768, audio_dim: int = 768, vision_dim: int = 768, projection_dim: int = 256, num_classes: int = 7):
        super().__init__()
        
        # Project all dimensions to a common fusion space
        self.text_proj = nn.Sequential(
            nn.Linear(text_dim, projection_dim),
            nn.LayerNorm(projection_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        self.audio_proj = nn.Sequential(
            nn.Linear(audio_dim, projection_dim),
            nn.LayerNorm(projection_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        self.vision_proj = nn.Sequential(
            nn.Linear(vision_dim, projection_dim),
            nn.LayerNorm(projection_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Attention Query, Key, Value systems for adaptive weighting
        self.query = nn.Linear(projection_dim, projection_dim)
        self.key = nn.Linear(projection_dim, projection_dim)
        self.value = nn.Linear(projection_dim, projection_dim)
        
        # Final classification layers
        self.classifier = nn.Sequential(
            nn.Linear(projection_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )
        
    def forward(self, 
                text_emb: Optional[torch.Tensor] = None, 
                audio_emb: Optional[torch.Tensor] = None, 
                vision_emb: Optional[torch.Tensor] = None) -> torch.Tensor:
        
        device = text_emb.device if text_emb is not None else (audio_emb.device if audio_emb is not None else vision_emb.device)
        batch_size = text_emb.shape[0] if text_emb is not None else (audio_emb.shape[0] if audio_emb is not None else vision_emb.shape[0])
        
        embs = []
        masks = []
        
        # Project and assemble available modalities
        if text_emb is not None:
            embs.append(self.text_proj(text_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
        else:
            embs.append(torch.zeros(batch_size, self.text_proj[0].out_features, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            
        if audio_emb is not None:
            embs.append(self.audio_proj(audio_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
        else:
            embs.append(torch.zeros(batch_size, self.audio_proj[0].out_features, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            
        if vision_emb is not None:
            embs.append(self.vision_proj(vision_emb))
            masks.append(torch.ones(batch_size, 1, device=device))
        else:
            embs.append(torch.zeros(batch_size, self.vision_proj[0].out_features, device=device))
            masks.append(torch.zeros(batch_size, 1, device=device))
            
        # Stack embeddings: Shape (batch_size, 3, projection_dim)
        stacked_embs = torch.stack(embs, dim=1)
        # Stack masks: Shape (batch_size, 3, 1)
        stacked_masks = torch.stack(masks, dim=1)
        
        # Calculate cross-attention
        Q = self.query(stacked_embs)
        K = self.key(stacked_embs)
        V = self.value(stacked_embs)
        
        # Attention scores (Q * K^T) / sqrt(d)
        scores = torch.bmm(Q, K.transpose(1, 2)) / (Q.shape[-1] ** 0.5)
        
        # Apply missing-modality mask (set attention to -inf for inactive modalities)
        mask_addition = (1.0 - stacked_masks.expand_as(scores)) * -1e9
        scores = scores + mask_addition
        
        # Softmax weights
        attn_weights = torch.softmax(scores, dim=-1)
        
        # Weighted representation: Shape (batch_size, 3, projection_dim)
        attn_output = torch.bmm(attn_weights, V)
        
        # Aggregate across modalities (taking mean of active ones)
        sum_output = torch.sum(attn_output * stacked_masks, dim=1)
        active_count = torch.sum(stacked_masks, dim=1).clamp(min=1.0)
        fused_representation = sum_output / active_count
        
        # Output logit predictions
        return self.classifier(fused_representation)

# Helper functions to load models and extract embeddings
class ModelPipeline:
    """Manages loading of modality-specific transformers and extracting feature embeddings."""
    def __init__(self):
        # We define checkpoints we want to use
        self.text_checkpoint = "microsoft/deberta-v3-small"
        self.audio_checkpoint = "facebook/wav2vec2-base-960h"
        self.vision_checkpoint = "microsoft/vit-base-patch16-224"
        
        # Lazy load weights to avoid loading latency on initialize
        self._text_model = None
        self._audio_model = None
        self._vision_model = None

    def get_text_encoder(self):
        if self._text_model is None:
            self._text_model = AutoModel.from_pretrained(self.text_checkpoint)
        return self._text_model

    def get_audio_encoder(self):
        if self._audio_model is None:
            self._audio_model = AutoModel.from_pretrained(self.audio_checkpoint)
        return self._audio_model

    def get_vision_encoder(self):
        if self._vision_model is None:
            self._vision_model = AutoModel.from_pretrained(self.vision_checkpoint)
        return self._vision_model
