from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_prediction_history(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PredictionHistory).offset(skip).limit(limit).all()

def create_prediction_entry(db: Session, prediction: schemas.PredictionCreate, pred_data: dict):
    db_prediction = models.PredictionHistory(
        coin_symbol=prediction.coin_symbol,
        predicted_price=pred_data["predicted_price"],
        sentiment_score=pred_data.get("sentiment_score"),
        rmse=pred_data.get("metrics", {}).get("rmse"),
        mae=pred_data.get("metrics", {}).get("mae"),
        mape=pred_data.get("metrics", {}).get("mape"),
        timestamp=datetime.utcnow()
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    from .core.security import get_password_hash
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_all_users(db: Session):
    return db.query(models.User).filter(models.User.role == "user").all()

def get_all_model_metadata(db: Session):
    return db.query(models.ModelMetadata).all()

def get_model_metadata(db: Session, coin_symbol: str, model_name: str):
    return db.query(models.ModelMetadata).filter(
        models.ModelMetadata.coin_symbol == coin_symbol,
        models.ModelMetadata.model_name == model_name
    ).first()

def update_model_metadata(db: Session, coin_symbol: str, model_name: str, metrics: dict, samples: int):
    db_metadata = get_model_metadata(db, coin_symbol, model_name)
    if not db_metadata:
        db_metadata = models.ModelMetadata(coin_symbol=coin_symbol, model_name=model_name)
        db.add(db_metadata)
    db_metadata.rmse = metrics.get("rmse", 0)
    db_metadata.mae = metrics.get("mae", 0)
    db_metadata.mape = metrics.get("mape", 0)
    db_metadata.precision = metrics.get("precision", 0)
    db_metadata.recall = metrics.get("recall", 0)
    db_metadata.f1_score = metrics.get("f1_score", 0)
    db_metadata.samples_count = samples
    db_metadata.last_trained = datetime.utcnow()
    db.commit()
    db.refresh(db_metadata)
    return db_metadata
