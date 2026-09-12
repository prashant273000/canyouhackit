# AI Feed Shield — Project Context

## Hackathon

- **Can You Hack It?**
- **24-hour hackathon**
- **Track 3: AI/ML — A Layer Between You and the Noise**

## Mandatory Deliverables

1. Toxicity classification
2. NSFW / graphic content detection
3. Semantic trigger filtering
4. Pre-post toxicity checking

## Product

AI Feed Shield is a Chrome browser extension that acts as a safety layer between web
content and the reader. It supports multiple websites by parsing frontend content into a
common representation. Whenever technically possible, AI analysis runs before normal
content is revealed or displayed to the reader.

## Core Architecture

```text
Website
  -> Chrome content script
  -> universal content representation
  -> extension background/service worker
  -> backend API
  -> ML models
  -> decision engine
  -> allow / warn / hide
  -> extension updates UI
```

## Planned Models

- Toxicity classifier
- NSFW / graphic image classifier
- Sentence embedding model for semantic triggers

## Novelty Features

- Universal cross-website parser
- Context-aware toxicity
- Conversation toxicity escalation

## Important Constraints

- The project is built in a 24-hour hackathon by four team members.
- The majority of core features must use models trained or fine-tuned by the team.
- Commercial LLM APIs must not perform the whole moderation pipeline.
- Do not train giant models from scratch.
- Do not build mobile support during the MVP.
- Do not build video analysis during the MVP.
- Mandatory deliverables take priority over novelty features.

## Development Philosophy

- Build in small phases.
- Test each phase.
- Preserve stable interfaces.
- Document important decisions.
- Do not implement future phases without being asked.

## Current Status

- The repository has been created.
- CYHI is installed.
- The `docs/` folder exists.
- Implementation has started: a Phase 1 Chrome Manifest V3 extension skeleton exists in
  `feature/extension/`. It contains only the manifest, content-script/style hooks, a
  background service worker, and a popup; no AI, ML, backend, or moderation functionality
  has been implemented.
