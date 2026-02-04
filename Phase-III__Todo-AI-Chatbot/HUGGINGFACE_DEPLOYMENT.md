# HuggingFace Deployment Guide - Phase 3 Backend

## Overview
Ye guide aapko Phase 3 AI Chatbot backend ko HuggingFace Spaces pe deploy karne mein help karega.

## Prerequisites
- HuggingFace account
- Git installed
- Phase 2 backend already deployed (for reference)

## Deployment Steps

### 1. HuggingFace Space Create Karein

```bash
# HuggingFace login
huggingface-cli login

# Ya manually website se:
# https://huggingface.co/spaces
# Click "Create new Space"
# Name: areeba715-h1-phase3-chatbot (ya koi bhi naam)
# SDK: Docker
# Visibility: Public/Private (as needed)
```

### 2. Required Files Prepare Karein

Phase 3 backend directory mein ye files honi chahiye:

```
Phase-III__Todo-AI-Chatbot/backend/
├── Dockerfile              # HuggingFace ke liye
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── src/
│   ├── main.py
│   ├── api/               # Chat API
│   ├── routers/           # Phase 2 routes (tasks, auth)
│   ├── models/            # Phase 2 models
│   ├── schemas/           # Phase 2 schemas
│   └── ...
└── README.md
```

### 3. Dockerfile Create/Update Karein

Create `Phase-III__Todo-AI-Chatbot/backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (HuggingFace uses 7860 by default)
EXPOSE 7860

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 4. Environment Variables Setup

HuggingFace Space settings mein ye environment variables set karein:

```bash
# Database (same as Phase 2)
DATABASE_URL=postgresql://user:password@host/database

# Better Auth (same as Phase 2)
BETTER_AUTH_SECRET=your-secret-key

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Or Gemini API
GOOGLE_API_KEY=your-gemini-api-key

# App settings
DEBUG=false
HOST=0.0.0.0
PORT=7860

# CORS origins
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### 5. Git Push to HuggingFace

```bash
# Clone your HuggingFace space
git clone https://huggingface.co/spaces/areeba715/h1-phase3-chatbot
cd h1-phase3-chatbot

# Copy Phase 3 backend files
cp -r /path/to/Phase-III__Todo-AI-Chatbot/backend/* .

# Add and commit
git add .
git commit -m "Deploy Phase 3 AI Chatbot Backend"

# Push to HuggingFace
git push
```

### 6. Verify Deployment

Backend deploy hone ke baad:

```bash
# Health check
curl https://areeba715-h1-phase3-chatbot.hf.space/api/health

# Check docs
# Visit: https://areeba715-h1-phase3-chatbot.hf.space/docs
```

## Frontend Configuration

Deployment ke baad frontend `.env.local` update karein:

```bash
# Production backend (HuggingFace)
NEXT_PUBLIC_BACKEND_API_URL=https://areeba715-h1-phase3-chatbot.hf.space
```

## Combined Backend (Recommended)

**Best approach**: Ek hi backend space mein Phase 2 + Phase 3 dono integrate karein.

### Benefits:
1. ✅ Single backend URL
2. ✅ Shared database connection
3. ✅ Shared authentication
4. ✅ No CORS issues
5. ✅ Easier deployment

### Implementation:

Phase 3 backend already Phase 2 routes include karta hai:
- `/api/tasks` - Task CRUD
- `/api/auth` - Authentication
- `/api/{user_id}/chat` - AI Chatbot (Phase 3)
- `/api/health` - Health check

## Testing

### Local Testing (before deployment)

```bash
# Terminal 1: Start combined backend
cd Phase-III__Todo-AI-Chatbot/backend
uvicorn src.main:app --port 8001 --reload

# Terminal 2: Start frontend
cd Phase-II__Todo-Full-Stack-Web-Application/frontend
npm run dev

# Update .env.local
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8001
```

Test endpoints:
- Tasks: http://localhost:8001/api/tasks
- Chat: http://localhost:8001/api/{user_id}/chat
- Docs: http://localhost:8001/docs

### Production Testing

```bash
# Set production URL
NEXT_PUBLIC_BACKEND_API_URL=https://areeba715-h1-phase3-chatbot.hf.space

# Build and test
npm run build
npm start
```

## Troubleshooting

### Issue 1: Module not found errors
**Solution**: Ensure all Phase 2 files copied correctly:
```bash
cp -r Phase-II/backend/src/routers Phase-III/backend/src/
cp -r Phase-II/backend/src/models Phase-III/backend/src/
cp -r Phase-II/backend/src/schemas Phase-III/backend/src/
```

### Issue 2: Database connection failed
**Solution**: Check DATABASE_URL in HuggingFace settings
- Must be same as Phase 2
- Include all connection parameters

### Issue 3: CORS errors
**Solution**: Update CORS_ORIGINS in main.py:
```python
allow_origins=[
    "https://your-frontend.vercel.app",
    "http://localhost:3000",
]
```

### Issue 4: 404 on /api/tasks
**Solution**: Verify routes registered:
```python
# In main.py
app.include_router(tasks_router, tags=["tasks"])
```

## Maintenance

### Update Backend
```bash
cd h1-phase3-chatbot
git pull
# Make changes
git add .
git commit -m "Update: description"
git push
```

### Monitor Logs
HuggingFace Space dashboard → Logs tab

### Check Metrics
- Response times
- Error rates
- API usage

## Cost Optimization

1. **Use Free Tier**: HuggingFace Spaces free tier sufficient for development
2. **Database**: Neon free tier (shared with Phase 2)
3. **AI API**: Monitor OpenAI/Gemini usage
4. **Upgrade**: Only if needed for production traffic

## Next Steps

1. ✅ Deploy Phase 3 backend to HuggingFace
2. ✅ Update frontend .env.local with new URL
3. ✅ Test all endpoints
4. ✅ Monitor for 24 hours
5. ✅ Scale if needed

## Support

Issues? Check:
1. HuggingFace Space logs
2. Backend /docs endpoint
3. Frontend browser console
4. Database connection status

---

**Quick Deploy Command** (after setup):

```bash
git clone https://huggingface.co/spaces/areeba715/h1-phase3-chatbot && \\
cd h1-phase3-chatbot && \\
cp -r ../Phase-III__Todo-AI-Chatbot/backend/* . && \\
git add . && \\
git commit -m "Deploy Phase 3" && \\
git push
```

Deployment complete! 🚀
