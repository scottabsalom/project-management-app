import { Project, Task } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern UI/UX',
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 'proj-2',
    title: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android',
    createdAt: '2024-02-01',
    status: 'active',
  },
  {
    id: 'proj-3',
    title: 'Data Analytics Platform',
    description: 'Business intelligence and analytics dashboard',
    createdAt: '2024-01-20',
    status: 'on-hold',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design System Creation',
    description: 'Create comprehensive design system with components and guidelines',
    assignee: 'Sarah Johnson',
    dueDate: '2024-03-15',
    status: 'in-progress',
    dependencies: [],
    isMilestone: true,
    projectId: 'proj-1',
  },
  {
    id: 'task-2',
    title: 'Homepage Wireframes',
    description: 'Create wireframes for the new homepage layout',
    assignee: 'Mike Chen',
    dueDate: '2024-03-10',
    status: 'completed',
    dependencies: ['task-1'],
    isMilestone: false,
    projectId: 'proj-1',
  },
  {
    id: 'task-3',
    title: 'Frontend Development',
    description: 'Implement the frontend components based on designs',
    assignee: 'Alex Rodriguez',
    dueDate: '2024-04-01',
    status: 'todo',
    dependencies: ['task-1', 'task-2'],
    isMilestone: false,
    projectId: 'proj-1',
  },
  {
    id: 'task-4',
    title: 'Backend API Setup',
    description: 'Set up REST API endpoints and database schema',
    assignee: 'Emily Davis',
    dueDate: '2024-03-25',
    status: 'in-progress',
    dependencies: [],
    isMilestone: false,
    projectId: 'proj-1',
  },
  {
    id: 'task-5',
    title: 'User Authentication System',
    description: 'Implement secure user login and registration',
    assignee: 'David Wilson',
    dueDate: '2024-03-20',
    status: 'todo',
    dependencies: ['task-4'],
    isMilestone: false,
    parentId: 'task-4',
    projectId: 'proj-1',
  },
  {
    id: 'task-6',
    title: 'iOS App Development',
    description: 'Native iOS application development',
    assignee: 'Lisa Park',
    dueDate: '2024-05-01',
    status: 'in-progress',
    dependencies: [],
    isMilestone: true,
    projectId: 'proj-2',
  },
  {
    id: 'task-7',
    title: 'Android App Development',
    description: 'Native Android application development',
    assignee: 'James Brown',
    dueDate: '2024-05-15',
    status: 'todo',
    dependencies: [],
    isMilestone: true,
    projectId: 'proj-2',
  },
];

// In-memory data store
let projects = [...mockProjects];
let tasks = [...mockTasks];

export const dataStore = {
  getProjects: () => projects,
  getProject: (id: string) => projects.find(p => p.id === id),
  getTasks: (projectId?: string) =>
    projectId ? tasks.filter(t => t.projectId === projectId) : tasks,
  getTask: (id: string) => tasks.find(t => t.id === id),
  createTask: (task: Task) => {
    tasks.push(task);
    return task;
  },
  updateTask: (id: string, updates: Partial<Task>) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      return tasks[index];
    }
    return null;
  },
  deleteTask: (id: string) => {
    tasks = tasks.filter(t => t.id !== id);
  },
};