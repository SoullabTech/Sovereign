'use client';

/**
 * Ventures List Page
 * View and filter business ventures
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  openTasks: number;
  upcomingMeetings: number;
}

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
  { value: 'active', label: 'Active' },
  { value: 'planning', label: 'Planning' },
  { value: 'idea', label: 'Idea' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
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

function VenturesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || 'active,planning,idea';

  const [ventures, setVentures] = useState<Venture[]>([]);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        let url = `/api/practitioner/practices/${practices[0].id}/labtools/ventures`;
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (params.toString()) url += `?${params.toString()}`;

        const venturesRes = await apiFetch(url);
        if (!venturesRes.ok) throw new Error('Failed to load ventures');
        const { ventures: ventureList } = await venturesRes.json();
        setVentures(ventureList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, typeFilter, statusFilter]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/practitioner/labtools/ventures?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">Ventures</h1>
        <Link
          href="/practitioner/labtools/ventures/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors"
        >
          + New Venture
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => updateFilters('type', e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="">All Types</option>
          {VENTURE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Status Pills */}
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => {
            const isActive = statusFilter.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => {
                  const current = statusFilter.split(',').filter(Boolean);
                  const updated = isActive
                    ? current.filter(v => v !== s.value)
                    : [...current, s.value];
                  updateFilters('status', updated.join(','));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive
                    ? STATUS_COLORS[s.value]
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ventures List */}
      {ventures.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500">No ventures found</p>
          <Link
            href="/practitioner/labtools/ventures/new"
            className="text-sm text-amber-400 hover:underline mt-2 inline-block"
          >
            Create your first venture
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {ventures.map(venture => (
            <Link
              key={venture.id}
              href={`/practitioner/labtools/ventures/${venture.id}`}
              className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{venture.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[venture.status]}`}>
                      {venture.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {VENTURE_TYPES.find(t => t.value === venture.ventureType)?.label || venture.ventureType}
                    {venture.priority && venture.priority !== 3 && (
                      <span className="ml-2">· {PRIORITY_LABELS[venture.priority]}</span>
                    )}
                  </p>
                  {venture.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{venture.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {venture.openTasks > 0 && (
                    <span>{venture.openTasks} tasks</span>
                  )}
                  {venture.upcomingMeetings > 0 && (
                    <span>{venture.upcomingMeetings} meetings</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VenturesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    }>
      <VenturesContent />
    </Suspense>
  );
}
