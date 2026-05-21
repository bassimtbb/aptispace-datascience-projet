from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(title="AptiSpace MPG Predictor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rf = joblib.load("/app/models/model.pkl")
scaler = joblib.load("/app/models/scaler.pkl")

FEATURE_ORDER = [
    "cylinders", "displacement", "horsepower", "weight",
    "acceleration", "model_year", "origin", "power_to_weight",
]

METADATA = {
    "cylinders":       {"min": 3,      "max": 8},
    "displacement":    {"min": 70,     "max": 455},
    "horsepower":      {"min": 46,     "max": 230},
    "weight":          {"min": 1600,   "max": 5140},
    "acceleration":    {"min": 8,      "max": 25},
    "model_year":      {"min": 70,     "max": 82},
    "origin":          {"min": 0,      "max": 2},
    "power_to_weight": {"min": round(46 / 5140, 4), "max": round(230 / 1600, 4)},
}


class CarFeatures(BaseModel):
    cylinders:    int   = Field(..., ge=3,    le=8)
    displacement: float = Field(..., ge=70,   le=455)
    horsepower:   float = Field(..., ge=46,   le=230)
    weight:       float = Field(..., ge=1600, le=5140)
    acceleration: float = Field(..., ge=8,    le=25)
    model_year:   int   = Field(..., ge=70,   le=82)
    origin:       int   = Field(..., ge=0,    le=2)


def _to_array(car: CarFeatures) -> np.ndarray:
    ptw = car.horsepower / car.weight
    return np.array([[
        car.cylinders, car.displacement, car.horsepower, car.weight,
        car.acceleration, car.model_year, car.origin, ptw,
    ]])


@app.get("/")
def root():
    return {"status": "ok", "model": "RandomForest"}


@app.get("/metadata")
def metadata():
    return METADATA


@app.post("/predict")
def predict(car: CarFeatures):
    mpg = float(rf.predict(_to_array(car))[0])
    if mpg < 20:
        category = "faible"
    elif mpg <= 30:
        category = "moyenne"
    else:
        category = "élevée"
    return {"mpg": round(mpg, 1), "category": category}


@app.post("/explain")
def explain(car: CarFeatures):
    ranked = sorted(
        zip(FEATURE_ORDER, rf.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    return [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in ranked[:3]
    ]
