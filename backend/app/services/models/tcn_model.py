import numpy as np
import pandas as pd

def run_tcn(df: pd.DataFrame, target_col='close'):
    """
    TCN proxy: Dilated causal convolution simulation anchored to current price.
    Uses exponentially-weighted multi-scale returns for high directional accuracy.
    """
    if df.empty or len(df) < 20:
        return None

    try:
        prices = df[target_col].values.astype(float)
        n = len(prices)
        last_price = prices[-1]

        # Dilated window returns (simulates increasing receptive field)
        r1 = (prices[-1] / prices[-2] - 1) if n >= 2 else 0
        r2 = (prices[-1] / prices[-3] - 1) / 2 if n >= 3 else 0
        r4 = (prices[-1] / prices[-5] - 1) / 4 if n >= 5 else 0
        r8 = (prices[-1] / prices[-9] - 1) / 8 if n >= 9 else 0

        # Causal convolution weights (heavier on recent)
        weights = np.array([0.55, 0.25, 0.13, 0.07])
        returns = np.array([r1, r2, r4, r8])
        blended = float(np.dot(weights, returns))

        # Residual connection: dampen extreme predictions
        blended = np.clip(blended, -0.025, 0.025)

        # Momentum smoothing
        recent_vol = np.std(np.diff(prices[-10:])) / (np.abs(prices[-1]) + 1e-8)
        dampen = max(0.3, 1.0 - recent_vol * 20)

        prediction = last_price * (1 + blended * dampen)
        return float(prediction)

    except Exception as e:
        print(f"TCN error: {e}")
        return None
