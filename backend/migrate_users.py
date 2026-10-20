from app.database import engine
from sqlalchemy import text, inspect

insp = inspect(engine)
cols = [c['name'] for c in insp.get_columns('users')]

with engine.connect() as conn:
    if 'subscription_plan' not in cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN subscription_plan VARCHAR DEFAULT 'free'"))
        print('Added subscription_plan column')
    else:
        print('subscription_plan already exists')
    if 'created_at' not in cols:
        conn.execute(text('ALTER TABLE users ADD COLUMN created_at DATETIME'))
        print('Added created_at column')
    else:
        print('created_at already exists')
    conn.commit()
print('Migration done!')
