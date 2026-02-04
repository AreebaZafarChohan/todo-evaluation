"""Database initialization module for the Todo application."""
from sqlmodel import SQLModel
from .db_engine import engine

def create_db_and_tables():
    """Create database tables based on SQLModel models."""
    # Create tables if they don't exist
    # Note: This won't update existing tables if the schema changes
    SQLModel.metadata.create_all(engine)
    print("Created tables successfully")