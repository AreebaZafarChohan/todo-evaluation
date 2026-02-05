// T011, T012, T022, T038, T039, T040, T041: Chat API client with streaming support
// Use separate URL for chat API (port 8001) vs main backend (Hugging Face)
const CHAT_BASE_URL = (process.env.NEXT_PUBLIC_CHAT_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || '').replace(/\/$/, '');

export interface ChatRequest {
  message: string;
}

export interface StreamEvent {
  type: 'content' | 'tool_call' | 'tool_output' | 'confirmation' | 'error' | 'end';
  value?: string;
  tool_name?: string;
  args?: any;
  output?: any;
  message?: string;
  code?: string;
}

export interface ChatError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * T011, T012: Send a chat message and handle streaming response
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest,
  onEvent: (event: StreamEvent) => void,
  onError: (error: ChatError) => void,
  onComplete: () => void
): Promise<void> {
  try {
    // T012: Get JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // T041: Check for expired or invalid session
    if (!token) {
      onError({
        message: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED',
        statusCode: 401,
      });
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return;
    }

    // T022: Make request with text/event-stream accept header
    const url = `${CHAT_BASE_URL}/api/${userId}/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    });

    // T038, T040, T041: Handle non-streaming errors
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Clear invalid session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
        onError({
          message: 'Session expired or invalid. Please log in again.',
          code: 'AUTH_ERROR',
          statusCode: response.status,
        });
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return;
      }

      // Try to parse error response
      const errorData = await response.json().catch(() => ({}));

      // Extract meaningful error message
      let errorMessage = `Request failed with status ${response.status}`;
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Pydantic validation errors
          errorMessage = errorData.detail.map((err: any) =>
            `${err.loc?.join('.') || 'field'}: ${err.msg}`
          ).join(', ');
        }
      }

      onError({
        message: errorMessage,
        code: 'API_ERROR',
        statusCode: response.status,
      });
      return;
    }

    // Check if response is streaming
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/event-stream')) {
      onError({
        message: 'Expected streaming response but received different content type',
        code: 'INVALID_RESPONSE',
      });
      return;
    }

    // T022: Read the stream
    const reader = response.body?.getReader();
    if (!reader) {
      onError({
        message: 'Failed to get response stream reader',
        code: 'STREAM_ERROR',
      });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // T039: Stream ended - check if properly terminated
          if (buffer.trim()) {
            console.warn('Stream ended with unparsed data:', buffer);
          }
          onComplete();
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (separated by double newline)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          // Parse SSE event block (can have multiple lines: event:, data:, id:, etc.)
          const lines = eventBlock.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData += line.substring(6);
            }
          }

          // Skip empty data or [DONE] marker
          if (!eventData || eventData === '[DONE]') {
            continue;
          }

          try {
            const event: StreamEvent = JSON.parse(eventData);

            // Handle error events
            if (event.type === 'error') {
              const errorMessage = event.message || 'An error occurred during processing';
              const errorCode = event.code || 'STREAM_ERROR';
              onError({
                message: errorMessage,
                code: errorCode,
              });
              return;
            }

            // Pass event to handler
            onEvent(event);

            // Check for end event
            if (event.type === 'end') {
              onComplete();
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError, 'Data:', eventData);
            // Continue processing other events
          }
        }
      }
    } catch (streamError) {
      // T039: Handle streaming interruptions
      onError({
        message: 'Connection interrupted while receiving response',
        code: 'STREAM_INTERRUPTED',
      });
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    // T038: Handle network failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      onError({
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      });
    } else {
      onError({
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }
}

/**
 * Helper to get user ID from session
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}
