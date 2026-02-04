// T004, T017, T019, T020, T021, T032, T036: Integrated chat page with conversation management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import ChatWindow, { Message } from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import {
  sendChatMessage,
  getUserId,
  type StreamEvent,
  type ChatError,
} from '@/lib/chat-api';
import {
  requestNotificationPermission,
  notifyWithSound,
  getNotificationStatus,
} from '@/lib/notifications';
import { ChatProvider, useChatContext } from '@/context/ChatContext';

function ChatPageContent() {
  const prefersReducedMotion = useReducedMotion();
  const { conversationId, setConversationId } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<Message | null>(null);

  // T017: Initialize conversation on page load
  useEffect(() => {
    const id = getUserId();
    setUserId(id);

    // T028: Request notification permissions on mount
    requestNotificationPermission().then((granted) => {
      if (!granted) {
        console.info('Notification permissions not granted');
      }
    });

    // For now, we start with a fresh conversation
    // T019: In a real implementation, we would fetch or create conversation here
    setIsLoading(false);
  }, []);

  // T021: New chat action
  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setCurrentStreamingMessage(null);
  }, [setConversationId]);

  // Handle streaming events
  const handleStreamEvent = useCallback((event: StreamEvent) => {
    if (event.type === 'content') {
      // T023: Render partial assistant messages as they stream
      setCurrentStreamingMessage((prev) => {
        if (!prev) {
          return {
            id: `temp-${Date.now()}`,
            role: 'assistant',
            content: event.value || '',
            timestamp: new Date(),
            is_streaming: true,
          };
        }
        return {
          ...prev,
          content: prev.content + (event.value || ''),
        };
      });
    } else if (event.type === 'tool_call') {
      // T015: Display tool actions
      setCurrentStreamingMessage((prev) => {
        if (!prev) return prev;
        const toolCalls = prev.tool_calls || [];
        return {
          ...prev,
          tool_calls: [
            ...toolCalls,
            {
              tool_name: event.tool_name || 'unknown',
              args: event.args,
            },
          ],
        };
      });
    } else if (event.type === 'tool_output') {
      // T014, T016: Display tool outputs and confirmations
      setCurrentStreamingMessage((prev) => {
        if (!prev) return prev;
        const toolOutputs = prev.tool_outputs || [];
        return {
          ...prev,
          tool_outputs: [
            ...toolOutputs,
            {
              tool_name: event.tool_name || 'unknown',
              output: event.output,
            },
          ],
        };
      });
    } else if (event.type === 'confirmation') {
      // T032: Handle reminder notifications
      if (event.message?.toLowerCase().includes('reminder set')) {
        const notifStatus = getNotificationStatus();
        if (notifStatus.supported && notifStatus.permission === 'granted') {
          // Show notification preview
          notifyWithSound({
            title: 'Todo Reminder',
            body: event.message,
          });
        }
      }

      // Add confirmation to streaming message
      setCurrentStreamingMessage((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          content: prev.content + '\n\n' + (event.message || ''),
        };
      });
    }
  }, []);

  // T027: Finalize assistant message after stream ends
  const handleStreamComplete = useCallback(() => {
    setIsTyping(false);
    setIsSending(false);

    if (currentStreamingMessage) {
      setMessages((prev) => [
        ...prev,
        {
          ...currentStreamingMessage,
          id: `msg-${Date.now()}`,
          is_streaming: false,
        },
      ]);
      setCurrentStreamingMessage(null);
    }
  }, [currentStreamingMessage]);

  // T038, T039, T040: Handle errors
  const handleStreamError = useCallback((chatError: ChatError) => {
    setIsTyping(false);
    setIsSending(false);

    // Safely convert error to string
    const errorMessage = typeof chatError === 'string'
      ? chatError
      : chatError?.message || JSON.stringify(chatError) || 'An unknown error occurred';

    setError(errorMessage);
    setCurrentStreamingMessage(null);

    // Add error message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // T011: Send message handler
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!userId || isSending) return;

      // T013: Display user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setIsSending(true);
      setIsTyping(true);

      // Send to backend (backend manages conversation internally)
      await sendChatMessage(
        userId,
        {
          message: messageText,
        },
        handleStreamEvent,
        handleStreamError,
        handleStreamComplete
      );
    },
    [userId, conversationId, isSending, handleStreamEvent, handleStreamError, handleStreamComplete]
  );

  // T036: Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  // Combine messages with current streaming message for display
  const displayMessages = currentStreamingMessage
    ? [...messages, currentStreamingMessage]
    : messages;

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            AI Todo Assistant
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Manage your tasks using natural language
          </p>
        </div>

        {/* T021: New chat button */}
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* T038, T040: Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-lg flex items-center space-x-3"
        >
          <FiAlertCircle className="w-5 h-5 text-[var(--error)]" />
          <div className="flex-1">
            <p className="text-[var(--error)] font-medium">Error</p>
            <p className="text-sm text-[var(--error)]/80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[var(--error)] hover:text-[var(--error)]/80"
          >
            ×
          </button>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg overflow-hidden">
        {/* T008, T009: Chat window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow messages={displayMessages} isTyping={isTyping && !currentStreamingMessage} />
        </div>

        {/* T010, T025: Chat input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isSending}
          placeholder={
            isSending
              ? 'AI is thinking...'
              : 'Type a message... (Shift+Enter for new line)'
          }
        />
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}
