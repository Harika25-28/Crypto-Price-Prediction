from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from .database import Base
from datetime import datetime

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    coin_symbol = Column(String, index=True)
    predicted_price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    # New columns
    sentiment_score = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    username = Column(String, unique=True, nullable=True, index=True)
    role = Column(String)  # 'user', 'management', 'admin'
    full_name = Column(String, nullable=True)
    subscription_plan = Column(String, default='free')  # 'free', 'pro', 'enterprise'
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    coin_symbol = Column(String, index=True)
    model_name = Column(String, index=True) # 'arima', 'lightgbm', 'tcn', 'tft', 'hybrid'
    rmse = Column(Float)
    mae = Column(Float)
    mape = Column(Float)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    last_trained = Column(DateTime, default=datetime.utcnow)
    samples_count = Column(Integer)
