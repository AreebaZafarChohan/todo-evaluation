"""Base model with common fields for all SQLModel entities."""
from datetime import datetime
from uuid import uuid4

from sqlmodel import Field, SQLModel


def generate_uuid() -> str:
    """Generate a UUID string."""
    return str(uuid4())


class BaseModel(SQLModel):
    """Base model with common fields shared across all entities.

    This base model provides:
    - id: UUID primary key
    - created_at: Timestamp when record was created
    - updated_at: Timestamp when record was last updated
    """

    id: str = Field(default_factory=generate_uuid, primary_key=True, max_length=36)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
