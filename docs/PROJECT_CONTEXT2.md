# HACKATHON PITCH CONTEXT: AI FEED SHIELD (MEGA PROMPT)

**Prompt to ChatGPT:**
Act as an expert Hackathon Pitch Coach and copywriter. I am participating in a high-stakes hackathon and I need you to help me write my pitch, my presentation script (3 minutes), and my Devpost submission. 

Below is the absolute, comprehensive, low-level technical context of exactly what my team built over the last 9 hours. Read EVERYTHING carefully. Do not skip the technical details. I want my pitch and Devpost to sound highly advanced, proving that we did hardcore Machine Learning engineering, not just API wrapping.

---

## 1. THE PROBLEM & SOLUTION OVERVIEW
**The Problem:** Social media toxicity is rampant. Generic safety filters are easily bypassed by typos, slang, and contextual harassment. Furthermore, relying on centralized black-box APIs for text moderation introduces massive privacy risks and latency.
**The Solution:** We built **AI Feed Shield**. It is a real-time, cross-browser (Chrome & Firefox) Manifest V3 extension backed by a local Python FastAPI server. It uses a custom-trained, 135-million-parameter Transformer AI (BERTweet) to intercept, analyze, and visually censor toxic tweets on X/Twitter in real-time, completely locally.

---

## 2. THE MACHINE LEARNING PIPELINE & ENGINEERING JOURNEY

### Phase 1: The Model & Tokenizer Selection
We selected `vinai/bertweet-base`, a RoBERTa architecture model pre-trained on 850 million English Tweets. 
*   **Why BERTweet?** Standard models trained on Wikipedia fail on emojis, slang, and hashtags. BERTweet mathematically maps social media slang accurately in its 768-dimensional vector space.
*   **Tokenization (BPE):** We used Byte-Pair Encoding (Subword Tokenization). Instead of splitting by spaces, it chops words into pieces. If a troll types "patheticc", a space-based filter fails, but BPE chops it into `["path", "etic", "c"]`, mapping it to specific integer IDs. This makes our model highly resistant to typo-based filter evasion.

### Phase 2: The LoRA Underfitting Crisis (The First Failure)
We initially attempted to fine-tune the model on Kaggle using Parameter-Efficient Fine-Tuning (PEFT/LoRA) to save GPU VRAM. 
*   **The Math of the Failure:** We froze the 135M base parameters and attached LoRA adapters (Rank `r=8`) to the `query` and `value` matrices. 
*   **The Bug:** Our model started flagging safe words like "Hello" as toxic. We intercepted the raw logits and found they were outputting exactly `0.06`. Passed through a Sigmoid function, this equals `0.5` probability. 
*   **The Diagnosis:** Our training loss flatlined permanently at `0.71` (which is mathematically `-log(0.5)`, or random guessing). Our LoRA bottleneck was too tight. The tiny adapters (only 12,288 trainable parameters) lacked the "expressive capacity" to map complex tweets into our 4 continuous probability labels (Toxicity, Hate, Harassment, Abuse). The model suffered from **Severe Underfitting**.

### Phase 3: Mode Collapse & Class Imbalance (The Second Failure)
We dropped LoRA, but our next training run resulted in explicit profanity scoring only `0.28` (failing our 0.5 threshold).
*   **The Diagnosis:** We trained on 25,000 sequential rows of the `google/civil_comments` dataset. Because that dataset is 92% safe text, our model experienced **Mode Collapse**. 
*   **The Optimizer's "Cheat":** The optimizer realized the mathematically easiest way to lower its `BCEWithLogitsLoss` was to blindly push all Logits to $-\infty$, predicting "Safe" for every single input and achieving 92% accuracy without actually learning linguistic vectors.

