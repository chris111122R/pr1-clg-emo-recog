import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F

logger = logging.getLogger(__name__)

@dataclass
class BackboneConfig:
    checkpoint: str
    hidden_size: int
    pooling: str = "mean"
    layer_norm: bool = True

class ModalityProjector(nn.Module):
    def __init__(self, in_dim: int, out_dim: int = 256, hidden_dim: int = 512, normalize: bool = True) -> None:
        super().__init__()
        self.normalize = normalize
        self.mlp = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, out_dim),
        )

    def forward(self, h: torch.Tensor) -> torch.Tensor:
        z = self.mlp(h)
        if self.normalize:
            z = F.normalize(z, p=2, dim=-1)
        return z

class ModalityEncoder(nn.Module):
    def __init__(self, config: BackboneConfig, proj_dim: int = 256, freeze_backbone: bool = True) -> None:
        super().__init__()
        self.config = config
        self.proj_dim = proj_dim
        self._backbone = None
        self.projector = ModalityProjector(in_dim=config.hidden_size, out_dim=proj_dim, normalize=True)
        self._freeze_backbone = freeze_backbone

    def _load_backbone(self) -> nn.Module:
        from transformers import AutoModel, ViTModel, Wav2Vec2Model, SwinModel, VideoMAEModel
        checkpoint = self.config.checkpoint
        logger.info(f"Loading backbone: {checkpoint}")

        try:
            if "swin" in checkpoint.lower():
                model = SwinModel.from_pretrained(checkpoint)
            elif "vit" in checkpoint.lower():
                model = ViTModel.from_pretrained(checkpoint)
            elif "wav2vec2" in checkpoint.lower():
                model = Wav2Vec2Model.from_pretrained(checkpoint)
            elif "videomae" in checkpoint.lower():
                model = VideoMAEModel.from_pretrained(checkpoint)
            else:
                model = AutoModel.from_pretrained(checkpoint)

            if hasattr(model, "gradient_checkpointing_enable"):
                model.gradient_checkpointing_enable()

            if self._freeze_backbone:
                for param in model.parameters():
                    param.requires_grad = False
        except Exception as e:
            logger.error(f"Failed to load backbone '{checkpoint}': {e}.")
            model = None

        return model

    def get_backbone(self) -> Optional[nn.Module]:
        if self._backbone is None:
            self._backbone = self._load_backbone()
        return self._backbone

    def _pool_output(self, backbone_output) -> torch.Tensor:
        if hasattr(backbone_output, "last_hidden_state"):
            hidden = backbone_output.last_hidden_state
        elif hasattr(backbone_output, "pooler_output") and backbone_output.pooler_output is not None:
            return backbone_output.pooler_output
        elif isinstance(backbone_output, torch.Tensor):
            hidden = backbone_output
        else:
            hidden = backbone_output[0]

        if self.config.pooling == "cls":
            return hidden[:, 0, :]
        elif self.config.pooling == "mean":
            return hidden.mean(dim=1)
        elif self.config.pooling == "last":
            return hidden[:, -1, :]
        else:
            return hidden.mean(dim=1)

    def extract_raw_features(self, inputs: Dict[str, torch.Tensor]) -> torch.Tensor:
        backbone = self.get_backbone()
        if backbone is None:
            batch_size = next(iter(inputs.values())).shape[0]
            device = next(iter(inputs.values())).device
            return torch.zeros(batch_size, self.config.hidden_size, device=device)

        device = next(backbone.parameters()).device
        inputs_on_device = {k: v.to(device) for k, v in inputs.items()}
        with torch.set_grad_enabled(not self._freeze_backbone):
            backbone_out = backbone(**inputs_on_device)
        return self._pool_output(backbone_out)


class ModalityBackboneRegistry:
    def __init__(self, proj_dim: int = 256) -> None:
        self.proj_dim = proj_dim
        
        # Upgraded to large models per requirements
        self.text_config = BackboneConfig(checkpoint="microsoft/deberta-v3-large", hidden_size=1024, pooling="cls")
        self.image_config = BackboneConfig(checkpoint="microsoft/swin-base-patch4-window7-224", hidden_size=1024, pooling="mean")
        self.face_config = BackboneConfig(checkpoint="google/vit-base-patch16-224", hidden_size=768, pooling="cls")
        self.audio_config = BackboneConfig(checkpoint="facebook/wav2vec2-large-960h", hidden_size=1024, pooling="mean")
        self.video_config = BackboneConfig(checkpoint="MCG-NJU/videomae-base", hidden_size=768, pooling="mean")

        self.text_encoder = ModalityEncoder(self.text_config, proj_dim=proj_dim)
        self.image_encoder = ModalityEncoder(self.image_config, proj_dim=proj_dim)
        self.face_encoder = ModalityEncoder(self.face_config, proj_dim=proj_dim)
        self.audio_encoder = ModalityEncoder(self.audio_config, proj_dim=proj_dim)
        self.video_encoder = ModalityEncoder(self.video_config, proj_dim=proj_dim)

    def extract_raw_text(self, inputs): return self.text_encoder.extract_raw_features(inputs)
    def extract_raw_image(self, inputs): return self.image_encoder.extract_raw_features(inputs)
    def extract_raw_face(self, inputs): return self.face_encoder.extract_raw_features(inputs)
    def extract_raw_audio(self, inputs): return self.audio_encoder.extract_raw_features(inputs)
    def extract_raw_video(self, inputs): return self.video_encoder.extract_raw_features(inputs)
