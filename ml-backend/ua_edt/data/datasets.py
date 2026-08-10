import torch
from torch.utils.data import Dataset
import numpy as np

class MultiTaskDatasetWrapper(Dataset):
    """
    Wraps multiple datasets to yield unified dictionary labels for the multi-task heads.
    """
    def __init__(self, dataset, task_name, num_classes=None, is_regression=False):
        self.dataset = dataset
        self.task_name = task_name
        self.num_classes = num_classes
        self.is_regression = is_regression

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        text_emb, audio_emb, vision_emb, label = self.dataset[idx]
        
        # Create a dictionary of labels for the multi-task heads
        labels_dict = {
            "goemotions": torch.zeros(28),
            "emotic": torch.zeros(26),
            "fer": torch.zeros(8),
            "vad": torch.zeros(3) # Valence, Arousal, Dominance
        }
        
        if self.is_regression:
            labels_dict[self.task_name] = label
        else:
            labels_dict[self.task_name] = torch.nn.functional.one_hot(label, num_classes=self.num_classes).float()
            
        return text_emb, audio_emb, vision_emb, labels_dict


class MultimodalBaseDataset(Dataset):
    def __init__(self, is_training: bool = False):
        self.is_training = is_training
        self.samples = []
        self._load_data()

    def _load_data(self):
        raise NotImplementedError

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        item = self.samples[idx]
        return item.get("text_emb", torch.zeros(1024)), \
               item.get("audio_emb", torch.zeros(1024)), \
               item.get("vision_emb", torch.zeros(1024)), \
               item["label"]

# --- Classification Datasets ---

class GoEmotionsDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            label = np.random.choice(28)
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "text_emb": emb,
                "label": torch.tensor(label).long()
            })

class EMOTICDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            label = np.random.choice(26)
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "vision_emb": emb,
                "label": torch.tensor(label).long()
            })

class FERPlusDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            label = np.random.choice(8)
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "vision_emb": emb,
                "label": torch.tensor(label).long()
            })

class CMUMOSEIDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            label = np.random.choice(7)
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "text_emb": emb.clone(),
                "audio_emb": emb.clone(),
                "vision_emb": emb.clone(),
                "label": torch.tensor(label).long()
            })

# --- Regression Datasets (VAD) ---

class MuSeDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            # VAD values usually range from -1 to 1 or 1 to 9
            label = torch.rand(3) * 2 - 1.0 # [-1, 1]
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "text_emb": emb.clone(),
                "audio_emb": emb.clone(),
                "vision_emb": emb.clone(),
                "label": label
            })

class EmoBankDataset(MultimodalBaseDataset):
    def _load_data(self):
        num_samples = 500 if self.is_training else 100
        for i in range(num_samples):
            label = torch.rand(3) * 2 - 1.0 # [-1, 1]
            emb = torch.randn(1024) * 0.1
            self.samples.append({
                "text_emb": emb.clone(),
                "label": label
            })
