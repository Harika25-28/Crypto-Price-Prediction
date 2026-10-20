from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .database import engine, Base
from .api.endpoints import predictions, auth

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CryptoPulse API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(predictions.router, prefix="/api", tags=["predictions"])

@app.on_event("startup")
def startup_event():
    """Seed fixed management and admin accounts on startup."""
    auth.seed_fixed_accounts()

@app.get("/")
def read_root():
    return {"message": "Welcome to CryptoPulse API"}

if __name__=="__main__":
    uvicorn.run("app.main:app",host="127.0.0.1",port=8000,reload=True)

