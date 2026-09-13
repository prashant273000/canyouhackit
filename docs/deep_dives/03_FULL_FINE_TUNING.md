# Deep Dive: Full Fine-Tuning & Dataset Balancing

After discarding LoRA due to expressive bottlenecks, we migrated to **Full Fine-Tuning**.

## Unfreezing the Network
By passing `base_model` directly to the `Trainer` without PEFT wrappers, PyTorch defaults all 135 million parameter tensors to `requires_grad = True`. 
During the Backward Pass (Backpropagation), the Autograd engine calculates the partial derivatives (gradients) of the loss function with respect to every single parameter in all 12 Transformer layers. 

Because we are adjusting the foundational linguistic representations of the model, we dropped the Learning Rate to `2e-5`. A high learning rate (e.g., `1e-3`) would cause massive gradient steps that completely overwrite the model's pre-trained English comprehension (a phenomenon known as Catastrophic Forgetting).

## Mode Collapse and the BCEWithLogitsLoss Function
Our model outputs raw, unnormalized numbers called **Logits** (ranging from $-\infty$ to $+\infty$).
The PyTorch loss function `BCEWithLogitsLoss` applies a Sigmoid function to these logits to squash them into a Probability range $(0, 1)$, and then calculates Binary Cross-Entropy.

### The Class Imbalance Crisis
Our original 25,000 sequential rows of `google/civil_comments` contained 92% safe text.
When passed through BCE, the optimizer detected a "shortcut" to minimize the loss function: if it just aggressively pushed all Logits to negative infinity (predicting everything as Safe), it would instantly achieve 92% accuracy. 
This is known as **Mode Collapse**. The model stopped analyzing words and just hardcoded a negative bias, resulting in explicit profanity scoring only `0.28` (below our 0.5 threshold).

### The Dataset Balancing Solution
To mathematically force the optimizer to rely on textual features rather than statistical priors, we executed a strict 50/50 dataset split using the Hugging Face `datasets` library:
```python
toxic_subset = dataset["train"].filter(lambda x: x["toxicity"] > 0.5)
safe_subset = dataset["train"].filter(lambda x: x["toxicity"] < 0.1)

train_ds = concatenate_datasets([
    toxic_subset.select(range(10_000)),
    safe_subset.select(range(10_000))
]).shuffle(seed=42)
```
By feeding the network exactly 10,000 toxic and 10,000 safe tweets, predicting "Safe" for everything would result in a terrible 50% accuracy. The optimizer was forced to actually update the 135 million parameters to distinguish between safe and toxic semantic vectors. This drove our evaluation loss down to an incredibly accurate `0.19`.
