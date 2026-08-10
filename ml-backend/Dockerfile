# Use an official PyTorch runtime as a parent image (supports CUDA if available on host)
FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for librosa/soundfile and opencv
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install specific Python dependencies for UA-EDT
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    python-multipart \
    pydantic \
    numpy \
    scikit-learn \
    matplotlib \
    optuna \
    pandas \
    wandb \
    mlflow \
    librosa \
    soundfile \
    Pillow \
    transformers \
    accelerate \
    peft

# Copy the ml-backend directory contents into the container at /app
COPY . /app

# Expose port 3001 for the FastAPI application
EXPOSE 3001

# Define environment variables
ENV PYTHONUNBUFFERED=1
ENV WANDB_SILENT=true

# Command to run the application using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3001", "--workers", "2"]
