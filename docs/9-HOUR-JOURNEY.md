# AI Feed Shield: The 9-Hour Hackathon Journey

## 1. Project Overview & Architecture
The goal of this hackathon project was to build **AI Feed Shield**, a cross-browser extension capable of intercepting and neutralizing toxic content, hate speech, and harassment in real-time across major social media platforms like Twitter/X. 

Instead of relying on generic pre-trained models, our ambition was to train a custom text-classification AI specifically tuned for toxic social media behavior, host it locally via a Python FastAPI backend, and pipe predictions directly into a dynamic DOM-altering browser extension.

## 2. The Training Pipeline (From Failure to Full Fine-Tuning)
Our initial goal was to fine-tune `vinai/bertweet-base` using Low-Rank Adaptation (PEFT/LoRA) on Kaggle using the massive `google/civil_comments` dataset. This process led to several critical Machine Learning discoveries.

### The 0.5 Threshold Bug (Severe Underfitting)
Upon deploying our first Kaggle-trained model, we encountered a critical bug: the model flagged the word "Hello" as highly toxic. 
*   **The Diagnosis:** By intercepting the raw logits, we found the model was outputting `0.06`. A Sigmoid function converts `0.0` logits into exactly `0.5` probability. Because our backend threshold was `> 0.5`, the random noise of the untrained classifier head was triggering false positives for everything.
*   **The Cause:** The training loss was permanently stuck at `0.71` (mathematically equivalent to `-log(0.5)`, or random guessing). Our LoRA configuration (`r=8` targeting only `query` and `value` matrices) severely bottlenecked the 135-million parameter model. The tiny adapters lacked the "brain capacity" to map complex tweets into 4 distinct toxicity categories.

### Mode Collapse (Severe Class Imbalance)
In our second attempt, we trained on 25,000 rows, successfully moving the logits into the negatives. However, highly explicit profanity only scored a `0.28` toxicity rating.
*   **The Diagnosis:** Because `google/civil_comments` is 92% safe text, our 25,000 sequential rows contained ~23,000 safe comments and only ~2,000 toxic ones. The AI experienced Mode Collapse—it realized the mathematically easiest way to lower its loss function was to simply guess "Safe" for every single input.
*   **The Fix:** We wrote custom Hugging Face dataset slicing logic to dynamically isolate highly toxic text (`>0.5`) and perfectly safe text (`<0.1`), using `concatenate_datasets` to create a flawlessly balanced 50/50 dataset.

### The "Hackathon Nuke": Full Fine-Tuning
Realizing that LoRA was bottlenecking our convergence time, we made the aggressive pivot to **Full Fine-Tuning**. Because `bertweet-base` is only 135M parameters, we bypassed PEFT entirely, unfreezing all parameters. 
*   **The Execution:** We trained the full model on a perfectly balanced 20,000-row dataset for 3 epochs with a learning rate of `2e-5`.
*   **The Result:** The evaluation loss plummeted from the stuck `0.71` down to **`0.19`**, proving the model had successfully memorized the geometric boundaries of toxic language.

## 3. The Git Disaster & Recovery
During rapid iteration, we accidentally committed the 500MB+ `.safetensors` model files to our local repository, permanently bricking our ability to push to GitHub due to the 100MB file limit. 
*   **The Fix:** We executed a deep `git filter-branch --tree-filter` command to systematically rewrite our Git history and purge the massive binaries from all previous commits, rescuing the repository.

## 4. Cross-Browser Extension Engineering
Our initial extension successfully blurred elements on a mock HTML demo feed, but we needed it to work on a live, heavily obfuscated production environment: **Twitter/X**.

*   **Twitter DOM Parsing:** We engineered a custom `twitter_adapter.js` content script that uses `MutationObserver` to intercept dynamically loading React elements via `article[data-testid="tweet"]`.
*   **Cross-Browser Support:** We migrated our manifest from Chrome-only to Firefox-compatible by adding Mozilla-specific `gecko` configurations and expanding our `host_permissions` to seamlessly bypass CORS restrictions on `x.com`.
*   **Backend Fail-Safes:** To ensure a flawless live presentation, we built dynamic fallback regex layers into our FastAPI backend to guarantee interception of explicitly banned keywords regardless of edge-case model uncertainties.

## 5. Conclusion
In just 9 hours, we went from struggling with generic models and fatal Git errors to successfully diagnosing complex Machine Learning mode collapses. We architected a perfectly balanced dataset, fully fine-tuned a 135M-parameter Transformer model on Kaggle, and successfully integrated it with a cross-browser extension capable of censoring live toxicity on one of the world's largest social media platforms.
