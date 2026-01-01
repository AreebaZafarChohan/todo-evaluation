# backend-database

## Description
Comprehensive guide for database operations including CRUD operations, query optimization, transaction management, connection pooling, and database best practices.

## Purpose
This skill provides patterns and best practices for working with databases in backend applications. It covers everything from basic CRUD operations to advanced topics like query optimization, transaction management, and connection pooling.

## Core Principles

1. **Data Integrity**: Use transactions and constraints to maintain data consistency
2. **Performance**: Optimize queries and use proper indexing
3. **Security**: Prevent SQL injection with parameterized queries
4. **Scalability**: Use connection pooling and efficient pagination
5. **Maintainability**: Follow consistent patterns and naming conventions

## When to Use

- Implementing CRUD operations for any resource
- Optimizing slow database queries
- Managing complex transactions
- Setting up database connections
- Implementing pagination and filtering
- Designing database schemas
- Handling database migrations

## Database Operations

### CRUD Operations Pattern

#### Create
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Create a new user with proper validation."""
    # Create instance
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )

    # Add to session
    db.add(user)

    # Flush to get ID (but not commit yet)
    await db.flush()

    # Refresh to load defaults
    await db.refresh(user)

    return user
```

#### Read
```python
async def get_user(db: AsyncSession, user_id: int) -> User | None:
    """Fetch user by ID."""
    return await db.get(User, user_id)

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Fetch user by email."""
    result = await db.execute(
        select(User).where(User.email == email)
    )
    return result.scalar_one_or_none()

async def list_users(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    filters: dict = None
) -> list[User]:
    """List users with filtering and pagination."""
    query = select(User)

    # Apply filters
    if filters:
        if filters.get('status'):
            query = query.where(User.status == filters['status'])
        if filters.get('role'):
            query = query.where(User.role == filters['role'])

    # Apply pagination
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()
```

#### Update
```python
async def update_user(
    db: AsyncSession,
    user: User,
    updates: UserUpdate
) -> User:
    """Update user with proper change tracking."""
    # Update only provided fields
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(user, field, value)

    # Update timestamp
    user.updated_at = datetime.utcnow()

    # Flush to validate constraints
    await db.flush()

    # Refresh to get updated values
    await db.refresh(user)

    return user
