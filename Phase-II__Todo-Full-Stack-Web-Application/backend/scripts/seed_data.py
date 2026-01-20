"""
Seed data script for the Todo application.

This script creates sample users and tasks for local testing.
"""

import sys
import os
# Add the backend directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__))))

from sqlmodel import Session, SQLModel, create_engine
from datetime import datetime
from src.models.task import User, Task
from src.core.db_config import config


def create_sample_data():
    """Create sample users and tasks for testing."""
    # Use the same database URL as configured in settings
    engine = create_engine(config.database_url)

    # Create all tables
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Check if data already exists
        existing_user = session.get(User, "test-user-123")
        if existing_user:
            print("Sample data already exists. Skipping seeding.")
            return

        # Create sample user
        user = User(
            id="test-user-123",
            email="test@example.com",
            name="Test User",
            created_at=datetime.now()
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        # Create sample tasks for the user
        tasks = [
            Task(
                user_id=user.id,
                title="Complete project proposal",
                description="Finish the project proposal document and submit to manager",
                completed=False,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            Task(
                user_id=user.id,
                title="Buy groceries",
                description="Milk, eggs, bread, fruits, and vegetables",
                completed=True,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ),
            Task(
                user_id=user.id,
                title="Schedule dentist appointment",
                description="Call Dr. Smith's office to schedule checkup",
                completed=False,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        ]

        for task in tasks:
            session.add(task)

        session.commit()
        print(f"Created sample user: {user.name} ({user.email})")
        print(f"Created {len(tasks)} sample tasks for the user")


if __name__ == "__main__":
    create_sample_data()