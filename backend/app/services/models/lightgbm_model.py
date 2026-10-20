import lightgbm as lgb
import pandas as pd
import numpy as np

def run_lightgbm(df: pd.DataFrame, target_col='close'):
    """
    Run LightGBM with enhanced feature engineering for high directional accuracy.
    """
    if df.empty or len(df) < 50:
        return None

    try:
        df = df.copy()

        # Core OHLCV features
        base_features = [c for c in ['open', 'high', 'low', 'volume', 'sma_20', 'ema_20', 'rsi', 'macd', 'volatility'] if c in df.columns]

        # Add lag features for better trend capture
        for lag in [1, 2, 3, 5]:
            df[f'close_lag_{lag}'] = df[target_col].shift(lag)

        # Add rolling statistics
        df['rolling_mean_5'] = df[target_col].rolling(5).mean()
        df['rolling_std_5'] = df[target_col].rolling(5).std()
        df['price_change_1'] = df[target_col].pct_change(1)
        df['price_change_3'] = df[target_col].pct_change(3)

        df = df.dropna()
        if len(df) < 30:
            return None

        lag_features = [f'close_lag_{lag}' for lag in [1, 2, 3, 5]]
        extra_features = ['rolling_mean_5', 'rolling_std_5', 'price_change_1', 'price_change_3']
        all_features = [f for f in base_features + lag_features + extra_features if f in df.columns]

        X = df[all_features]
        y = df[target_col].shift(-1).iloc[:-1]
        X_train = X.iloc[:-1]

        train_data = lgb.Dataset(X_train, label=y)
        params = {
            'objective': 'regression',
            'metric': 'rmse',
            'verbosity': -1,
            'learning_rate': 0.05,
            'num_leaves': 63,
            'min_child_samples': 10,
            'feature_fraction': 0.8,
            'bagging_fraction': 0.8,
            'bagging_freq': 5,
            'reg_alpha': 0.1,
            'reg_lambda': 0.1,
        }

        model = lgb.train(params, train_data, num_boost_round=300)
        last_record = X.iloc[-1:].values
        prediction = model.predict(last_record)[0]
        return float(prediction)

    except Exception as e:
        print(f"LightGBM error: {e}")
        return None
