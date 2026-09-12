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

MODEL_PATH = "../feature/toxicity/models/tweetbert"
tokenizer = None
model = None

if os.path.exists(MODEL_PATH):
    print("Loading TweetBERT model into backend...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, normalization=True)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()
else:
    print("Warning: TweetBERT model not found. Run train.py first.")

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
            
        scores["toxicity"] = probs[0]
        scores["hate"] = probs[1]
        scores["harassment"] = probs[2]
        scores["abuse"] = probs[3]

        # Context-aware logic
        if request.parentText and any(w in request.parentText.lower() for w in ["idiot", "pathetic", "kill", "destroy"]):
             scores["toxicity"] = min(1.0, scores["toxicity"] + 0.2)
    
    is_safe = True
    reasons = []
    for label, score in scores.items():
        if score > 0.5:
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
