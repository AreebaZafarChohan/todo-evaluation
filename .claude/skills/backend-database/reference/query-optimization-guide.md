# Database Query Optimization Guide

## Understanding Query Performance

### Query Execution Steps
1. **Parsing**: SQL syntax validation
2. **Planning**: Query optimizer chooses execution plan
3. **Execution**: Database executes the plan
4. **Fetching**: Results returned to application

### Using EXPLAIN ANALYZE

```sql
-- PostgreSQL
EXPLAIN ANALYZE
SELECT u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id;

-- Look for:
-- - Seq Scan (bad for large tables)
-- - Index Scan (good)
-- - Nested Loop vs Hash Join
-- - Execution time
```

---

## Indexing Strategies

### When to Add Indexes

✅ **Good candidates for indexing:**
- Primary keys (automatic)
- Foreign keys (manual)
- Columns in WHERE clauses
- Columns in JOIN conditions
- Columns in ORDER BY
- Columns with high cardinality

❌ **Poor candidates:**
- Small tables (<1000 rows)
- Columns with low cardinality (e.g., boolean)
- Frequently updated columns
- Large text columns

### Types of Indexes

#### 1. B-Tree Index (Default)
Best for equality and range queries:

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_date ON orders(created_at);

-- Use case
SELECT * FROM users WHERE email = 'user@example.com';
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

#### 2. Composite Index
Multiple columns, order matters:

```sql
CREATE INDEX idx_orders_user_date
ON orders(user_id, created_at DESC);

-- Fast
SELECT * FROM orders
WHERE user_id = 123 AND created_at > '2024-01-01';

-- Fast (uses first column only)
SELECT * FROM orders WHERE user_id = 123;

-- Slow (can't use index - doesn't start with first column)
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

**Rule:** Index column order should match query filters from most to least selective.

#### 3. Partial Index
Index only subset of rows:

```sql
-- Only index published posts
CREATE INDEX idx_posts_published
ON posts(created_at DESC)
WHERE status = 'published';

-- This query uses the index
SELECT * FROM posts
WHERE status = 'published'
ORDER BY created_at DESC;

-- Smaller index = faster queries + less storage
```

#### 4. Full-Text Search Index (PostgreSQL)

```sql
-- Create GIN index for full-text search
CREATE INDEX idx_posts_content_fts
ON posts
USING GIN(to_tsvector('english', content));

-- Use with tsvector queries
SELECT * FROM posts
WHERE to_tsvector('english', content) @@ to_tsquery('postgresql & optimization');
```

#### 5. Unique Index
Enforce uniqueness and improve lookups:

```sql
CREATE UNIQUE INDEX idx_users_email_unique
ON users(email);

-- Composite unique constraint
CREATE UNIQUE INDEX idx_posts_slug_unique
ON posts(slug) WHERE is_deleted = false;
```

---

## Common Performance Issues

### 1. N+1 Query Problem

**Problem:**
```python
# Bad: One query to get users, then N queries for their posts
users = await db.execute(select(User))
for user in users.scalars():
    posts = await db.execute(
        select(Post).where(Post.user_id == user.id)
    )
```

**Solution: Eager Loading**
```python
from sqlalchemy.orm import selectinload

# Good: Two queries total (1 for users, 1 for all posts)
result = await db.execute(
    select(User).options(selectinload(User.posts))
)
users = result.scalars().unique().all()

# Now user.posts is already loaded
for user in users:
    print(user.posts)  # No additional query
```

**Alternative: JOIN**
```python
from sqlalchemy.orm import joinedload

# Single query with LEFT JOIN
result = await db.execute(
    select(User).options(joinedload(User.posts))
)
users = result.scalars().unique().all()
```

### 2. SELECT * Waste

**Problem:**
```python
# Bad: Fetches all columns even if you only need a few
users = await db.execute(select(User))
```

**Solution: Select Specific Columns**
```python
# Good: Only fetch what you need
result = await db.execute(
    select(User.id, User.name, User.email)
)
users = result.all()
```

### 3. Missing Indexes on Foreign Keys

**Problem:**
```sql
-- Bad: No index on foreign key
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
);

-- Slow JOIN
SELECT * FROM users u
JOIN posts p ON p.user_id = u.id;
```

**Solution:**
```sql
-- Good: Always index foreign keys
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**In SQLAlchemy:**
```python
class Post(Base):
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True  # ✅ Always add this!
    )
```

### 4. Inefficient Pagination

**Problem: Offset Pagination Gets Slower**
```python
# Slow for large offsets (has to count 10,000 rows to skip them)
SELECT * FROM posts
ORDER BY created_at DESC
OFFSET 10000 LIMIT 20;
```

**Solution: Cursor-Based Pagination**
```python
# Fast: Uses index to directly find position
SELECT * FROM posts
WHERE id < 12345  -- Last ID from previous page
ORDER BY id DESC
LIMIT 20;
```

