export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'completed';
  dependencies: string[];
  isMilestone: boolean;
  parentId?: string;
  projectId: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: 'active' | 'completed' | 'on-hold';
}

export interface TaskUpdate {
  type: 'task_updated' | 'task_created' | 'task_deleted';
  task: Task;
  timestamp: string;
}