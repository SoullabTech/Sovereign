'use client';

/**
 * Venture Detail Page
 * View and manage a specific venture
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Venture {
  id: string;
  name: string;
  description: string | null;
  ventureType: string;
  status: string;
  priority: number;
  targetStartDate: string | null;
  targetEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  estimatedHours: number | null;
  actualHours: number;
  budgetCents: number | null;
  spentCents: number;
  tags: string[];
  notes: string | null;
  openTasks: number;
  collaboratorCount: number;
  collaborators: Array<{
    id: string;
    personId: string;
    role: string;
    allocatedHours: number | null;
    personName: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const VENTURE_TYPES: Record<string, string> = {
  maia_rd: 'MAIA R&D',
  soullab_rd: 'Soullab R&D',
  marketing: 'Marketing',
  sales: 'Sales',
  partnership: 'Partnership',
  operations: 'Operations',
  content: 'Content',
  events: 'Events',
};

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  planning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  idea: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  on_hold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Someday',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function VentureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ventureId = params.ventureId as string;

  const [venture, setVenture] = useState<Venture | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);

        const ventureRes = await apiFetch(
          `/api/practitioner/practices/${practices[0].id}/labtools/ventures/${ventureId}`
        );
        if (!ventureRes.ok) throw new Error('Failed to load venture');
        const { venture: v } = await ventureRes.json();
        setVenture(v);
        setEditName(v.name);
        setEditDescription(v.description || '');
        setEditStatus(v.status);
        setEditNotes(v.notes || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, ventureId]);

  const handleSave = async () => {
    if (!practiceId || !venture) return;

    setIsSaving(true);
    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures/${venture.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editName,
            description: editDescription || null,
            status: editStatus,
            notes: editNotes || null,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to update');

      setVenture(prev => prev ? {
        ...prev,
        name: editName,
        description: editDescription || null,
        status: editStatus,
        notes: editNotes || null,
      } : null);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!practiceId || !venture) return;
    if (!confirm('Delete this venture? This cannot be undone.')) return;

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures/${venture.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/practitioner/labtools/ventures');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-64" />
          <div className="h-32 bg-gray-800 rounded-lg" />
          <div className="h-48 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !venture) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error || 'Venture not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/practitioner/labtools/ventures')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-medium text-white bg-gray-800 border border-gray-700 rounded px-2 py-1"
              />
            ) : (
              <h1 className="text-xl font-medium text-white">{venture.name}</h1>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {VENTURE_TYPES[venture.ventureType]} · {PRIORITY_LABELS[venture.priority]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </header>

      {/* Status */}
      <div className="mb-6">
        {isEditing ? (
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        ) : (
          <span className={`px-3 py-1 rounded-lg text-sm border ${STATUS_COLORS[venture.status]}`}>
            {venture.status}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Description</h2>
        {isEditing ? (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            placeholder="What's this venture about?"
          />
        ) : (
          <p className="text-gray-300">{venture.description || 'No description'}</p>
        )}
      </div>

      {/* Timeline & Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Timeline</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Start</span>
              <span className="text-white">{formatDate(venture.targetStartDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target End</span>
              <span className="text-white">{formatDate(venture.targetEndDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-white">{formatDate(venture.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Metrics</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Open Tasks</span>
              <span className="text-white">{venture.openTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collaborators</span>
              <span className="text-white">{venture.collaboratorCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hours Logged</span>
              <span className="text-white">{venture.actualHours || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-2">Notes</h2>
        {isEditing ? (
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            placeholder="Working notes, links, ideas..."
          />
        ) : (
          <p className="text-gray-300 whitespace-pre-wrap">{venture.notes || 'No notes'}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/practitioner/tasks/new?ventureId=${venture.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + Add Task
        </Link>
        <Link
          href={`/practitioner/labtools/meetings/new?ventureId=${venture.id}`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          + Schedule Meeting
        </Link>
      </div>
    </div>
  );
}