```

#### Delete
```python
async def delete_user(db: AsyncSession, user_id: int) -> None:
    """Hard delete user."""
    user = await db.get(User, user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    await db.delete(user)
    await db.flush()

async def soft_delete_user(db: AsyncSession, user_id: int) -> User:
    """Soft delete user (recommended)."""
    user = await db.get(User, user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")

    user.is_deleted = True
    user.deleted_at = datetime.utcnow()

    await db.flush()
    await db.refresh(user)

    return user
```

## Query Optimization

### Indexing Strategy

```sql
-- Single column index (most common)
CREATE INDEX idx_users_email ON users(email);

-- Composite index (for multi-column queries)
CREATE INDEX idx_orders_user_date
ON orders(user_id, created_at DESC);

-- Partial index (for filtered queries)
CREATE INDEX idx_posts_published
ON posts(created_at DESC)
WHERE status = 'published';

-- Unique index (enforces uniqueness)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_posts_content_fts
ON posts USING GIN(to_tsvector('english', content));
```

### Avoiding N+1 Queries

```python
from sqlalchemy.orm import selectinload, joinedload

# ❌ Bad: N+1 problem
users = await db.execute(select(User))
for user in users.scalars():
    posts = await db.execute(
        select(Post).where(Post.user_id == user.id)
    )  # Separate query per user!

# ✅ Good: Eager loading with selectinload
result = await db.execute(
    select(User).options(selectinload(User.posts))
)
users = result.scalars().unique().all()
# Now user.posts is already loaded

# ✅ Alternative: joinedload (single JOIN query)
result = await db.execute(
    select(User).options(joinedload(User.posts))
)
users = result.scalars().unique().all()
```

### Query Performance Tips

```python
# Use select_from for complex queries
query = (
    select(User.name, func.count(Post.id).label('post_count'))
    .select_from(User)
    .outerjoin(Post, Post.user_id == User.id)
    .group_by(User.id)
)

# Use exists() for checking existence (faster than count)
exists_query = select(
    exists(select(User.id).where(User.email == email))
)
exists_result = await db.execute(exists_query)
user_exists = exists_result.scalar()

# Use limit(1) when you only need one result
first_user = await db.execute(
    select(User).where(User.status == 'active').limit(1)
)
```

## Pagination Techniques

### Offset-Based Pagination
Simple but slow for large offsets:

```python
async def paginate_offset(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20
) -> tuple[list[User], int]:
    """Offset-based pagination."""
    # Count total
    count_query = select(func.count(User.id))
    total = (await db.execute(count_query)).scalar()

    # Get page
    offset = (page - 1) * page_size
    result = await db.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    users = result.scalars().all()
    return users, total
```

### Cursor-Based Pagination
Better for large datasets and real-time data:

```python
async def paginate_cursor(
    db: AsyncSession,
    cursor: str | None = None,
    limit: int = 20
) -> tuple[list[User], str | None]:
    """Cursor-based pagination."""
    query = select(User).order_by(User.id.desc())

    if cursor:
        # Decode cursor (base64 encoded ID)
        last_id = int(base64.b64decode(cursor).decode())
        query = query.where(User.id < last_id)

    query = query.limit(limit + 1)  # Fetch one extra to check if more exist

    result = await db.execute(query)
    users = result.scalars().all()

    # Check if more results exist
    has_more = len(users) > limit
    if has_more:
        users = users[:limit]

    # Generate next cursor
    next_cursor = None
    if has_more and users:
        last_id = users[-1].id
        next_cursor = base64.b64encode(str(last_id).encode()).decode()

    return users, next_cursor
```

## Transaction Management

### Basic Transaction
```python
async def transfer_money(
    db: AsyncSession,
    from_account_id: int,
    to_account_id: int,
    amount: float
):
    """Transfer money between accounts (atomic)."""
    async with db.begin():
        # Deduct from source
        from_account = await db.get(Account, from_account_id)
        from_account.balance -= amount

        # Add to destination
        to_account = await db.get(Account, to_account_id)
        to_account.balance += amount

        # Create transaction record
        transaction = Transaction(
            from_account_id=from_account_id,
            to_account_id=to_account_id,
            amount=amount
        )
        db.add(transaction)

        # All succeed or all fail together
```

### Nested Transactions (Savepoints)
```python
async def complex_operation(db: AsyncSession):
    """Use savepoints for nested transactions."""
    async with db.begin():
        # Main transaction
        user = await create_user(db, user_data)

        try:
            async with db.begin_nested():
                # Savepoint 1
                profile = await create_profile(db, user.id, profile_data)
        except Exception:
            # Rollback to savepoint, but keep user
            pass

        try:
            async with db.begin_nested():
                # Savepoint 2
                settings = await create_settings(db, user.id)
        except Exception:
            # Rollback to savepoint
            pass
```

### Transaction Isolation Levels

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    isolation_level="READ COMMITTED"  # Default for PostgreSQL
)

# Available levels:
# - READ UNCOMMITTED
# - READ COMMITTED (recommended)
# - REPEATABLE READ
# - SERIALIZABLE (strictest, slowest)
```

## Connection Pooling

### Pool Configuration

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host/db",

    # Pool size
    pool_size=10,           # Number of permanent connections
    max_overflow=20,        # Additional temporary connections

    # Health checks
    pool_pre_ping=True,     # Verify connection before use

    # Timeouts
    pool_recycle=3600,      # Recycle connections after 1 hour
    pool_timeout=30,        # Wait 30s for available connection

    # Debugging
    echo=False,             # Log all SQL (dev only)
    echo_pool=False,        # Log pool events (dev only)
)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autoflush=False,         # Manual control of flush
)
```

### Dependency Injection (FastAPI)

```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Database session dependency."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Usage in route
@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(User))
    return users.scalars().all()
