// T008, T009, T013, T014, T015, T016: Base Chat UI component with message list
'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiUser, FiCpu } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tool_calls?: Array<{
    tool_name: string;
    args: any;
  }>;
  tool_outputs?: Array<{
    tool_name: string;
    output: any;
  }>;
  is_streaming?: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
}

export default function ChatWindow({ messages, isTyping = false }: ChatWindowProps) {
  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // T026: Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // T037: Empty state for no messages
  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center mb-6">
            <FiCpu className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Welcome to AI Todo Assistant
          </h3>
          <p className="text-[var(--muted-foreground)] max-w-md">
            Start a conversation to manage your tasks using natural language. Try asking me to create a task, list your todos, or mark tasks as complete!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              prefersReducedMotion={prefersReducedMotion}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* T024: Typing indicator */}
        {isTyping && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center">
              <FiCpu className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-1 bg-[var(--muted)] px-4 py-3 rounded-2xl">
              <span className="w-2 h-2 bg-[var(--primary-500)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[var(--primary-500)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[var(--primary-500)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({
  message,
  prefersReducedMotion,
  index,
}: {
  message: Message;
  prefersReducedMotion: boolean;
  index: number;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn('flex items-start space-x-3', isUser && 'flex-row-reverse space-x-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-[var(--muted)]'
            : 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]'
        )}
      >
        {isUser ? (
          <FiUser className="w-4 h-4 text-[var(--foreground)]" />
        ) : (
          <FiCpu className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={cn('flex flex-col space-y-1 max-w-[70%]', isUser && 'items-end')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white'
              : 'bg-[var(--muted)] text-[var(--foreground)]',
            message.is_streaming && 'animate-pulse'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* T015: Tool action summaries */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
              {message.tool_calls.map((tool, idx) => (
                <div key={idx} className="text-xs opacity-80">
                  <span className="font-medium">Action:</span> {tool.tool_name}
                </div>
              ))}
            </div>
          )}

          {/* T014, T016: Tool outputs and confirmations */}
          {message.tool_outputs && message.tool_outputs.length > 0 && (
            <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
              {message.tool_outputs.map((output, idx) => (
                <div key={idx} className="text-xs opacity-80">
                  <span className="font-medium">✓</span> {output.tool_name} completed
                </div>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-[var(--muted-foreground)] px-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
