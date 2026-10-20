from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ... import crud, schemas, database
from . import auth
from ...services import ml_service
from ...database import get_db

router = APIRouter()

@router.post("/predict/", response_model=schemas.PredictionResponse)
def create_prediction(prediction: schemas.PredictionCreate, db: Session = Depends(get_db)):
    # Run prediction logic
    pred_data = ml_service.predict_price(prediction.coin_symbol)
    if pred_data is None:
        raise HTTPException(status_code=400, detail="Could not generate prediction")

    # Store in DB
    return crud.create_prediction_entry(db=db, prediction=prediction, pred_data=pred_data)

@router.get("/history/", response_model=list[schemas.PredictionResponse])
def read_predictions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    predictions = crud.get_prediction_history(db, skip=skip, limit=limit)
    return predictions

@router.post("/train/{coin_symbol}/")
def train_model(coin_symbol: str, db: Session = Depends(get_db)):
    results = ml_service.run_training_and_testing(coin_symbol, db)
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    return results

@router.get("/metrics/{coin_symbol}/", response_model=schemas.ModelMetadataResponse)
def get_model_metrics(coin_symbol: str, db: Session = Depends(get_db)):
    metrics = ml_service.get_trained_metrics(coin_symbol, db)
    if not metrics:
        raise HTTPException(status_code=404, detail="Metrics not found for this coin. Please train the model first.")
    return metrics

# ============================================================
# MANAGEMENT ENDPOINTS
# ============================================================
@router.get("/management/metrics/")
def get_all_metrics(db: Session = Depends(get_db)):
    """Management can view model performance for all coins."""
    all_meta = crud.get_all_model_metadata(db)
    return [{
        "coin_symbol": m.coin_symbol, "model_name": m.model_name,
        "rmse": m.rmse, "mae": m.mae, "mape": m.mape,
        "precision": m.precision, "recall": m.recall, "f1_score": m.f1_score,
        "samples_count": m.samples_count, "last_trained": m.last_trained
    } for m in all_meta]

@router.get("/management/users/")
def get_management_users(db: Session = Depends(get_db)):
    """Management can view all registered users with their subscription plan."""
    from .. import models as db_models
    users = db.query(db_models.User).filter(db_models.User.role == "user").all()
    return [{
        "id": u.id,
        "email": u.email,
        "username": u.username,
        "full_name": u.full_name,
        "role": u.role,
        "subscription_plan": u.subscription_plan if hasattr(u, 'subscription_plan') and u.subscription_plan else "free",
        "created_at": u.created_at if hasattr(u, 'created_at') else None,
    } for u in users]

@router.get("/management/history/")
def management_prediction_history(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Management can view the full prediction history."""
    predictions = crud.get_prediction_history(db, skip=skip, limit=limit)
    return predictions

# ============================================================
# ADMIN ENDPOINTS
# ============================================================
@router.get("/admin/users/")
def list_all_users(db: Session = Depends(get_db)):
    """Admin can view all registered users."""
    users = crud.get_all_users(db)
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role} for u in users]

@router.get("/admin/metrics/")
def admin_all_metrics(db: Session = Depends(get_db)):
    """Admin can view model performance for all coins."""
    return crud.get_all_model_metadata(db)

@router.get("/models/performance", response_model=list[schemas.ModelMetadataResponse])
def get_all_models_performance(db: Session = Depends(get_db)):
    """Get performance metrics for all models across all coins."""
    return crud.get_all_model_metadata(db)
