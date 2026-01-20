'use client';

import { useState } from 'react';
import { Task } from '@/src/types/task';
import UpdateTaskForm from './UpdateTaskForm';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleUpdateSuccess = (updatedTask: Task) => {
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  return (
    <li className="py-4">
      {isEditing ? (
        <UpdateTaskForm 
          task={task} 
          onUpdateSuccess={handleUpdateSuccess} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <div className="ml-3 min-w-0 flex-1">
            <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-500'}`}>
                {task.description}
              </p>
            )}
          </div>
          <div className="ml-4 flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white ${
                isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}