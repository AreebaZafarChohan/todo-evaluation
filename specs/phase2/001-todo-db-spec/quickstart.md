# Quickstart Guide: Todo Application Database

## Overview

This guide provides instructions for setting up and running the Todo application database locally. It covers environment setup, database configuration, and initial deployment.

## Prerequisites

Before getting started, ensure you have the following installed:

- Python 3.11 or higher
- PostgreSQL (or access to a Neon PostgreSQL instance)
- pip (Python package manager)

## Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install sqlmodel sqlalchemy psycopg2-binary fastapi uvicorn pytest
   ```

## Database Configuration

1. **Set up your Neon PostgreSQL database:**
   - Create an account at [neon.tech](https://neon.tech)
   - Create a new project
   - Note your connection string

2. **Configure environment variables:**
   Create a `.env` file in your project root:
   ```env
   DATABASE_URL=postgresql+asyncpg://username:password@ep-xxxxxx.us-east-1.aws.neon.tech/dbname
   ```

## Database Initialization

1. **Initialize the database:**
   ```bash
   python -c "
   from backend.src.todo_app.database.engine import create_db_and_tables
   import asyncio
   asyncio.run(create_db_and_tables())
   "
   ```

2. **Verify the tables were created:**
   Connect to your database using a client and verify that the `users` and `tasks` tables exist with the correct schema.

## Running Tests

1. **Set up test environment:**
   ```bash
   export DATABASE_TEST_URL=postgresql+asyncpg://username:password@localhost/todo_test
   ```

2. **Run the tests:**
   ```bash
   pytest
   ```

## API Integration

Once the database is set up, you can integrate it with the FastAPI backend:

1. **Start the development server:**
   ```bash
   uvicorn backend.src.todo_app.main:app --reload
   ```

2. **Access the API documentation:**
   Visit `http://localhost:8000/docs` to view the automatically generated API documentation.

## Migration Management

If you need to make schema changes:

1. **Install Alembic:**
   ```bash
   pip install alembic
   ```

2. **Initialize Alembic:**
   ```bash
   alembic init alembic
   ```

3. **Generate a migration:**
   ```bash
   alembic revision --autogenerate -m "Description of changes"
   ```

4. **Apply the migration:**
   ```bash
   alembic upgrade head
   ```

## Troubleshooting

### Common Issues

- **Connection refused:** Verify your DATABASE_URL is correct and the database server is accessible
- **Permission denied:** Check that your database user has CREATE TABLE privileges
- **SSL errors:** Ensure your connection string includes proper SSL parameters for Neon

### Verification Steps

1. Confirm the database tables exist:
   ```sql
   \dt  -- In psql
   ```

2. Check table structure:
   ```sql
   \d tasks;  -- In psql
   ```

## Next Steps

After successfully setting up the database:

1. Implement the API endpoints using FastAPI
2. Integrate with Better Auth for user management
3. Add business logic for task operations
4. Implement proper error handling and validation