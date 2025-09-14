import { Task } from '../types';

export interface TaskSuggestion {
  title: string;
  description: string;
  estimatedDays: number;
  suggestedAssignee?: string;
  dependencies: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface TimelineAdjustment {
  taskId: string;
  currentDueDate: string;
  suggestedDueDate: string;
  reason: string;
  impact: 'low' | 'medium' | 'high';
}

// AI Placeholder: Suggest task details based on input
export async function suggestTaskDetails(input: string): Promise<TaskSuggestion> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mock AI suggestions based on keywords
  const mockSuggestions: Record<string, TaskSuggestion> = {
    'design': {
      title: 'UI/UX Design Phase',
      description: 'Create comprehensive design system including wireframes, mockups, and component library',
      estimatedDays: 14,
      suggestedAssignee: 'Design Team Lead',
      dependencies: [],
      priority: 'high',
    },
    'frontend': {
      title: 'Frontend Implementation',
      description: 'Implement responsive user interface based on approved designs',
      estimatedDays: 21,
      suggestedAssignee: 'Frontend Developer',
      dependencies: ['design-task'],
      priority: 'high',
    },
    'backend': {
      title: 'Backend API Development',
      description: 'Build REST API endpoints with proper authentication and data validation',
      estimatedDays: 18,
      suggestedAssignee: 'Backend Developer',
      dependencies: [],
      priority: 'high',
    },
    'testing': {
      title: 'Quality Assurance Testing',
      description: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing',
      estimatedDays: 10,
      suggestedAssignee: 'QA Engineer',
      dependencies: ['frontend-task', 'backend-task'],
      priority: 'medium',
    },
    'deployment': {
      title: 'Production Deployment',
      description: 'Deploy application to production environment with monitoring and rollback procedures',
      estimatedDays: 5,
      suggestedAssignee: 'DevOps Engineer',
      dependencies: ['testing-task'],
      priority: 'medium',
    },
  };

  // Simple keyword matching
  const inputLower = input.toLowerCase();
  const matchedKey = Object.keys(mockSuggestions).find(key =>
    inputLower.includes(key) || key.includes(inputLower.split(' ')[0])
  );

  if (matchedKey) {
    return mockSuggestions[matchedKey];
  }

  // Default generic suggestion
  return {
    title: `Task: ${input}`,
    description: `Complete the ${input} phase of the project with proper documentation and testing`,
    estimatedDays: 7,
    suggestedAssignee: 'Project Team Member',
    dependencies: [],
    priority: 'medium',
  };
}

// AI Placeholder: Predict timeline adjustments based on current tasks
export async function predictTimelineAdjustments(tasks: Task[]): Promise<TimelineAdjustment[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

  const adjustments: TimelineAdjustment[] = [];
  const today = new Date();

  tasks.forEach(task => {
    if (!task.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Simulate AI logic for timeline adjustments
    if (task.status === 'todo' && daysDiff < 3) {
      // Task is overdue or due soon but not started
      const newDueDate = new Date(today);
      newDueDate.setDate(today.getDate() + 7);

      adjustments.push({
        taskId: task.id,
        currentDueDate: task.dueDate,
        suggestedDueDate: newDueDate.toISOString().split('T')[0],
        reason: 'Task not started and deadline is approaching. Recommended 7-day extension.',
        impact: daysDiff < 0 ? 'high' : 'medium',
      });
    } else if (task.status === 'in-progress' && task.dependencies.length > 0) {
      // Check if dependencies might cause delays
      const hasIncompleteDependencies = task.dependencies.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'completed';
      });

      if (hasIncompleteDependencies && daysDiff < 10) {
        const newDueDate = new Date(dueDate);
        newDueDate.setDate(dueDate.getDate() + 5);

        adjustments.push({
          taskId: task.id,
          currentDueDate: task.dueDate,
          suggestedDueDate: newDueDate.toISOString().split('T')[0],
          reason: 'Dependent tasks not completed. Consider 5-day buffer to prevent cascade delays.',
          impact: 'medium',
        });
      }
    } else if (task.isMilestone && task.status !== 'completed' && daysDiff < 5) {
      // Critical milestone at risk
      const newDueDate = new Date(dueDate);
      newDueDate.setDate(dueDate.getDate() + 10);

      adjustments.push({
        taskId: task.id,
        currentDueDate: task.dueDate,
        suggestedDueDate: newDueDate.toISOString().split('T')[0],
        reason: 'Critical milestone at risk. Recommend 10-day extension to ensure quality delivery.',
        impact: 'high',
      });
    }
  });

  // Add some random positive adjustments (early completion possibilities)
  if (Math.random() > 0.7 && tasks.length > 0) {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      if (randomTask.dueDate && randomTask.status === 'in-progress') {
        const dueDate = new Date(randomTask.dueDate);
        const earlyDate = new Date(dueDate);
        earlyDate.setDate(dueDate.getDate() - 3);

        if (earlyDate > today) {
          adjustments.push({
            taskId: randomTask.id,
            currentDueDate: randomTask.dueDate,
            suggestedDueDate: earlyDate.toISOString().split('T')[0],
            reason: 'Team is performing well. This task could potentially be completed 3 days early.',
            impact: 'low',
          });
        }
      }
    }
  }

  return adjustments;
}

// AI Placeholder: Generate task insights and recommendations
export async function generateProjectInsights(tasks: Task[]): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const insights: string[] = [];

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const milestones = tasks.filter(t => t.isMilestone);

  if (completedTasks.length / tasks.length > 0.7) {
    insights.push("🎉 Great progress! Over 70% of tasks are completed. You're on track for successful project delivery.");
  }

  if (inProgressTasks.length > 5) {
    insights.push("⚠️ You have many tasks in progress. Consider focusing on completing current tasks before starting new ones.");
  }

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 'completed';
  });

  if (overdueTasks.length > 0) {
    insights.push(`🚨 ${overdueTasks.length} task(s) are overdue. Prioritize these immediately to prevent project delays.`);
  }

  if (milestones.length > 0) {
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    insights.push(`🏆 Milestone progress: ${completedMilestones.length}/${milestones.length} completed.`);
  }

  const tasksWithoutAssignee = tasks.filter(t => !t.assignee);
  if (tasksWithoutAssignee.length > 0) {
    insights.push(`👤 ${tasksWithoutAssignee.length} task(s) need assignment. Assign these to team members to improve accountability.`);
  }

  return insights;
}