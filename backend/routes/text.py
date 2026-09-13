from fastapi import APIRouter
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

router = APIRouter()

class TextRequest(BaseModel):
    id: str
    text: str
    parentText: str | None = None

class TextResponse(BaseModel):
    id: str
    is_safe: bool
    toxicity_score: float
    hate_score: float
    harassment_score: float
    abuse_score: float
    reason: str | None = None

LOCAL_MODEL_PATH = "../feature/toxicity/models/tweetbert"
HF_MODEL_PATH = "Prashant273013/AiFieldSheild"
tokenizer = None
model = None

if os.path.exists(LOCAL_MODEL_PATH):
    print("Loading custom model LOCALLY (Fast boot)...")
    MODEL_PATH = LOCAL_MODEL_PATH
else:
    print(f"Local model not found. Downloading from Hugging Face: {HF_MODEL_PATH}")
    MODEL_PATH = HF_MODEL_PATH

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, normalization=True)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()
except Exception as e:
    print(f"Failed to load model: {e}")

@router.post("/text", response_model=TextResponse)
def analyze_text(request: TextRequest):
    scores = {"toxicity": 0.1, "hate": 0.1, "harassment": 0.1, "abuse": 0.1}
    
    if model and tokenizer and request.text:
        inputs = tokenizer(request.text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.sigmoid(outputs.logits).squeeze().tolist()
            
        if not isinstance(probs, list):
            probs = [probs] * 4 # fallback if output shape is flat
            
        # Update these indices if your Kaggle config.json has 7 labels instead of 4!
        scores["toxicity"] = probs[0]
        scores["hate"] = probs[1]
        scores["harassment"] = probs[2]
        scores["abuse"] = probs[3]

        text_to_check = (request.text + " " + (request.parentText or "")).lower()
        if any(w in text_to_check  for w in ["idiot", "pathetic", "kill", "destroy", "fuck", "shit", "scum", "rapist"]):
             scores["toxicity"] = 0.99
    
    is_safe = True
    reasons = []
    for label, score in scores.items():
        if score > 0.3:
            is_safe = False
            reasons.append(label)
            
    return TextResponse(
        id=request.id,
        is_safe=is_safe,
        toxicity_score=scores["toxicity"],
        hate_score=scores["hate"],
        harassment_score=scores["harassment"],
        abuse_score=scores["abuse"],
        reason=",".join(reasons) if reasons else None
    )
