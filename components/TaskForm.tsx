'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { suggestTaskDetails, TaskSuggestion } from '@/lib/ai/placeholders';
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  projectId: string;
  existingTasks: Task[];
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  initialTask?: Partial<Task>;
}

export default function TaskForm({
  projectId,
  existingTasks,
  onSubmit,
  onCancel,
  initialTask
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    assignee: initialTask?.assignee || '',
    dueDate: initialTask?.dueDate || '',
    status: initialTask?.status || 'todo' as Task['status'],
    dependencies: initialTask?.dependencies || [],
    isMilestone: initialTask?.isMilestone || false,
    parentId: initialTask?.parentId || '',
  });

  const [aiSuggestion, setAiSuggestion] = useState<TaskSuggestion | null>(null);
  const [loadingAiSuggestion, setLoadingAiSuggestion] = useState(false);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      projectId,
    });
  };

  const handleDependencyChange = (taskId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dependencies: checked
        ? [...prev.dependencies, taskId]
        : prev.dependencies.filter(id => id !== taskId)
    }));
  };

  const handleAiSuggestion = async () => {
    if (!formData.title.trim()) return;

    setLoadingAiSuggestion(true);
    try {
      const suggestion = await suggestTaskDetails(formData.title);
      setAiSuggestion(suggestion);
      setShowAiSuggestion(true);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setLoadingAiSuggestion(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;

    const suggestedDueDate = new Date();
    suggestedDueDate.setDate(suggestedDueDate.getDate() + aiSuggestion.estimatedDays);

    setFormData(prev => ({
      ...prev,
      description: aiSuggestion.description,
      assignee: aiSuggestion.suggestedAssignee || prev.assignee,
      dueDate: suggestedDueDate.toISOString().split('T')[0],
    }));

    setShowAiSuggestion(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {initialTask ? 'Edit Task' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <button
              type="button"
              onClick={handleAiSuggestion}
              disabled={loadingAiSuggestion || !formData.title.trim()}
              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {loadingAiSuggestion ? '🤖 Thinking...' : '🤖 AI Suggest'}
            </button>
          </div>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="milestone"
              checked={formData.isMilestone}
              onChange={(e) => setFormData(prev => ({ ...prev, isMilestone: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="milestone" className="ml-2 block text-sm text-gray-700">
              Mark as milestone
            </label>
          </div>
        </div>

        {existingTasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependencies
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {existingTasks.map((task) => (
                <label key={task.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dependencies.includes(task.id)}
                    onChange={(e) => handleDependencyChange(task.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">{task.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {initialTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>

      {/* AI Suggestion Panel */}
      {showAiSuggestion && aiSuggestion && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-purple-900">🤖 AI Suggestion</h4>
            <button
              onClick={() => setShowAiSuggestion(false)}
              className="text-purple-400 hover:text-purple-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Description:</strong> {aiSuggestion.description}</p>
            {aiSuggestion.suggestedAssignee && (
              <p><strong>Suggested Assignee:</strong> {aiSuggestion.suggestedAssignee}</p>
            )}
            <p><strong>Estimated Duration:</strong> {aiSuggestion.estimatedDays} days</p>
            <p><strong>Priority:</strong>
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                aiSuggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                aiSuggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {aiSuggestion.priority}
              </span>
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={applyAiSuggestion}
              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
            >
              Apply Suggestion
            </button>
            <button
              onClick={() => setShowAiSuggestion(false)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}