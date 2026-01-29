# Phase 3 Chatbot Backend - Integration Guide

## Overview

This backend integrates with Phase 2's existing infrastructure:
- **Same PostgreSQL Database** (Neon)
- **Same Better Auth** (JWT validation)
- **Same User table** (read-only access)
- **Same Task table** (with new columns)

## Database Schema

### Existing Tables (from Phase 2 - DO NOT MODIFY)

```sql
-- User table (managed by Better Auth)
CREATE TABLE "user" (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Task table (Phase 2 created, Phase 3 extends)
CREATE TABLE task (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES "user"(id),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Phase 3 additions:
    due_date TIMESTAMP,
    priority INTEGER DEFAULT 3
);
```

### New Tables (Phase 3)

```sql
-- Conversation table (chat sessions)
CREATE TABLE conversation (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR REFERENCES "user"(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Message table (chat messages)
CREATE TABLE message (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) REFERENCES conversation(id),
    role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    tool_calls TEXT  -- JSON string of tool invocations
);
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd Phase-III__Todo-AI-Chatbot/backend
poetry install
```

### 2. Run Database Migration

This adds the new tables and columns to the existing Phase 2 database:

```bash
poetry run alembic upgrade head
```

### 3. Start the Server

```bash
poetry run uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

The chatbot API will be available at `http://localhost:8001`

## API Endpoints

### Chat Endpoint

```
POST /api/{user_id}/chat
Authorization: Bearer <jwt_token_from_better_auth>
Content-Type: application/json

{
    "message": "Add a task to buy groceries"
}

Response: Server-Sent Events (SSE) stream
```

### Conversation History

```
GET /api/{user_id}/conversations
Authorization: Bearer <jwt_token>

Response:
{
    "conversations": [
        {"id": "...", "created_at": "...", "updated_at": "..."}
    ]
}
```

### Get Specific Conversation

```
GET /api/{user_id}/conversations/{conversation_id}
Authorization: Bearer <jwt_token>

Response:
{
    "id": "...",
    "messages": [
        {"id": "...", "role": "user", "content": "...", "tool_calls": null},
        {"id": "...", "role": "assistant", "content": "...", "tool_calls": [...]}
    ]
}
```

## Frontend Integration

### Example: React/Next.js Chat Component

```typescript
// hooks/useChat.ts
import { useState } from 'react';

export function useChat(userId: string, token: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (content: string) => {
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', content }]);

        const response = await fetch(`http://localhost:8001/api/${userId}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ message: content }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'token') {
                        assistantMessage += data.value;
                        // Update UI with streaming token
                    } else if (data.type === 'final_response') {
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            content: data.value,
                            toolCalls: data.tool_summary
                        }]);
                    }
                }
            }
        }

        setIsLoading(false);
    };

    return { messages, sendMessage, isLoading };
}
```

## Environment Variables

The `.env` file MUST have these values matching Phase 2:

```env
# Must match Phase 2
BETTER_AUTH_SECRET="c7e9a4f2b1d6a0e8f5c3d9b7a1e6c4f0b8d2a9e5f7c1b4d3a6e8f9"
DATABASE_URL="postgresql+asyncpg://neondb_owner:npg_2Ttz8MpYkhmn@ep-bold-bonus-ahfa029g-pooler.c-3.us-east-1.aws.neon.tech/neondb"

# Phase 3 specific
GEMINI_API_KEY="your_gemini_api_key"
PORT=8001  # Different from Phase 2 backend (8000)
```

## Authentication Flow

1. User logs in via Phase 2 frontend (Better Auth)
2. Frontend receives JWT token
3. Frontend sends token to Phase 3 chatbot API
4. Phase 3 validates token using same BETTER_AUTH_SECRET
5. Phase 3 extracts `user_id` from token's `sub` claim
6. Phase 3 verifies user exists in Phase 2's `user` table
7. Chat proceeds with authenticated user

## Task Management via Chat

Users can manage their tasks through natural language:

- "Add a task to buy milk" → Creates task with title "buy milk"
- "Show my tasks" → Lists all tasks
- "Complete the milk task" → Marks task as completed
- "Delete all completed tasks" → Removes completed tasks
- "Set priority 5 for the milk task" → Updates priority
- "Set due date tomorrow for groceries" → Sets due_date

## Troubleshooting

### JWT Validation Error
- Ensure BETTER_AUTH_SECRET matches Phase 2
- Check token hasn't expired

### Database Connection Error
- Verify DATABASE_URL has `+asyncpg` driver
- Check Neon database is accessible

### User Not Found
- User must exist in Phase 2's user table
- Users are created via Phase 2's signup, not Phase 3
