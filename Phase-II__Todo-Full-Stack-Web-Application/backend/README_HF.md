# Todo App Backend - Hugging Face Spaces Deployment

## Deployment Instructions for Hugging Face Spaces

### Step 1: Create a New Space
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose **Docker** as the SDK
4. Set Space name (e.g., `todo-backend`)

### Step 2: Set Environment Variables
In your Space Settings > Repository secrets, add:

```
DATABASE_URL=postgresql://username:password@host:port/database
BETTER_AUTH_SECRET=your-jwt-secret-key-here
```

### Step 3: Upload Files
Upload all backend files to your Space repository, or connect it to your GitHub repo.

### Step 4: Space Configuration
The Dockerfile is configured to:
- Use Python 3.11
- Run on port 7860 (required by HF Spaces)
- Auto-create database tables on startup

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Toggle complete |
| DELETE | `/api/tasks/{id}` | Delete task |

### Frontend Configuration
Update your frontend's `.env.local`:
```
NEXT_PUBLIC_BACKEND_API_URL=https://YOUR-SPACE-NAME.hf.space
```

### CORS Origins Configured
- `https://todo-evaluation.vercel.app`
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`

### Tech Stack
- FastAPI
- SQLModel (SQLAlchemy)
- PostgreSQL (Neon)
- JWT Authentication
- Uvicorn ASGI Server
