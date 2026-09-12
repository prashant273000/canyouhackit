# Full System Architecture & Working Pipeline

The AI Feed Shield operates as a seamless pipeline between the user's browser and the AI backend. Here is the step-by-step breakdown of how the system processes data:

## 1. Frontend Interception (Chrome Extension)
- **MutationObserver**: `content.js` attaches an observer to the DOM. Whenever the user scrolls or a new comment loads, it detects the new HTML elements.
- **Pre-Analysis Hiding**: Before the user can read the post, the extension applies the `ai-pending` CSS class. This visually blurs or dims the content so the user is protected while the AI "thinks".

## 2. Universal Parsing
- The `UniversalPost` class acts as a site-agnostic adapter. Instead of writing AI logic for every single website, site adapters (like `reddit_adapter.js`) extract the core payload (text, image URLs, and parent comment context) and format it into a standard JSON object.

## 3. Communication Bridge
- `content.js` sends the `UniversalPost` payload to the background service worker (`background.js`). 
- The background worker dispatches asynchronous HTTP POST requests to the FastAPI backend (`http://localhost:8000/analyze/text`).

## 4. NLP Inference (TweetBERT Backend)
- **Tokenization**: The FastAPI backend receives the text and passes it to the `vinai/bertweet-base` tokenizer.
- **Adversarial Normalization**: Before inference, text is normalized (e.g., stripping leetspeak like `1di0t` to `idiot`) to catch users trying to bypass the filter.
- **PyTorch Model Execution**: The tokenized text is passed through the fine-tuned `TweetBERT` Sequence Classifier. The model outputs logits, which are passed through a Sigmoid function to generate percentage probabilities (0.0 to 1.0) for four labels: `toxicity`, `hate`, `harassment`, and `abuse`.
- **Context Awareness**: If the request includes a `parentText` (the comment being replied to), and that parent is heavily toxic, the backend artificially lowers the tolerance threshold for the reply, assuming the conversation is hostile.

## 5. Central Decision Engine
- The `decision_engine.py` aggregates the TweetBERT scores, semantic triggers (e.g., blocking the keyword "war"), and NSFW image scores. 
- It evaluates the combined threat level and returns an actionable verdict: `ALLOW`, `WARN`, or `HIDE`.

## 6. UI Resolution
- The background worker receives the verdict and passes it back to `content.js`.
- If `ALLOW`: The `ai-pending` class is removed, and the post is displayed normally.
- If `WARN/HIDE`: The post is hidden behind a yellow warning box detailing the exact labels that triggered the AI. The user retains agency and can click "Show Anyway" to reveal the content.
