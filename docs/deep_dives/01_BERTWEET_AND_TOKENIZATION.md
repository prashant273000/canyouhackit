# Deep Dive: BERTweet & Subword Tokenization

## The Base Architecture: `vinai/bertweet-base`
For this project, we selected `vinai/bertweet-base` rather than a standard BERT or RoBERTa model. BERTweet is specifically pre-trained on 850 million English Tweets. 

### Low-Level Mechanics of BERTweet
BERTweet utilizes the RoBERTa (Robustly Optimized BERT Pretraining Approach) architecture. At a low level, it consists of:
1. **135 Million Parameters**: These are 32-bit floating-point numbers distributed across the model's matrices.
2. **12 Transformer Layers**: Each layer contains a Multi-Head Attention mechanism and a Feed-Forward Neural Network.
3. **Hidden Size of 768**: Every word (token) is mathematically represented as a dense vector of 768 dimensions floating in a high-dimensional space.

Standard models struggle with social media text because they are trained on Wikipedia and Books. They fail on emojis, slang, and hashtags. BERTweet's pre-training forces its 768-dimensional vectors to cluster social media slang accurately (e.g., placing the vector for "smh" near "disappointed").

## Tokenization: Byte-Pair Encoding (BPE)
Before text reaches the neural network, it must pass through the `AutoTokenizer`. Neural networks cannot read strings; they only perform matrix multiplication on numbers.

### How BPE Works at a Low Level
If a user tweets: `"You are a patheticc loser 🤬"`
A standard space-based tokenizer would fail to recognize `"patheticc"` due to the typo. 
Byte-Pair Encoding (BPE) solves this via **Subword Tokenization**:
1. The tokenizer breaks the string into sub-word chunks based on statistical frequency.
2. `"patheticc"` is chopped into known subwords: `["path", "etic", "c"]`.
3. Each subword is mapped to a highly specific Integer ID in the model's vocabulary (e.g., `8492`, `431`, `11`).
4. The emoji `🤬` is mapped to its specific token ID.

### The Padding and Masking Phase
Because GPUs require uniform matrix dimensions for matrix multiplication, we enforce `max_length=128`.
*   If a tweet has 20 tokens, the tokenizer adds 108 `[PAD]` (Padding) tokens (ID: `1`).
*   It generates an **Attention Mask**: An array of `1`s for real words and `0`s for padding. This tells the Attention Mechanism mathematically to multiply the padding token vectors by 0, ensuring they do not affect the toxicity prediction.
