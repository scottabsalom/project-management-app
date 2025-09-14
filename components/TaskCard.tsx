import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
};

const statusIcons = {
  'todo': '⏳',
  'in-progress': '🚧',
  'completed': '✅',
};

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate?.(task.id, { status: newStatus });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {task.isMilestone && <span className="text-yellow-500">🏆</span>}
          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
            {statusIcons[task.status]} {task.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">{task.description}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <span>👤</span>
            <span>{task.assignee}</span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {task.dependencies.length > 0 && (
          <div className="flex items-center gap-1">
            <span>🔗</span>
            <span>{task.dependencies.length} dependencies</span>
          </div>
        )}
      </div>

      {onUpdate && (
        <div className="mt-4 flex gap-2">
          {Object.keys(statusColors).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status as Task['status'])}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                task.status === status
                  ? statusColors[status as Task['status']]
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}