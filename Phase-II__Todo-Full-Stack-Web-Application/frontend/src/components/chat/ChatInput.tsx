// T010, T025: Input field with send action and disabled state
'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { FiSend } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message... (Shift+Enter for new line)',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // T010: Handle Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize logic
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max height 200px
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className="border-t border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12',
              'bg-[var(--muted)] text-[var(--foreground)]',
              'border border-[var(--card-border)] rounded-2xl',
              'resize-none overflow-y-auto',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent',
              'placeholder:text-[var(--muted-foreground)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full',
            'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)]',
            'flex items-center justify-center',
            'text-white',
            'transition-all duration-200',
            'hover:shadow-lg hover:scale-105',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] mt-2 px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
