import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class TemperatureScaling(nn.Module):
    """
    Calibrates probabilities via Temperature Scaling.
    Requires a held-out validation set.
    """
    def __init__(self):
        super().__init__()
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)

    def forward(self, logits):
        return logits / self.temperature

    def fit(self, logits, labels, lr=0.01, max_iter=50):
        optimizer = optim.LBFGS([self.temperature], lr=lr, max_iter=max_iter)
        nll_criterion = nn.CrossEntropyLoss()

        def eval():
            optimizer.zero_grad()
            loss = nll_criterion(self.forward(logits), labels)
            loss.backward()
            return loss

        optimizer.step(eval)
        return self.temperature.item()

def calculate_ece(probs, labels, num_bins=15):
    """Expected Calibration Error (ECE)"""
    bin_boundaries = np.linspace(0, 1, num_bins + 1)
    bin_lowers = bin_boundaries[:-1]
    bin_uppers = bin_boundaries[1:]

    confidences, predictions = torch.max(probs, dim=1)
    accuracies = predictions.eq(labels)

    ece = 0.0
    for bin_lower, bin_upper in zip(bin_lowers, bin_uppers):
        in_bin = (confidences > bin_lower) * (confidences <= bin_upper)
        prop_in_bin = in_bin.float().mean()
        if prop_in_bin.item() > 0.0:
            accuracy_in_bin = accuracies[in_bin].float().mean()
            avg_confidence_in_bin = confidences[in_bin].mean()
            ece += torch.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin

    return ece.item()

def calculate_brier_score(probs, labels, num_classes):
    """Brier Score for multi-class classification"""
    labels_one_hot = torch.nn.functional.one_hot(labels, num_classes=num_classes).float()
    brier_score = torch.mean(torch.sum((probs - labels_one_hot) ** 2, dim=1))
    return brier_score.item()
