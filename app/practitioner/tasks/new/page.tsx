'use client';

/**
 * New Task Page
 * Create a new task for your practice
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Container {
  id: string;
  scope: string | null;
  type: string;
  participants: Array<{ displayName: string }>;
}

interface Practice {
  id: string;
  name: string;
}

function NewTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContainerId = searchParams.get('containerId');

  const [practice, setPractice] = useState<Practice | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [containerId, setContainerId] = useState(preselectedContainerId || '');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // Get practice
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPractice(practices[0]);

        // Get containers
        const containersRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/containers?status=active,inquiry,paused`
        );
        if (!containersRes.ok) throw new Error('Failed to load containers');
        const { containers: containerList } = await containersRes.json();
        setContainers(containerList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practice || !title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/practitioner/practices/${practice.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          containerId: containerId || null,
          dueAt: dueDate ? new Date(dueDate).toISOString() : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      const { task } = await res.json();
      router.push(`/practitioner/tasks/${task.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSaving(false);
    }
  };

  const getContainerLabel = (c: Container) => {
    if (c.scope) return c.scope;
    if (c.participants.length > 0) {
      return c.participants.map(p => p.displayName).join(', ');
    }
    return `${c.type} container`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-800 rounded" />
              <div className="h-12 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-medium text-white">New Task</h1>
        </header>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Container (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Related Container <span className="text-gray-500">(optional)</span>
            </label>
            <select
              value={containerId}
              onChange={(e) => setContainerId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              <option value="">No container (general task)</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>
                  {getContainerLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700
                       disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-800 rounded" />
              <div className="h-12 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    }>
      <NewTaskContent />
    </Suspense>
  );
}
