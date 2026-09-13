import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = "feature/toxicity/models/tweetbert"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, normalization=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

text = "Hello"
inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
with torch.no_grad():
    outputs = model(**inputs)
    probs = torch.sigmoid(outputs.logits).squeeze().tolist()

print(f"Logits for 'Hello': {outputs.logits.squeeze().tolist()}")
print(f"Probs for 'Hello': {probs}")
