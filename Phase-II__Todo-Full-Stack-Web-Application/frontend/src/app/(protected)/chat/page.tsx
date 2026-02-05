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
  type ChatError,
} from '@/lib/chat-api-simple';
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

  // Initialize on page load
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsLoading(false);
  }, []);

  // New chat action
  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, [setConversationId]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!userId || isSending) return;

      // Display user message immediately
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

      try {
        // Send to backend and get response
        const response = await sendChatMessage(userId, messageText);

        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const error = err as ChatError;
        const errorMessage = error.message || 'An error occurred';
        setError(errorMessage);

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
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [userId, isSending]
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
        <div className="flex-1 overflow-hidden">
          <ChatWindow messages={messages} isTyping={isTyping} />
        </div>

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
