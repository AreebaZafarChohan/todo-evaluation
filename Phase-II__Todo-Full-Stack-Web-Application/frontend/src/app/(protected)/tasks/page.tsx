// T023-T024: Tasks page with animations and responsive grid
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task } from '@/types/task';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import { AnimatedText } from '@/components/ui/animated-text';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiClipboard, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data: Task[] = await apiClient.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]); // Add to beginning for visibility
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask: Task = await apiClient.patch(`/tasks/${task.id}/complete`, {
        completed: !task.completed
      });
      handleTaskUpdated(updatedTask);
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full"
          />
          <p className="text-[var(--muted-foreground)]">Loading your tasks...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20"
        >
          <p className="text-xl text-[var(--error)]">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--error)] text-white hover:bg-[var(--error)]/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <AnimatedText delay={0} direction="up" as="h1">
            <span className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              My Tasks
            </span>
          </AnimatedText>
          <AnimatedText delay={0.1} direction="up">
            <p className="mt-2 text-[var(--muted-foreground)]">
              Manage your to-dos efficiently
            </p>
          </AnimatedText>

          {/* Stats */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-6 mt-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
              <FiClipboard className="w-5 h-5 text-[var(--primary-500)]" />
              <span className="font-semibold">{tasks.length}</span>
              <span className="text-[var(--muted-foreground)]">Total</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--success)]/10 text-[var(--success)]">
              <FiCheckCircle className="w-5 h-5" />
              <span className="font-semibold">{completedTasks}</span>
              <span className="opacity-70">Done</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--warning)]/10 text-[var(--warning)]">
              <FiClock className="w-5 h-5" />
              <span className="font-semibold">{pendingTasks}</span>
              <span className="opacity-70">Pending</span>
            </div>
          </motion.div>
        </div>

        {/* Create Task Form */}
        <CreateTaskForm onTaskCreated={handleTaskCreated} />

        {/* Task List */}
        {tasks.length === 0 ? (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-8 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]"
          >
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiClipboard className="mx-auto h-16 w-16 text-[var(--muted-foreground)]" />
            </motion.div>
            <h3 className="mt-4 text-lg font-medium text-[var(--foreground)]">No tasks yet</h3>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Get started by creating your first task above.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={cn(
              'grid gap-4',
              // T024: Responsive grid layout
              'grid-cols-1 md:grid-cols-2'
            )}
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onToggleComplete={handleToggleComplete}
                  onUpdate={handleTaskUpdated}
                  onDelete={handleTaskDeleted}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
