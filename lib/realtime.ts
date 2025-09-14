import { TaskUpdate } from './types';

export class MockWebSocketService {
  private listeners: ((update: TaskUpdate) => void)[] = [];
  private connected = false;

  connect() {
    this.connected = true;
    console.log('Mock WebSocket connected');

    // Simulate periodic random updates
    this.simulateRandomUpdates();

    // Listen for custom events from the app
    if (typeof window !== 'undefined') {
      window.addEventListener('taskUpdate', this.handleTaskUpdate as EventListener);
    }
  }

  disconnect() {
    this.connected = false;
    console.log('Mock WebSocket disconnected');

    if (typeof window !== 'undefined') {
      window.removeEventListener('taskUpdate', this.handleTaskUpdate as EventListener);
    }
  }

  subscribe(callback: (update: TaskUpdate) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private handleTaskUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<TaskUpdate>;
    this.broadcast(customEvent.detail);
  };

  private broadcast(update: TaskUpdate) {
    if (!this.connected) return;

    this.listeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  private simulateRandomUpdates() {
    if (!this.connected) return;

    // Simulate a random task update every 10-30 seconds
    const randomDelay = Math.random() * 20000 + 10000;

    setTimeout(() => {
      if (this.connected) {
        this.simulateTaskUpdate();
        this.simulateRandomUpdates(); // Schedule next update
      }
    }, randomDelay);
  }

  private simulateTaskUpdate() {
    const mockUpdates: TaskUpdate[] = [
      {
        type: 'task_updated',
        task: {
          id: 'task-2',
          title: 'Homepage Wireframes',
          description: 'Create wireframes for the new homepage layout - Updated with feedback',
          assignee: 'Mike Chen',
          dueDate: '2024-03-10',
          status: 'completed',
          dependencies: ['task-1'],
          isMilestone: false,
          projectId: 'proj-1',
        },
        timestamp: new Date().toISOString(),
      },
      {
        type: 'task_updated',
        task: {
          id: 'task-3',
          title: 'Frontend Development',
          description: 'Implement the frontend components based on designs',
          assignee: 'Alex Rodriguez',
          dueDate: '2024-04-01',
          status: 'in-progress',
          dependencies: ['task-1', 'task-2'],
          isMilestone: false,
          projectId: 'proj-1',
        },
        timestamp: new Date().toISOString(),
      },
    ];

    const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
    this.broadcast(randomUpdate);
  }
}

// Singleton instance
export const mockWebSocketService = new MockWebSocketService();

// Hook for React components
export function useRealTimeUpdates(
  onUpdate: (update: TaskUpdate) => void,
  deps: any[] = []
) {
  if (typeof window === 'undefined') return;

  const unsubscribe = mockWebSocketService.subscribe(onUpdate);

  // Auto-connect if not already connected
  if (!mockWebSocketService['connected']) {
    mockWebSocketService.connect();
  }

  return unsubscribe;
}

// Notification system
export function showUpdateNotification(update: TaskUpdate) {
  if (typeof window === 'undefined') return;

  const message = `Task "${update.task.title}" was ${
    update.type === 'task_created' ? 'created' :
    update.type === 'task_updated' ? 'updated' :
    'deleted'
  } by another user`;

  // Simple browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Project Update', {
      body: message,
      icon: '/favicon.ico',
    });
  } else {
    // Fallback to console or custom notification UI
    console.log('Real-time update:', message);
  }
}