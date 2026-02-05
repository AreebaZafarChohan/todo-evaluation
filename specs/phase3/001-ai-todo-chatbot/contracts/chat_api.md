# API Contract: Chat Endpoint (Frontend Perspective)

**Date**: 2026-01-29
**Feature**: AI-Powered Todo Chatbot Frontend
**Spec**: ./specs/001-ai-todo-chatbot/spec.md
**Plan**: ./specs/001-ai-todo-chatbot/plan.md

## Overview

This document outlines the expected contract for the primary chat interaction endpoint from the frontend's perspective. This endpoint facilitates sending user messages to the AI backend and receiving streaming responses.

## Endpoint: `POST /api/{user_id}/chat`

### Description

Sends a user message to the AI chatbot, optionally continuing an existing conversation. Receives a server-sent event (SSE) stream of AI responses.

### Request

*   **Method**: `POST`
*   **URL**: `/api/{user_id}/chat`
    *   `user_id`: Path parameter, extracted from the authenticated session.
*   **Headers**:
    *   `Authorization`: `Bearer <JWT_TOKEN>` (extracted from existing Better Auth session).
    *   `Content-Type`: `application/json`
    *   `Accept`: `text/event-stream` (to enable SSE for streaming responses)
*   **Body (JSON)**:

    ```json
    {
      "conversation_id": "string | null", // Optional: ID of the current conversation, null for new conversation
      "message": "string"                // The user's message text
    }
    ```

### Response (Streaming - Server-Sent Events)

The API will respond with a stream of events. Each event represents a part of the AI's response (e.g., individual tokens) or metadata.

*   **`Content-Type`**: `text/event-stream`
*   **Event Format**: Each event will be a JSON object wrapped in an SSE `data:` field.

    ```
    data: {"type": "content", "value": "Hello"}
    data: {"type": "content", "value": " world"}
    data: {"type": "tool_call", "tool_name": "create_task", "args": {"title": "Buy groceries"}}
    data: {"type": "content", "value": "."}
    data: {"type": "end"}
    ```

*   **Example Event Types**:
    *   `content`: Represents a piece of the AI's natural language response.
        ```json
        {"type": "content", "value": "string"}
        ```
    *   `tool_call`: Indicates the AI is invoking a tool (e.g., to create a task).
        ```json
        {"type": "tool_call", "tool_name": "string", "args": "object"}
        ```
    *   `tool_output`: Output received from a tool execution.
        ```json
        {"type": "tool_output", "tool_name": "string", "output": "object"}
        ```
    *   `confirmation`: A final confirmation or action summary from the AI.
        ```json
        {"type": "confirmation", "message": "string"}
        ```
    *   `error`: An error occurred during processing.
        ```json
        {"type": "error", "code": "string", "message": "string"}
        ```
    *   `end`: Signals the completion of the AI's response for the current turn.
        ```json
        {"type": "end"}
        ```

### Error Responses (Non-Streaming)

In case of non-streaming errors (e.g., authentication, invalid request), a standard JSON error response is expected.

*   **`Content-Type`**: `application/json`

*   **Status Codes**:
    *   `400 Bad Request`: Invalid request payload.
    *   `401 Unauthorized`: Missing or invalid JWT token.
    *   `403 Forbidden`: User not authorized to access this resource.
    *   `500 Internal Server Error`: General server error.

*   **Body (JSON)**:

    ```json
    {
      "detail": "string"
    }
    ```

---
**End of API Contract**
