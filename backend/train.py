import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.services.trainer import train_and_test

def main():
    if len(sys.argv) < 2:
        print("Usage: python train.py <coin_symbol>")
        print("Available coins: bitcoin, binancecoin, solana")
        sys.exit(1)

    coin_symbol = sys.argv[1].lower()
    
    # Ensure database tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print(f"Starting training and testing for {coin_symbol}...")
        results = train_and_test(coin_symbol, db)
        
        if "error" in results:
            print(f"Error: {results['error']}")
        else:
            print(f"Successfully trained {results['coin']}!")
            print(f"Samples tested: {results['samples_tested']}")
            print("Metrics:")
            for k, v in results['metrics'].items():
                print(f"  {k.upper()}: {v:.4f}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
