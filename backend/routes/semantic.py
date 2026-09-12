from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SemanticRequest(BaseModel):
    id: str
    text: str

class SemanticResponse(BaseModel):
    id: str
    is_safe: bool
    similarity_score: float
    reason: str | None = None

# Pure Python keyword fallback for Semantic Engine
user_triggers = ["war", "conflict", "disturbing"]

@router.post("/semantic", response_model=SemanticResponse)
def analyze_semantic(request: SemanticRequest):
    text_lower = request.text.lower()
    score = 0.1
    for trigger in user_triggers:
        if trigger in text_lower:
            score = 0.88
            
    return SemanticResponse(
        id=request.id,
        is_safe=score < 0.8,
        similarity_score=score,
        reason="semantic-trigger" if score >= 0.8 else None
    )
