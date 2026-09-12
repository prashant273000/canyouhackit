import pandas as pd
import os

# Create a tiny synthetic dataset for the hackathon MVP
data = {
    "text": [
        "Just had a lovely walk in the park!",
        "You are absolutely pathetic and nobody likes you.",
        "I'm going to find where you live and make you pay.",
        "All people from that group are scum and should be exiled.",
        "Beautiful sunset today.",
        "What an idiot you are",
        "Have a great day!",
        "I will destroy you"
    ],
    "toxicity": [0, 1, 1, 1, 0, 1, 0, 1],
    "hate": [0, 0, 0, 1, 0, 0, 0, 0],
    "harassment": [0, 1, 1, 0, 0, 1, 0, 1],
    "abuse": [0, 1, 1, 1, 0, 1, 0, 1]
}

df = pd.DataFrame(data)
os.makedirs("ml/toxicity/data", exist_ok=True)
df.to_csv("ml/toxicity/data/train.csv", index=False)
print("Data preparation complete. Dataset size:", len(df))
