import torch
import torch.nn as nn
import torch.nn.functional as F

class CCCLoss(nn.Module):
    """Concordance Correlation Coefficient Loss for VAD regression."""
    def __init__(self):
        super().__init__()

    def forward(self, pred, target):
        pred_mean = torch.mean(pred)
        target_mean = torch.mean(target)
        pred_var = torch.var(pred)
        target_var = torch.var(target)
        
        covariance = torch.mean((pred - pred_mean) * (target - target_mean))
        ccc = (2 * covariance) / (pred_var + target_var + (pred_mean - target_mean) ** 2 + 1e-8)
        
        return 1.0 - ccc

class GaussianNLLLoss(nn.Module):
    """Aleatoric uncertainty loss for regression."""
    def __init__(self):
        super().__init__()

    def forward(self, pred_mean, pred_var, target):
        loss = 0.5 * torch.log(pred_var + 1e-6) + 0.5 * ((target - pred_mean) ** 2) / (pred_var + 1e-6)
        return torch.mean(loss)

class EvidentialLoss(nn.Module):
    """Evidential Deep Learning Loss (Dirichlet)."""
    def __init__(self, num_classes=28, annealing_step=10):
        super().__init__()
        self.num_classes = num_classes
        self.annealing_step = annealing_step

    def kl_divergence(self, alpha):
        ones = torch.ones_like(alpha)
        sum_alpha = torch.sum(alpha, dim=1, keepdim=True)
        sum_ones = torch.sum(ones, dim=1, keepdim=True)
        
        kl = torch.lgamma(sum_alpha) - torch.lgamma(alpha).sum(dim=1, keepdim=True) + \
             torch.lgamma(ones).sum(dim=1, keepdim=True) - torch.lgamma(sum_ones) + \
             ((alpha - ones) * (torch.digamma(alpha) - torch.digamma(sum_alpha))).sum(dim=1, keepdim=True)
        return kl

    def forward(self, alpha, target_one_hot, epoch):
        S = torch.sum(alpha, dim=1, keepdim=True)
        
        # Cross entropy term (Expected Negative Log-Likelihood of Dirichlet)
        loss_ce = torch.sum(target_one_hot * (torch.digamma(S) - torch.digamma(alpha)), dim=1, keepdim=True)
        
        # KL Divergence term (Regularize evidence of incorrect classes to 0)
        annealing_coef = min(1.0, epoch / self.annealing_step)
        alpha_tilde = target_one_hot + (1 - target_one_hot) * alpha
        loss_kl = annealing_coef * self.kl_divergence(alpha_tilde)
        
        return torch.mean(loss_ce + loss_kl)

class MultiTaskLoss(nn.Module):
    def __init__(self, epoch=0):
        super().__init__()
        self.epoch = epoch
        
        self.ce_loss = nn.CrossEntropyLoss()
        self.ccc_loss = CCCLoss()
        self.nll_loss = GaussianNLLLoss()
        self.evidential_loss = EvidentialLoss()

        # Learnable homoscedastic uncertainty weights for multi-task loss balancing
        self.log_vars = nn.Parameter(torch.zeros(4))

    def forward(self, outputs, targets):
        """
        outputs: dict containing goemotions, emotic, fer, vad, aleatoric_var, evidential_alpha
        targets: dict containing one-hot/regression targets for the same keys
        """
        # 1. Classification Loss (GoEmotions) via Evidential DL
        if torch.sum(targets["goemotions"]) > 0:
            loss_goemotions = self.evidential_loss(outputs["evidential_alpha"], targets["goemotions"], self.epoch)
        else:
            loss_goemotions = torch.tensor(0.0, device=self.log_vars.device)
            
        # 2. Classification Loss (EMOTIC)
        if torch.sum(targets["emotic"]) > 0:
            loss_emotic = self.ce_loss(outputs["emotic"], torch.argmax(targets["emotic"], dim=1))
        else:
            loss_emotic = torch.tensor(0.0, device=self.log_vars.device)

        # 3. Classification Loss (FER)
        if torch.sum(targets["fer"]) > 0:
            loss_fer = self.ce_loss(outputs["fer"], torch.argmax(targets["fer"], dim=1))
        else:
            loss_fer = torch.tensor(0.0, device=self.log_vars.device)

        # 4. Regression Loss (VAD) + Aleatoric Uncertainty
        if torch.sum(torch.abs(targets["vad"])) > 0:
            loss_vad_ccc = self.ccc_loss(outputs["vad"], targets["vad"])
            loss_vad_nll = self.nll_loss(outputs["vad"], outputs["aleatoric_var"], targets["vad"])
            loss_vad = loss_vad_ccc + loss_vad_nll
        else:
            loss_vad = torch.tensor(0.0, device=self.log_vars.device)
            
        # Homoscedastic multi-task weighting
        losses = [loss_goemotions, loss_emotic, loss_fer, loss_vad]
        total_loss = 0
        for i, loss in enumerate(losses):
            if loss > 0:
                total_loss += torch.exp(-self.log_vars[i]) * loss + self.log_vars[i]
                
        return total_loss
