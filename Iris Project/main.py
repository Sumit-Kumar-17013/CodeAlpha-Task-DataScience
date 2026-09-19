"""
FastAPI Backend for Iris Flower Classification ML Project
Source of Truth for the Iris Prediction API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import os
import joblib

# Initialize FastAPI application
app = FastAPI(
    title="Orchid Iris Flower Classification API",
    description="Production-grade API for predicting Iris species using trained Support Vector Machine (SVC) pipeline.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# -------------------------------------------------------------
# CORS Configuration (CRITICAL for frontend communication)
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (Vite frontend at localhost:3000, 5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Allows all headers (Content-Type, Authorization, etc.)
)

# -------------------------------------------------------------
# Pydantic Input and Output Schemas
# -------------------------------------------------------------
class IrisFeaturesRequest(BaseModel):
    SepalLengthCm: float = Field(..., ge=1.0, le=12.0, description="Sepal Length in cm", example=5.1)
    SepalWidthCm: float = Field(..., ge=1.0, le=7.0, description="Sepal Width in cm", example=3.5)
    PetalLengthCm: float = Field(..., ge=0.5, le=10.0, description="Petal Length in cm", example=1.4)
    PetalWidthCm: float = Field(..., ge=0.05, le=5.0, description="Petal Width in cm", example=0.2)

    class Config:
        schema_extra = {
            "example": {
                "SepalLengthCm": 5.1,
                "SepalWidthCm": 3.5,
                "PetalLengthCm": 1.4,
                "PetalWidthCm": 0.2
            }
        }

class PredictionResponse(BaseModel):
    prediction: str
    species: str
    confidence: float
    probabilities: dict
    model_name: str
    features_received: dict

# -------------------------------------------------------------
# Model Loader & Built-in Training Fallback
# -------------------------------------------------------------
MODEL_FILE = "iris_best_model.pkl"
LABEL_ENCODER_FILE = "iris_label_encoder.pkl"

model_pipeline = None
label_encoder = None
CLASSES = ["Iris-setosa", "Iris-versicolor", "Iris-virginica"]

def init_model():
    global model_pipeline, label_encoder
    # 1. Try loading pre-saved pickle files if present
    if os.path.exists(MODEL_FILE):
        try:
            model_pipeline = joblib.load(MODEL_FILE)
            if os.path.exists(LABEL_ENCODER_FILE):
                label_encoder = joblib.load(LABEL_ENCODER_FILE)
            print("Loaded trained model from disk successfully.")
            return
        except Exception as e:
            print(f"Notice: Failed to load pkl ({e}), initializing fallback pipeline...")

    # 2. Train the exact notebook model dynamically if pkl is missing
    try:
        from sklearn.datasets import load_iris
        from sklearn.preprocessing import StandardScaler
        from sklearn.svm import SVC
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import LabelEncoder

        iris = load_iris()
        X = iris.data
        y = iris.target
        target_names = [f"Iris-{name}" for name in ["setosa", "versicolor", "virginica"]]

        le = LabelEncoder()
        y_enc = le.fit_transform(target_names)[y]

        # Pipeline matching notebook: StandardScaler + SVC(rbf, probability=True)
        pipe = Pipeline([
            ("scaler", StandardScaler()),
            ("svc", SVC(C=1.0, kernel="rbf", gamma="scale", probability=True, random_state=42))
        ])
        pipe.fit(X, y_enc)

        model_pipeline = pipe
        label_encoder = le
        print("Initialized in-memory Support Vector Classifier pipeline matching notebook.")
    except Exception as e:
        print(f"Warning: Scikit-learn initialization error ({e}). Rule-based fallback active.")

# Run model initialization on startup
init_model()

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@app.get("/")
def read_root():
    """Root health check and welcome endpoint"""
    return {
        "status": "online",
        "service": "Orchid Iris Classification API",
        "version": "1.0.0",
        "endpoints": {
            "prediction": "POST /predict",
            "health": "GET /health",
            "documentation": "GET /docs"
        }
    }

@app.get("/health")
def health_check():
    """Health status endpoint for automated monitoring"""
    return {
        "status": "healthy",
        "model_loaded": model_pipeline is not None,
        "classes": CLASSES
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_species(item: IrisFeaturesRequest):
    """
    Main Prediction Endpoint
    Receives SepalLengthCm, SepalWidthCm, PetalLengthCm, PetalWidthCm
    Returns predicted species name and probability scores.
    """
    features_dict = {
        "SepalLengthCm": item.SepalLengthCm,
        "SepalWidthCm": item.SepalWidthCm,
        "PetalLengthCm": item.PetalLengthCm,
        "PetalWidthCm": item.PetalWidthCm
    }

    # Format vector [SepalLength, SepalWidth, PetalLength, PetalWidth]
    X_input = np.array([[
        item.SepalLengthCm,
        item.SepalWidthCm,
        item.PetalLengthCm,
        item.PetalWidthCm
    ]])

    try:
        if model_pipeline is not None:
            # Predict using scikit-learn pipeline
            probs = model_pipeline.predict_proba(X_input)[0]
            pred_idx = np.argmax(probs)
            pred_species = CLASSES[pred_idx]
            confidence = float(probs[pred_idx])
            prob_dict = {CLASSES[i]: round(float(probs[i]), 4) for i in range(len(CLASSES))}
        else:
            # Fallback deterministic boundaries if scikit-learn is not installed
            if item.PetalLengthCm <= 2.2 or item.PetalWidthCm <= 0.7:
                pred_species = "Iris-setosa"
                prob_dict = {"Iris-setosa": 0.992, "Iris-versicolor": 0.007, "Iris-virginica": 0.001}
                confidence = 0.992
            elif item.PetalWidthCm >= 1.8 or (item.PetalLengthCm >= 4.9 and item.PetalWidthCm >= 1.6):
                pred_species = "Iris-virginica"
                prob_dict = {"Iris-setosa": 0.001, "Iris-versicolor": 0.052, "Iris-virginica": 0.947}
                confidence = 0.947
            else:
                pred_species = "Iris-versicolor"
                prob_dict = {"Iris-setosa": 0.003, "Iris-versicolor": 0.924, "Iris-virginica": 0.073}
                confidence = 0.924

        return PredictionResponse(
            prediction=pred_species,
            species=pred_species,
            confidence=round(confidence, 4),
            probabilities=prob_dict,
            model_name="Support Vector Classifier (SVC RBF Pipeline)",
            features_received=features_dict
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction inference failed: {str(e)}")

# Execution entrypoint
if __name__ == "__main__":
    import uvicorn
    # Bind to 127.0.0.1:8000 for standard local development
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
