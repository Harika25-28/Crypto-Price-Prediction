"""
test_database.py
Tests for app/database.py.

Run with:
    cd backend
    .\\venv\\Scripts\\python.exe -m pytest tests/test_database.py -v
"""
import sys
import os
import pytest
from sqlalchemy import text
from sqlalchemy.engine import Engine

# Make sure 'app' is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ─── Test: Engine object exists ────────────────────────────────────────────────

def test_engine_object_exists():
    """
    database.engine must be a real SQLAlchemy Engine instance,
    not None or any other type.
    """
    from app.database import engine
    assert engine is not None, "engine must not be None"
    assert isinstance(engine, Engine), f"engine must be a SQLAlchemy Engine, got {type(engine)}"


# ─── Test: Database connection works ───────────────────────────────────────────

def test_database_connection_works():
    """
    We should be able to open a connection to the SQLite database,
    execute a trivial query, and read back the result without any errors.
    """
    from app.database import engine
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        row = result.fetchone()
    assert row is not None, "SELECT 1 returned no rows — connection may be broken"
    assert row[0] == 1, f"Expected 1, got {row[0]}"


# ─── Bonus: SessionLocal can create a session ──────────────────────────────────

def test_session_local_creates_session():
    """
    SessionLocal() must return a usable session object with the standard
    SQLAlchemy session interface (commit, rollback, close).
    """
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        assert hasattr(db, 'commit'),   "Session must have commit()"
        assert hasattr(db, 'rollback'), "Session must have rollback()"
        assert hasattr(db, 'close'),    "Session must have close()"
        # Run a trivial query through the session to confirm it works
        result = db.execute(text("SELECT 1")).fetchone()
        assert result[0] == 1
    finally:
        db.close()


# ─── Bonus: Base metadata is available ─────────────────────────────────────────

def test_base_metadata_exists():
    """
    Base.metadata must exist and must contain the 'users' and
    'prediction_history' tables (created by app/models.py).
    """
    from app.database import Base, engine
    # Import models so SQLAlchemy registers them on Base.metadata
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    table_names = list(Base.metadata.tables.keys())
    assert "users" in table_names, f"'users' table missing. Found: {table_names}"
    assert "prediction_history" in table_names, \
        f"'prediction_history' table missing. Found: {table_names}"
