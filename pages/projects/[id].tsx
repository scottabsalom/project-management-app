import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { dataStore } from '@/lib/data/mockData';
import { Project, Task, TaskUpdate } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import Milestone from '@/components/Milestone';
import TaskForm from '@/components/TaskForm';
import GanttChart from '@/components/GanttChart';
import { useRealTimeUpdates, showUpdateNotification } from '@/lib/realtime';
import { generateProjectInsights, predictTimelineAdjustments, TimelineAdjustment } from '@/lib/ai/placeholders';
import { v4 as uuidv4 } from 'uuid';

interface ProjectDetailProps {
  project: Project;
  initialTasks: Task[];
}

type ViewMode = 'list' | 'gantt';

export default function ProjectDetail({ project, initialTasks }: ProjectDetailProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [timelineAdjustments, setTimelineAdjustments] = useState<TimelineAdjustment[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  const milestones = tasks.filter(task => task.isMilestone);
  const regularTasks = tasks.filter(task => !task.isMilestone);

  const handleCreateTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
    };

    setTasks(prev => [...prev, newTask]);
    setShowTaskForm(false);

    // Simulate real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('taskUpdate', {
        detail: { type: 'task_created', task: newTask, timestamp: new Date().toISOString() }
      }));
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));

    // Simulate real-time update
    if (typeof window !== 'undefined') {
      const updatedTask = tasks.find(t => t.id === taskId);
      if (updatedTask) {
        window.dispatchEvent(new CustomEvent('taskUpdate', {
          detail: {
            type: 'task_updated',
            task: { ...updatedTask, ...updates },
            timestamp: new Date().toISOString()
          }
        }));
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleUpdateEditingTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      handleUpdateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowTaskForm(false);
    }
  };

  const getTasksByStatus = () => {
    const statusGroups = {
      'todo': regularTasks.filter(t => t.status === 'todo'),
      'in-progress': regularTasks.filter(t => t.status === 'in-progress'),
      'completed': regularTasks.filter(t => t.status === 'completed'),
    };
    return statusGroups;
  };

  const statusGroups = getTasksByStatus();

  // Real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (update: TaskUpdate) => {
      if (update.task.projectId !== project.id) return;

      setTasks(prev => {
        switch (update.type) {
          case 'task_created':
            return [...prev, update.task];
          case 'task_updated':
            return prev.map(t => t.id === update.task.id ? update.task : t);
          case 'task_deleted':
            return prev.filter(t => t.id !== update.task.id);
          default:
            return prev;
        }
      });

      showUpdateNotification(update);
    };

    const unsubscribe = useRealTimeUpdates(handleRealtimeUpdate);
    return unsubscribe;
  }, [project.id]);

  // AI Insights
  const generateAiInsights = async () => {
    setLoadingAi(true);
    try {
      const [insights, adjustments] = await Promise.all([
        generateProjectInsights(tasks),
        predictTimelineAdjustments(tasks),
      ]);
      setAiInsights(insights);
      setTimelineAdjustments(adjustments);
      setShowAiPanel(true);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Project Header */}
      <div className="border-b border-gray-200 pb-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-6 text-gray-900">
              {project.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 List View
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'gantt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Gantt View
              </button>
            </div>
            <button
              onClick={generateAiInsights}
              disabled={loadingAi}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingAi ? '🤖 Analyzing...' : '🤖 AI Insights'}
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Milestones</h2>
          <div className="space-y-3">
            {milestones.map(milestone => (
              <Milestone
                key={milestone.id}
                task={milestone}
                className="cursor-pointer hover:bg-yellow-100"
                onClick={() => handleEditTask(milestone)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Task Form */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <TaskForm
              projectId={project.id}
              existingTasks={tasks.filter(t => t.id !== editingTask?.id)}
              onSubmit={editingTask ? handleUpdateEditingTask : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              initialTask={editingTask || undefined}
            />
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAiPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">🤖 AI Project Insights</h3>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Insights */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">📊 Project Analysis</h4>
                  <div className="space-y-2">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Adjustments */}
                {timelineAdjustments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">⏰ Timeline Recommendations</h4>
                    <div className="space-y-3">
                      {timelineAdjustments.map((adjustment, index) => {
                        const task = tasks.find(t => t.id === adjustment.taskId);
                        return (
                          <div key={index} className={`p-4 rounded-lg border ${
                            adjustment.impact === 'high' ? 'bg-red-50 border-red-200' :
                            adjustment.impact === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">
                                {task?.title || 'Unknown Task'}
                              </h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                adjustment.impact === 'high' ? 'bg-red-100 text-red-800' :
                                adjustment.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {adjustment.impact} impact
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{adjustment.reason}</p>
                            <div className="text-sm">
                              <span className="text-gray-500">Current due date: </span>
                              <span className="font-medium">{new Date(adjustment.currentDueDate).toLocaleDateString()}</span>
                              <span className="mx-2">→</span>
                              <span className="text-gray-500">Suggested: </span>
                              <span className="font-medium text-blue-600">{new Date(adjustment.suggestedDueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    These insights are generated by AI and should be reviewed by project managers before implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(statusGroups).map(([status, statusTasks]) => (
            <div key={status} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {status.replace('-', ' ')} ({statusTasks.length})
              </h3>
              <div className="space-y-4">
                {statusTasks.map(task => (
                  <div key={task.id} className="cursor-pointer" onClick={() => handleEditTask(task)}>
                    <TaskCard
                      task={task}
                      onUpdate={handleUpdateTask}
                    />
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No {status.replace('-', ' ')} tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Project Timeline</h2>
          <GanttChart tasks={tasks} />
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by creating your first task for this project
          </p>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Create First Task
          </button>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const project = dataStore.getProject(id as string);
  const tasks = dataStore.getTasks(id as string);

  if (!project) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project,
      initialTasks: tasks,
    },
  };
};