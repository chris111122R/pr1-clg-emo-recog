"""
ua_edt.models.heads
====================
Publication-grade prediction heads for multimodal emotion recognition.

Implements:
  1. EvidentialClassificationHead — Dirichlet EDL classification with non-negative evidence.
  2. EvidentialLoss               — Type-II MLE + step-based KL annealing regularisation.
  3. HeteroscedasticRegressionHead — Gaussian NLL with Softplus variance (valence/arousal).
  4. HeteroscedasticNLLLoss       — Negative Log-Likelihood for continuous emotion regression.

Mathematical Foundations
-----------------------
Evidential Deep Learning (EDL) — Subjective Logic / Dirichlet parameterisation:
  Evidence      : e_k = Softplus(f_k(x)) ≥ 0
  Alpha         : α_k = e_k + 1
  Total strength: S = Σ_k α_k
  Expected prob : p̂_k = α_k / S
  Vacuity       : u = K / S   (epistemic uncertainty from lack of evidence)

  Loss (Type-II MLE / Bayes Risk):
    L_EDL = Σ_k y_k · (ψ(S) − ψ(α_k)) + λ_t · KL[Dir(α̃) ‖ Dir(1)]
  where α̃ = y + (1 − y) ⊙ α  (removes evidence from incorrect classes),
  and λ_t = min(1.0, t / T_anneal) with t = global training step.

Gaussian Regression Head (Aleatoric Uncertainty for Continuous Emotions):
  Mean    : μ̂(x) = f_μ(x)
  Variance: σ̂²(x) = Softplus(f_σ(x)) + ε   (strictly positive)
  Loss    : L_NLL = ½ log(σ̂²) + (y − μ̂)² / (2σ̂²) + C

References
----------
  - Sensoy, M. et al., "Evidential Deep Learning to Quantify Classification Uncertainty",
    NeurIPS 2018. https://arxiv.org/abs/1806.01768
  - Kendall, A. & Gal, Y., "What Uncertainties Do We Need in Bayesian Deep Learning?",
    NeurIPS 2017. https://arxiv.org/abs/1703.04977
"""

from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional


