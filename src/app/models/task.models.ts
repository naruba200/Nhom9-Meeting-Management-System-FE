export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Subtask {
  id?: number;
  title: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export interface Task {
  id?: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigneeEmail: string;
  createdByEmail?: string;
  meetingId: number;
  meetingTitle?: string;
  subtasks: Subtask[];
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigneeEmail: string;
  subtaskTitles?: string[];
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  assigneeEmail: string;
  subtaskTitles?: string[];
}

export interface TaskResponse extends Task {}
