"""User repository for database operations - Compatible with Phase 2."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.persistence.models.user import User


class UserRepository:
    """Repository for User entity database operations.

    Note: User table is managed by Phase 2/Better Auth.
    This repository is READ-ONLY - do not create/update users here.
    """

    def __init__(self, session: AsyncSession) -> None:
        """Initialize repository with database session.

        Args:
            session: Async database session
        """
        self.session = session

    async def get_by_id(self, user_id: str) -> User | None:
        """Get a user by their ID.

        Args:
            user_id: User's unique identifier (from Better Auth)

        Returns:
            User if found, None otherwise
        """
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """Get a user by their email.

        Args:
            email: User's email address

        Returns:
            User if found, None otherwise
        """
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def exists(self, user_id: str) -> bool:
        """Check if a user exists.

        Args:
            user_id: User's unique identifier

        Returns:
            True if user exists, False otherwise
        """
        user = await self.get_by_id(user_id)
        return user is not None
