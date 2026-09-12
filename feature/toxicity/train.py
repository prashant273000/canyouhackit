import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from torch.utils.data import Dataset
import os
import sys

# We'll use our local train.csv but expand it slightly to have a valid batch
try:
    df = pd.read_csv("ml/toxicity/data/train.csv")
except FileNotFoundError:
    print("Could not find train.csv. Make sure prepare_data.py has been run.")
    sys.exit(1)

# Duplicate to have enough for a small batch
df = pd.concat([df]*4, ignore_index=True)

print("Loading tokenizer vinai/bertweet-base...")
tokenizer = AutoTokenizer.from_pretrained("vinai/bertweet-base", normalization=True)

class ToxicityDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        labels = self.labels[idx]
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.FloatTensor(labels)
        }

labels = df[['toxicity', 'hate', 'harassment', 'abuse']].values.tolist()
dataset = ToxicityDataset(df['text'].tolist(), labels, tokenizer)

print("Loading model vinai/bertweet-base...")
model = AutoModelForSequenceClassification.from_pretrained(
    "vinai/bertweet-base", 
    num_labels=4,
    problem_type="multi_label_classification"
)

training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=1,
    per_device_train_batch_size=8,
    logging_steps=5,
    save_strategy="no",
    use_cpu=True # Force CPU for local sandboxed run
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

print("Starting training on CPU (this may take a minute)...")
trainer.train()

# Save the model
os.makedirs("ml/toxicity/models/tweetbert", exist_ok=True)
model.save_pretrained("ml/toxicity/models/tweetbert")
tokenizer.save_pretrained("ml/toxicity/models/tweetbert")
print("Model saved to ml/toxicity/models/tweetbert")
