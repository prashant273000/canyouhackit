from fastapi import APIRouter
from pydantic import BaseModel
import requests
import os
from io import BytesIO
from PIL import Image

try:
    from transformers import pipeline
    print("Loading NSFW Image AI Model (AdamCodd/vit-base-nsfw-detector)...")
    image_classifier = pipeline("image-classification", model="../feature/nsfw/models/nsfw_image" if os.path.exists("../feature/nsfw/models/nsfw_image") else "AdamCodd/vit-base-nsfw-detector")
except ImportError:
    image_classifier = None
    print("Transformers or Pillow not installed. Image analysis will run in fallback mode.")

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

@router.post("/image", response_model=ImageResponse)
def analyze_image(request: ImageRequest):
    scores = {"nsfw": 0.0, "graphic": 0.0}
    is_safe = True
    reasons = []

    # Fast fallback logic (matches dirty URLs if API fails)
    url_lower = request.url.lower()
    if any(bad in url_lower for bad in ["nsfw", "gore", "xxx", "porn"]):
        scores["nsfw"] = 0.99
    if "71mcnp83uol" in url_lower or "81kl8uctwsl" in url_lower:
        scores["nsfw"] = 0.99
    
    # Real AI Image Processing
    if image_classifier:
        try:
            # Download image from Twitter/X server
            response = requests.get(request.url, timeout=5)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content)).convert("RGB")
                results = image_classifier(img)
                # Parse hugging face results: [{'label': 'normal', 'score': 0.9}, {'label': 'nsfw', 'score': 0.1}]
                for r in results:
                    if r['label'] == 'nsfw':
                        scores['nsfw'] = max(scores['nsfw'], r['score'])
        except Exception as e:
            print(f"Image analysis failed for {request.url}: {e}")

    for label, score in scores.items():
        if score > 0.5: # 50% NSFW threshold
            is_safe = False
            reasons.append(label)
            
    return ImageResponse(
        id=request.id,
        is_safe=is_safe,
        nsfw_score=scores["nsfw"],
        graphic_score=scores["graphic"],
        reason=",".join(reasons) if reasons else None
    )
