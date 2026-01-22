from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core.db_init import create_db_and_tables
from src.routers import tasks, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables...")
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Production
        "https://todo-evaluation.vercel.app",
        # Local development
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}