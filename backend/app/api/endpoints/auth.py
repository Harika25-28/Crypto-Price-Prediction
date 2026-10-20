from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ... import crud, models, schemas, database
from ...core import security

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _seed_fixed_accounts(db: Session):
    """Seed management and admin accounts if they don't exist."""
    fixed_accounts = [
        {
            "username": "madmin",
            "email": "madmin@cryptopulse.internal",
            "password": "madminadmin",
            "role": "management",
            "full_name": "Management Admin"
        },
        {
            "username": "superadmin",
            "email": "superadmin@cryptopulse.internal",
            "password": "adminsuperadmin",
            "role": "admin",
            "full_name": "Super Admin"
        },
    ]
    for acc in fixed_accounts:
        existing = crud.get_user_by_username(db, acc["username"])
        if not existing:
            hashed = security.get_password_hash(acc["password"])
            user = models.User(
                email=acc["email"],
                username=acc["username"],
                hashed_password=hashed,
                role=acc["role"],
                full_name=acc["full_name"]
            )
            db.add(user)
    db.commit()

def seed_fixed_accounts():
    """Called at application startup."""
    db = database.SessionLocal()
    try:
        _seed_fixed_accounts(db)
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserBase)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Only 'user' role can self-register
    if user.role not in ("user",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Management and Admin accounts cannot be created via registration."
        )
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Try by email first
    user = crud.get_user_by_email(db, email=login_data.identifier)
    # If not found, try by username
    if not user:
        user = crud.get_user_by_username(db, username=login_data.identifier)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    display_name = user.username or user.full_name or user.email
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": display_name,
        "subscription_plan": getattr(user, 'subscription_plan', 'free') or 'free',
    }

# Dependency to get current user from bearer token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except security.JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user
