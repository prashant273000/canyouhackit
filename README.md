# AI Feed Shield

## Quickstart & Installation

1. **Install Dependencies** (This creates the heavy environment, but keeps it local)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Download the AI Model** (Downloads the ~500MB weights so they aren't in Git)
```bash
python scripts/download_model.py
# (Or you can run `python feature/toxicity/train.py` to fine-tune it locally)
```

3. **Start the Backend**
```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload
```
