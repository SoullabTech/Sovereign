'use client';

/**
 * ProtocolList — components/studio/protocols/ProtocolList.tsx
 *
 * Per-client protocol listing for studio practitioners.
 * Columns: pattern name, type, week/6, status, last observation date.
 * Status filter tabs: All / Draft / Active / Paused / Completed.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Protocol {
  id: string;
  patternName: string;
  protocolType: string;
  status: string;
  currentWeek: number;
  lastObservationAt: string | null;
  createdAt: string;
}

const STATUS_FILTERS = ['all', 'draft', 'active', 'paused', 'completed'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-700 text-gray-300',
  active: 'bg-amber-900/60 text-amber-300',
  paused: 'bg-blue-900/60 text-blue-300',
  completed: 'bg-green-900/60 text-green-300',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

interface Props {
  clientId?: string;
  onSelect?: (protocol: Protocol) => void;
}

export function ProtocolList({ clientId, onSelect }: Props) {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (clientId) params.set('client_id', clientId);
    if (statusFilter !== 'all') params.set('status', statusFilter);

    apiFetch(`/api/studio/protocols?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setProtocols(data.protocols ?? []);
        }
      })
      .catch((err) => {
        setError('Failed to load protocols');
        console.error('[ProtocolList]', err);
      })
      .finally(() => setLoading(false));
  }, [clientId, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              statusFilter === f
                ? 'bg-amber-700 text-amber-100'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-sm text-gray-500 py-4 text-center">
          Loading protocols...
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-sm text-red-400 py-4 text-center">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && protocols.length === 0 && (
        <div className="text-sm text-gray-500 py-8 text-center">
          No protocols found.
          {statusFilter !== 'all' && (
            <button
              className="ml-2 text-amber-400 underline"
              onClick={() => setStatusFilter('all')}
            >
              Show all
            </button>
          )}
        </div>
      )}

      {/* Protocol table */}
      {!loading && !error && protocols.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="pb-2 pr-4 font-medium">Pattern</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Progress</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Last Observation</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    onSelect ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onSelect?.(p)}
                >
                  <td className="py-3 pr-4 text-gray-200 font-medium">
                    {p.patternName}
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {p.protocolType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 pr-4 text-gray-300">
                    Week {p.currentWeek}/6
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[p.status] ?? 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">
                    {formatDate(p.lastObservationAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
