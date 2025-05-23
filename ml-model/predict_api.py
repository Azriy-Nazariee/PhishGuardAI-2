from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import re
from gensim.models import Word2Vec
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import uvicorn

# Load models
lr_model = joblib.load('logistic_regression_model.pkl')
rf_model = joblib.load('random_forest_model.pkl')
word2vec_model = joblib.load('word2vec_model.pkl')
scaler = joblib.load('scaler.pkl')

# Preprocessing
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text.split()

def vectorize(tokens, w2v_model, size=100):
    vector = np.zeros(size)
    count = 0
    for word in tokens:
        if word in w2v_model.wv:
            vector += w2v_model.wv[word]
            count += 1
    return vector / count if count != 0 else vector

# FastAPI app
app = FastAPI()

class EmailBody(BaseModel):
    body: str

@app.post("/predict")
async def predict(email: EmailBody):
    tokens = preprocess_text(email.body)
    vector = vectorize(tokens, word2vec_model).reshape(1, -1)
    vector_scaled = scaler.transform(vector)

    # Logistic Regression
    lr_proba = lr_model.predict_proba(vector_scaled)[0][1]
    lr_pred = "phishing" if lr_proba > 0.5 else "non-phishing"

    # Random Forest
    rf_proba = rf_model.predict_proba(vector)[0][1]  # RF uses unscaled features
    rf_pred = "phishing" if rf_proba > 0.5 else "non-phishing"

    return {
        "logistic_regression": {
            "prediction": lr_pred,
            "confidence": round(float(lr_proba), 4)
        },
        "random_forest": {
            "prediction": rf_pred,
            "confidence": round(float(rf_proba), 4)
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
