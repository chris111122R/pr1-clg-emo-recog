from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import inference

app = FastAPI(title="UA-EDT ML Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inference.router, prefix="", tags=["Inference"])

@app.get("/health")
def health_check():
    import torch
    return {
        "status": "online", 
        "gpu_available": torch.cuda.is_available()
    }
