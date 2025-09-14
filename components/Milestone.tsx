import { Task } from '@/lib/types';

interface MilestoneProps {
  task: Task;
  className?: string;
  onClick?: () => void;
}

export default function Milestone({ task, className = '', onClick }: MilestoneProps) {
  if (!task.isMilestone) return null;

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-green-500 border-green-600';
      case 'in-progress': return 'bg-blue-500 border-blue-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded ${className}`}
      onClick={onClick}
    >
      <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor()}`}></div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          🏆 {task.title}
        </h4>
        <p className="text-sm text-gray-600">{task.description}</p>
        {task.dueDate && (
          <p className="text-xs text-gray-500 mt-1">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="text-right">
        <span className="text-xs font-medium text-gray-600">
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}