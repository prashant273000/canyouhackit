from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import text, image, semantic

app = FastAPI(title="AI Feed Shield Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(text.router, prefix="/analyze")
app.include_router(image.router, prefix="/analyze")
app.include_router(semantic.router, prefix="/analyze")

@app.get("/health")
def health_check():
    return {"status": "ok"}
