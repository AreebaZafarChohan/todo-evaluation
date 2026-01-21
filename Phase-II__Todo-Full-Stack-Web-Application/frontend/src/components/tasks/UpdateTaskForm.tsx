// T022: UpdateTaskForm with animations
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task, TaskUpdate } from '@/types/task';
import { GradientButton } from '@/components/ui/gradient-button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';

interface UpdateTaskFormProps {
  task: Task;
  onUpdateSuccess: (updatedTask: Task) => void;
  onCancel: () => void;
}

export default function UpdateTaskForm({ task, onUpdateSuccess, onCancel }: UpdateTaskFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [completed, setCompleted] = useState(task.completed);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      const updatedTaskData: TaskUpdate = {
        title: title.trim(),
        description: description.trim() || null,
        completed,
      };

      const updatedTask: Task = await apiClient.put(`/tasks/${task.id}`, updatedTaskData);
      onUpdateSuccess(updatedTask);
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      {/* Title input */}
      <div>
        <label
          htmlFor="edit-title"
          className="block text-sm font-medium text-[var(--foreground)] mb-1"
        >
          Title <span className="text-[var(--error)]">*</span>
        </label>
        <input
          type="text"
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            'w-full px-3 py-2 rounded-lg transition-all duration-200',
            'bg-[var(--background)] border border-[var(--card-border)]',
            'text-[var(--foreground)] placeholder-[var(--muted-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]'
          )}
          disabled={isLoading}
        />
      </div>

      {/* Description input */}
      <div>
        <label
          htmlFor="edit-description"
          className="block text-sm font-medium text-[var(--foreground)] mb-1"
        >
          Description
        </label>
        <textarea
          id="edit-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(
            'w-full px-3 py-2 rounded-lg transition-all duration-200 resize-none',
            'bg-[var(--background)] border border-[var(--card-border)]',
            'text-[var(--foreground)] placeholder-[var(--muted-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)]'
          )}
          disabled={isLoading}
        />
      </div>

      {/* Completed checkbox */}
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => setCompleted(!completed)}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
            completed
              ? 'bg-[var(--success)] border-[var(--success)] text-white'
              : 'border-[var(--neutral-400)] hover:border-[var(--primary-500)]'
          )}
          disabled={isLoading}
        >
          {completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </motion.button>
        <label
          htmlFor="edit-completed"
          className="text-sm text-[var(--foreground)] cursor-pointer"
          onClick={() => setCompleted(!completed)}
        >
          Mark as completed
        </label>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 p-3 flex items-center gap-2"
          >
            <FiAlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0" />
            <span className="text-sm text-[var(--error)]">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-[var(--muted)] text-[var(--foreground)]',
            'hover:bg-[var(--muted)]/80',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <FiX className="w-4 h-4 inline mr-1" />
          Cancel
        </motion.button>
        <GradientButton
          type="submit"
          size="sm"
          isLoading={isLoading}
          disabled={isLoading}
        >
          <FiSave className="w-4 h-4 mr-1" />
          {isLoading ? 'Saving...' : 'Save'}
        </GradientButton>
      </div>
    </motion.form>
  );
}
