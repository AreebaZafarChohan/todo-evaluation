// T021: CreateTaskForm with animations
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task, TaskCreate } from '@/types/task';
import { GradientButton } from '@/components/ui/gradient-button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';

interface CreateTaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newTaskData: TaskCreate = {
        title: title.trim(),
        description: description.trim() || null,
      };

      const newTask: Task = await apiClient.post('/tasks', newTaskData);
      onTaskCreated(newTask);

      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div
        className={cn(
          'rounded-xl overflow-hidden transition-all duration-300',
          'bg-[var(--card-bg)] border',
          isFocused
            ? 'border-[var(--primary-500)]/50 shadow-lg shadow-[var(--primary-500)]/10'
            : 'border-[var(--card-border)]'
        )}
      >
        <div className="p-6">
          <div className="space-y-4">
            {/* Title input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Task Title <span className="text-[var(--error)]">*</span>
              </label>
              <motion.input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                whileFocus={prefersReducedMotion ? {} : { scale: 1.01 }}
                className={cn(
                  'w-full px-4 py-3 rounded-lg transition-all duration-200',
                  'bg-[var(--background)] border border-[var(--card-border)]',
                  'text-[var(--foreground)] placeholder-[var(--muted-foreground)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]'
                )}
                placeholder="What needs to be done?"
                disabled={isLoading}
              />
            </div>

            {/* Description input */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[var(--foreground)] mb-2"
              >
                Description
              </label>
              <motion.textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                whileFocus={prefersReducedMotion ? {} : { scale: 1.01 }}
                className={cn(
                  'w-full px-4 py-3 rounded-lg transition-all duration-200 resize-none',
                  'bg-[var(--background)] border border-[var(--card-border)]',
                  'text-[var(--foreground)] placeholder-[var(--muted-foreground)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]'
                )}
                placeholder="Add details about this task..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 p-4 flex items-center gap-2"
              >
                <FiAlertCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
                <span className="text-sm text-[var(--error)]">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit button area */}
        <div className="px-6 py-4 bg-[var(--muted)]/50 border-t border-[var(--card-border)] flex justify-end">
          <GradientButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            {isLoading ? 'Creating...' : 'Create Task'}
          </GradientButton>
        </div>
      </div>
    </motion.form>
  );
}
