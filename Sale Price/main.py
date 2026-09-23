from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import joblib
import numpy as np
import pandas as pd
import os
import logging
from datetime import datetime

APP_NAME = "Advertising Sales Prediction API"
APP_VERSION = "1.0.0"
MODEL_PATH = os.path.join("models", "sales_prediction_model.pkl")

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s | %(levelname)s | %(message)s"
    )
logger = logging.getLogger(__name__)

app = FastAPI(
    title=APP_NAME, 
    description="Machine Learning API for Advertising Sales Prediction.", 
    version=APP_VERSION, 
    docs_url="/docs", 
    redoc_url="/redoc"
    )

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
    )

model = None
metadata = {}



try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
    
    saved_model = joblib.load(MODEL_PATH)

    if isinstance(saved_model, dict):
        model = saved_model["pipeline"]
        metadata = saved_model.get("metadata", {})

    else:
        model = saved_model
        metadata = {}

    logger.info("Model loaded successfully.")
    logger.info(f"Model path: {MODEL_PATH}")
except Exception:
    logger.exception("Failed to load trained model.")
    model = None
    metadata = {}



class SalesPredictionRequest(BaseModel):
    TV: float = Field(..., ge=0, description="Advertising expenditure on TV", examples=[230.1])
    Radio: float = Field(..., ge=0, description="Advertising expenditure on Radio", examples=[37.8])
    Newspaper: float = Field(..., ge=0, description="Advertising expenditure on Newspaper", examples=[69.2])




class SalesPredictionResponse(BaseModel):
    predicted_sales: float
    model_name: Optional[str] = None
    input_data: dict
    timestamp: str




@app.get("/")
def root():
    return {
        "message": "Advertising Sales Prediction API is running", 
        "application": APP_NAME, 
        "version": APP_VERSION, 
        "status": "healthy" 
        if model is not None else "unhealthy", "model_loaded": 
            model is not None, "documentation": "/docs"}



@app.get("/health")
def health_check():
    return {
        "status": "healthy" 
        if model is not None else "unhealthy", "model_loaded": model is not None, "model_path": MODEL_PATH}

@app.get("/model-info")
def model_info():

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction model is not loaded.")
    
    model_name = metadata.get("model_name")

    if model_name is None:
        if hasattr(model, "named_steps"):
            estimator = model.named_steps.get("model")

            if estimator is not None:
                model_name = type(estimator).__name__
        else:
            model_name = type(model).__name__
    pipeline_steps = list(model.named_steps.keys()) if hasattr(model, "named_steps") else []

    return {
        "model_name": model_name, 
        "target": "Sales", "features": ["TV", "Radio", "Newspaper"], 
        "pipeline_steps": pipeline_steps, "metadata": metadata
        }

@app.post("/predict", response_model=SalesPredictionResponse)
def predict_sales(request: SalesPredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Prediction model is unavailable.")
    try:
        input_data = pd.DataFrame([{
            "TV": request.TV, 
            "Radio": request.Radio, 
            "Newspaper": request.Newspaper
            }])


        
        logger.info(f"Prediction request: {input_data.to_dict(orient='records')[0]}")
        prediction = model.predict(input_data)
        predicted_value = float(prediction[0])


        if not np.isfinite(predicted_value):
            raise ValueError("Model returned an invalid prediction.")
        
        model_name = metadata.get("model_name")

        if model_name is None:
            if hasattr(model, "named_steps"):
                estimator = model.named_steps.get("model")
                if estimator is not None:
                    model_name = type(estimator).__name__
            else:
                model_name = type(model).__name__



        return SalesPredictionResponse(
            predicted_sales=round(predicted_value, 4), 
            model_name=model_name, 
            input_data={"TV": request.TV, "Radio": request.Radio, "Newspaper": request.Newspaper}, 
            timestamp=datetime.now().isoformat())

    
    except Exception as e:
        logger.exception("Prediction failed.")
        raise HTTPException(
            status_code=400, 
            detail=f"Prediction failed: {str(e)}")

    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
        )