# WebSocket Module Structure Reference

```
src/
  infrastructure/
    websocket/
      servers/
        websocket.server.ts       # Base WebSocket server
        chat.server.ts            # Chat functionality
        presence.server.ts        # Online presence
        notification.server.ts    # Notifications
      handlers/
        connection.handler.ts     # Connection lifecycle
        message.handler.ts        # Message processing
        typing.handler.ts         # Typing indicators
      middleware/
        auth.middleware.ts        # Token authentication
        rate-limiter.ts           # Connection throttling
      utils/
        room-manager.ts           # Room management
        presence-tracker.ts       # Online status

  interfaces/
    websocket/
      controllers/
        socket.controller.ts     # Socket event controllers
      events/
        chat.events.ts           # Chat event types
        presence.events.ts       # Presence event types

  types/
    websocket.types.ts           # TypeScript types
```

## Usage Examples

### 1. Basic Server Setup
```typescript
// infrastructure/websocket/index.ts
import { createServer } from 'http';
import { WebSocketServer } from './servers/websocket.server';

const httpServer = createServer(app);
const wsServer = new WebSocketServer(httpServer, {
  cors: { origin: 'https://yourdomain.com' },
});

httpServer.listen(3000);
```

### 2. Chat Server Setup
```typescript
// infrastructure/websocket/chat.ts
import { Server as SocketIOServer } from 'socket.io';
import { ChatServer } from './servers/chat.server';

const io = new SocketIOServer(server, {
  cors: { origin: '*' },
});

const chatServer = new ChatServer(io);
```

### 3. Client Connection
```typescript
// Client-side (TypeScript)
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('https://api.example.com', {
  auth: { token: 'user-jwt-token' },
  transports: ['websocket'],
});

// Event handlers
socket.on('connect', () => {
  console.log('Connected:', socket.id);

  // Join a chat room
  socket.emit('chat:join', 'room-123');
});

socket.on('chat:receive_message', (message) => {
  console.log('New message:', message);
});

socket.on('chat:typing_start', ({ userId }) => {
  console.log('User is typing:', userId);
});
```

## Event Reference

### Connection Events
| Event | Direction | Description |
|-------|-----------|-------------|
| connection | Server | Client connected |
| disconnect | Server | Client disconnected |
| error | Bidirectional | Error occurred |

### Chat Events
| Event | Direction | Description |
|-------|-----------|-------------|
| chat:join | Client -> Server | Join a room |
| chat:leave | Client -> Server | Leave a room |
| chat:send_message | Client -> Server | Send message |
| chat:receive_message | Server -> Client | Receive message |
| chat:typing_start | Bidirectional | User started typing |
| chat:typing_stop | Bidirectional | User stopped typing |
| chat:message_read | Bidirectional | Message marked as read |
| chat:get_online_users | Client -> Server | Request online users |
| chat:online_users | Server -> Client | Online users list |

### Presence Events
| Event | Direction | Description |
|-------|-----------|-------------|
| presence:online | Server -> Client | User came online |
| presence:offline | Server -> Client | User went offline |

## Best Practices

1. **Authentication**: Always authenticate on connection
2. **Rate Limiting**: Limit messages per second per connection
3. **Message Size**: Enforce max payload size
4. **Reconnection**: Handle reconnection gracefully
5. **Heartbeat**: Use ping/pong for connection health
6. **Room Management**: Clean up empty rooms
7. **History**: Limit message history size
8. **Typing Indicators**: Debounce typing events

## Scaling Considerations

- Use Redis Adapter for multi-instance deployment
- Implement sticky sessions with load balancer
- Consider message queue for offline delivery
- Use CDN for static assets
