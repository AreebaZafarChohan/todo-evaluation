// T017-T020: TaskItem with 3D card and animations
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import UpdateTaskForm from './UpdateTaskForm';
import { Card3D } from '@/components/ui/3d-card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiEdit2, FiTrash2, FiCheck, FiCircle } from 'react-icons/fi';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
  index?: number;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
  index = 0
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
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });
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
    // Small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, prefersReducedMotion ? 0 : 300));
    onToggleComplete(task);
    setIsCompleting(false);
  };

  const handleUpdateSuccess = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  // T018: Entrance animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
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
    // T020: Exit animation
    exit: {
      opacity: 0,
      scale: 0.9,
      x: -100,
      transition: {
        duration: 0.2,
      }
    },
  };

  // T019: Completion animation
  const completionVariants = {
    incomplete: { scale: 1 },
    completing: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 }
    },
    complete: { scale: 1 },
  };

  return (
    <motion.div
      layout
      variants={prefersReducedMotion ? {} : cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card3D
        containerClassName="w-full"
        className={cn(
          'p-4 rounded-xl border transition-all duration-300',
          task.completed
            ? 'bg-[var(--muted)]/50 border-[var(--card-border)]'
            : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--primary-500)]/30',
          isCompleting && 'ring-2 ring-[var(--success)]/50'
        )}
        rotationIntensity={task.completed ? 5 : 10}
        glareEnabled={!task.completed}
      >
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              className="flex items-start gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Checkbox with animation */}
              <motion.button
                onClick={handleToggleComplete}
                variants={completionVariants}
                animate={isCompleting ? 'completing' : task.completed ? 'complete' : 'incomplete'}
                className={cn(
                  'mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  task.completed
                    ? 'bg-[var(--success)] border-[var(--success)] text-white'
                    : 'border-[var(--neutral-400)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/10'
                )}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                <AnimatePresence>
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <FiCheck className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-medium text-base transition-all duration-200',
                    task.completed
                      ? 'line-through text-[var(--muted-foreground)]'
                      : 'text-[var(--foreground)]'
                  )}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={cn(
                      'mt-1 text-sm transition-all duration-200',
                      task.completed
                        ? 'line-through text-[var(--muted-foreground)]/60'
                        : 'text-[var(--muted-foreground)]'
                    )}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg bg-[var(--primary-500)]/10 text-[var(--primary-500)] hover:bg-[var(--primary-500)]/20 transition-colors"
                  aria-label="Edit task"
                >
                  <FiEdit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isLoading
                      ? 'bg-[var(--error)]/50 text-[var(--error)]/50 cursor-not-allowed'
                      : 'bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20'
                  )}
                  aria-label="Delete task"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FiCircle className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card3D>
    </motion.div>
  );
}