### 5. Unnecessary Sorting

**Problem:**
```python
# Bad: Sort in application (slow for large datasets)
users = await db.execute(select(User))
sorted_users = sorted(users.scalars(), key=lambda u: u.created_at, reverse=True)
```

**Solution: Sort in Database**
```python
# Good: Let database handle sorting (uses index)
users = await db.execute(
    select(User).order_by(User.created_at.desc())
)
```

### 6. Using COUNT(*) for Existence Check

**Problem:**
```python
# Bad: Counts all rows just to check if any exist
count = await db.execute(
    select(func.count(User.id)).where(User.email == email)
)
exists = count.scalar() > 0
```

**Solution: Use EXISTS**
```python
# Good: Stops at first match
from sqlalchemy import exists as sql_exists

query = select(
    sql_exists(select(User.id).where(User.email == email))
)
exists = (await db.execute(query)).scalar()
```

---

## Optimization Techniques

### 1. Use Connection Pooling

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,        # Permanent connections
    max_overflow=20,     # Temporary connections
    pool_pre_ping=True,  # Health check before use
)
```

**Why it helps:**
- Reuses connections (avoiding handshake overhead)
- Limits concurrent connections
- Faster response times

### 2. Batch Operations

```python
# Bad: Insert one at a time
for user_data in users_data:
    user = User(**user_data)
    db.add(user)
    await db.flush()  # N database calls

# Good: Batch insert
users = [User(**data) for data in users_data]
db.add_all(users)
await db.flush()  # 1 database call
```

### 3. Use Proper Transaction Isolation

```python
# Default: READ COMMITTED (good for most cases)
engine = create_engine(
    DATABASE_URL,
    isolation_level="READ COMMITTED"
)

# For critical transactions: SERIALIZABLE (slower but safer)
async with db.begin():
    # Your transaction
    pass
```

### 4. Lazy vs Eager Loading

```python
# Lazy: Load related data only when accessed
class User(Base):
    posts = relationship("Post", lazy="select")

# Eager: Always load related data
class User(Base):
    posts = relationship("Post", lazy="selectin")

# Dynamic: Load on-demand (best for large collections)
class User(Base):
    posts = relationship("Post", lazy="dynamic")
```

**Choose based on usage:**
- Most of the time need posts? → Eager
- Rarely need posts? → Lazy
- Need to filter/paginate posts? → Dynamic

### 5. Caching Strategies

```python
from functools import lru_cache
from cachetools import TTLCache

# In-memory cache with TTL
cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes

async def get_user_cached(user_id: int) -> User:
    if user_id in cache:
        return cache[user_id]

    user = await db.get(User, user_id)
    cache[user_id] = user
    return user
```

---

## Monitoring Query Performance

### 1. Enable Query Logging (Development)

```python
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Log all SQL
    echo_pool=True  # Log pool events
)
```

### 2. Track Slow Queries

```python
import time
from sqlalchemy import event

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault("query_start_time", []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info["query_start_time"].pop(-1)
    if total > 1.0:  # Log queries slower than 1 second
        logger.warning(f"Slow query ({total:.2f}s): {statement}")
```

### 3. Use Database Query Logs

```sql
-- PostgreSQL: Find slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Performance Checklist

### Before Deploying
- [ ] All foreign keys have indexes
- [ ] WHERE clause columns have indexes
- [ ] Large tables have appropriate indexes
- [ ] No SELECT * in production code
- [ ] Pagination implemented for lists
- [ ] N+1 queries eliminated
- [ ] Connection pooling configured
- [ ] Query timeouts set
- [ ] Slow query logging enabled

### For Each Query
- [ ] Uses indexes (check with EXPLAIN)
- [ ] Returns only needed columns
- [ ] Properly parameterized (no SQL injection)
- [ ] Has reasonable LIMIT
- [ ] Appropriate transaction isolation
- [ ] Error handling in place

### When Performance Issues Arise
1. **Identify**: Use EXPLAIN ANALYZE
2. **Index**: Add missing indexes
3. **Refactor**: Eliminate N+1 queries
4. **Cache**: Add caching if appropriate
5. **Monitor**: Track improvement

---

## Quick Reference Table

| Issue | Symptom | Solution |
|-------|---------|----------|
| Full table scan | Seq Scan in EXPLAIN | Add index |
| N+1 queries | Many small queries | Eager loading |
| Slow pagination | Slow at high offsets | Cursor pagination |
| Slow COUNT | Takes long to count | Use approximate or cache |
| Lock contention | Queries waiting | Shorter transactions |
| Pool exhaustion | Connection errors | Increase pool size |
| Memory usage | OOM errors | Limit result sets |

---

## Resources

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/using-explain.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [SQLAlchemy Performance Tips](https://docs.sqlalchemy.org/en/20/faq/performance.html)
- [Database Indexing Explained](https://stackoverflow.com/questions/1108/how-does-database-indexing-work)
