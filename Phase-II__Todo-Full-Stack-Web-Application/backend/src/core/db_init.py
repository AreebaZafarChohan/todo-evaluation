"""Database initialization module for the Todo application."""
from sqlmodel import SQLModel
from .db_engine import engine

def create_db_and_tables():
    """Create database tables based on SQLModel models."""
    # For development: drop all tables and recreate to ensure schema matches models
    # In production, use proper migrations instead!
    try:
        SQLModel.metadata.drop_all(engine)
        print("Dropped existing tables")
    except Exception as e:
        print(f"Note: Could not drop tables (probably because they don't exist yet): {e}")

    SQLModel.metadata.create_all(engine)
    print("Created tables successfully")