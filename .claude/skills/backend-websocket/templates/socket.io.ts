import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import { createMessage, WebSocketMessage, WebSocketConfig } from './websocket';

// Chat-specific event types
export enum ChatEvents {
  SEND_MESSAGE = 'chat:send_message',
  RECEIVE_MESSAGE = 'chat:receive_message',
  TYPING_START = 'chat:typing_start',
  TYPING_STOP = 'chat:typing_stop',
  MESSAGE_READ = 'chat:message_read',
  MESSAGE_DELIVERED = 'chat:message_delivered',
  JOIN_CHAT = 'chat:join',
  LEAVE_CHAT = 'chat:leave',
  USER_JOINED = 'chat:user_joined',
  USER_LEFT = 'chat:user_left',
  GET_ONLINE_USERS = 'chat:get_online_users',
  ONLINE_USERS = 'chat:online_users',
}

// Chat message payload
export interface ChatMessagePayload {
  roomId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

// Chat state
export interface ChatState {
  rooms: Map<string, Set<string>>;
  typingUsers: Map<string, Set<string>>; // roomId -> userIds
  messageHistory: Map<string, WebSocketMessage[]>; // roomId -> messages
}

// Chat Room Manager
export class ChatRoomManager {
  private rooms: Map<string, Set<string>> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map();

  joinRoom(socket: Socket, roomId: string): void {
    socket.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socket.data.userId);

    // Notify others
    socket.to(roomId).emit(ChatEvents.USER_JOINED, {
      roomId,
      userId: socket.data.userId,
      timestamp: Date.now(),
    });
  }

  leaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socket.data.userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
        this.typingUsers.delete(roomId);
      }
    }

    // Notify others
    socket.to(roomId).emit(ChatEvents.USER_LEFT, {
      roomId,
      userId: socket.data.userId,
      timestamp: Date.now(),
    });
  }

  getRoomMembers(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) || []);
  }

  isUserInRoom(roomId: string, userId: string): boolean {
    return this.rooms.get(roomId)?.has(userId) || false;
  }

  setTyping(roomId: string, userId: string, isTyping: boolean): void {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }

    if (isTyping) {
      this.typingUsers.get(roomId)!.add(userId);
    } else {
      this.typingUsers.get(roomId)!.delete(userId);
    }
  }

  getTypingUsers(roomId: string): string[] {
    return Array.from(this.typingUsers.get(roomId) || []);
  }
}

// Chat Server
export class ChatServer {
  private io: SocketIOServer;
  private roomManager: ChatRoomManager;
  private messageHistory: Map<string, WebSocketMessage[]> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.roomManager = new ChatRoomManager();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      // Join room
      socket.on(ChatEvents.JOIN_CHAT, (roomId: string) => {
        this.roomManager.joinRoom(socket, roomId);

        // Send online users
        const onlineUsers = this.roomManager.getRoomMembers(roomId);
        socket.emit(ChatEvents.ONLINE_USERS, { roomId, users: onlineUsers });

        // Send message history
        const history = this.messageHistory.get(roomId) || [];
        socket.emit('chat:history', { roomId, messages: history.slice(-50) });
      });

      // Leave room
      socket.on(ChatEvents.LEAVE_CHAT, (roomId: string) => {
        this.roomManager.leaveRoom(socket, roomId);
      });

      // Send message
      socket.on(ChatEvents.SEND_MESSAGE, (payload: ChatMessagePayload) => {
        const message = createMessage(
          'chat_message',
          {
            content: payload.content,
            messageType: payload.messageType,
            replyTo: payload.replyTo,
            metadata: payload.metadata,
          },
          payload.roomId
        );

        // Store in history
        if (!this.messageHistory.has(payload.roomId)) {
          this.messageHistory.set(payload.roomId, []);
        }
        this.messageHistory.get(payload.roomId)!.push(message);

        // Broadcast to room
        this.io.to(payload.roomId).emit(ChatEvents.RECEIVE_MESSAGE, {
          ...message,
          senderId: socket.data.userId,
          senderName: socket.data.userName,
        });

        // Send delivery confirmation
        socket.emit(ChatEvents.MESSAGE_DELIVERED, {
          messageId: message.id,
          roomId: payload.roomId,
          timestamp: message.timestamp,
        });
      });

      // Typing indicators
      socket.on(ChatEvents.TYPING_START, (roomId: string) => {
        this.roomManager.setTyping(roomId, socket.data.userId, true);
        socket.to(roomId).emit(ChatEvents.TYPING_START, {
          roomId,
          userId: socket.data.userId,
        });
      });

      socket.on(ChatEvents.TYPING_STOP, (roomId: string) => {
        this.roomManager.setTyping(roomId, socket.data.userId, false);
        socket.to(roomId).emit(ChatEvents.TYPING_STOP, {
          roomId,
          userId: socket.data.userId,
        });
      });

      // Mark messages as read
      socket.on(ChatEvents.MESSAGE_READ, (data: { roomId: string; messageId: string }) => {
        socket.to(data.roomId).emit(ChatEvents.MESSAGE_READ, {
          roomId: data.roomId,
          messageId: data.messageId,
          userId: socket.data.userId,
          timestamp: Date.now(),
        });
      });

      // Get online users
      socket.on(ChatEvents.GET_ONLINE_USERS, (roomId: string) => {
        const users = this.roomManager.getRoomMembers(roomId);
        socket.emit(ChatEvents.ONLINE_USERS, { roomId, users });
      });
    });
  }

  getRoomManager(): ChatRoomManager {
    return this.roomManager;
  }
}

// Presence Server for online status
export class PresenceServer {
  private io: SocketIOServer;
  private onlineUsers: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  handleConnection(socket: Socket) {
    const userId = socket.data.userId;

    if (userId) {
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(socket.id);

      // Broadcast presence update
      this.io.emit('presence:online', { userId, timestamp: Date.now() });
    }

    socket.on('disconnect', () => {
      if (userId) {
        const sockets = this.onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.io.emit('presence:offline', { userId, timestamp: Date.now() });
          }
        }
      }
    });
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }
}

// Notification Server
export class NotificationServer {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  sendNotification(userId: string, notification: {
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: Date.now(),
    });
  }

  broadcastNotification(notification: {
    type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }) {
    this.io.emit('notification', {
      ...notification,
      timestamp: Date.now(),
    });
  }
}
