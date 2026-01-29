# Quickstart Guide: AI-Powered Todo Chatbot Backend

This guide provides a quick overview to get the AI-Powered Todo Chatbot Backend up and running for development purposes.

## 1. Prerequisites

- Docker (for database)
- Python 3.11+
- Poetry (or pip/venv for dependency management)

## 2. Setup Database

The backend relies on a PostgreSQL database. You can start a local PostgreSQL instance using Docker:

```bash
docker run --name todo-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=todo_ai_chatbot -p 5432:5432 -d postgres:16
```

## 3. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
BETTER_AUTH_SECRET="YOUR_BETTER_AUTH_SECRET_KEY"
DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/todo_ai_chatbot"
```

Replace `YOUR_GEMINI_API_KEY` and `YOUR_BETTER_AUTH_SECRET_KEY` with your actual keys.

## 4. Install Dependencies

Navigate to the `backend/` directory and install the Python dependencies:

```bash
cd backend
poetry install
```

## 5. Run Database Migrations

Apply the database migrations using Alembic:

```bash
poetry run alembic upgrade head
```

## 6. Run the Backend Server

Start the FastAPI application:

```bash
poetry run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

## 7. Interact with the Chat API

You can now send requests to the chat API endpoint. For example, using `curl`:

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d 
'{ 
  "message": "Add a task to buy groceries."
}'
```

Replace `{user_id}` with a valid user ID and `YOUR_JWT_TOKEN` with a valid JWT token.
