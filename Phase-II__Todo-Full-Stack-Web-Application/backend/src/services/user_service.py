"""User service functions for user management in the Todo application."""
from typing import Optional
from sqlmodel import Session, select
from src.models.task import User
from datetime import datetime


def create_user(*, session: Session, user: User) -> User:
    """
    Create a new user in the database.
    
    Args:
        session: Database session
        user: User object with id, email, and name
    
    Returns:
        Created User object
    """
    db_user = User(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=datetime.now()
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_id(*, session: Session, user_id: str) -> Optional[User]:
    """
    Retrieve a user by their ID.
    
    Args:
        session: Database session
        user_id: The ID of the user to retrieve
    
    Returns:
        User object if found, None otherwise
    """
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    return user


def get_user_by_email(*, session: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email.
    
    Args:
        session: Database session
        email: The email of the user to retrieve
    
    Returns:
        User object if found, None otherwise
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def update_user(*, session: Session, user_id: str, user_data: dict) -> Optional[User]:
    """
    Update a user's information.
    
    Args:
        session: Database session
        user_id: The ID of the user to update
        user_data: Dictionary containing fields to update
    
    Returns:
        Updated User object if found, None otherwise
    """
    db_user = get_user_by_id(session=session, user_id=user_id)
    if not db_user:
        return None
    
    # Update fields
    for field, value in user_data.items():
        if hasattr(db_user, field):
            setattr(db_user, field, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def delete_user(*, session: Session, user_id: str) -> bool:
    """
    Delete a user from the database.
    
    Args:
        session: Database session
        user_id: The ID of the user to delete
    
    Returns:
        True if user was deleted, False if user was not found
    """
    db_user = get_user_by_id(session=session, user_id=user_id)
    if not db_user:
        return False
    
    session.delete(db_user)
    session.commit()
    return True