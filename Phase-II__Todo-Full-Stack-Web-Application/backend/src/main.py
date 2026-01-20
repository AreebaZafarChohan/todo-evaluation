from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.core.db_init import create_db_and_tables
from src.routers import tasks, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating tables...")
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}