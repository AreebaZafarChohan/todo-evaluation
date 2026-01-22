// src/types/task.ts

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
}

export interface TaskUpdate {
  title: string;
  description?: string | null;
  completed: boolean;
}