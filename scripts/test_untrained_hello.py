import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Load fresh untrained model
tokenizer = AutoTokenizer.from_pretrained("vinai/bertweet-base", normalization=True)
model = AutoModelForSequenceClassification.from_pretrained("vinai/bertweet-base", num_labels=4)
model.eval()

text = "Hello"
inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
with torch.no_grad():
    outputs = model(**inputs)

print(f"Untrained Logits: {outputs.logits.squeeze().tolist()}")
