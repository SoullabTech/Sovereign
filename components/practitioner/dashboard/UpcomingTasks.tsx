'use client';

/**
 * UpcomingTasks
 * Shows tasks in the care horizon.
 * Simple list with due dates, no urgency colors.
 */

interface UpcomingTask {
  id: string;
  title: string;
  dueAt: string | null;
  containerId: string | null;
  containerScope: string | null;
}

interface UpcomingTasksProps {
  tasks: UpcomingTask[];
  onTaskClick?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
}

function formatDueDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) {
    return taskDate.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function UpcomingTasks({ tasks, onTaskClick, onTaskComplete }: UpcomingTasksProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200/60 p-6">
      <h2 className="text-xs font-medium tracking-wider text-stone-400 uppercase mb-4">
        Care Horizon · Tasks
      </h2>

      {tasks.length === 0 ? (
        <p className="text-sm text-stone-400 italic">No upcoming tasks</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-start gap-3 py-2 px-3 rounded hover:bg-stone-50 transition-colors group"
            >
              <button
                onClick={() => onTaskComplete?.(task.id)}
                className="mt-0.5 w-4 h-4 rounded-full border-2 border-stone-300
                         hover:border-stone-400 hover:bg-stone-100 transition-colors
                         flex-shrink-0"
                aria-label="Complete task"
              />
              <button
                onClick={() => onTaskClick?.(task.id)}
                className="flex-1 text-left"
              >
                <span className="text-sm text-stone-700">{task.title}</span>
              </button>
              {task.dueAt && (
                <span className="text-xs text-stone-400 tabular-nums flex-shrink-0">
                  {formatDueDate(new Date(task.dueAt))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
