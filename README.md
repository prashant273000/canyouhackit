# AI Feed Shield

## Overview
AI Feed Shield is a personalized, real-time machine learning safety layer designed to protect users from toxic content and explicit imagery on social media platforms. Built for the Can You Hack It? Hackathon, this system intercepts incoming DOM elements on supported platforms (such as X/Twitter) and analyzes them using state-of-the-art Natural Language Processing (NLP) and Vision Transformers (ViT) before rendering them to the screen.

## System Architecture

The architecture is divided into three primary components: the Client Extension, the Inference Backend, and the Hybrid Safety Pipeline.

### 1. Client Architecture (Browser Extension)
The frontend is a Manifest V3 cross-browser extension (Chrome and Firefox compatible) that operates directly on the DOM level.
- **Platform Adapters:** The extension utilizes site-specific adapters (e.g., twitter_adapter.js) to locate feed elements, extract text and image URLs, and temporarily hide them by modifying CSS opacity while awaiting backend analysis.
- **Dynamic UI Injection:** If content is flagged as unsafe, the extension reconstructs the DOM node into a native-looking platform warning. For example, on X, it injects a simulated "System Warning" styled identically to the platform's dark mode, obscuring the harmful content behind an interactive shield.
- **Real-Time Configuration:** A popup control panel interfaces with chrome.storage.local to allow users to toggle text filtering, image filtering, or the master shield on and off in real-time.

### 2. Backend Architecture (FastAPI)
The backend is a high-performance, asynchronous Python server built on FastAPI. It acts as the orchestration layer between the client requests and the machine learning models.
- **Smart Loading Mechanism:** To ensure instant boot times in offline or restricted environments, the server checks local directories (e.g., .safetensors files) before attempting to pull from the Hugging Face Hub.
- **Endpoint Structure:** The API exposes dedicated endpoints for /analyze/text, /analyze/image, and /analyze/semantic, allowing the client to concurrently process different data modalities.

### 3. Machine Learning Pipeline & Models

#### Text Toxicity Engine (BERTweet)
The text analysis relies on a fine-tuned version of `vinai/bertweet-base`, a RoBERTa model pre-trained on English Tweets. 
- **Training Architecture:** The model was trained using Full Fine-Tuning (FFT) rather than Low-Rank Adaptation (LoRA) to overcome catastrophic underfitting and mode collapse observed during early testing. 
- **Classification Head:** It predicts four distinct labels: toxicity, hate, harassment, and abuse.

#### Hybrid Image Safety Engine
Because lightweight, open-source Vision Transformers trained on human gore are highly restricted, the image safety layer employs a hybrid approach:
- **Vision Transformer (ViT):** Pixel data is passed through `AdamCodd/vit-base-nsfw-detector`, a highly efficient model for identifying explicit nudity and pornography. 
- **Semantic Heuristic Fallback:** Before visual inference, the backend scans image URLs and associated metadata for violent or explicit keywords. If a heuristic match is found, a high toxicity score is assigned.
- **Max Pooling Resolution:** The final safety score is determined by the maximum value between the ViT inference score and the Semantic Heuristic score, preventing false negatives.

## Deployment Strategy (The LocalTunnel Bypass)
Due to severe RAM constraints on free-tier cloud platforms (which often limit containers to 512MB, causing Out-Of-Memory errors when loading ViT and RoBERTa models), the system utilizes a Local-Cloud hybrid deployment.
- The heavy inference server runs natively on the presenter's host machine, utilizing the full hardware capacity.
- A secure HTTPS tunnel (via localtunnel or ngrok) exposes the local port (8000) to the public internet.
- This bypasses CORS restrictions and mixed-content blocking in the browser extension, allowing a flawless, zero-latency demonstration without requiring expensive cloud GPU hosting.

## Installation & Setup

### Backend Setup
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server: `python -m uvicorn main:app --reload`
5. (Optional) Run `lt --port 8000` to expose the backend publicly.

### Extension Setup
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" and select the `extension` directory.
4. For Firefox, navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `manifest.json` file.
