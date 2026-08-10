import re

with open("api/inference.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add new imports
import_block = """
# ── Research-Grade UA-EDT Package ────────────────────────────────────────────
from ua_edt.models.ua_edt_model import UAEDTMultimodalModel
from ua_edt.uncertainty.mc_dropout import UncertaintyQuantificationEngine
from ua_edt.uncertainty.calibration import CalibrationMetrics
from ua_edt.quality.quality_estimator import MultimodalQualityEstimator
from ua_edt.xai.explainability import MultimodalAttributionExplainer, AudioSpectrogramAttribution
from ua_edt.models.backbones import ModalityBackboneRegistry

import io
import soundfile as sf
import librosa
from PIL import Image
from transformers import AutoTokenizer, CLIPProcessor, Wav2Vec2Processor
"""
code = re.sub(r'# ── Research-Grade UA-EDT Package.*?from ua_edt\.xai\.explainability import MultimodalAttributionExplainer, AudioSpectrogramAttribution', import_block, code, flags=re.DOTALL)

# 2. Add Backbone Registry Initialization
init_block = """
# ── Core Engines ─────────────────────────────────────────────────────────────
uq_engine = UncertaintyQuantificationEngine(num_samples=30, temperature=1.15)
quality_estimator = MultimodalQualityEstimator()
attribution_explainer = MultimodalAttributionExplainer()
audio_attributor = AudioSpectrogramAttribution()
intervention_engine = InterventionEngine()
calibration_metrics = CalibrationMetrics(num_bins=15)

# Initialize Modality Backbone Registry
try:
    backbone_registry = ModalityBackboneRegistry.build(proj_dim=256)
    text_tokenizer = AutoTokenizer.from_pretrained(backbone_registry.config.text.checkpoint)
    vision_processor = CLIPProcessor.from_pretrained(backbone_registry.config.vision.checkpoint)
    audio_processor = Wav2Vec2Processor.from_pretrained(backbone_registry.config.audio.checkpoint)
except Exception as e:
    logger.error(f"Failed to load processors/registry: {e}")
    backbone_registry = None
    text_tokenizer = None
    vision_processor = None
    audio_processor = None
"""
code = re.sub(r'# ── Core Engines.*?calibration_metrics = CalibrationMetrics\(num_bins=15\)', init_block, code, flags=re.DOTALL)

# 3. Replace mock embedding and add processors
processing_helpers = """
def process_text_for_backbone(text: str) -> Optional[torch.Tensor]:
    if text_tokenizer is None or backbone_registry is None: return None
    inputs = text_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    return backbone_registry.extract_raw_text(inputs)

def process_audio_for_backbone(audio_bytes: bytes) -> Optional[torch.Tensor]:
    if audio_processor is None or backbone_registry is None: return None
    try:
        with io.BytesIO(audio_bytes) as f:
            audio_data, sr = sf.read(f)
        if len(audio_data.shape) > 1:
            audio_data = audio_data.mean(axis=1) # stereo to mono
        if sr != 16000:
            audio_data = librosa.resample(audio_data, orig_sr=sr, target_sr=16000)
        inputs = audio_processor(audio_data, sampling_rate=16000, return_tensors="pt")
        return backbone_registry.extract_raw_audio(inputs)
    except Exception as e:
        logger.error(f"Audio processing error: {e}")
        return None

def process_image_for_backbone(image_bytes: bytes) -> Optional[torch.Tensor]:
    if vision_processor is None or backbone_registry is None: return None
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        inputs = vision_processor(images=image, return_tensors="pt")
        return backbone_registry.extract_raw_vision(inputs)
    except Exception as e:
        logger.error(f"Image processing error: {e}")
        return None
"""
code = re.sub(r'def build_mock_embedding\(modality: str\) -> torch\.Tensor:.*?return F\.normalize\(emb, dim=-1\)', processing_helpers, code, flags=re.DOTALL)

# 4. Replace predict_text
code = code.replace('text_emb = build_mock_embedding("text")', 'text_emb = process_text_for_backbone(request.text)')
# 5. Replace predict_audio
code = code.replace('audio_emb = build_mock_embedding("audio")', 'audio_emb = process_audio_for_backbone(audio_bytes)')
# 6. Replace predict_image
code = code.replace('vision_emb = build_mock_embedding("vision")', 'vision_emb = process_image_for_backbone(image_bytes)')

# 7. Replace multimodal mock embeddings
multimodal_repl = """        # 2. Embeddings
        text_emb = process_text_for_backbone(text) if text else None
        audio_emb = process_audio_for_backbone(audio_bytes) if audio_bytes else None
        vision_emb = process_image_for_backbone(image_bytes) if image_bytes else None"""
code = re.sub(r'# 2\. Embeddings.*?vision_emb = build_mock_embedding\("vision"\) if image_bytes else None', multimodal_repl, code, flags=re.DOTALL)


with open("api/inference.py", "w", encoding="utf-8") as f:
    f.write(code)

print("inference.py successfully refactored!")
