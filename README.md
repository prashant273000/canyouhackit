# 🛡️ AI Feed Shield

**AI Feed Shield** is a real-time, cross-browser extension and local AI backend that actively intercepts, analyzes, and neutralizes toxic content, hate speech, and harassment on social media feeds (specifically optimized for Twitter/X).

Instead of relying on generic safety filters, AI Feed Shield is powered by a custom-trained **135M parameter BERTweet Transformer Model**, which was fully fine-tuned from scratch on 20,000 perfectly balanced toxic/safe interactions. 

---

## 🏗️ Architecture Stack
* **AI Model:** `vinai/bertweet-base` (Fully Fine-Tuned via Hugging Face `transformers` & PyTorch)
* **Backend:** Python, FastAPI, Uvicorn
* **Frontend:** Manifest V3 Browser Extension (Chrome & Firefox compatible)
* **DOM Parsing:** Real-time React `MutationObserver` targeting `[data-testid]` hooks

---

## 🚀 Initial Setup & Installation

To run AI Feed Shield locally, you need to start the AI Backend and load the Browser Extension.

### Prerequisites
* Python 3.9 or higher
* Google Chrome or Mozilla Firefox

### Step 1: Set up the Python Backend
1. Clone this repository and navigate to the project directory:
   ```bash
   git clone <your-repo-url>
   cd CanYouHackIt
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install fastapi uvicorn torch transformers pydantic
   ```

### Step 2: Load the AI Model
If you just finished training the model on Kaggle:
1. Download your `final_tweetbert.zip` from Kaggle and extract it.
2. Place the `model.safetensors`, `config.json`, and tokenizer files into the following directory:
   ```text
   CanYouHackIt/feature/toxicity/models/tweetbert/
   ```

### Step 3: Start the API Server
Start the local FastAPI backend so the extension can communicate with the AI:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The server is now listening for text payloads at `http://localhost:8000/analyze/text`.*

### Step 4: Install the Browser Extension

**For Google Chrome:**
1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** (top right corner).
3. Click **Load unpacked** (top left).
4. Select the `extension/` folder from this repository.

**For Mozilla Firefox:**
1. Open Firefox and navigate to `about:debugging`.
2. Click **This Firefox** on the left sidebar.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file inside the `extension/` folder.

---

## 🧪 Testing on Twitter / X

1. Ensure the Python backend is running.
2. Open a new tab and go to [x.com](https://x.com).
3. Scroll through your feed. The extension will silently scan every tweet in the background.
4. **Trigger a Test:** Search for a highly controversial keyword or explicit profanity on Twitter. The moment the toxic tweets render, the AI will score them (Threshold > 0.3) and instantly replace the DOM node with a yellow **"Content Hidden"** safety shield.

---

## 📚 Deep Dive Documentation
If you are interested in the low-level Machine Learning mathematics and Extension Engineering that powers this project, check out our deep dive documentation:

* [01. BERTweet & Tokenization Mechanics](docs/deep_dives/01_BERTWEET_AND_TOKENIZATION.md)
* [02. LoRA Mechanics & Underfitting Diagnosis](docs/deep_dives/02_LORA_MECHANICS.md)
* [03. Full Fine-Tuning & Resolving Mode Collapse](docs/deep_dives/03_FULL_FINE_TUNING.md)
* [04. Manifest V3 Extension & DOM Interception Pipeline](docs/deep_dives/04_EXTENSION_ENGINEERING.md)
