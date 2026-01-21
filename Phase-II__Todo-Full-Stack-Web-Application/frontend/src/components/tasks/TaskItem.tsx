// T017-T020: TaskItem with cosmic theme and smooth animations
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import UpdateTaskForm from './UpdateTaskForm';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { FiEdit2, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export default function TaskItem({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
  index = 0,
  viewMode = 'grid'
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    await new Promise(resolve => setTimeout(resolve, prefersReducedMotion ? 0 : 200));
    onToggleComplete(task);
    setIsCompleting(false);
  };

  const handleUpdateSuccess = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: -50,
      transition: {
        duration: 0.2,
      }
    },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      variants={prefersReducedMotion ? {} : cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative group"
    >
      {/* Hover glow effect */}
      <div className={cn(
        'absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm',
        task.completed
          ? 'bg-gradient-to-r from-teal-500/30 to-green-500/30'
          : 'bg-gradient-to-r from-purple-500/40 to-teal-500/40'
      )} />

      {/* Card */}
      <div className={cn(
        'relative p-5 rounded-2xl border backdrop-blur-sm transition-all duration-300',
        task.completed
          ? 'bg-white/3 border-white/5'
          : 'bg-white/5 border-white/10 hover:bg-white/8',
        viewMode === 'list' && 'flex items-center gap-4'
      )}>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <UpdateTaskForm
                task={task}
                onUpdateSuccess={handleUpdateSuccess}
                onCancel={() => setIsEditing(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="display"
              className={cn(
                'flex gap-4 w-full',
                viewMode === 'grid' ? 'flex-col' : 'items-center'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Checkbox + Content */}
              <div className={cn(
                'flex gap-4 flex-1',
                viewMode === 'grid' ? 'items-start' : 'items-center'
              )}>
                {/* Custom Checkbox */}
                <motion.button
                  onClick={handleToggleComplete}
                  className={cn(
                    'relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                    task.completed
                      ? 'bg-gradient-to-r from-teal-500 to-green-500 border-transparent'
                      : 'border-neutral-500 hover:border-purple-400 hover:bg-purple-500/10',
                    isCompleting && 'scale-110'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence>
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <FiCheck className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ripple effect */}
                  {isCompleting && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-teal-400/50"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </motion.button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'font-semibold text-base transition-all duration-300',
                      task.completed
                        ? 'line-through text-neutral-500'
                        : 'text-white'
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && viewMode === 'grid' && (
                    <p
                      className={cn(
                        'mt-1.5 text-sm line-clamp-2 transition-all duration-300',
                        task.completed
                          ? 'text-neutral-600'
                          : 'text-neutral-400'
                      )}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Meta info */}
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-3 mt-3">
                      {task.created_at && (
                        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {formatDate(task.created_at)}
                        </span>
                      )}
                      {task.completed && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          Done
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={cn(
                'flex items-center gap-2',
                viewMode === 'grid' ? 'justify-end' : ''
              )}>
                {/* Action buttons - always visible on mobile, hover on desktop */}
                <div className={cn(
                  'flex items-center gap-1 transition-opacity duration-200',
                  viewMode === 'grid' ? 'sm:opacity-0 sm:group-hover:opacity-100' : ''
                )}>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Edit task"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Delete task"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