### Phase 4: The "Hackathon Nuke" & Full Fine-Tuning (The Victory)
We executed two massive fixes to achieve our final working model:
1.  **Dynamic Dataset Balancing:** We wrote custom Hugging Face dataset slicing logic (`concatenate_datasets`) to dynamically isolate highly toxic text (`>0.5`) and perfectly safe text (`<0.1`), creating a flawlessly balanced 20,000-row dataset (10k toxic, 10k safe). This mathematically forced the optimizer to stop guessing and actually learn the linguistic boundaries.
2.  **Full Fine-Tuning:** We bypassed PEFT entirely, unfroze all 135 million parameters, and ran Full Fine-Tuning. We dropped our learning rate to `2e-5` to prevent Catastrophic Forgetting. 
*   **The Result:** The evaluation loss plummeted from the stuck `0.71` down to an incredible **`0.19`**. Our Macro F1 score spiked, and the model successfully memorized the geometric boundaries of toxic language.

---

## 3. EXTENSION ENGINEERING & FRONTEND
Our frontend successfully intercepts the live, heavily obfuscated production environment of **Twitter/X**.

*   **Twitter DOM Parsing:** Modern SPAs use Infinite Scrolling. We engineered a custom `twitter_adapter.js` content script that uses `MutationObserver` to intercept dynamically loading React elements in real-time. Because Twitter obfuscates CSS classes, we targeted stable React test hooks (`article[data-testid="tweet"]`).
*   **Manifest V3 Messaging Bridge:** The content script extracts the text and sends a serialized JSON payload to our background Service Worker. The Service Worker operates independent of the DOM, allowing it to bypass CORS restrictions on `x.com` and execute a `fetch()` POST request to our local FastAPI backend.
*   **Dynamic DOM Mutation:** If the Python backend returns `is_safe: false`, the content script immediately injects a Yellow Warning DOM Node (`display: none` on the original tweet), dropping the AI safety shield directly into the user's feed before they can process the toxicity.
*   **Cross-Browser Support:** We migrated our manifest from Chrome-only to Firefox-compatible by injecting Mozilla-specific `gecko` configurations (`browser_specific_settings`).

## 4. THE GIT DISASTER & RECOVERY
During rapid iteration, we accidentally committed the 500MB+ `.safetensors` model files to our local repository, permanently bricking our ability to push to GitHub due to the 100MB file limit. We executed a deep `git filter-branch --tree-filter` command to systematically rewrite our Git history and purge the massive binaries from all previous commits, rescuing the repository just in time.

---

### WHAT I NEED FROM YOU (CHATGPT):
Based on this massive, highly detailed technical context, generate the following deliverables:
1.  **A 3-minute Presentation Script:** Include a Hook, the Problem, the Solution, a deep dive into "Our ML Engineering Journey" (highlighting the LoRA underfitting, Mode Collapse, and Full Fine-Tuning victory), and a strong Conclusion.
2.  **Devpost Submission Text:** Write the "Inspiration", "What it does", "How we built it", and "Challenges we ran into" sections. Make the "Challenges" section incredibly technical and impressive based on the ML and Git roadblocks mentioned above.
3.  **A Punchy Elevator Pitch (2 sentences).**

---

## UPDATE 3: Hybrid Image Safety & Deployment

**New Features for Pitching:**
1. **Hybrid Image Filter:** Tell the judges we couldn't just rely on standard APIs. We integrated `AdamCodd/vit-base-nsfw-detector` (a lightweight Vision Transformer) to catch explicit pixel data. But because pre-trained "Gore" models are restricted/unavailable, we built a **Semantic Heuristic Fallback**. The system reads image URLs and metadata for violent/NSFW triggers and aggressively blocks them before the AI even has to process the pixels. The final safety score is the `max(AI_Score, Heuristic_Score)`.
2. **The "Local-Cloud" Infrastructure Hack:** When Render and Hugging Face paywalled their Docker/RAM tiers, we pivoted instantly. We turned the local laptop into the cloud server by establishing a secure public HTTPS tunnel (`localtunnel`/`ngrok`). This bypassed the 512MB RAM cloud limits entirely, allowing the heavy ViT models and RoBERTa models to run flawlessly during the live demo with zero latency.
