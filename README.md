# UA-EDT: Multimodal Emotion Recognition Platform

UA-EDT is an advanced emotion analysis dashboard built to predict and track human emotions across multiple modalities. It utilizes **Late Fusion** techniques to analyze Text, Audio, and Image inputs, alongside offering a zero-latency real-time video feed via in-browser machine learning.

## 🚀 Features

*   **Multimodal "Upload & Wait" Analysis**: Upload text, audio (.wav), and images (.jpg, .png) to receive a unified emotional prediction using Late Fusion.
*   **Real-Time Browser Inference**: A flawless, zero-latency live webcam feed that tracks facial expressions natively in the browser without sending video data to any server.
*   **Hugging Face Serverless APIs**: Powered by state-of-the-art models for feature extraction and classification entirely via the cloud.
*   **Modern Tech Stack**: Built with a sleek Next.js (React) frontend dashboard and a lightning-fast FastAPI (Python) backend.

## 🧠 Machine Learning Architecture

### 1. The Multimodal Pipeline (Late Fusion)
Instead of relying on heavy local models, the backend securely pipes your uploads to Hugging Face's serverless infrastructure:
*   **Text Model**: `SamLowe/roberta-base-go_emotions`
*   **Audio Model**: `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`
*   **Image Model**: `dima806/facial_emotions_image_detection`

The Python backend receives probabilities from each active modality, normalizes them into GoEmotions labels, and averages them to return a fused prediction.

### 2. Real-Time Video Feed (Edge ML)
The `/real-time` dashboard page uses `@vladmandic/face-api` (WebGL) to run facial detection and expression analysis at 30+ FPS directly inside your web browser. 

---

## 🛠️ Getting Started

The project is split into two parts: the React frontend and the Python backend. You need to run both for the full experience.

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   A Hugging Face Account and API Key

### 1. Start the Python Backend

1. Navigate to the `ml-backend` folder:
   ```bash
   cd ml-backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `ml-backend` folder and add your Hugging Face API key:
   ```env
   HF_API_KEY=your_hugging_face_token_here
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will now be running on `http://localhost:8000`*

### 2. Start the Next.js Frontend

1. Open a new terminal window and ensure you are in the root directory (where `package.json` is).
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running on `http://localhost:3000`*

## 🌐 Usage
1. Open your browser to `http://localhost:3000`.
2. Navigate to **Analyze Emotion** to upload files and test the multimodal fusion.
3. Navigate to **Real-Time Feed** to test in-browser webcam tracking.
