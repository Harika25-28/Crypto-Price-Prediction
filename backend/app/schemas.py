from pydantic import BaseModel, EmailStr, field_validator, validator
from typing import Optional
from datetime import datetime
import re

class PredictionBase(BaseModel):
    coin_symbol: str

class PredictionCreate(PredictionBase):
    pass

class MetricsBase(BaseModel):
    rmse: float
    mae: float
    mape: float

class IndividualPredictions(BaseModel):
    arima: Optional[float] = None
    lightgbm: Optional[float] = None
    tcn: Optional[float] = None
    tft: Optional[float] = None

class PredictionResponse(PredictionBase):
    id: int
    predicted_price: float
    timestamp: datetime
    # New fields
    individual_predictions: Optional[dict] = None # Using dict for flexibility or a nested schema
    sentiment_score: Optional[float] = None
    rmse: Optional[float] = None
    mae: Optional[float] = None
    mape: Optional[float] = None

    class Config:
        from_attributes = True

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    role: str # 'user', 'management', 'admin'

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    subscription_plan: Optional[str] = 'free'

    @validator('password')
    def validate_password(cls, v, values):
        if values.get('role') == 'user':
            # Strong password validation for 'user' role
            if len(v) < 8:
                raise ValueError('Password must be at least 8 characters long')
            if not re.search(r"[A-Z]", v):
                raise ValueError('Password must contain at least one uppercase letter')
            if not re.search(r"[a-z]", v):
                raise ValueError('Password must contain at least one lowercase letter')
            if not re.search(r"[0-9]", v):
                raise ValueError('Password must contain at least one digit')
            if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
                raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    # Determine user by username or email
    identifier: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    subscription_plan: Optional[str] = 'free'

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class ModelMetadataResponse(BaseModel):
    coin_symbol: str
    model_name: str
    rmse: float
    mae: float
    mape: float
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    last_trained: datetime
    samples_count: int

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    subscription_plan: Optional[str] = 'free'
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
