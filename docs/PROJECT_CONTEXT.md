# AI Feed Shield - Project Context

- **Event:** Can You Hack It? 24-hour hackathon
- **Track:** Track 3: AI/ML - A Layer Between You and the Noise
- **Mandatory Deliverables:** 
  1. Toxicity classification
  2. NSFW/graphic detection
  3. Semantic trigger filtering
  4. Pre-post toxicity check
- **Product:** Chrome safety-layer extension working across supported websites
- **Architecture:** page -> content script -> UniversalPost -> service worker -> FastAPI -> models -> decision engine -> UI
- **Core Models:** toxicity classifier, image safety classifier, sentence embedding model
- **Novelty:** universal parser, context-aware toxicity, conversation escalation
- **Constraints:** 24 hours, 4 members, majority core features must use team-trained/fine-tuned models, no giant from-scratch models
- **Development Philosophy:** small phases, tests, stable interfaces, honest documentation
- **Current State:** Repo initialized, documentation scaffolding created, basic directories exist.
