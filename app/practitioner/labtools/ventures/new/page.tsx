'use client';

/**
 * New Venture Page
 * Create a new business venture
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

const VENTURE_TYPES = [
  { value: 'maia_rd', label: 'MAIA R&D' },
  { value: 'soullab_rd', label: 'Soullab R&D' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'operations', label: 'Operations' },
  { value: 'content', label: 'Content' },
  { value: 'events', label: 'Events' },
];

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Critical' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Low' },
  { value: 5, label: 'Someday' },
];

export default function NewVenturePage() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ventureType, setVentureType] = useState('');
  const [status, setStatus] = useState('idea');
  const [priority, setPriority] = useState(3);
  const [targetStartDate, setTargetStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');

  useEffect(() => {
    async function loadPractice() {
      try {
        const res = await apiFetch('/api/practitioner/practices');
        if (!res.ok) throw new Error('Failed to load practice');
        const { practices } = await res.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadPractice();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId || !name.trim() || !ventureType) {
      setError('Name and type are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/practitioner/practices/${practiceId}/labtools/ventures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          ventureType,
          status,
          priority,
          targetStartDate: targetStartDate || null,
          targetEndDate: targetEndDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create venture');
      }

      const { venture } = await res.json();
      router.push(`/practitioner/labtools/ventures/${venture.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create venture');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-white">New Venture</h1>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What are you building?"
            required
            autoFocus
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type *
          </label>
          <select
            value={ventureType}
            onChange={(e) => setVentureType(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          >
            <option value="">Select type...</option>
            {VENTURE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the goal? What will success look like?"
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Start
            </label>
            <input
              type="date"
              value={targetStartDate}
              onChange={(e) => setTargetStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target End
            </label>
            <input
              type="date"
              value={targetEndDate}
              onChange={(e) => setTargetEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
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
            disabled={isSaving || !name.trim() || !ventureType}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700
                     disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {isSaving ? 'Creating...' : 'Create Venture'}
          </button>
        </div>
      </form>
    </div>
  );
}
