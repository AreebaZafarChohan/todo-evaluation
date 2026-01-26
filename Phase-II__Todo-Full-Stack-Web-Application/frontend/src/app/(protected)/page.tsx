// T031: Dashboard page with analytics and quick actions
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task } from '@/types/task';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiBarChart2, 
  FiPlus, 
  FiTrendingUp, 
  FiActivity 
} from 'react-icons/fi';
import { GradientButton } from '@/components/ui/gradient-button';
import Link from 'next/link';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data: Task[] = await apiClient.get('/tasks');
      setTasks(data);

      // Calculate stats
      const total = data.length;
      const completed = data.filter((t: Task) => t.completed).length;
      const pending = total - completed;
      // Note: dueDate feature not yet implemented
      const overdue = 0;

      setStats({ total, completed, pending, overdue });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'text-[var(--primary-500)]',
      bgColor: 'bg-[var(--primary-500)]/10'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'text-[var(--success)]',
      bgColor: 'bg-[var(--success)]/10'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <FiClock className="w-6 h-6" />,
      color: 'text-[var(--warning)]',
      bgColor: 'bg-[var(--warning)]/10'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'text-[var(--error)]',
      bgColor: 'bg-[var(--error)]/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Welcome back!</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Here's what's happening with your tasks today
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className={cn(
              'p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]',
              'hover:shadow-lg transition-all duration-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{stat.title}</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">{stat.value}</p>
              </div>
              <div className={cn(stat.bgColor, 'p-3 rounded-lg', stat.color)}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions and recent tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/tasks">
                <GradientButton className="w-full justify-start">
                  <FiCheckCircle className="mr-2" />
                  View All Tasks
                </GradientButton>
              </Link>
              <Link href="/tasks">
                <GradientButton variant="outline" className="w-full justify-start">
                  <FiPlus className="mr-2" />
                  Create New Task
                </GradientButton>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent tasks */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="p-5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Tasks</h2>
              <Link href="/tasks">
                <span className="text-sm text-[var(--primary-500)] hover:underline">View all</span>
              </Link>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="w-12 h-12 text-[var(--muted-foreground)] mx-auto" />
                <p className="mt-2 text-[var(--muted-foreground)]">No tasks yet</p>
                <p className="text-sm text-[var(--muted-foreground)]/70">Create your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    className={cn(
                      'p-3 rounded-lg border',
                      task.completed 
                        ? 'border-[var(--success)]/30 bg-[var(--success)]/10' 
                        : 'border-[var(--card-border)] bg-[var(--background)]/50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        'font-medium',
                        task.completed 
                          ? 'text-[var(--muted-foreground)] line-through' 
                          : 'text-[var(--foreground)]'
                      )}>
                        {task.title}
                      </h3>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        task.completed 
                          ? 'bg-[var(--success)]/20 text-[var(--success)]' 
                          : 'bg-[var(--warning)]/20 text-[var(--warning)]'
                      )}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}