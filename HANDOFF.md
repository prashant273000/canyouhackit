# Handoff - team

> Updated 2026-09-12T22:27:39+05:30 by bot (session 0912-2151, track ?)
> Read this first. The full log is cyhi-logs/session.md.

# Handoff

## Current state
Project is fully built and deployed locally. Upgraded to TweetBERT for NLP, rearranged the directory structure to match the user's architectural designs, and verified the Chrome extension + FastAPI backend work together when served over HTTP.

## Works
- Real-time toxicity filtering via Hugging Face TweetBERT (PyTorch).
- Chrome extension UI (warning boxes, hide/reveal mechanics).
- Pre-post toxicity checker in the compose box.
- Conversation escalation tracking.
- Semantic trigger filtering.
- Local demo feed and Reddit parsing adapter.
- Accurate project directory layout.

## Broken
- The NSFW model uses a pure Python fallback mock because we only migrated Toxicity to a real PyTorch model.
- Double-clicking the HTML file directly (`file://`) prevents the extension from running due to Chrome security (resolved by using `python3 -m http.server`).

## Next 3 things
1. Migrate the NSFW/Graphic model to a real PyTorch vision model (e.g., MobileNet/ResNet).
2. Build more `UniversalPost` site adapters for platforms like Twitter/X and YouTube.
3. Add a persistent database for the Decision Engine to track user configurations permanently.

## Decisions (and why)
Instructed the user to use `python3 -m http.server 8080` to test the frontend, as updating the Chrome extension manifest to allow `file://` access is insecure and requires hidden browser settings to be toggled manually.

## Don't retry
Do not attempt to load the empty placeholder files in `feature/extension` as the actual unpacked extension. The real extension logic resides in the root `extension/` folder.
