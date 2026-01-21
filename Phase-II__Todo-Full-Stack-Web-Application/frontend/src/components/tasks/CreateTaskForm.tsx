// T021: CreateTaskForm with cosmic theme
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task, TaskCreate } from '@/types/task';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiPlus, FiAlertCircle, FiFileText, FiType } from 'react-icons/fi';

interface CreateTaskFormProps {
  onTaskCreated: (task: Task) => void;
}

export default function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Gradient border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 via-teal-500/30 to-purple-500/30 blur-sm" />

      {/* Card */}
      <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Task Title <span className="text-purple-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiType className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  focusedField === 'title' ? 'text-purple-400' : 'text-neutral-500'
                )} />
              </div>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-neutral-500 transition-all duration-300
                  focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                  focus:ring-2 focus:ring-purple-500/20"
                placeholder="What needs to be done?"
                disabled={isLoading}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: focusedField === 'title' ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Description <span className="text-neutral-500">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                <FiFileText className={cn(
                  'w-5 h-5 transition-colors duration-200',
                  focusedField === 'description' ? 'text-purple-400' : 'text-neutral-500'
                )} />
              </div>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-neutral-500 transition-all duration-300 resize-none
                  focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                  focus:ring-2 focus:ring-purple-500/20"
                placeholder="Add details about this task..."
                disabled={isLoading}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: focusedField === 'description' ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="rounded-xl p-4 border border-red-500/30 bg-red-500/10 flex items-center gap-3"
              >
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="w-5 h-5" />
                  Create Task
                </>
              )}
            </span>
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
