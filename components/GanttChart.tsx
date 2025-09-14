import { Task } from '@/lib/types';

interface GanttChartProps {
  tasks: Task[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  const getTaskDuration = (task: Task) => {
    if (!task.dueDate) return 7; // Default 7 days
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const getTaskProgress = (task: Task) => {
    switch (task.status) {
      case 'completed': return 100;
      case 'in-progress': return 60;
      default: return 0;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const generateTimelineColumns = () => {
    const columns = [];
    const today = new Date();

    for (let i = -5; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      columns.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: i === 0,
        isPast: i < 0,
      });
    }
    return columns;
  };

  const timelineColumns = generateTimelineColumns();

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium text-gray-900">Project Timeline (Static Placeholder)</h3>
        <p className="text-sm text-gray-500 mt-1">
          This is a static mockup of a Gantt chart. In a real implementation, this would be interactive with drag-and-drop functionality.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header */}
          <div className="flex border-b bg-gray-50">
            <div className="w-64 p-3 font-medium text-gray-700 border-r">Task</div>
            <div className="flex-1 flex">
              {timelineColumns.map((col, index) => (
                <div
                  key={index}
                  className={`flex-1 min-w-[30px] p-2 text-xs text-center border-r ${
                    col.isToday ? 'bg-blue-100 text-blue-800' :
                    col.isPast ? 'bg-gray-100 text-gray-500' : 'text-gray-600'
                  }`}
                >
                  {col.date}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          {tasks.map((task, taskIndex) => {
            const duration = getTaskDuration(task);
            const progress = getTaskProgress(task);
            const startOffset = Math.max(0, Math.min(20, taskIndex * 3 + 5)); // Mock start position

            return (
              <div key={task.id} className="flex border-b hover:bg-gray-50">
                <div className="w-64 p-3 border-r">
                  <div className="flex items-center gap-2">
                    {task.isMilestone && <span className="text-yellow-500">🏆</span>}
                    <div>
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {task.assignee || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative p-2">
                  <div className="flex h-8 items-center">
                    {/* Task Bar */}
                    <div
                      className="relative h-6 rounded"
                      style={{
                        marginLeft: `${(startOffset / timelineColumns.length) * 100}%`,
                        width: `${Math.min(60, (duration / timelineColumns.length) * 100)}%`,
                      }}
                    >
                      <div className={`h-full rounded ${getStatusColor(task.status)} opacity-80`}>
                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div
                            className="h-full bg-white bg-opacity-30 rounded"
                            style={{ width: `${progress}%` }}
                          />
                        )}
                      </div>

                      {/* Task Label */}
                      <div className="absolute -top-6 left-0 text-xs text-gray-600">
                        {task.status === 'completed' ? '✅' :
                         task.status === 'in-progress' ? '🚧' : '⏳'}
                        {progress}%
                      </div>

                      {/* Dependencies Connector (Mock) */}
                      {task.dependencies.length > 0 && (
                        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-0.5 bg-gray-400"></div>
                          <div className="absolute -left-1 -top-0.5 w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to display</h3>
          <p className="text-sm text-gray-500">Add some tasks to see them in the Gantt chart</p>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-gray-300 rounded"></div>
            <span>To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <span>Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
}