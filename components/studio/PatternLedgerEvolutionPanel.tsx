'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PatternRow {
  patternKey: string;
  patternLabel: string;
  patternType: string;
  recurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  latestSignificance: number;
  averageSignificance: number;
  maxSignificance: number;
  triggerContexts: string[];
  evidenceCount: number;
  status: string;
  weightedScore: number;
}

interface PatternLedgerEvolutionPanelProps {
  clientId: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function patternStatus(row: PatternRow): { label: string; color: string } {
  const daysSinceSeen = (Date.now() - new Date(row.lastSeenAt).getTime()) / (1000 * 60 * 60 * 24);
  const recency = daysSinceSeen <= 7 ? 1.0 : daysSinceSeen <= 30 ? 0.8 : daysSinceSeen <= 90 ? 0.55 : 0.3;

  if (recency < 0.55) {
    return { label: 'Receding', color: 'bg-slate-700/50 text-slate-400' };
  }
  if (row.recurrenceCount < 3) {
    return { label: 'Emerging', color: 'bg-amber-500/20 text-amber-400' };
  }
  return { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400' };
}

function PatternTypeBadge({ type }: { type: string }) {
  const styles =
    type === 'growth_edge'
      ? 'bg-violet-500/20 text-violet-400'
      : 'bg-sky-500/20 text-sky-400';
  const label = type === 'growth_edge' ? 'Growth Edge' : 'Pattern';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles}`}>{label}</span>
  );
}

function ScoreIndicator({ score }: { score: number }) {
  if (score >= 0.75) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (score >= 0.55) return <Minus className="w-4 h-4 text-amber-400" />;
  return <TrendingDown className="w-4 h-4 text-slate-500" />;
}

export function PatternLedgerEvolutionPanel({ clientId }: PatternLedgerEvolutionPanelProps) {
  const [patterns, setPatterns] = useState<PatternRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containment, setContainment] = useState<{ reason: string } | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchPatterns();
    }
  }, [clientId]);

  async function fetchPatterns() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/pattern-ledger`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPatterns(data.patterns || []);
      setContainment(data.containment ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pattern ledger');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  // Containment is NOT emptiness. Saying "no patterns recorded yet" while the
  // read path is closed would assert something we have not established and
  // cannot see — the honest statement is that this view is closed, and why.
  // ⛔ Do not collapse this branch into the empty state.
  if (containment) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <p className="text-sm text-slate-400">{containment.reason}</p>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
        <p className="text-sm text-slate-500">
          No patterns recorded yet. Patterns emerge from recurring themes across conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patterns.map(row => {
        const status = patternStatus(row);
        return (
          <div
            key={row.patternKey}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-white text-sm">{row.patternLabel}</span>
                <PatternTypeBadge type={row.patternType} />
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <ScoreIndicator score={row.weightedScore} />
                <span className="text-xs text-slate-500 font-mono">{row.weightedScore.toFixed(2)}</span>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-2">
              <span>seen {row.recurrenceCount} time{row.recurrenceCount !== 1 ? 's' : ''}</span>
              <span>first {formatDate(row.firstSeenAt)}</span>
              <span>last {timeAgo(row.lastSeenAt)}</span>
              {row.evidenceCount > 0 && (
                <span>{row.evidenceCount} supporting moment{row.evidenceCount !== 1 ? 's' : ''}</span>
              )}
            </div>

            {/* Trigger contexts */}
            {row.triggerContexts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {row.triggerContexts.slice(0, 5).map((ctx, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded"
                  >
                    {ctx}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
