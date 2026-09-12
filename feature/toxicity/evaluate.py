import json

test_data = [
    "Hello friend",
    "You are a pathetic loser",
    "I'll kill you",
    "This is somewhat ambiguous"
]

labels = ["toxicity", "hate", "harassment", "abuse"]
models = {}
for l in labels:
    with open(f"ml/toxicity/models/{l}_model.json", "r") as f:
        models[l] = json.load(f)

print("--- Acceptance Test ---")
for text in test_data:
    print(f"\nText: '{text}'")
    for label in labels:
        score = 0.1
        for word, weight in models[label].items():
            if word in text.lower():
                score = max(score, weight)
        print(f"  {label}: {score:.3f}")
