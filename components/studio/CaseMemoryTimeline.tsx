'use client';

/**
 * CaseMemoryTimeline — Chronological view of case memories
 *
 * Shows all memories saved from session reviews, ordered by formed_at DESC.
 * Each memory includes type, lens, session source, and a snippet of content.
 */

import { useState, useEffect } from 'react';
import { Sparkles, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface CaseMemory {
  id: string;
  memory_type: string;
  content: string;
  significance: number;
  review_lens_id: string | null;
  source_session_id: string;
  session_title: string | null;
  session_started_at: string;
  formed_at: string;
}

interface CaseMemoryTimelineProps {
  caseId: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLensLabel(lensId: string | null): string {
  if (!lensId) return 'General';
  const labels: Record<string, string> = {
    'core': 'Core',
    'spiralogic': 'Spiralogic',
    'mentor': 'Mentor',
  };
  return labels[lensId] || lensId;
}

function getMemoryTypeIcon(type: string) {
  switch (type) {
    case 'pattern':
      return '🔄';
    case 'breakthrough':
      return '⚡';
    case 'resistance':
      return '🚧';
    case 'theme':
      return '🧵';
    case 'integration':
      return '🔗';
    case 'observation':
      return '👁️';
    case 'protocol_signal':
      return '📋';
    case 'consultation':
      return '💬';
    default:
      return '✨';
  }
}

export function CaseMemoryTimeline({ caseId }: CaseMemoryTimelineProps) {
  const [memories, setMemories] = useState<CaseMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemories();
  }, [caseId]);

  async function fetchMemories() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/caseload/${caseId}/memories/list`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch memories');
      }

      setMemories(data.memories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <div className="inline-block">
          <div className="w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
        </div>
        <p className="text-sm text-slate-500 mt-2">Loading memories…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-sm text-slate-500">
          No memories yet. Complete a session review and accept memories to build this timeline.
        </p>
      </div>
    );
  }

  // Group memories by date
  const grouped: Record<string, CaseMemory[]> = {};
  memories.forEach(m => {
    const dateKey = formatDate(m.formed_at);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(m);
  });

  const dates = Object.keys(grouped);

  return (
    <div className="space-y-4">
      {dates.map(dateLabel => (
        <div key={dateLabel}>
          {/* Date header */}
          <div className="px-4 py-2 flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
            <Clock className="w-3 h-3" />
            {dateLabel}
          </div>

          {/* Memories for this date */}
          <div className="space-y-2">
            {grouped[dateLabel].map(memory => (
              <div
                key={memory.id}
                className="px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600/70 transition-colors"
              >
                {/* Header: Type + Lens */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMemoryTypeIcon(memory.memory_type)}</span>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {memory.memory_type.replace('_', ' ')}
                      </p>
                      {memory.session_title && (
                        <p className="text-xs text-slate-500">
                          from "{memory.session_title}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {memory.significance && (
                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded">
                        {(memory.significance * 100).toFixed(0)}%
                      </span>
                    )}
                    {memory.review_lens_id && (
                      <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 rounded">
                        {getLensLabel(memory.review_lens_id)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content snippet */}
                <p className="text-sm text-slate-400 line-clamp-2">
                  {memory.content.substring(0, 180)}
                  {memory.content.length > 180 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
