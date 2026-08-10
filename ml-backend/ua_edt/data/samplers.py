import numpy as np
import torch
from torch.utils.data import Sampler, WeightedRandomSampler
from typing import List, Iterator
from collections import Counter

class SpeakerIndependentSampler(Sampler):
    """
    Ensures that batches or epochs do not leak speakers across train/val/test splits.
    """
    def __init__(self, dataset, speaker_ids: List[int], batch_size: int):
        self.dataset = dataset
        self.speaker_ids = np.array(speaker_ids)
        self.batch_size = batch_size
        self.unique_speakers = np.unique(self.speaker_ids)
        
    def __iter__(self) -> Iterator[int]:
        np.random.shuffle(self.unique_speakers)
        indices = []
        for spk in self.unique_speakers:
            spk_indices = np.where(self.speaker_ids == spk)[0]
            np.random.shuffle(spk_indices)
            indices.extend(spk_indices.tolist())
        return iter(indices)
        
    def __len__(self) -> int:
        return len(self.dataset)

def get_class_balanced_sampler(labels: List[int]) -> WeightedRandomSampler:
    """
    Creates a WeightedRandomSampler based on the inverse frequency of classes.
    """
    class_counts = Counter(labels)
    total_samples = len(labels)
    class_weights = {cls: total_samples / count for cls, count in class_counts.items()}
    sample_weights = [class_weights[label] for label in labels]
    
    return WeightedRandomSampler(
        weights=torch.DoubleTensor(sample_weights),
        num_samples=len(sample_weights),
        replacement=True
    )
