"""
ua_edt.data — Dataset harmonization, domain adaptation, and augmentation utilities.

Provides:
  - UnifiedEmotionHarmonizer: Cross-dataset label mapping to 7-class taxonomy.
  - ClassBalancedFocalLoss: CB-Focal loss with Effective Number of Samples weighting.
  - MMDLoss: Maximum Mean Discrepancy domain adaptation loss.
  - SoftLabelConstructor: Converts valence/arousal to soft probability distributions.
"""

from .harmonizer import (
    UnifiedEmotionHarmonizer,
    ClassBalancedFocalLoss,
    MMDLoss,
    SoftLabelConstructor,
    UNIFIED_EMOTIONS,
    UNIFIED_EMOTION_TO_IDX,
)
from .downloader import DatasetManager
from .preprocessing import VisionPreprocessor, AudioPreprocessor, TextPreprocessor
from .samplers import SpeakerIndependentSampler, get_class_balanced_sampler
from .datasets import (
    MultimodalBaseDataset, 
    CMUMOSEIDataset, 
    IEMOCAPDataset, 
    AffectNetDataset, 
    GoEmotionsDataset
)

__all__ = [
    "UnifiedEmotionHarmonizer",
    "ClassBalancedFocalLoss",
    "MMDLoss",
    "SoftLabelConstructor",
    "UNIFIED_EMOTIONS",
    "UNIFIED_EMOTION_TO_IDX",
    "DatasetManager",
    "VisionPreprocessor",
    "AudioPreprocessor",
    "TextPreprocessor",
    "SpeakerIndependentSampler",
    "get_class_balanced_sampler",
    "MultimodalBaseDataset",
    "CMUMOSEIDataset",
    "IEMOCAPDataset",
    "AffectNetDataset",
    "GoEmotionsDataset"
]
