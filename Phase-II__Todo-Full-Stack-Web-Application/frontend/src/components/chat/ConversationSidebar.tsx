'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiTrash2, FiMoreVertical, FiX, FiMenu, FiAlertCircle } from 'react-icons/fi';
import {
  getConversations,
  deleteConversation,
  getUserId,
  type Conversation,
  type ChatError,
} from '@/lib/chat-api-simple';

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onConversationDeleted: () => void;
  refreshTrigger?: number; // Optional prop to trigger refresh
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onConversationDeleted,
  refreshTrigger,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch conversations on mount and when refreshTrigger changes
  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  const loadConversations = async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await getConversations(userId);
      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      const error = err as ChatError;
      setError(error.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation?'
    );

    if (!confirmed) return;

    const userId = getUserId();
    if (!userId) return;

    setDeletingId(conversationId);
    try {
      await deleteConversation(userId, conversationId);
      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationId)
      );
      setMenuOpenId(null);

      // If deleted current conversation, notify parent
      if (conversationId === currentConversationId) {
        onConversationDeleted();
      }
    } catch (err) {
      const error = err as ChatError;
      alert(error.message || 'Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const generateTitle = (conversation: Conversation) => {
    const date = new Date(conversation.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return `Today's Chat ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    // Otherwise show date
    return `${date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--card-bg)] to-[var(--background)] border-r border-[var(--card-border)] shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg">
              <FiMessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              Chat History
            </h3>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-[var(--hover-bg)] rounded-lg transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => {
            onNewChat();
            setIsMobileOpen(false);
          }}
          className="w-full px-4 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
        >
          <FiMessageSquare className="w-5 h-5" />
          <span>Start New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-10 h-10 border-3 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-[var(--muted-foreground)] font-medium">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-[var(--error)]" />
            </div>
            <p className="text-sm text-[var(--error)] text-center">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 flex items-center justify-center">
              <FiMessageSquare className="w-8 h-8 text-[var(--primary-500)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">No conversations yet</p>
              <p className="text-xs text-[var(--muted-foreground)]">Start a new chat to begin</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence>
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative group rounded-xl transition-all duration-200 ${
                    conversation.id === currentConversationId
                      ? 'bg-gradient-to-r from-[var(--primary-500)]/15 to-[var(--primary-600)]/15 border-2 border-[var(--primary-500)] shadow-md'
                      : 'hover:bg-[var(--hover-bg)] border-2 border-transparent hover:border-[var(--card-border)] hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      setIsMobileOpen(false);
                    }}
                    disabled={deletingId === conversation.id}
                    className="w-full p-4 text-left flex items-start space-x-3 disabled:opacity-50 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      conversation.id === currentConversationId
                        ? 'bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] shadow-lg'
                        : 'bg-[var(--card-bg)] group-hover:bg-[var(--primary-500)]/10'
                    }`}>
                      <FiMessageSquare className={`w-5 h-5 ${
                        conversation.id === currentConversationId
                          ? 'text-white'
                          : 'text-[var(--primary-500)]'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate mb-1 ${
                        conversation.id === currentConversationId
                          ? 'text-[var(--primary-500)]'
                          : 'text-[var(--foreground)]'
                      }`}>
                        {generateTitle(conversation)}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] flex items-center space-x-1">
                        <span>•</span>
                        <span>{formatDate(conversation.updated_at)}</span>
                      </p>
                    </div>
                  </button>

                  {/* Delete button */}
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(
                          menuOpenId === conversation.id ? null : conversation.id
                        );
                      }}
                      className="p-2 rounded-lg hover:bg-[var(--hover-bg)] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === conversation.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 mt-2 w-44 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <button
                          onClick={(e) => handleDelete(conversation.id, e)}
                          disabled={deletingId === conversation.id}
                          className="w-full px-4 py-3 text-left hover:bg-[var(--error)]/10 flex items-center space-x-3 text-[var(--error)] disabled:opacity-50 transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span className="font-medium">Delete Chat</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle button - Always visible */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white border border-[var(--primary-400)] rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        title="Open Chat History"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Collapsible sidebar for all screen sizes */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
