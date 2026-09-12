# Toxicity Model: Fine-Tuning Roadmap

Currently, the backend runs `vinai/bertweet-base` trained on a miniature synthetic dataset to fit hackathon time and hardware constraints. To move this to production, follow this fine-tuning path:

## Step 1: Data Acquisition
- **Dataset**: Download the [Jigsaw Toxic Comment Classification Challenge](https://www.kaggle.com/c/jigsaw-toxic-comment-classification-challenge) dataset from Kaggle. It contains ~160,000 labeled Wikipedia comments.
- **Mapping**: Map Jigsaw's 6 labels (`toxic, severe_toxic, obscene, threat, insult, identity_hate`) to our 4 application labels (`toxicity, hate, harassment, abuse`).

## Step 2: Data Preprocessing
- Update `feature/toxicity/prepare_data.py`. Use the Hugging Face `datasets` library to load the Kaggle CSV.
- Split the dataset into 80% Training, 10% Validation, and 10% Test sets.

## Step 3: Hardware & Compute Acceleration
- Fine-tuning BERT on 160k rows requires a GPU. 
- Open `feature/toxicity/train.py` and remove `use_cpu=True` from the `TrainingArguments`. 
- Run the training script on a CUDA-capable machine (e.g., Google Colab T4/A100, or an AWS EC2 instance).

## Step 4: Hyperparameter Optimization
In `train.py`, adjust the `TrainingArguments` for deep learning:
- `num_train_epochs=3`
- `per_device_train_batch_size=16`
- `learning_rate=2e-5`
- `weight_decay=0.01`

## Step 5: Evaluation & Deployment
- Run the model against the 10% Test set to calculate F1-Score, Precision, and Recall.
- Save the final checkpoint and copy the `.safetensors` files back into `feature/toxicity/models/tweetbert/`.
- Restart the FastAPI backend to load the production-ready weights!
