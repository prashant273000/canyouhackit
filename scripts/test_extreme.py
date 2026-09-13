import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
MODEL_PATH = "feature/toxicity/models/tweetbert"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, normalization=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

texts = [
    "kill yourself you disgusting piece of trash",
    "I am going to murder your entire family",
    "fuck you bitch"
]

for text in texts:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        probs = torch.sigmoid(model(**inputs).logits).squeeze().tolist()
    print(f"'{text}' -> {probs[0]:.4f} toxicity")
