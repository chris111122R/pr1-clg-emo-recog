import os
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
from torch.cuda.amp import autocast, GradScaler
import optuna

from ua_edt.models.ua_edt_model import UAEDTMultimodalModel
from ua_edt.training.losses import MultiTaskLoss
from ua_edt.uncertainty.calibration import TemperatureScaling
from sklearn.model_selection import KFold

EMOTIONS = ["Anger", "Disgust", "Fear", "Joy", "Sadness", "Surprise", "Neutral"]

def train_and_evaluate(model, train_loader, val_loader, lr, weight_decay, epochs, device, use_amp=True):
    model.to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scaler = GradScaler() if use_amp else None
    
    # Cosine Annealing LR Scheduler
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    # Exponential Moving Average (EMA) for weights
    ema_model = torch.optim.swa_utils.AveragedModel(model, multi_avg_fn=torch.optim.swa_utils.get_ema_multi_avg_fn(0.999))
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        criterion = MultiTaskLoss(epoch=epoch)
        criterion.to(device)
        
        model.train()
        train_loss = 0.0
        
        for text_emb, audio_emb, vision_emb, labels_dict in train_loader:
            text_emb = text_emb.to(device)
            audio_emb = audio_emb.to(device)
            vision_emb = vision_emb.to(device)
            labels_dict = {k: v.to(device) for k, v in labels_dict.items()}
            
            optimizer.zero_grad()
            
            if use_amp:
                with autocast():
                    outputs = model(text_emb=text_emb, audio_emb=audio_emb, image_emb=vision_emb)
                    loss = criterion(outputs, labels_dict)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                outputs = model(text_emb=text_emb, audio_emb=audio_emb, image_emb=vision_emb)
                loss = criterion(outputs, labels_dict)
                loss.backward()
                optimizer.step()
                
            ema_model.update_parameters(model)
            train_loss += loss.item()
            
        scheduler.step()
        train_loss /= len(train_loader)
        
        # Validation
        ema_model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for text_emb, audio_emb, vision_emb, labels_dict in val_loader:
                text_emb = text_emb.to(device)
                audio_emb = audio_emb.to(device)
                vision_emb = vision_emb.to(device)
                labels_dict = {k: v.to(device) for k, v in labels_dict.items()}
                
                outputs = ema_model(text_emb=text_emb, audio_emb=audio_emb, image_emb=vision_emb)
                loss = criterion(outputs, labels_dict)
                val_loss += loss.item()
                
        val_loss /= len(val_loader)
        print(f"Epoch {epoch+1}/{epochs} - Train Loss: {train_loss:.4f} - Val Loss: {val_loss:.4f}")
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            
    return best_val_loss, ema_model

def cross_validate(dataset, k_folds=5, epochs=10, batch_size=16):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    kfold = KFold(n_splits=k_folds, shuffle=True)
    
    cv_scores = []
    
    for fold, (train_ids, val_ids) in enumerate(kfold.split(dataset)):
        print(f"FOLD {fold}")
        
        train_sub = Subset(dataset, train_ids)
        val_sub = Subset(dataset, val_ids)
        
        train_loader = DataLoader(train_sub, batch_size=batch_size, shuffle=True)
        val_loader = DataLoader(val_sub, batch_size=batch_size, shuffle=False)
        
        model = UAEDTMultimodalModel()
        val_loss, best_ema_model = train_and_evaluate(
            model=model, train_loader=train_loader, val_loader=val_loader,
            lr=1e-4, weight_decay=1e-4, epochs=epochs, device=device
        )
        
        cv_scores.append(val_loss)
        
        # Temperature Scaling on validation set
        ts = TemperatureScaling().to(device)
        print("Applying Temperature Scaling...")
        # (In a full script, we would collect logits and labels from val_loader here and call ts.fit())
        
    print(f"5-Fold CV Average Validation Loss: {sum(cv_scores)/k_folds:.4f}")

if __name__ == "__main__":
    from ua_edt.data.datasets import CMUMOSEIDataset, MultiTaskDatasetWrapper
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10)
    args = parser.parse_args()
    
    # Use CMU-MOSEI wrapped for multi-task
    base_dataset = CMUMOSEIDataset(is_training=True)
    multi_task_dataset = MultiTaskDatasetWrapper(base_dataset, task_name="goemotions", num_classes=28)
    
    cross_validate(multi_task_dataset, epochs=args.epochs)
