# backend-websocket

## Description
WebSocket implementation patterns for real-time bidirectional communication with connection management.

## Core Principles
1. **Heartbeat**: Detect dead connections with pings.
2. **Reconnection**: Support client reconnection with backoff.
3. **Message Types**: Use typed message envelopes.
4. **Scaling**: Use Redis pub/sub for multi-instance support.
