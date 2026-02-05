// Simple chat API client (non-streaming, JSON response)
const CHAT_BASE_URL = (process.env.NEXT_PUBLIC_CHAT_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || '').replace(/\/$/, '');

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  tool_summary: Array<{
    tool_name: string;
    arguments: any;
  }>;
}

export interface ChatError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tool_calls?: any;
}

export interface ConversationDetail {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
}

/**
 * Send a chat message and get simple JSON response
 */
export async function sendChatMessage(
  userId: string,
  message: string,
  conversationId?: string | null
): Promise<ChatResponse> {
  // Get JWT token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Check for expired or invalid session
  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId
    }),
  });

  // Handle errors
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Clear invalid session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
      throw {
        message: 'Session expired or invalid. Please log in again.',
        code: 'AUTH_ERROR',
        statusCode: response.status,
      } as ChatError;
    }

    // Try to parse error response
    const errorData = await response.json().catch(() => ({}));

    // Extract meaningful error message with user-friendly formatting
    let errorMessage = 'An error occurred while processing your request.';
    let errorCode = 'API_ERROR';

    if (errorData.detail) {
      const detail = errorData.detail;

      // Check for specific error patterns
      if (typeof detail === 'string') {
        // Rate limit errors
        if (detail.includes('quota') || detail.includes('rate limit') || detail.includes('429')) {
          errorMessage = 'The AI service is currently at capacity. Please try again in a few moments.';
          errorCode = 'RATE_LIMIT';
        }
        // API key errors
        else if (detail.includes('API key') || detail.includes('leaked') || detail.includes('403')) {
          errorMessage = 'There is an issue with the AI service configuration. Please contact support.';
          errorCode = 'CONFIG_ERROR';
        }
        // Generic error
        else {
          errorMessage = detail;
        }
      } else if (Array.isArray(detail)) {
        // Pydantic validation errors
        errorMessage = detail.map((err: any) =>
          `${err.loc?.join('.') || 'field'}: ${err.msg}`
        ).join(', ');
      }
    } else if (response.status === 429) {
      errorMessage = 'The AI service is currently at capacity. Please try again in a few moments.';
      errorCode = 'RATE_LIMIT';
    } else if (response.status === 500) {
      errorMessage = 'The AI service encountered an error. Please try again or contact support if the issue persists.';
      errorCode = 'SERVER_ERROR';
    }

    throw {
      message: errorMessage,
      code: errorCode,
      statusCode: response.status,
    } as ChatError;
  }

  // Parse JSON response
  const data: ChatResponse = await response.json();
  return data;
}

/**
 * Get all conversations for a user
 */
export async function getConversations(userId: string): Promise<ConversationsResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/conversations`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw {
      message: 'Failed to fetch conversations',
      code: 'API_ERROR',
      statusCode: response.status,
    } as ChatError;
  }

  return response.json();
}

/**
 * Get a specific conversation with all messages
 */
export async function getConversation(
  userId: string,
  conversationId: string
): Promise<ConversationDetail> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/conversations/${conversationId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw {
      message: 'Failed to fetch conversation',
      code: 'API_ERROR',
      statusCode: response.status,
    } as ChatError;
  }

  return response.json();
}

/**
 * Clear all messages from current conversation (keep conversation)
 */
export async function clearChatSession(
  userId: string,
  conversationId: string
): Promise<{ message: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/conversations/${conversationId}/messages`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw {
      message: 'Failed to clear chat session',
      code: 'API_ERROR',
      statusCode: response.status,
    } as ChatError;
  }

  return response.json();
}

/**
 * Delete a specific conversation
 */
export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<{ message: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/conversations/${conversationId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw {
      message: 'Failed to delete conversation',
      code: 'API_ERROR',
      statusCode: response.status,
    } as ChatError;
  }

  return response.json();
}

/**
 * Clear all conversation history for user
 */
export async function clearAllHistory(
  userId: string
): Promise<{ message: string; deleted_count: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw {
      message: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED',
      statusCode: 401,
    } as ChatError;
  }

  const url = `${CHAT_BASE_URL}/api/${userId}/conversations`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw {
      message: 'Failed to clear history',
      code: 'API_ERROR',
      statusCode: response.status,
    } as ChatError;
  }

  return response.json();
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
