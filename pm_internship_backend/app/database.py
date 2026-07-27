"""
Database configuration.
Uses SQLite for local development. Swap SQLALCHEMY_DATABASE_URL to a
Postgres URL (e.g. from Render/Supabase) for production deployment —
no other code changes are required.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:vamshi@localhost:3306/internship_recommendation"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
