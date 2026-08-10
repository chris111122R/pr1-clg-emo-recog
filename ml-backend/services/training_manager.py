import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.cuda.amp import autocast, GradScaler
from typing import Dict, Any, Optional, Tuple
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

class TrainingManager:
    """
    Manages mixed precision training, learning rate schedules, gradient accumulation,
    early stopping, linter metrics, and model checkpointing.
    """
    def __init__(self, 
                 model: nn.Module, 
                 checkpoint_dir: str = "./checkpoints", 
                 patience: int = 5,
                 grad_accum_steps: int = 1):
        self.model = model
        self.checkpoint_dir = checkpoint_dir
        self.patience = patience
        self.grad_accum_steps = grad_accum_steps
        
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        self.best_loss = float('inf')
        self.patience_counter = 0

    def save_checkpoint(self, epoch: int, loss: float, optimizer: torch.optim.Optimizer, scaler: GradScaler, is_best: bool = False):
        """Saves a model checkpoint to disk."""
        checkpoint = {
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scaler_state_dict": scaler.state_dict() if scaler else None,
            "loss": loss,
            "best_loss": self.best_loss
        }
        
        filepath = os.path.join(self.checkpoint_dir, f"checkpoint_epoch_{epoch}.pt")
        torch.save(checkpoint, filepath)
        
        if is_best:
            best_path = os.path.join(self.checkpoint_dir, "best_model.pt")
            torch.save(checkpoint, best_path)

    def load_checkpoint(self, filepath: str, optimizer: torch.optim.Optimizer, scaler: Optional[GradScaler] = None) -> int:
        """Loads a model checkpoint and resumes from the corresponding epoch."""
        checkpoint = torch.load(filepath)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
        if scaler and checkpoint["scaler_state_dict"]:
            scaler.load_state_dict(checkpoint["scaler_state_dict"])
        self.best_loss = checkpoint["best_loss"]
        return checkpoint["epoch"]

    def train_epoch(self, 
                    loader: DataLoader, 
                    optimizer: torch.optim.Optimizer, 
                    scheduler: Any,
                    criterion: nn.Module,
                    device: torch.device,
                    use_amp: bool = False) -> float:
        """Trains the model for one epoch using mixed precision and gradient clipping."""
        self.model.train()
        scaler = GradScaler() if use_amp else None
        total_loss = 0.0
        
        optimizer.zero_grad()
        for i, batch in enumerate(loader):
            # Parse inputs (expecting text, audio, and visual embeddings)
            text, audio, vision, y = [b.to(device) if b is not None else None for b in batch]
            
            # Forward pass with mixed precision context
            if use_amp:
                with autocast():
                    outputs = self.model(text, audio, vision)
                    loss = criterion(outputs, y)
                scaler.scale(loss).backward()
            else:
                outputs = self.model(text, audio, vision)
                loss = criterion(outputs, y)
                loss.backward()
                
            # Perform optimization after accumulating gradients
            if (i + 1) % self.grad_accum_steps == 0:
                if use_amp:
                    scaler.unscale_(optimizer)
                    nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    scaler.step(optimizer)
                    scaler.update()
                else:
                    nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                    optimizer.step()
                
                optimizer.zero_grad()
                if scheduler:
                    scheduler.step()
                    
            total_loss += loss.item()
            
        return total_loss / len(loader)

    def evaluate(self, 
                 loader: DataLoader, 
                 criterion: nn.Module, 
                 device: torch.device) -> Tuple[float, Dict[str, float]]:
        """Evaluates the model on validation/test datasets and calculates performance metrics."""
        self.model.eval()
        total_loss = 0.0
        
        all_preds = []
        all_targets = []
        
        with torch.no_grad():
            for batch in loader:
                text, audio, vision, y = [b.to(device) if b is not None else None for b in batch]
                outputs = self.model(text, audio, vision)
                loss = criterion(outputs, y)
                total_loss += loss.item()
                
                _, preds = torch.max(outputs, dim=-1)
                all_preds.extend(preds.cpu().numpy())
                all_targets.extend(y.cpu().numpy())
                
        # Metrics calculations
        avg_loss = total_loss / len(loader)
        accuracy = accuracy_score(all_targets, all_preds)
        precision, recall, f1, _ = precision_recall_fscore_support(all_targets, all_preds, average='weighted', zero_division=0)
        
        metrics = {
            "accuracy": round(accuracy * 100, 2),
            "precision": round(precision * 100, 2),
            "recall": round(recall * 100, 2),
            "f1": round(f1 * 100, 2)
        }
        
        return avg_loss, metrics

    def run_training_loop(self, 
                          epochs: int,
                          train_loader: DataLoader,
                          val_loader: DataLoader,
                          optimizer: torch.optim.Optimizer,
                          scheduler: Any,
                          criterion: nn.Module,
                          device: torch.device,
                          use_amp: bool = False):
        """Runs the entire training loop with validation checks and early stopping."""
        scaler = GradScaler() if use_amp else None
        
        for epoch in range(1, epochs + 1):
            train_loss = self.train_epoch(train_loader, optimizer, scheduler, criterion, device, use_amp)
            val_loss, metrics = self.evaluate(val_loader, criterion, device)
            
            # Check early stopping constraints
            if val_loss < self.best_loss:
                self.best_loss = val_loss
                self.patience_counter = 0
                self.save_checkpoint(epoch, val_loss, optimizer, scaler, is_best=True)
            else:
                self.patience_counter += 1
                self.save_checkpoint(epoch, val_loss, optimizer, scaler, is_best=False)
                
            # Logger check
            print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Accuracy: {metrics['accuracy']}% | F1: {metrics['f1']}%")
            
            if self.patience_counter >= self.patience:
                print("Early stopping triggered. Training terminated.")
                break
