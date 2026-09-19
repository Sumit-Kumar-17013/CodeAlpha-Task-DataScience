from fastapi import FastAPI , HTTPException
from pydantic import BaseModel , Field 
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
import numpy as np
import joblib
import uvicorn 
from datetime import datetime , timezone
import time

TIME_START = time.time()

model_path = "car_price_prediction_model.pkl"

try:
    model = joblib.load(model_path)
except Exception as e:
    raise RuntimeError(
        f"Model path coundn't Load {e}"
    )

app = FastAPI(
    title = 'Car Price Project',
    description= "API for Predict Car Price",
    version= '1.0.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],
    allow_credentials= True,
    allow_methods= ["*"],
    allow_headers=["*"], 
)

class ModelData(BaseModel):
    car_name: str = Field(..., min_length=1, max_length=100, description="Name of the car")

    present_price: float = Field( ..., gt=0, le=1000, description="Current showroom/present price in lakhs" ) 

    driven_kms: float = Field( ..., ge=0, le=1_000_000, description="Total kilometres driven" ) 

    fuel_type: Literal[ "Petrol", "Diesel", "CNG"] = Field( ...,description="Fuel type")
    
    selling_type: Literal["Dealer", "Individual"] = Field(..., description="Selling type") 

    transmission: Literal["Manual","Automatic"] = Field(...,description="Transmission type") 

    owner: int = Field( ..., ge=0, le=5, description="Number of previous owners") 

    car_age: float = Field( ..., ge=0, le=50,description="Age of the car in years" ) 

    kms_per_year: float = Field( ..., ge=0, le=100_000,description="Kilometres driven per year")



class PredictionRecord(BaseModel):
    predicted_price: float = Field( ..., description="Predicted selling price in lakhs" )
    currency: str = "INR" 
    unit: str = "Lakhs" 
    model: str = "Random Forest"
    status: str = "success"




@app.get("/")
def home():
    return{
        "Message" : "Car Price Prediction APi",
        "Status" : "Running",
        "Endpoint" :{
            "home": "GET /", 
            "health": "GET /health", 
            "prediction": "POST /prediction", 
            "documentation": "GET /docs"
        }
    }

@app.get("/health")
def health():
    return{
        "Status" : "OK",
        "timestamp" : datetime.now(timezone.utc).isoformat(),
        "uptime" :time.time() - TIME_START, 
    }

@app.post("/predict" , response_model = PredictionRecord)
def predict(data : ModelData):
    try:
        input_df = pd.DataFrame([{
            "Present_Price": data.present_price, 
            "Driven_kms": data.driven_kms, 
            "Owner": data.owner, 
            "Car_Age": data.car_age, 
            "kms_Per_Year": data.kms_per_year, 
            "Selling_type": data.selling_type, 
            "Transmission": data.transmission, 
            "Fuel_Type": data.fuel_type, 
            "Car_Name": data.car_name

        }])

        prediction_value = model.predict(input_df)

        predicted_price = float(prediction_value[0])

        if not np.isfinite(predicted_price): 
            raise ValueError( "Model returned an invalid prediction." )


        return PredictionRecord(
            predicted_price=round(predicted_price, 2), 
            currency="INR", 
            unit="Lakhs", 
            model="Random Forest", 
            status="success" 
        )


    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail = f"Prediction Failed {e}"
        )



if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host = "0.0.0.0",
        port = 8000,
        reload = True
    )



