# 🚀 PHASE 3 BACKEND - RUN COMMANDS

## 1. Dependencies Install Karo

```bash
cd "D:\Gemini_Cli\hackathon\hackathon_2\Phase-III__Todo-AI-Chatbot\backend"

pip install -r requirements.txt
```

## 2. Database Migration Run Karo

```bash
alembic upgrade head
```

✅ Yeh command naye tables (conversation, message) aur naye columns (due_date, priority) add karega.

## 3. Backend Start Karo

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

✅ Backend URL: http://localhost:8001
✅ API Docs: http://localhost:8001/docs
✅ Health Check: http://localhost:8001/health

## 4. Real APIs Test Karo

Backend start hone ke baad, ek naya terminal mein yeh command chalao:

```bash
python test_real_apis.py
```

---

## 📋 Quick Reference

| Command | Purpose |
|---------|---------|
| `pip install -r requirements.txt` | Dependencies install |
| `alembic upgrade head` | Database migration |
| `uvicorn src.main:app --port 8001 --reload` | Backend start |
| `python test_real_apis.py` | APIs test karo |

## ⚠️ Important Notes

1. **Phase 2 backend running hona chahiye** Better Auth JWT milne ke liye
2. **.env file confirm karo** ki sahi values hain:
   - `BETTER_AUTH_SECRET` = Phase 2 ke saath match hona chahiye
   - `DATABASE_URL` = Phase 2 ki hi database
   - `GEMINI_API_KEY` = Valid API key hona chahiye

3. **Port 8001** use ho raha hai taake Phase 2 (port 8000) se conflict na ho

## 🔧 Troubleshooting

Agar dependency install mein error aaye:
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

Agar database migration fail ho:
```bash
alembic downgrade -1
alembic upgrade head
```

Agar backend start nahi ho raha:
- Port 8001 check karo (koi aur service use to nahi kar rahi)
- `.env` file check karo
- Gemini API key valid hai ya nahi check karo

---

## 🎯 Next Steps

1. Backend successfully run hone ke baad, Phase 2 ke frontend mein chatbot component integrate kiya ja sakta hai
2. Frontend component mein user ke JWT token ko Phase 3 API calls mein use karna hoga
3. Chat widget create karna hoga jo `/api/{user_id}/chat` ko SSE streams handle kare
