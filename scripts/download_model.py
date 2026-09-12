import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "vinai/bertweet-base"
SAVE_PATH = "feature/toxicity/models/tweetbert"

print(f"Downloading {MODEL_NAME} from Hugging Face...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, normalization=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=4, problem_type="multi_label_classification")

os.makedirs(SAVE_PATH, exist_ok=True)
print(f"Saving model to {SAVE_PATH}...")
tokenizer.save_pretrained(SAVE_PATH)
model.save_pretrained(SAVE_PATH)

print("Download complete! The backend is ready to run.")
