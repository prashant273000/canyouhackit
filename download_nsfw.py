from transformers import AutoImageProcessor, AutoModelForImageClassification
import os

save_path = "feature/nsfw/models/nsfw_image"
os.makedirs(save_path, exist_ok=True)

print("Downloading model...")
processor = AutoImageProcessor.from_pretrained("Falconsai/nsfw_image_detection")
model = AutoModelForImageClassification.from_pretrained("Falconsai/nsfw_image_detection")

print("Saving model locally...")
processor.save_pretrained(save_path)
model.save_pretrained(save_path)
print("Done!")
