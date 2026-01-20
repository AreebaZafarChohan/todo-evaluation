# Database Migration Guide

This document explains how to manage database schema changes for the Todo application using Alembic.

## Prerequisites

- Python virtual environment activated
- Dependencies installed (`pip install -r requirements.txt`)
- Alembic configured (already done in this project)

## Common Migration Commands

### Generate a new migration
```bash
source venv/bin/activate  # Activate virtual environment
python -m alembic revision --autogenerate -m "Description of changes"
```

### Apply pending migrations (upgrade)
```bash
source venv/bin/activate  # Activate virtual environment
python -m alembic upgrade head
```

### Downgrade to a previous version
```bash
source venv/bin/activate  # Activate virtual environment
python -m alembic downgrade -1  # Go back one migration
# Or to a specific migration:
python -m alembic downgrade <migration_id>
```

### Check current migration status
```bash
source venv/bin/activate  # Activate virtual environment
python -m alembic current
```

### Show migration history
```bash
source venv/bin/activate  # Activate virtual environment
python -m alembic history
```

## Migration Best Practices

1. Always review auto-generated migrations before applying them
2. Test migrations on a copy of production data when possible
3. Create backup before running migrations on production
4. Write custom migration logic for complex data transformations
5. Use transactions appropriately to ensure data consistency

## Current Schema

The current database schema includes:

- `user` table: Stores user information (id, email, name, created_at)
- `task` table: Stores task information (id, user_id, title, description, completed, created_at, updated_at)
- Proper foreign key relationship between tasks and users
- Indexes on user email and task user_id for performance