import pandas as pd
import numpy as np

def calculate_indicators(df: pd.DataFrame):
    """
    Calculate technical indicators: SMA, EMA, RSI, MACD, and Volatility.
    """
    if df.empty:
        return df
    
    # Ensure data is sorted by timestamp
    df = df.sort_values('timestamp')
    
    # 1. Simple Moving Average (SMA)
    df['sma_20'] = df['close'].rolling(window=20).mean()
    
    # 2. Exponential Moving Average (EMA)
    df['ema_20'] = df['close'].ewm(span=20, adjust=False).mean()
    
    # 3. Relative Strength Index (RSI)
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # 4. Moving Average Convergence Divergence (MACD)
    exp1 = df['close'].ewm(span=12, adjust=False).mean()
    exp2 = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = exp1 - exp2
    df['signal_line'] = df['macd'].ewm(span=9, adjust=False).mean()
    
    # 5. Volatility (Standard Deviation of returns)
    df['returns'] = df['close'].pct_change()
    df['volatility'] = df['returns'].rolling(window=20).std()
    
    # Drop rows with NaN values resulting from rolling windows
    df = df.dropna()
    
    return df
