# AI Feed Shield

## 1. Project Name
AI Feed Shield

## 2. Problem
Social media feeds are flooded with toxicity, graphic content, and topics that users may simply want to avoid for their mental health.

## 3. Solution
A personalized AI safety layer Chrome extension that parses frontend content, analyzes it with a backend model, and decides whether to allow, warn, or hide content before it displays.

## 4. Differentiator
Operates entirely on the client-side rendering layer across multiple sites using a Universal Parser, preventing the need for platform-specific APIs.

## 5. Four Mandatory Deliverables
1. **Toxicity classification**: Blocks hate, harassment, abuse.
2. **NSFW/graphic detection**: Blocks explicit/violent imagery.
3. **Semantic trigger filtering**: Configurable keyword/semantic blockers (e.g., 'war').
4. **Pre-post toxicity check**: Warns users before they post toxic drafts.

## 6. Novelty Features
- Universal cross-website parser.
- Context-aware toxicity (evaluates replies based on parent context).
- Conversation toxicity escalation tracking.
- Adversarial text normalization.

## 7. Architecture
Page -> Content Script -> UniversalPost -> Service Worker -> FastAPI -> Decision Engine -> UI

## 8. ML Models
- Pure Python dictionary fallback models (Hackathon MVP due to sandbox constraints).
- Supports Toxicity, NSFW, Graphic, Semantic modules.

## 9. Datasets
- Synthetic 8-item miniature dataset (MVP).

## 10. Training/Fine-Tuning
- Minimal pure Python training pipeline deployed in `ml/toxicity` and `ml/nsfw`.

## 11. Evaluation
- See `docs/10-testing.md`.

## 12. Local Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
# Download base TweetBERT and generate local weights
python feature/toxicity/train.py

cd backend && uvicorn main:app --reload
```

## 13. Extension Loading
- Open Chrome -> `chrome://extensions`
- Enable Developer Mode
- "Load unpacked" -> select `extension/` directory.

## 14. Demo Flow
- Open `demo-feed/index.html` in browser.
- Scroll through feed to see safe content load and toxic/nsfw content hidden behind warning banners.
- Type "You are pathetic" in the compose box to trigger the pre-post warning.

## 15. Limitations
- ML models are mocked using keyword dictionaries due to hackathon time and compute constraints.
- Site adapters only fully functional on local demo and partially on Reddit.

## 16. AI-Assisted Development / CYHI
Built with Antigravity AI following the 28-node Master Build Plan.