```

## Schema Design Best Practices

### Primary Keys

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.postgresql import UUID
import uuid

class User(Base):
    __tablename__ = "users"

    # Auto-increment integer (internal use)
    id = Column(Integer, primary_key=True)

    # UUID for external API (recommended)
    uuid = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)
```

### Foreign Keys with Cascades

```python
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),  # Delete posts when user deleted
        nullable=False,
        index=True  # Always index foreign keys
    )

    # Relationship
    user = relationship("User", back_populates="posts")
```

### Indexes in Models

```python
from sqlalchemy import Index

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(50), unique=True, index=True)
    status = Column(String(20), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Composite index
    __table_args__ = (
        Index("idx_users_status_created", "status", "created_at"),
    )
```

### Soft Delete Pattern

```python
class SoftDeleteMixin:
    """Mixin for soft delete functionality."""
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, index=True)

class User(Base, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255))

# Always filter by is_deleted
async def get_active_users(db: AsyncSession) -> list[User]:
    result = await db.execute(
        select(User).where(User.is_deleted == False)
    )
    return result.scalars().all()
```

### Timestamps Pattern

```python
class TimestampMixin:
    """Mixin for created/updated timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255))
```

## Best Practices

1. **Use Parameterized Queries**: Always use SQLAlchemy's query builder (prevents SQL injection)
2. **Use Async/Await**: Better performance and scalability
3. **Wrap Multi-Operations in Transactions**: Ensure data consistency
4. **Implement Soft Deletes**: Easier to recover deleted data
5. **Index Foreign Keys**: Dramatically improves join performance
6. **Use Connection Pooling**: Essential for production
7. **Monitor Query Performance**: Use `EXPLAIN ANALYZE` for slow queries
8. **Use UUIDs for External IDs**: Hide internal database structure
9. **Always Handle Exceptions**: Rollback transactions on errors
10. **Use Migrations**: Never modify schema manually in production

## Anti-Patterns to Avoid

❌ **Raw SQL strings without parameters**
```python
# NEVER DO THIS
query = f"SELECT * FROM users WHERE email = '{user_email}'"
```

❌ **Not using transactions for multi-step operations**
❌ **Forgetting to index foreign keys**
❌ **Using `SELECT *` instead of specific columns**
❌ **Not handling connection pool exhaustion**
❌ **Storing sensitive data unencrypted**
❌ **Using ORM for bulk operations** (use bulk_insert_mappings instead)

## Quality Checklist

- [ ] All queries use parameterized statements
- [ ] Transactions properly managed for multi-step operations
- [ ] Connection pooling configured correctly
- [ ] Indexes created for all foreign keys
- [ ] Indexes created for frequently queried columns
- [ ] Soft delete implemented for critical tables
- [ ] Pagination implemented for list queries
- [ ] N+1 queries avoided with eager loading
- [ ] Query performance tested with large datasets
- [ ] Error handling covers all database errors
- [ ] Migrations tested before production deploy
- [ ] Database credentials stored securely

## Related Skills
- backend-api-routes
- backend-error-handling
- backend-service-layer
- drizzle-orm
- neon-postgres

## Tools & Libraries
- SQLAlchemy (Python ORM)
- asyncpg (Async PostgreSQL driver)
- Alembic (Database migrations)
- Drizzle ORM (TypeScript)
- PostgreSQL, MySQL, SQLite

## References
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Database Indexing Strategies](https://use-the-index-luke.com/)
- [SQLAlchemy Best Practices](https://docs.sqlalchemy.org/en/20/orm/queryguide/)
