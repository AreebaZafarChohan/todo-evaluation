# Template: SQLAlchemy Model with Common Patterns
# Usage: Copy and customize for your database table

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

# Mixins for common functionality
class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

class SoftDeleteMixin:
    """Mixin for soft delete functionality."""
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime, nullable=True)

class UUIDMixin:
    """Mixin for UUID (external ID)."""
    uuid = Column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        nullable=False,
        index=True
    )

# Example Model
class User(Base, TimestampMixin, SoftDeleteMixin, UUIDMixin):
    """User model with all common patterns."""
    __tablename__ = "users"

    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)

    # Basic fields
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Profile fields
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)

    # Status field (indexed for filtering)
    status = Column(String(20), default="active", nullable=False, index=True)
    role = Column(String(20), default="user", nullable=False, index=True)

    # Optional fields
    email_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False)

    # Composite indexes (define at model level)
    __table_args__ = (
        # Index for common query: active users sorted by creation
        Index("idx_users_status_created", "status", "created_at"),

        # Partial index: only index non-deleted users
        Index(
            "idx_users_active_email",
            "email",
            postgresql_where=(is_deleted == False)
        ),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

    @property
    def full_name(self) -> str:
        """Computed property for full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def to_dict(self) -> dict:
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "uuid": str(self.uuid),
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "status": self.status,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

# Related Model (One-to-Many)
class Post(Base, TimestampMixin, SoftDeleteMixin, UUIDMixin):
    """Post model related to User."""
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)

    # Foreign key (always indexed!)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Content fields
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)

    # Status
    status = Column(String(20), default="draft", nullable=False, index=True)
    published_at = Column(DateTime, nullable=True)

    # Relationship
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        # Common query: published posts by date
        Index(
            "idx_posts_published",
            "published_at",
            postgresql_where=(status == 'published')
        ),

        # User's posts by date
        Index("idx_posts_user_created", "user_id", "created_at"),
    )

    def __repr__(self):
        return f"<Post(id={self.id}, title={self.title})>"

# Related Model (One-to-One)
class UserProfile(Base, TimestampMixin):
    """User profile (one-to-one with User)."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True)

    # Foreign key (one-to-one)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    # Profile fields
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)

    # Relationship
    user = relationship("User", back_populates="profile")

    def __repr__(self):
        return f"<UserProfile(user_id={self.user_id})>"

# Many-to-Many Relationship (Association Table)
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE")),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE")),
    Column("created_at", DateTime, default=datetime.utcnow),
)

class Tag(Base, TimestampMixin):
    """Tag model for many-to-many with Post."""
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)

    # Many-to-many relationship
    posts = relationship("Post", secondary=post_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag(name={self.name})>"

# Add to Post model:
# tags = relationship("Tag", secondary=post_tags, back_populates="posts")

# Enum-like Status Field (Alternative)
from enum import Enum as PyEnum

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class UserRole(str, PyEnum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

# Use in model:
# status = Column(Enum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
# role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
