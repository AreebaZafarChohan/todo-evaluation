@echo off
REM Phase 3 Chatbot Backend Startup Script
REM Make sure Phase 2 backend is already running

@echo Starting Phase 3 AI Chatbot Backend...
@echo Make sure Phase 2 backend is running first!
@echo.

REM Check if .env file exists
if not exist .env (
    @echo ERROR: .env file not found!
    @echo Please create .env file with:
    @echo   GEMINI_API_KEY=<your-key>
    @echo   BETTER_AUTH_SECRET=c7e9a4f2b1d6a0e8f5c3d9b7a1e6c4f0b8d2a9e5f7c1b4d3a6e8f9
    @echo   DATABASE_URL=postgresql+asyncpg://neondb_owner:npg_2Ttz8MpYkhmn@ep-bold-bonus-ahfa029g-pooler.c-3.us-east-1.aws.neon.tech/neondb
    pause
    exit /b 1
)

REM Install dependencies if not already installed
@echo Installing dependencies...
pip install -q -r requirements.txt
if %errorlevel% neq 0 (
    @echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Run Alembic migration
echo Running database migrations...
alembic upgrade head
if %errorlevel% neq 0 (
    @echo WARNING: Migration failed or already applied
    @echo Continuing anyway...
)

REM Start the backend
echo.
echo =================================
echo PHASE 3 BACKEND STARTING...
echo =================================
echo Port: 8001
echo API Docs: http://localhost:8001/docs
echo Health:   http://localhost:8001/health
echo.
echo To test APIs, run: python test_real_apis.py
echo.

uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
