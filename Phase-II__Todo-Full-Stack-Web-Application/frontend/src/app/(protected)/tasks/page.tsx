// T023-T024: Stunning Tasks page with cosmic theme
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Task } from '@/types/task';
import CreateTaskForm from '@/components/tasks/CreateTaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import {
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiList,
  FiSearch,
  FiPlus,
  FiTrendingUp
} from 'react-icons/fi';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
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
    setTasks([newTask, ...tasks]);
    setShowCreateForm(false);
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

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' ||
                         (filter === 'active' && !task.completed) ||
                         (filter === 'completed' && task.completed);

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Animated loader */}
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-t-teal-400 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-neutral-400 text-lg">Loading your tasks...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl border border-red-500/30 bg-red-500/10 max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <FiClipboard className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <motion.button
            onClick={fetchTasks}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 10% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 90% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
                My Tasks
              </span>
            </h1>
            <p className="text-neutral-400">
              Stay organized and productive
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {/* Total Tasks */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500/50 to-teal-500/50 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <FiClipboard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{tasks.length}</p>
                    <p className="text-sm text-neutral-400">Total Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-teal-500/50 to-green-500/50 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-500/20">
                    <FiCheckCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{completedTasks}</p>
                    <p className="text-sm text-neutral-400">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/50 to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <FiClock className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{pendingTasks}</p>
                    <p className="text-sm text-neutral-400">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-pink-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-pink-500/20">
                    <FiTrendingUp className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{completionRate}%</p>
                    <p className="text-sm text-neutral-400">Done</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Bar */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="w-5 h-5 text-neutral-500" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder-neutral-500 transition-all duration-300
                  focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                  focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Filter & View Controls */}
            <div className="flex gap-3">
              {/* Filter Dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                  text-white transition-all duration-300 cursor-pointer
                  focus:outline-none focus:border-purple-500/50"
              >
                <option value="all" className="bg-neutral-900">All Tasks</option>
                <option value="active" className="bg-neutral-900">Active</option>
                <option value="completed" className="bg-neutral-900">Completed</option>
              </select>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-3.5 transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-3.5 transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              {/* Add Task Button */}
              <motion.button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-5 py-3.5 rounded-xl font-medium text-white flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
                }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <FiPlus className={cn('w-5 h-5 transition-transform', showCreateForm && 'rotate-45')} />
                <span className="hidden sm:inline">Add Task</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Create Task Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <CreateTaskForm onTaskCreated={handleTaskCreated} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                  <FiClipboard className="w-10 h-10 text-purple-400" />
                </div>
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-neutral-400 mb-6">
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Create your first task to get started'}
              </p>
              {!showCreateForm && filter === 'all' && !searchQuery && (
                <motion.button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 rounded-xl font-medium text-white inline-flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus className="w-5 h-5" />
                  Create Task
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onUpdate={handleTaskUpdated}
                    onDelete={handleTaskDeleted}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
