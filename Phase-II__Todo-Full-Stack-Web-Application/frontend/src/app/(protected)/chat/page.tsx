// T004, T017, T019, T020, T021, T032, T036: Integrated chat page with conversation management
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiRefreshCw, FiAlertCircle, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import ChatWindow, { Message } from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import {
  sendChatMessage,
  getUserId,
  clearChatSession,
  clearAllHistory,
  getConversation,
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
  const [showMenu, setShowMenu] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // Initialize on page load
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsLoading(false);
  }, []);

  // Load conversation messages
  const loadConversation = useCallback(async (convId: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const conversation = await getConversation(userId, convId);

      // Convert backend messages to frontend Message format
      const loadedMessages: Message[] = conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
      setConversationId(convId);
      setError(null);
    } catch (err) {
      const error = err as ChatError;
      setError(error.message || 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [userId, setConversationId]);

  // New chat action
  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, [setConversationId]);

  // Handle conversation selection from sidebar
  const handleSelectConversation = useCallback((convId: string) => {
    loadConversation(convId);
  }, [loadConversation]);

  // Handle conversation deleted from sidebar
  const handleConversationDeleted = useCallback(() => {
    // If current conversation was deleted, start new chat
    handleNewChat();
    // Trigger sidebar refresh
    setRefreshSidebar(prev => prev + 1);
  }, [handleNewChat]);

  // Clear current chat session
  const handleClearSession = useCallback(async () => {
    if (!userId || !conversationId || isClearing) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear this chat session? All messages will be deleted.'
    );

    if (!confirmed) return;

    setIsClearing(true);
    try {
      await clearChatSession(userId, conversationId);
      setMessages([]);
      setError(null);
    } catch (err) {
      const error = err as ChatError;
      setError(error.message || 'Failed to clear chat session');
    } finally {
      setIsClearing(false);
      setShowMenu(false);
    }
  }, [userId, conversationId, isClearing]);

  // Clear all history
  const handleClearAllHistory = useCallback(async () => {
    if (!userId || isClearing) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete ALL conversation history? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsClearing(true);
    try {
      const result = await clearAllHistory(userId);
      setMessages([]);
      setConversationId(null);
      setError(null);
      setRefreshSidebar(prev => prev + 1);
      alert(`Successfully deleted ${result.deleted_count} conversation(s)`);
    } catch (err) {
      const error = err as ChatError;
      setError(error.message || 'Failed to clear history');
    } finally {
      setIsClearing(false);
      setShowMenu(false);
    }
  }, [userId, isClearing, setConversationId]);

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
        // Send to backend with conversation_id (if exists)
        const response = await sendChatMessage(userId, messageText, conversationId);

        // Update conversation ID from response (for new chats)
        if (response.conversation_id && !conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Trigger sidebar refresh to show new conversation
        setRefreshSidebar(prev => prev + 1);
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
    [userId, isSending, conversationId, setConversationId]
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
    <div className="h-full flex">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onConversationDeleted={handleConversationDeleted}
        refreshTrigger={refreshSidebar}
      />

      {/* Main Chat Area */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col lg:ml-0"
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

          <div className="flex items-center space-x-2">
            {messages.length > 0 && conversationId && (
              <>
                <button
                  onClick={handleNewChat}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>New Chat</span>
                </button>

                {/* More options menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
                    title="More options"
                  >
                    <FiMoreVertical className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg z-50"
                    >
                      <div className="py-1">
                        <button
                          onClick={handleClearSession}
                          disabled={isClearing}
                          className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg)] flex items-center space-x-2 text-[var(--foreground)] disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Clear Chat Session</span>
                        </button>
                        <button
                          onClick={handleClearAllHistory}
                          disabled={isClearing}
                          className="w-full px-4 py-2 text-left hover:bg-[var(--hover-bg)] flex items-center space-x-2 text-[var(--error)] disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Clear All History</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
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
            disabled={isSending || isClearing}
            placeholder={
              isSending
                ? 'AI is thinking...'
                : isClearing
                ? 'Clearing...'
                : 'Type a message... (Shift+Enter for new line)'
            }
          />
        </div>
      </motion.div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}
