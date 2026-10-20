import ccxt
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import pytz

class DataFetcher:
    def __init__(self):
        self.binance = ccxt.binance()
        
    def fetch_binance_data(self, symbol: str, timeframe: str = '1h', limit: int = 100):
        """
        Fetch historical OHLCV data from Binance using CCXT.
        Example symbol: 'BTC/USDT'
        """
        try:
            ohlcv = self.binance.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            print(f"Error fetching from Binance: {e}")
            return pd.DataFrame()

    def fetch_yahoo_finance_data(self, symbol: str, period: str = '1mo', interval: str = '1h'):
        """
        Fetch data from Yahoo Finance.
        Example symbol: 'BTC-USD'
        """
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period, interval=interval)
            df = df.reset_index()
            df.columns = [c.lower() for c in df.columns]
            if 'date' in df.columns:
                df = df.rename(columns={'date': 'timestamp'})
            elif 'datetime' in df.columns:
                df = df.rename(columns={'datetime': 'timestamp'})
            return df
        except Exception as e:
            print(f"Error fetching from Yahoo Finance: {e}")
            return pd.DataFrame()

    def fetch_combined_data(self, symbol_ccxt: str, symbol_yf: str):
        """
        Fetches data from both sources and merges them if possible, 
        or returns the best available.
        """
        binance_df = self.fetch_binance_data(symbol_ccxt)
        yf_df = self.fetch_yahoo_finance_data(symbol_yf)
        
        # Simple implementation: Return Binance if available, else Yahoo
        if not binance_df.empty:
            return binance_df
        return yf_df

# Singleton instance
data_fetcher = DataFetcher()
