# Deep Dive: Low-Rank Adaptation (LoRA)

During our initial iterations, we attempted to use PEFT (Parameter-Efficient Fine-Tuning) via LoRA. While this ultimately underfit our complex multi-label task, understanding its low-level mechanics is critical.

## The Problem with Standard Fine-Tuning
When training a 135-million-parameter model, the optimizer calculates a gradient for every single weight. It then creates an "optimizer state" (like AdamW) which stores running averages of gradients. This effectively triples the memory required, often causing Out-Of-Memory (OOM) crashes on standard GPUs.

## The LoRA Mathematical Solution
LoRA hypothesizes that the change in weights during fine-tuning has a "low intrinsic rank." 
If $W$ is the original pre-trained weight matrix (e.g., a 768x768 matrix in the attention layer), the updated matrix after training would be $W + \Delta W$.

Instead of learning the massive 768x768 $\Delta W$ matrix (589,824 parameters), LoRA decomposes $\Delta W$ into two much smaller matrices: $A$ and $B$.
$$ \Delta W = B \times A $$

### Low-Level Implementation
1. **Freezing:** We loop through all 135 million parameters in `bertweet-base` and set `requires_grad = False` in PyTorch. The PyTorch Autograd engine completely ignores these weights, saving massive amounts of VRAM.
2. **Matrix A:** A randomly initialized matrix of size `(768, r)`. In our configuration, we used `r=8`.
3. **Matrix B:** A matrix of size `(r, 768)`, initialized to exactly `0`.
4. **The Forward Pass:** When $x$ passes through the layer, the math is: 
   $h = Wx + \Delta Wx = Wx + BAx$. 

Because $r=8$, the total trainable parameters drop from 589,824 down to just 12,288.

## Target Modules: `query` and `value`
In the Multi-Head Attention mechanism, there are Query ($Q$), Key ($K$), and Value ($V$) matrices. 
By setting `target_modules=["query", "value"]`, we explicitly attach the $A$ and $B$ matrices ONLY to the $Q$ and $V$ projection layers. 

## Why LoRA Failed (Severe Underfitting)
Our Multi-Label Toxicity task required the model to understand the subtle differences between Toxicity, Hate, Harassment, and Abuse. 
By restricting $r=8$, the information bottleneck was too tight. The $A$ and $B$ matrices simply did not have enough floating-point numbers (expressive capacity) to map the complex semantic structures of toxic tweets into 4 distinct continuous probabilities. The training loss flatlined at `0.71` (mathematically `-log(0.5)`), meaning the LoRA adapters were completely overwhelmed and reverted to random guessing (50/50).
