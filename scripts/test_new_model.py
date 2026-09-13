import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = "feature/toxicity/models/tweetbert"

print("Loading tokenizer and newly trained model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, normalization=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

texts = ["hello", "hi", "You are a pathetic idiot and I hate you"]

for text in texts:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.sigmoid(outputs.logits).squeeze().tolist()
        logits = outputs.logits.squeeze().tolist()
        
    print(f"\nText: '{text}'")
    print(f"  Logits: {[round(l, 4) for l in logits]}")
    print(f"  Probs:  {[round(p, 4) for p in probs]}")
