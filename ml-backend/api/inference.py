import os
import logging
import torch
import io
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List, Dict

router = APIRouter()
logger = logging.getLogger("uvicorn")

logger.info("Initializing Hugging Face API Client for Late Fusion...")

HF_TOKEN = os.environ.get("HF_TOKEN")
if not HF_TOKEN:
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("HF_TOKEN="):
                    HF_TOKEN = line.strip().split("=", 1)[1]
                    break
if not HF_TOKEN:
    logger.warning("No HF_TOKEN found in environment or .env file. API fallback will be used.")

HF_HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

GOEMOTIONS_LABELS = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring",
    "confusion", "curiosity", "desire", "disappointment", "disapproval",
    "disgust", "embarrassment", "excitement", "fear", "gratitude", "grief",
    "joy", "love", "nervousness", "optimism", "pride", "realization",
    "relief", "remorse", "sadness", "surprise", "neutral"
]

# Basic emotions typically output by audio/image models mapped to GoEmotions
BASIC_TO_GOEMOTIONS_MAP = {
    "happy": "joy",
    "happiness": "joy",
    "angry": "anger",
    "sad": "sadness",
    "surprise": "surprise",
    "fear": "fear",
    "disgust": "disgust",
    "neutral": "neutral"
}

def query_hf_classification(model_id: str, payload, is_json=True, content_type=None):
    url = f"https://router.huggingface.co/hf-inference/models/{model_id}"
    try:
        headers = HF_HEADERS.copy()
        if content_type:
            headers["Content-Type"] = content_type
            
        if is_json:
            response = requests.post(url, headers=headers, json=payload)
        else:
            response = requests.post(url, headers=headers, data=payload)
            
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"HF API Error ({model_id}): {response.text}")
            raise HTTPException(status_code=503, detail=f"HF API Error ({model_id}): {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"HF API Request failed: {e}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to Hugging Face API: {str(e)}. No real prediction could be made.")

def process_text_classification(text: str) -> Dict[str, float]:
    # Returns 28 GoEmotions directly
    res = query_hf_classification("SamLowe/roberta-base-go_emotions", {"inputs": text}, is_json=True)
    probs = {label: 0.0 for label in GOEMOTIONS_LABELS}
    if res and isinstance(res, list) and len(res) > 0 and isinstance(res[0], list):
        for item in res[0]:
            label = item.get("label", "").lower()
            if label in probs:
                probs[label] = item.get("score", 0.0)
    return probs

def map_basic_to_goemotions(res: List[Dict]) -> Dict[str, float]:
    probs = {label: 0.0 for label in GOEMOTIONS_LABELS}
    if res and isinstance(res, list):
        # Audio/Image might be wrapped in another list depending on API
        if len(res) > 0 and isinstance(res[0], list):
            res = res[0]
            
        for item in res:
            label = item.get("label", "").lower()
            score = item.get("score", 0.0)
            go_label = BASIC_TO_GOEMOTIONS_MAP.get(label)
            if go_label in probs:
                probs[go_label] += score
    return probs

def process_audio_classification(audio_bytes: bytes) -> Dict[str, float]:
    res = query_hf_classification("ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition", audio_bytes, is_json=False, content_type="application/octet-stream")
    return map_basic_to_goemotions(res) if res else {label: 0.0 for label in GOEMOTIONS_LABELS}

def process_image_classification(image_bytes: bytes) -> Dict[str, float]:
    res = query_hf_classification("dima806/facial_emotions_image_detection", image_bytes, is_json=False, content_type="application/octet-stream")
    return map_basic_to_goemotions(res) if res else {label: 0.0 for label in GOEMOTIONS_LABELS}

@router.post("/predict/multimodal")
async def predict_multimodal(
    text: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None)
):
    try:
        audio_bytes = await audio_file.read() if audio_file else None
        image_bytes = await image_file.read() if image_file else None

        active_modalities = 0
        total_probs = {label: 0.0 for label in GOEMOTIONS_LABELS}

        # 1. Gather Predictions
        if text:
            text_probs = process_text_classification(text)
            for k in total_probs: total_probs[k] += text_probs[k]
            active_modalities += 1
            
        if audio_bytes:
            audio_probs = process_audio_classification(audio_bytes)
            for k in total_probs: total_probs[k] += audio_probs[k]
            active_modalities += 1
            
        if image_bytes:
            image_probs = process_image_classification(image_bytes)
            for k in total_probs: total_probs[k] += image_probs[k]
            active_modalities += 1

        fallback_used = active_modalities == 0

        # 2. Late Fusion (Average Probabilities)
        if active_modalities > 0:
            for k in total_probs:
                total_probs[k] /= active_modalities
        else:
            total_probs["neutral"] = 1.0

        # 3. Extract Top 5
        sorted_emotions = sorted(total_probs.items(), key=lambda x: x[1], reverse=True)
        top_5_emotions = [
            {"emotion": k, "probability": round(v * 100.0, 2)}
            for k, v in sorted_emotions[:5]
        ]

        emotion = sorted_emotions[0][0]
        confidence = round(sorted_emotions[0][1] * 100.0, 2)

        # Final Inference Output JSON Contract
        response = {
            "prediction": {
                "emotion": emotion.capitalize(),
                "top_5_emotions": top_5_emotions,
                "probability": confidence,
                "confidence_score": "High" if confidence > 80 else "Low"
            },
            "is_dummy_fallback": fallback_used,
            "uncertainty": {
                "aleatoric_data_noise": 5.0, # Dummy for dashboard
                "epistemic_model_ignorance": 5.0, # Dummy for dashboard
                "total_uncertainty": 10.0 # Dummy for dashboard
            },
            "robustness": {
                "calibration_ece": 0.02, # Dummy
                "ood_score": 10.0,
                "is_ood": False
            },
            "regression_vad": {
                "valence": 0.0,
                "arousal": 0.0,
                "dominance": 0.0
            },
            "explainability": {
                "cross_modal_attention": [0.33, 0.33, 0.34],
                "reasoning_summary": f"Inference computed via Late Fusion of {active_modalities} modalities using real HF classification APIs."
            }
        }
        
        return response

    except Exception as e:
        logger.error(f"/predict/multimodal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
