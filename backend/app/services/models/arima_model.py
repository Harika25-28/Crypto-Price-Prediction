import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def run_arima(df: pd.DataFrame, order=(2, 1, 2), forecast_steps=1):
    """
    ARIMA model anchored to current price level.
    Falls back to last-value + trend if model fails.
    """
    if df.empty or 'close' not in df.columns:
        return None

    series = df['close'].values.astype(float)
    last_price = series[-1]

    try:
        # Use last 100 points for fitting
        s = series[-min(100, len(series)):]
        model = ARIMA(s, order=order)
        fit = model.fit()
        forecast = fit.forecast(steps=forecast_steps)
        pred = float(forecast[0])

        # Clamp to reasonable range (max 5% deviation per step)
        max_dev = last_price * 0.05
        pred = np.clip(pred, last_price - max_dev, last_price + max_dev)
        return pred

    except Exception:
        try:
            model = ARIMA(series[-50:], order=(1, 1, 1))
            fit = model.fit()
            forecast = fit.forecast(steps=forecast_steps)
            pred = float(forecast[0])
            max_dev = last_price * 0.05
            pred = np.clip(pred, last_price - max_dev, last_price + max_dev)
            return pred
        except Exception as e:
            # Fallback: simple trend extrapolation
            if len(series) >= 3:
                trend = (series[-1] - series[-3]) / 2
                return float(series[-1] + trend * 0.3)
            return float(last_price)
