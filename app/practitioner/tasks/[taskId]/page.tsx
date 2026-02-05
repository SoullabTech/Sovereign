'use client';

/**
 * Task Detail Page
 * View and manage a single task
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Task {
  id: string;
  title: string;
  dueAt: string | null;
  status: string;
  containerId: string | null;
  containerScope: string | null;
  personId: string | null;
  personName: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    async function loadTask() {
      try {
        const res = await apiFetch(`/api/practitioner/tasks/${taskId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/practitioner/dashboard');
            return;
          }
          throw new Error('Failed to load task');
        }
        const data = await res.json();
        setTask(data.task);
        setEditTitle(data.task.title);
        setEditDueDate(data.task.dueAt ? data.task.dueAt.split('T')[0] : '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setIsLoading(false);
      }
    }
    loadTask();
  }, [taskId, router]);

  const updateTask = async (updates: Record<string, unknown>) => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const res = await apiFetch(`/api/practitioner/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setTask({ ...task, ...data.task });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = () => updateTask({ status: 'completed' });
  const handleReopen = () => updateTask({ status: 'open' });
  const handleCancel = () => updateTask({ status: 'cancelled' });

  const handleSaveEdit = async () => {
    await updateTask({
      title: editTitle.trim(),
      dueAt: editDueDate ? new Date(editDueDate).toISOString() : null
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await apiFetch(`/api/practitioner/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/practitioner/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Task not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = task.dueAt && task.status === 'open' && new Date(task.dueAt) < new Date();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <span className="text-sm text-gray-500">Task</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[task.status] || STATUS_COLORS.open}`}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
        </header>

        {/* Task Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg
                         text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg
                           text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editTitle.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                {task.status === 'open' && (
                  <button
                    onClick={handleComplete}
                    disabled={isUpdating}
                    className="mt-1 w-6 h-6 rounded-full border-2 border-gray-500 hover:border-green-500
                             hover:bg-green-500/20 transition-colors flex-shrink-0"
                  />
                )}
                {task.status === 'completed' && (
                  <div className="mt-1 w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-500
                                flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className={`text-xl text-white ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </h1>
                  {task.dueAt && (
                    <p className={`text-sm mt-2 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                      Due {formatDate(task.dueAt)}
                      {isOverdue && ' (overdue)'}
                    </p>
                  )}
                </div>
                {task.status === 'open' && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Related Container */}
              {task.containerId && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-sm text-gray-500 mb-1">Related to</p>
                  <button
                    onClick={() => router.push(`/practitioner/containers/${task.containerId}`)}
                    className="text-amber-500 hover:text-amber-400 flex items-center gap-2"
                  >
                    {task.containerScope || 'Container'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
              Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              {task.status === 'open' && (
                <>
                  <button
                    onClick={handleComplete}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                             text-white rounded-lg transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800
                             text-gray-300 rounded-lg transition-colors"
                  >
                    Cancel Task
                  </button>
                </>
              )}
              {task.status === 'completed' && (
                <button
                  onClick={handleReopen}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                           text-white rounded-lg transition-colors"
                >
                  Reopen
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30
                         text-red-400 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
