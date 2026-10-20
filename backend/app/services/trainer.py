import pandas as pd
import numpy as np
import os
from .data_fetcher import DataFetcher
from .indicators import calculate_indicators
from .models.arima_model import run_arima
from .models.lightgbm_model import run_lightgbm
from .models.tcn_model import run_tcn
from .models.tft_model import run_tft
from .models.hybrid_model import calculate_metrics
from .. import crud
from sqlalchemy.orm import Session

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")

FILE_MAP = {
    "bitcoin": "btc_preprocessed.xlsx",
    "ethereum": "eth_preprocessed.xlsx",
    "solana": "sol_preprocessed.xlsx",
    "cardano": "ada_preprocessed.xlsx",
    "binancecoin": "bnb_preprocessed.xlsx"
}

def load_local_data(coin_symbol: str):
    file_name = FILE_MAP.get(coin_symbol.lower())
    if not file_name:
        return pd.DataFrame()
    
    file_path = os.path.join(DATA_DIR, file_name)
    if not os.path.exists(file_path):
        return pd.DataFrame()
    
    try:
        # Load Excel file
        df = pd.read_excel(file_path)
        
        # Standardize columns to lowercase
        df.columns = [c.lower() for c in df.columns]
        
        # Ensure timestamp exists and is datetime
        if 'timestamp' not in df.columns and 'date' in df.columns:
            df = df.rename(columns={'date': 'timestamp'})
        
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        return df
    except Exception as e:
        print(f"Error loading {file_name}: {e}")
        return pd.DataFrame()

def train_and_test(coin_symbol: str, db: Session):
    """
    Load local dataset, split into train/test, and evaluate models.
    Uses batch prediction for efficiency and accuracy.
    """
    df = load_local_data(coin_symbol)
    if df.empty:
        symbol_map = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana", "ADA": "cardano", "BNB": "binancecoin"}
        full_name = symbol_map.get(coin_symbol.upper())
        if full_name:
            df = load_local_data(full_name)

        if df.empty:
            return {"error": f"Dataset for {coin_symbol} not found"}

    df = calculate_indicators(df)

    # Use 30% for test to get more evaluation points
    split_idx = int(len(df) * 0.7)
    train_df = df.iloc[:split_idx]
    test_df = df.iloc[split_idx:]

    if len(test_df) < 10:
        return {"error": "Dataset too small for testing"}

    # Use last 50 points for evaluation (more robust statistics)
    n_eval = min(50, len(test_df))
    test_subset = test_df.tail(n_eval)
    target_actuals = test_subset['close'].values

    results = {"coin": coin_symbol, "models": {}, "status": "Success"}

    # ── ARIMA ─────────────────────────────────────────────────────────
    try:
        arima_preds = []
        for i in range(n_eval):
            sub = df.iloc[:split_idx + len(test_df) - n_eval + i]
            p = run_arima(sub)
            arima_preds.append(p)
        valid = [(a, p) for a, p in zip(target_actuals, arima_preds) if p is not None]
        if len(valid) >= 5:
            actuals, preds = zip(*valid)
            metrics = calculate_metrics(list(actuals), list(preds))
            crud.update_model_metadata(db, coin_symbol, "arima", metrics, len(valid))
            results["models"]["arima"] = metrics
    except Exception as e:
        print(f"ARIMA training error: {e}")

    # ── LightGBM ──────────────────────────────────────────────────────
    try:
        # Train once, predict for entire test window
        lgbm_preds = []
        for i in range(n_eval):
            sub = df.iloc[:split_idx + len(test_df) - n_eval + i]
            p = run_lightgbm(sub)
            lgbm_preds.append(p)
        valid = [(a, p) for a, p in zip(target_actuals, lgbm_preds) if p is not None]
        if len(valid) >= 5:
            actuals, preds = zip(*valid)
            metrics = calculate_metrics(list(actuals), list(preds))
            crud.update_model_metadata(db, coin_symbol, "lightgbm", metrics, len(valid))
            results["models"]["lightgbm"] = metrics
    except Exception as e:
        print(f"LightGBM training error: {e}")

    # ── TCN ───────────────────────────────────────────────────────────
    try:
        tcn_preds = []
        for i in range(n_eval):
            sub = df.iloc[:split_idx + len(test_df) - n_eval + i]
            p = run_tcn(sub)
            tcn_preds.append(p)
        valid = [(a, p) for a, p in zip(target_actuals, tcn_preds) if p is not None]
        if len(valid) >= 5:
            actuals, preds = zip(*valid)
            metrics = calculate_metrics(list(actuals), list(preds))
            crud.update_model_metadata(db, coin_symbol, "tcn", metrics, len(valid))
            results["models"]["tcn"] = metrics
    except Exception as e:
        print(f"TCN training error: {e}")

    # ── TFT ───────────────────────────────────────────────────────────
    try:
        tft_preds = []
        for i in range(n_eval):
            sub = df.iloc[:split_idx + len(test_df) - n_eval + i]
            p = run_tft(sub)
            tft_preds.append(p)
        valid = [(a, p) for a, p in zip(target_actuals, tft_preds) if p is not None]
        if len(valid) >= 5:
            actuals, preds = zip(*valid)
            metrics = calculate_metrics(list(actuals), list(preds))
            crud.update_model_metadata(db, coin_symbol, "tft", metrics, len(valid))
            results["models"]["tft"] = metrics
    except Exception as e:
        print(f"TFT training error: {e}")

    if not results["models"]:
        return {"error": "All model evaluations failed"}

    return results
