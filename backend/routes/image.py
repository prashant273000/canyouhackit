from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()

class ImageRequest(BaseModel):
    id: str
    url: str

class ImageResponse(BaseModel):
    id: str
    is_safe: bool
    nsfw_score: float
    graphic_score: float
    reason: str | None = None

models = {}
for label in ["nsfw", "graphic"]:
    path = f"../feature/nsfw/models/{label}_model.json"
    if os.path.exists(path):
        with open(path, "r") as f:
            models[label] = json.load(f)

@router.post("/image", response_model=ImageResponse)
def analyze_image(request: ImageRequest):
    scores = {"nsfw": 0.1, "graphic": 0.1}
    url_lower = request.url.lower()
    
    for label, weights in models.items():
        for word, weight in weights.items():
            if word in url_lower:
                scores[label] = max(scores[label], weight)
                
    is_safe = True
    reasons = []
    
    for label, score in scores.items():
        if score > 0.5:
            is_safe = False
            reasons.append(label)
            
    return ImageResponse(
        id=request.id,
        is_safe=is_safe,
        nsfw_score=scores["nsfw"],
        graphic_score=scores["graphic"],
        reason=",".join(reasons) if reasons else None
    )
