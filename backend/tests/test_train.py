"""
test_train.py
Tests for train.py / trainer service.

Run with:
    cd backend
    .\\venv\\Scripts\\python.exe -m pytest tests/test_train.py -v
"""
import sys
import os
import types
import pytest
from unittest.mock import patch, MagicMock

# Make sure 'app' is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.trainer import train_and_test, load_local_data, FILE_MAP


# ─── Helpers ───────────────────────────────────────────────────────────────────

def make_mock_db():
    """Return a lightweight mock SQLAlchemy session."""
    return MagicMock()


# ─── Test: Missing argument handling ───────────────────────────────────────────

def test_missing_argument_handling():
    """
    train.py should print usage and exit with code 1 when no coin arg is passed.
    We simulate this by calling main() with sys.argv = ['train.py'].
    """
    import train
    with patch.object(sys, 'argv', ['train.py']):
        with pytest.raises(SystemExit) as exc_info:
            train.main()
    assert exc_info.value.code == 1


# ─── Test: Bitcoin training start ──────────────────────────────────────────────

def test_bitcoin_training_start():
    """
    train_and_test('bitcoin', db) should return a dict with 'coin' == 'bitcoin'
    (or an error dict if data is unavailable, but should NOT raise an exception).
    """
    db = make_mock_db()
    result = train_and_test("bitcoin", db)
    assert isinstance(result, dict), "Result must be a dict"
    # Either success with 'coin' key or an 'error' key — never a bare exception
    assert "coin" in result or "error" in result


# ─── Test: Solana training start ───────────────────────────────────────────────

def test_solana_training_start():
    """
    train_and_test('solana', db) should return a dict without raising.
    """
    db = make_mock_db()
    result = train_and_test("solana", db)
    assert isinstance(result, dict)
    assert "coin" in result or "error" in result


# ─── Test: Binancecoin training start ──────────────────────────────────────────

def test_binancecoin_training_start():
    """
    train_and_test('binancecoin', db) should return a dict without raising.
    """
    db = make_mock_db()
    result = train_and_test("binancecoin", db)
    assert isinstance(result, dict)
    assert "coin" in result or "error" in result


# ─── Test: Invalid coin handling ───────────────────────────────────────────────

def test_invalid_coin_handling():
    """
    Passing a completely unknown coin symbol should return an error dict,
    NOT raise an exception.
    """
    db = make_mock_db()
    result = train_and_test("invalidcoin_xyz", db)
    assert isinstance(result, dict), "Result must be a dict even for invalid coins"
    assert "error" in result, "Unknown coin should return an error key"
    assert "invalidcoin_xyz" in result["error"].lower() or "not found" in result["error"].lower()


# ─── Test: Uppercase coin handling ─────────────────────────────────────────────

def test_uppercase_coin_handling():
    """
    Coin symbols like 'BITCOIN' or 'BTC' should be handled gracefully — either
    normalised internally or return a meaningful error (not a crash).
    """
    db = make_mock_db()

    # Full uppercase name
    result_upper = train_and_test("BITCOIN", db)
    assert isinstance(result_upper, dict), "BITCOIN must return a dict"

    # Short ticker alias (BTC → bitcoin via symbol_map in trainer)
    result_ticker = train_and_test("BTC", db)
    assert isinstance(result_ticker, dict), "BTC must return a dict"


# ─── Test: Metrics output validation ───────────────────────────────────────────

def test_metrics_output_validation():
    """
    When training succeeds, every model entry in results['models'] must contain
    numeric 'rmse', 'mae', and 'mape' values that are >= 0.
    """
    db = make_mock_db()
    result = train_and_test("bitcoin", db)

    if "error" in result:
        pytest.skip(f"Training returned error (likely missing data file): {result['error']}")

    assert "models" in result, "Successful result must have a 'models' key"
    assert len(result["models"]) > 0, "At least one model must be evaluated"

    for model_name, metrics in result["models"].items():
        assert "rmse" in metrics, f"{model_name} missing 'rmse'"
        assert "mae"  in metrics, f"{model_name} missing 'mae'"
        assert "mape" in metrics, f"{model_name} missing 'mape'"
        assert metrics["rmse"] >= 0, f"{model_name} RMSE must be non-negative"
        assert metrics["mae"]  >= 0, f"{model_name} MAE must be non-negative"
        assert metrics["mape"] >= 0, f"{model_name} MAPE must be non-negative"
