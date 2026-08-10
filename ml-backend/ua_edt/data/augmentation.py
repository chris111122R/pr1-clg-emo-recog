import random
import numpy as np
import torch
import torchvision.transforms as T
import torchaudio.transforms as AT

# Text Augmentations
def synonym_replacement(text: str, p: float = 0.1) -> str:
    # A simplified mock implementation of synonym replacement
    if random.random() > p: return text
    words = text.split()
    if not words: return text
    idx = random.randint(0, len(words) - 1)
    words[idx] = "[SYN]" # Mock synonym
    return " ".join(words)

def random_deletion(text: str, p: float = 0.1) -> str:
    if random.random() > p: return text
    words = text.split()
    if len(words) <= 1: return text
    idx = random.randint(0, len(words) - 1)
    del words[idx]
    return " ".join(words)

class TextAugmenter:
    def __init__(self, p=0.2):
        self.p = p

    def __call__(self, text: str) -> str:
        text = synonym_replacement(text, self.p)
        text = random_deletion(text, self.p)
        return text

# Image Augmentations
class ImageAugmenter:
    def __init__(self, size=(224, 224)):
        self.transform = T.Compose([
            T.RandomResizedCrop(size, scale=(0.8, 1.0)),
            T.RandomHorizontalFlip(),
            T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
            T.GaussianBlur(kernel_size=(5, 9), sigma=(0.1, 5.)),
            T.RandomErasing(p=0.3, scale=(0.02, 0.2)),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def __call__(self, img) -> torch.Tensor:
        return self.transform(img)

# Audio Augmentations
class AudioAugmenter:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.freq_mask = AT.FrequencyMasking(freq_mask_param=30)
        self.time_mask = AT.TimeMasking(time_mask_param=100)
        
    def add_noise(self, waveform: torch.Tensor, noise_level=0.05) -> torch.Tensor:
        noise = torch.randn_like(waveform)
        return waveform + noise_level * noise
        
    def __call__(self, waveform: torch.Tensor) -> torch.Tensor:
        waveform = self.add_noise(waveform)
        # SpecAugment happens on the spectrogram, which is applied in preprocessing
        return waveform

class RobustnessCollator:
    """Generates Out-Of-Distribution (OOD) / corrupted samples with zero evidence."""
    def __init__(self, p_ood=0.15):
        self.p_ood = p_ood

    def corrupt(self, emb: torch.Tensor) -> torch.Tensor:
        return emb * 0.05 + torch.randn_like(emb) * 3.0

    def apply(self, text_emb, audio_emb, vision_emb, labels_dict):
        if random.random() < self.p_ood:
            text_emb = self.corrupt(text_emb)
            audio_emb = self.corrupt(audio_emb)
            vision_emb = self.corrupt(vision_emb)
            # For OOD, zero out all classification/regression targets to enforce flat Dirichlet
            for k in labels_dict:
                labels_dict[k] = torch.zeros_like(labels_dict[k])
        return text_emb, audio_emb, vision_emb, labels_dict
