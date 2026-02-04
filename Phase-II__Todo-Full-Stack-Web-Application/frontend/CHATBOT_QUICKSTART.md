# AI Chatbot Quick Start Guide

## Overview
The AI-powered chatbot is now integrated into the Phase II Todo frontend application at `/chat`.

## Running the Application

### Development Mode
```bash
cd Phase-II__Todo-Full-Stack-Web-Application/frontend
npm run dev
```

The app will be available at `http://localhost:3000`

### Access the Chatbot
1. Navigate to `http://localhost:3000`
2. Sign in with your credentials
3. Click "AI Assistant" in the sidebar navigation
4. Start chatting with the AI to manage your todos!

## Features

### ✅ Implemented
- **Conversational Task Management**: Use natural language to create, update, and manage tasks
- **Real-time Streaming**: See AI responses appear character by character
- **Conversation History**: Continue conversations across sessions
- **Browser Notifications**: Get notified about reminders (requires permission)
- **Mobile Responsive**: Works seamlessly on mobile devices
- **Error Handling**: Graceful error messages and recovery
- **Session Management**: Automatic redirect on session expiration

### ⏳ Pending
- Unit and integration tests
- Full keyboard navigation (arrow keys for message history)
- Backend integration with actual AI endpoint

## Backend Requirements

The frontend expects a backend API at the following endpoint:

**Endpoint**: `POST /api/{user_id}/chat`

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: text/event-stream
```

**Request Body**:
```json
{
  "conversation_id": "string or null",
  "message": "user message text"
}
```

**Response**: Server-Sent Events (SSE) stream with the following event types:

```json
// Content chunks
{"type": "content", "value": "text chunk"}

// Tool invocations
{"type": "tool_call", "tool_name": "create_task", "args": {...}}

// Tool results
{"type": "tool_output", "tool_name": "create_task", "output": {...}}

// Confirmations
{"type": "confirmation", "message": "Task created successfully"}

// Errors
{"type": "error", "code": "ERROR_CODE", "message": "Error description"}

// Stream end
{"type": "end"}
```

## Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
```

## File Structure

```
src/
├── app/(protected)/chat/
│   ├── page.tsx           # Main chat page
│   └── layout.tsx         # Chat layout wrapper
├── components/chat/
│   ├── ChatWindow.tsx     # Message display component
│   └── ChatInput.tsx      # Input component
├── context/
│   └── ChatContext.tsx    # Conversation state management
└── lib/
    ├── chat-api.ts        # API client with streaming support
    └── notifications.ts   # Browser notifications & sounds
```

## Troubleshooting

### Chat Page Not Loading
- Ensure you're signed in (check localStorage for `access_token`)
- Verify the `/chat` route is protected in `middleware.ts`

### Streaming Not Working
- Check backend is returning `Content-Type: text/event-stream`
- Verify SSE events follow the expected format
- Check browser console for parsing errors

### Notifications Not Appearing
- Check if browser notification permissions are granted
- Look for permission prompt on first visit to `/chat`
- Some browsers block notifications in incognito mode

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Testing

### Manual Testing Checklist
- [ ] Navigate to /chat and see empty state
- [ ] Send a message and see it appear immediately
- [ ] Observe AI response streaming in real-time
- [ ] Click "New Chat" to reset conversation
- [ ] Test on mobile device (responsive layout)
- [ ] Try sending message while AI is responding (should be disabled)
- [ ] Test notification permissions
- [ ] Sign out and verify redirect on unauthorized access

### Automated Testing (Pending)
Run tests when implemented:
```bash
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # E2E tests
```

## Next Steps

1. **Connect Backend**: Integrate with actual FastAPI backend implementing the chat endpoint
2. **Add Tests**: Implement unit, integration, and E2E tests (T042-T046)
3. **Complete Navigation**: Add arrow key navigation for message history (T033)
4. **User Testing**: Conduct UAT with real users
5. **Performance**: Optimize for large conversation histories

## Support

For issues or questions:
1. Check the implementation summary: `specs/001-ai-todo-chatbot/IMPLEMENTATION_SUMMARY.md`
2. Review the specification: `specs/001-ai-todo-chatbot/spec.md`
3. Check the task list: `specs/001-ai-todo-chatbot/tasks.md`

## Version Info

- **Next.js**: 16.1.4 (with Turbopack)
- **React**: 19.2.3
- **ChatKit**: @openai/chatkit-react@1.4.3
- **Branch**: 001-ai-todo-chatbot
- **Implementation Date**: 2026-02-03
