import numpy as np
import torch
import torchvision.transforms as T
import torchaudio.transforms as AT
import re

class VisionPreprocessor:
    def __init__(self, target_size=(224, 224), is_training=False):
        self.target_size = target_size
        self.is_training = is_training
        
        transforms_list = [
            T.ToPILImage(),
            T.Resize(self.target_size),
            T.ToTensor(),
            T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ]
        
        if self.is_training:
            transforms_list.insert(2, T.RandomHorizontalFlip())
            transforms_list.insert(3, T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1))
            transforms_list.append(T.RandomErasing(p=0.2))
            
        self.transform = T.Compose(transforms_list)

    def apply_clahe(self, image: np.ndarray) -> np.ndarray:
        # Mock for cv2.createCLAHE
        return image

    def __call__(self, image: np.ndarray) -> torch.Tensor:
        image = self.apply_clahe(image)
        return self.transform(image)


class AudioPreprocessor:
    def __init__(self, target_sr=16000, n_mels=128, max_len=300, is_training=False):
        self.target_sr = target_sr
        self.n_mels = n_mels
        self.max_len = max_len
        self.is_training = is_training
        
        self.mel_spec = AT.MelSpectrogram(
            sample_rate=self.target_sr,
            n_mels=self.n_mels,
            n_fft=1024,
            hop_length=256,
            power=2.0
        )
        self.amplitude_to_db = AT.AmplitudeToDB()
        self.freq_mask = AT.FrequencyMasking(freq_mask_param=15)
        self.time_mask = AT.TimeMasking(time_mask_param=35)

    def __call__(self, waveform: torch.Tensor) -> torch.Tensor:
        # waveform expected as (1, seq_len)
        mel = self.mel_spec(waveform)
        mel = self.amplitude_to_db(mel)
        
        if self.is_training:
            mel = self.freq_mask(mel)
            mel = self.time_mask(mel)
            
        if mel.shape[2] > self.max_len:
            mel = mel[:, :, :self.max_len]
        else:
            pad_amount = self.max_len - mel.shape[2]
            mel = torch.nn.functional.pad(mel, (0, pad_amount))
            
        return mel

class TextPreprocessor:
    def __init__(self, tokenizer=None):
        self.tokenizer = tokenizer
        
    def clean_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'<.*?>', '', text)
        return text.strip()

    def __call__(self, text: str) -> dict:
        text = self.clean_text(text)
        if self.tokenizer:
            return self.tokenizer(
                text, 
                padding='max_length', 
                truncation=True, 
                max_length=128, 
                return_tensors='pt'
            )
        return text
