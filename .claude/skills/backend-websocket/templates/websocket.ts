import { Server as HttpServer, IncomingMessage } from 'http';
import { Server as SocketIOServer, Socket, ServerOptions } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Message types
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  roomId?: string;
}

export interface HandshakeData {
  userId?: string;
  token?: string;
  roomId?: string;
  metadata?: Record<string, unknown>;
}

// Configuration
export interface WebSocketConfig {
  path?: string;
  cors?: {
    origin: string | string[];
    methods: string[];
  };
  pingInterval?: number;
  pingTimeout?: number;
  maxPayload?: number;
}

// Default configuration
export const defaultConfig: WebSocketConfig = {
  path: '/socket.io',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000,
  pingTimeout: 20000,
  maxPayload: 1e6, // 1MB
};

// Event types
export enum SocketEvents {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  MESSAGE = 'message',
  TYPING = 'typing',
  PRESENCE_UPDATE = 'presence_update',
}

// Message factory
export function createMessage<T>(
  type: string,
  payload: T,
  roomId?: string
): WebSocketMessage<T> {
  return {
    id: uuidv4(),
    type,
    payload,
    timestamp: Date.now(),
    roomId,
  };
}

// WebSocket Server class
export class WebSocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private roomMembers: Map<string, Set<string>> = new Map(); // roomId -> userIds

  constructor(server: HttpServer, config: Partial<WebSocketConfig> = {}) {
    const finalConfig = { ...defaultConfig, ...config };

    this.io = new SocketIOServer(server, {
      path: finalConfig.path,
      cors: finalConfig.cors,
      pingInterval: finalConfig.pingInterval,
      pingTimeout: finalConfig.pingTimeout,
      maxPayload: finalConfig.maxPayload,
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (token) {
          // Validate token and set userId
          // const user = await validateToken(token);
          // socket.data.userId = user.id;
        }

        socket.data.socketId = socket.id;
        socket.data.connectedAt = new Date();

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on(SocketEvents.CONNECT, (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Track user connections
      const userId = socket.data.userId;
      if (userId) {
        this.trackUserConnection(userId, socket.id);
      }

      // Room management
      socket.on(SocketEvents.JOIN_ROOM, (roomId: string) => {
        this.handleJoinRoom(socket, roomId);
      });

      socket.on(SocketEvents.LEAVE_ROOM, (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Message handling
      socket.on(SocketEvents.MESSAGE, (message: WebSocketMessage) => {
        this.handleMessage(socket, message);
      });

      // Typing indicators
      socket.on(SocketEvents.TYPING, (data: { roomId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit(SocketEvents.TYPING, {
          userId: socket.data.userId,
          isTyping: data.isTyping,
        });
      });

      // Disconnect handling
      socket.on(SocketEvents.DISCONNECT, (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.handleDisconnect(socket);
      });

      socket.on(SocketEvents.ERROR, (error) => {
        console.error(`Socket error: ${socket.id}`, error);
      });
    });
  }

  private trackUserConnection(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
    this.socketUsers.set(socketId, userId);
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    const userId = socket.data.userId;

    socket.join(roomId);

    // Track room membership
    if (!this.roomMembers.has(roomId)) {
      this.roomMembers.set(roomId, new Set());
    }
    if (userId) {
      this.roomMembers.get(roomId)!.add(userId);
    }

    // Notify room members
    socket.to(roomId).emit(SocketEvents.PRESENCE_UPDATE, {
      roomId,
      userId,
      action: 'joined',
      timestamp: Date.now(),
    });

    // Send current room members to the joining user
    const members = Array.from(this.roomMembers.get(roomId) || []);
    socket.emit(SocketEvents.PRESENCE_UPDATE, {
      roomId,
      members,
      action: 'sync',
      timestamp: Date.now(),
    });
  }

  private handleLeaveRoom(socket: Socket, roomId: string) {
    const userId = socket.data.userId;

    socket.leave(roomId);

    // Update room membership
    if (userId) {
      this.roomMembers.get(roomId)?.delete(userId);
    }

    // Notify room members
    socket.to(roomId).emit(SocketEvents.PRESENCE_UPDATE, {
      roomId,
      userId,
      action: 'left',
      timestamp: Date.now(),
    });
  }

  private handleMessage(socket: Socket, message: WebSocketMessage) {
    const userId = socket.data.userId;

    // Add sender info to message
    message.id = message.id || uuidv4();
    message.timestamp = Date.now();

    if (message.roomId) {
      // Broadcast to room
      this.io.to(message.roomId).emit(SocketEvents.MESSAGE, {
        ...message,
        senderId: userId,
      });
    } else {
      // Direct message
      const targetSocketId = this.getSocketIdByUserId(message.payload['targetUserId']);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit(SocketEvents.MESSAGE, {
          ...message,
          senderId: userId,
        });
      }
    }
  }

  private handleDisconnect(socket: Socket) {
    const socketId = socket.id;
    const userId = this.socketUsers.get(socketId);

    // Remove from user sockets
    if (userId) {
      this.userSockets.get(userId)?.delete(socketId);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUsers.delete(socketId);

    // Remove from all rooms
    for (const [roomId, members] of this.roomMembers.entries()) {
      if (userId && members.has(userId)) {
        members.delete(userId);
        socket.to(roomId).emit(SocketEvents.PRESENCE_UPDATE, {
          roomId,
          userId,
          action: 'left',
          timestamp: Date.now(),
        });
      }
    }
  }

  // Public methods
  getSocketIdByUserId(userId: string): string | null {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.values().next().value : null;
  }

  getOnlineUsers(roomId?: string): string[] {
    if (roomId) {
      return Array.from(this.roomMembers.get(roomId) || []);
    }
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  sendToUser(userId: string, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  sendToRoom(roomId: string, event: string, data: unknown) {
    this.io.to(roomId).emit(event, data);
  }

  broadcast(event: string, data: unknown) {
    this.io.emit(event, data);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

// Typed Socket interface
export interface TypedSocket<T extends Record<string, unknown>> extends Socket {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): this;
  emit<K extends keyof T>(event: K, data: T[K]): boolean;
}

// Helper to create typed socket
export function createTypedSocket<T>(socket: Socket): TypedSocket<T> {
  return socket as TypedSocket<T>;
}