class ResidualMLPBlock(nn.Module):
    def __init__(self, dim: int, dropout_rate: float = 0.3):
        super().__init__()
        self.norm = nn.LayerNorm(dim)
        self.fc1 = nn.Linear(dim, dim)
        self.act = nn.GELU()
        self.dropout = nn.Dropout(dropout_rate)
        self.fc2 = nn.Linear(dim, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x = self.norm(x)
        x = self.fc1(x)
        x = self.act(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return res + x

class ResidualMLPClassifier(nn.Module):
    """
    Residual MLP Classifier meeting requirements:
    Residual blocks, LayerNorm, Dropout, GELU, and Temperature-scaled logits.
    """
    def __init__(self, in_features: int, num_classes: int = 7, hidden_dim: int = 256, dropout_rate: float = 0.3, num_blocks: int = 2, temperature: float = 1.15):
        super().__init__()
        self.temperature = temperature
        self.proj = nn.Linear(in_features, hidden_dim)
        self.blocks = nn.ModuleList([
            ResidualMLPBlock(hidden_dim, dropout_rate) for _ in range(num_blocks)
        ])
        self.norm = nn.LayerNorm(hidden_dim)
        self.head = nn.Linear(hidden_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.proj(x)
        for block in self.blocks:
            x = block(x)
        x = self.norm(x)
        logits = self.head(x)
        
        # Temperature-scaled logits
        if not self.training:
            logits = logits / self.temperature
            
        return logits

class EvidentialClassificationHead(nn.Module):
    """
    Evidential Deep Learning Classification Head.

    Replaces uncalibrated Softmax with a Dirichlet distribution parameterisation,
    enabling principled separation of aleatoric and epistemic uncertainty.

    Architecture
    ------------
    Linear(in_features → 256) → LayerNorm → ReLU → Dropout → Linear(256 → K)
    → Softplus (non-negative evidence e_k ≥ 0)

    Outputs
    -------
    logits   : torch.Tensor (B, K) — Raw pre-activation logits.
    evidence : torch.Tensor (B, K) — Non-negative evidence e_k = Softplus(logits).
    alpha    : torch.Tensor (B, K) — Dirichlet parameters α_k = e_k + 1.
    S        : torch.Tensor (B, 1) — Total Dirichlet strength S = Σ α_k.
    probs    : torch.Tensor (B, K) — Expected class probabilities p̂_k = α_k / S.
    vacuity  : torch.Tensor (B,)   — Epistemic vacuity u = K / S ∈ (0, 1].

    Parameters
    ----------
    in_features  : int   — Input feature dimension (fused representation size).
    num_classes  : int   — Number of emotion classes K (default 7).
    dropout_rate : float — Dropout probability (default 0.3).
    hidden_dim   : int   — Hidden layer width (default 256).
    """

    def __init__(
        self,
        in_features: int,
        num_classes: int = 7,
        dropout_rate: float = 0.3,
        hidden_dim: int = 256,
    ) -> None:
        super().__init__()
        self.num_classes = num_classes

        self.fc = ResidualMLPClassifier(
            in_features=in_features,
            num_classes=num_classes,
            hidden_dim=hidden_dim,
            dropout_rate=dropout_rate,
            num_blocks=2,
            temperature=1.15
        )

    def forward(self, x: torch.Tensor) -> dict:
        """
        Forward pass through the Evidential Classification Head.

        Parameters
        ----------
        x : torch.Tensor, shape (B, in_features)

        Returns
        -------
        dict with keys: logits, evidence, alpha, S, probs, vacuity
        """
        logits = self.fc(x)

        # Non-negative evidence via Softplus: e_k = log(1 + exp(logit_k))
        evidence = F.softplus(logits)

        # Dirichlet parameters: α_k = e_k + 1 (always ≥ 1 → valid Dirichlet)
        alpha = evidence + 1.0

        # Total Dirichlet strength: S = Σ_k α_k
        S = torch.sum(alpha, dim=-1, keepdim=True)

        # Expected class probabilities: p̂_k = α_k / S
        probs = alpha / S

        # Epistemic vacuity: u = K / S ∈ (0, 1]
        # u → 0 when evidence is very large (confident); u → 1 when evidence ≈ 0
        vacuity = self.num_classes / S.squeeze(-1)

        return {
            "logits": logits,
            "evidence": evidence,
            "alpha": alpha,
            "S": S,
            "probs": probs,
            "vacuity": vacuity,
        }


class EvidentialLoss(nn.Module):
    """
    Evidential Deep Learning Loss: Type-II Maximum Likelihood + KL Regularisation.

    Full loss formula:
        L_EDL(θ) = Σ_n [ L_ACE(αₙ, yₙ) + λ_t · KL[Dir(α̃ₙ) ‖ Dir(1)] ]

    where:
        L_ACE = Σ_k y_k · (ψ(S) − ψ(α_k))               [Aleatoric cross-entropy]
        α̃     = y + (1 − y) ⊙ α                          [Remove evidence on wrong classes]
        KL    = log Γ(Σα̃) − Σ log Γ(α̃_k) + Σ(α̃_k − 1)(ψ(α̃_k) − ψ(Σα̃))
        λ_t   = min(1.0, t / T_anneal)                    [Step-based annealing]

    Parameters
    ----------
    num_classes : int
        Number of emotion classes K.
    kl_weight : float
        Overall KL regularisation weight multiplier (default 0.2).
    T_anneal : int
        Total number of training steps over which λ_t ramps from 0 → 1.
        Defaults to 10000 (≈ 5 epochs × 2000 steps/epoch for batch=64).
    """

    def __init__(
        self,
        num_classes: int = 7,
        kl_weight: float = 0.2,
        T_anneal: int = 15000,
        class_weights: Optional[torch.Tensor] = None
    ) -> None:
        super().__init__()
        self.num_classes = num_classes
        self.kl_weight = kl_weight
        self.T_anneal = T_anneal
        
        if class_weights is None:
            class_weights = torch.ones(num_classes)
        self.register_buffer("class_weights", class_weights.float())

    def _annealing_coefficient(self, global_step: int) -> float:
        """
        Step-based annealing coefficient.

        Delayed linear ramp to prevent premature collapse of evidence.
        """
        warmup_steps = int(self.T_anneal * 0.2)
        if global_step < warmup_steps:
            return 0.0
        return min(1.0, float(global_step - warmup_steps) / float(max(self.T_anneal - warmup_steps, 1)))

    def kl_divergence(
        self,
        alpha: torch.Tensor,
        target_one_hot: torch.Tensor,
    ) -> torch.Tensor:
        """
        KL[Dir(α̃) ‖ Dir(1)] where α̃ = y + (1 − y) ⊙ α.

        This removes evidence on incorrect classes, penalising the model only
        for assigning evidence to wrong classes — not for being uncertain overall.

        Returns
        -------
        kl : torch.Tensor, shape (B,)
        """
        # Uniform Dirichlet prior β = 1
        beta = torch.ones_like(alpha)

        # Modified alpha: keep evidence only for ground-truth class
        # α̃_k = y_k + (1 − y_k) · α_k
        alpha_tilde = target_one_hot + (1.0 - target_one_hot) * alpha

        sum_alpha_tilde = torch.sum(alpha_tilde, dim=-1, keepdim=True)   # (B, 1)
        sum_beta = torch.sum(beta, dim=-1, keepdim=True)                 # (B, 1)

        # log Γ(Σα̃) − Σ log Γ(α̃_k) + Σ log Γ(β_k) − log Γ(Σβ)
        log_gamma_term = (
            torch.lgamma(sum_alpha_tilde)
            - torch.lgamma(alpha_tilde).sum(dim=-1, keepdim=True)
            + torch.lgamma(beta).sum(dim=-1, keepdim=True)
            - torch.lgamma(sum_beta)
        )

        # Σ (α̃_k − β_k) · (ψ(α̃_k) − ψ(Σα̃))
        digamma_diff = torch.digamma(alpha_tilde) - torch.digamma(sum_alpha_tilde)
        poly_term = torch.sum(
            (alpha_tilde - beta) * digamma_diff,
            dim=-1,
            keepdim=True,
        )

        kl = (log_gamma_term + poly_term).squeeze(-1)  # (B,)
        return kl

    def forward(
        self,
        evidential_output: dict,
        target: torch.Tensor,
        global_step: int = 0,
    ) -> torch.Tensor:
        """
        Compute the full EDL loss with step-based KL annealing.

        Parameters
        ----------
        evidential_output : dict  — Output from EvidentialClassificationHead.forward().
                                    Must contain keys: 'alpha', 'S'.
        target : torch.Tensor     — Hard labels (B,) or soft labels (B, K).
        global_step : int         — Current global training step t for λ_t computation.

        Returns
        -------
        total_loss : torch.Tensor, scalar
        """
        alpha = evidential_output["alpha"]  # (B, K)
        S = evidential_output["S"]          # (B, 1)

        # Build one-hot (or use soft labels directly if provided)
        if target.ndim == 1:
            target_one_hot = F.one_hot(target, num_classes=self.num_classes).float()
        else:
            target_one_hot = target.float()

        # 1. Expected Cross-Entropy (Aleatoric) Loss
        #    L_ACE = Σ_k y_k · (ψ(S) − ψ(α_k))
        digamma_S = torch.digamma(S)           # (B, 1)
        digamma_alpha = torch.digamma(alpha)    # (B, K)
        ace_loss_components = target_one_hot * (digamma_S - digamma_alpha)
        
        # Apply class weights to ACE loss components
        ace_loss_components = ace_loss_components * self.class_weights.unsqueeze(0)
        ace_loss = torch.sum(ace_loss_components, dim=-1)  # (B,)

        # 2. KL Divergence Regularisation with step-based annealing
        lambda_t = self._annealing_coefficient(global_step)
        kl_loss = self.kl_divergence(alpha, target_one_hot)  # (B,)

        # In evidential learning, it's also valid to scale the KL loss by class weight 
        # based on the ground-truth target for that sample.
        # We find the target class index to apply its weight to the KL loss.
        target_class_idx = target_one_hot.argmax(dim=-1)
        sample_weights = self.class_weights[target_class_idx]
        kl_loss = kl_loss * sample_weights

        # Combined per-sample loss
        total_loss = ace_loss + self.kl_weight * lambda_t * kl_loss

        return total_loss.mean()


class HeteroscedasticRegressionHead(nn.Module):
    """
    Heteroscedastic Neural Network Head for Continuous Emotion Regression.

    Predicts both the mean μ̂(x) and the input-dependent variance σ̂²(x) for
    continuous emotion targets (valence and arousal).

    Architecture
    ------------
    Shared: Linear(in_features → 256) → LayerNorm → ReLU → Dropout
    Mean head:     Linear(256 → out_dim)
    Variance head: Linear(256 → out_dim) → Softplus → + ε

    The variance is parameterised as:
        σ̂²(x) = Softplus(f_σ(x)) + ε

    Using Softplus (instead of exp) prevents numerical explosion and ensures
    strict positivity without the instability of unconstrained log-variance.

    Parameters
    ----------
    in_features  : int   — Input feature dimension.
    out_dim      : int   — Number of continuous outputs (2 for valence + arousal).
    dropout_rate : float — Dropout probability.
    eps          : float — Minimum variance floor to prevent zero variance (default 1e-6).
    """

    def __init__(
        self,
        in_features: int,
        out_dim: int = 2,
        dropout_rate: float = 0.3,
        eps: float = 1e-6,
    ) -> None:
        super().__init__()
        self.eps = eps

        self.fc_shared = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.LayerNorm(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
        )
        self.mu_head = nn.Linear(256, out_dim)
        self.sigma_head = nn.Linear(256, out_dim)  # outputs raw logits → Softplus

    def forward(self, x: torch.Tensor) -> dict:
        """
        Forward pass through the Heteroscedastic Regression Head.

        Parameters
        ----------
        x : torch.Tensor, shape (B, in_features)

        Returns
        -------
        dict with keys:
          mu    : torch.Tensor (B, out_dim) — Predicted mean.
          var   : torch.Tensor (B, out_dim) — Predicted variance σ̂²(x) > 0.
          std   : torch.Tensor (B, out_dim) — Predicted std dev = sqrt(var + ε).
        """
        h = self.fc_shared(x)
        mu = self.mu_head(h)

        # σ̂²(x) = Softplus(f_σ(x)) + ε  (strictly positive, no log-space instability)
        var = F.softplus(self.sigma_head(h)) + self.eps
        std = torch.sqrt(var)

        return {
            "mu": mu,
            "var": var,
            "std": std,
        }


class HeteroscedasticNLLLoss(nn.Module):
    """
    Negative Log-Likelihood Loss for Heteroscedastic Gaussian Regression.

    Loss formula (per element):
        L_NLL = ½ log(σ̂²) + (y − μ̂)² / (2σ̂²)

    This jointly optimises for accurate mean prediction while learning
    input-adaptive uncertainty: the model is rewarded for high variance
    when it is wrong and low variance when it is correct.

    Parameters
    ----------
    reduction : str — 'mean' (default) or 'sum'.
    """

    def __init__(self, reduction: str = "mean") -> None:
        super().__init__()
        self.reduction = reduction

    def forward(
        self,
        outputs: dict,
        target: torch.Tensor,
    ) -> torch.Tensor:
        """
        Compute the Gaussian NLL loss.

        Parameters
        ----------
        outputs : dict   — Output from HeteroscedasticRegressionHead.forward().
                           Must contain keys: 'mu', 'var'.
        target  : torch.Tensor (B, out_dim) — Ground-truth continuous targets.

        Returns
        -------
        loss : torch.Tensor, scalar
        """
        mu = outputs["mu"]
        var = outputs["var"]

        # L_NLL = ½ log(σ̂²) + (y − μ̂)² / (2σ̂²)
        # Add eps inside log for numerical stability even though Softplus+eps ≥ eps
        loss = 0.5 * torch.log(var + 1e-9) + (target - mu) ** 2 / (2.0 * var)

        if self.reduction == "mean":
            return loss.mean()
        elif self.reduction == "sum":
            return loss.sum()
        else:
            return loss
