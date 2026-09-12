import json
import os

# Pure Python keyword mock for Image URL / Alt Text
models = {
    "nsfw": {"explicit": 0.9, "nude": 0.9},
    "graphic": {"gore": 0.9, "graphic": 0.9, "violent": 0.8}
}

for label, weights in models.items():
    with open(f"ml/nsfw/models/{label}_model.json", "w") as f:
        json.dump(weights, f)

print("NSFW/Graphic models saved.")
