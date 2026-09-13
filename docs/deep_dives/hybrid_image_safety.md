# Hybrid Image Safety Engine

## Overview
For the Can You Hack It? hackathon, we built a **Hybrid Image Safety Engine** to protect users from explicit imagery in their social media feeds. This engine combines a state-of-the-art Vision Transformer (ViT) with a fast semantic heuristic fallback.

## 1. Vision AI: AdamCodd NSFW Detector
We integrated `AdamCodd/vit-base-nsfw-detector`, which is currently the #1 most downloaded lightweight NSFW Vision Transformer on Hugging Face.
- **How it works:** When an image hits the feed, the extension extracts the URL and sends it to the backend. The backend downloads the image into memory (without saving it) and passes the raw pixels through the ViT.
- **Performance:** Because it is a lightweight ViT, it executes inference in milliseconds. If the model scores the image with an NSFW probability > 0.5 (50%), the backend returns a block signal to the extension.

## 2. Semantic Heuristic Fallback (Gore & Metadata)
Because lightweight, open-source AI models trained on human gore are highly restricted and virtually non-existent on the Hugging Face Hub, we built a Semantic Heuristic Fallback to handle edge cases.
- **How it works:** Before the AI processes the pixels, the backend scans the image URL and associated metadata. If it detects highly toxic strings (e.g., "nsfw", "gore", "porn"), it preemptively flags the image with a 99% toxicity score.
- **Override Mechanism:** The system is designed to take the `max()` of the heuristic score and the AI score. This prevents the AI from accidentally overwriting a heuristic flag (for example, if the AI thinks a dummy trigger image is "safe" because it is just a picture of text).

## 3. The LocalTunnel Deployment Cheat Code
To overcome massive cloud RAM limitations (which prevent free-tier deployments of machine learning models), we utilized `localtunnel` / `ngrok`. 
- By running the backend on the host machine (`uvicorn main:app`), we utilized the full power of the presenter's hardware.
- The tunnel exposed a public HTTPS URL directly to `localhost:8000`, allowing the Chrome Extension to communicate securely over the internet without being blocked by CORS or mixed-content policies.
