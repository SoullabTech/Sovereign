/**
 * Guidance Signals — Admin Signal Compass
 *
 * Shows aggregate confusion signals grouped by feature + type.
 * Includes signal velocity (24h / 7d / 30d) and trend indicator.
 * No member data displayed. No content captured. Aggregate only.
 *
 * Purpose: tell you what content to create next based on real confusion,
 * not guesses. Velocity separates active friction from ambient noise.
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Search, AlertCircle, Check, Copy,
  ArrowUp, ArrowDown, Minus, TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface SignalRow {
  feature_key: string;
  signal_type: string;
  count: number;
  last_seen_at: string;
  has_tooltip: boolean;
  last_24h: number;
  last_7d: number;
  last_30d: number;
  trend: number | null;   // 24h / (7d avg). >1 = accelerating
}

type SortKey = 'feature' | 'count' | 'last_24h' | 'last_7d' | 'trend';
type SortDir = 'asc' | 'desc';

const SIGNAL_LABELS: Record<string, string> = {
  tooltip_open: 'Tooltip opened',
  learn_more_click: 'Learn more clicked',
  search_help: 'Searched for help',
  error_state: 'Hit error state',
};

export default function GuidanceSignalsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    loadSignals();
  }, []);

  async function loadSignals() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/guidance/signals/rollup');
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
      }
    } catch {
      // Silent — page still renders empty state
    } finally {
      setLoading(false);
    }
  }

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const filtered = useMemo(() => {
    let result = [...rows];

    if (filter) {
      const lower = filter.toLowerCase();
      result = result.filter((r) => r.feature_key.toLowerCase().includes(lower));
    }
    if (onlyMissing) {
      result = result.filter((r) => !r.has_tooltip);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'feature':
          cmp = a.feature_key.localeCompare(b.feature_key);
          break;
        case 'count':
          cmp = a.count - b.count;
          break;
        case 'last_24h':
          cmp = a.last_24h - b.last_24h;
          break;
        case 'last_7d':
          cmp = a.last_7d - b.last_7d;
          break;
        case 'trend':
          cmp = (a.trend ?? -1) - (b.trend ?? -1);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [rows, filter, onlyMissing, sortKey, sortDir]);

  const totalSignals = rows.reduce((sum, r) => sum + r.count, 0);
  const last24hTotal = rows.reduce((sum, r) => sum + r.last_24h, 0);
  const missingTooltips = new Set(
    rows.filter((r) => !r.has_tooltip).map((r) => r.feature_key)
  ).size;

  function copySeedSQL(featureKey: string) {
    const slug = featureKey.replace(/\./g, '/') + '/tooltip-what-is';
    const sql = `INSERT INTO guidance_content (slug, title, summary, depth, feature_key, sort_rank)
VALUES (
  '${slug}',
  'TODO: Title',
  'TODO: One-sentence summary.',
  'tooltip',
  '${featureKey}',
  10
)
ON CONFLICT (slug) DO NOTHING;`;

    navigator.clipboard.writeText(sql).then(() => {
      setCopiedSlug(featureKey);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  }

  /** Trend indicator: ↑ accelerating, → stable, ↓ decelerating */
  function TrendBadge({ trend }: { trend: number | null }) {
    if (trend === null) return <span className="text-slate-600">—</span>;
    if (trend >= 2) {
      return (
        <span className="inline-flex items-center gap-0.5 text-red-400 text-[11px] font-medium">
          <ArrowUp className="w-3 h-3" />
          {trend}x
        </span>
      );
    }
    if (trend > 1.2) {
      return (
        <span className="inline-flex items-center gap-0.5 text-amber-400 text-[11px] font-medium">
          <TrendingUp className="w-3 h-3" />
          {trend}x
        </span>
      );
    }
    if (trend >= 0.8) {
      return (
        <span className="inline-flex items-center gap-0.5 text-slate-400 text-[11px]">
          <Minus className="w-3 h-3" />
          stable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-[11px]">
        <ArrowDown className="w-3 h-3" />
        {trend}x
      </span>
    );
  }

  /** Sortable column header */
  function SortHeader({ label, sortId, className = '' }: { label: string; sortId: SortKey; className?: string }) {
    const active = sortKey === sortId;
    return (
      <button
        onClick={() => handleSort(sortId)}
        className={`text-left text-[11px] uppercase tracking-wider transition-colors
          ${active ? 'text-white/70' : 'text-slate-500 hover:text-slate-400'}
          ${className}`}
      >
        {label}
        {active && (
          <span className="ml-0.5">{sortDir === 'desc' ? '↓' : '↑'}</span>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-light text-white">Guidance Signals</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Where members need guidance — aggregate only, no content captured
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <div className="text-2xl font-light text-white">{totalSignals}</div>
            <div className="text-xs text-slate-500 mt-1">Total signals</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <div className="text-2xl font-light text-white">{last24hTotal}</div>
            <div className="text-xs text-slate-500 mt-1">Last 24 hours</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <div className="text-2xl font-light text-amber-400">{missingTooltips}</div>
            <div className="text-xs text-slate-500 mt-1">Missing tooltips</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by feature key..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10
                text-sm text-white placeholder:text-slate-600
                focus:outline-none focus:border-white/20"
            />
          </div>
          <button
            onClick={() => setOnlyMissing(!onlyMissing)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              onlyMissing
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
            }`}
          >
            Missing only
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading signals...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {rows.length === 0
                ? 'No signals captured yet. Signals appear as members interact with guidance tooltips.'
                : 'No signals match your filter.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_100px_50px_42px_42px_50px_70px_44px] gap-2 px-4 py-2
              bg-white/5 min-w-[640px]">
              <SortHeader label="Feature" sortId="feature" />
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">Signal</div>
              <SortHeader label="Total" sortId="count" className="text-right" />
              <SortHeader label="24h" sortId="last_24h" className="text-right" />
              <div className="text-[11px] text-slate-500 uppercase tracking-wider text-right">7d</div>
              <SortHeader label="Trend" sortId="trend" className="text-center" />
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">Last seen</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider text-center">Tip</div>
            </div>

            {/* Rows */}
            {filtered.map((row, i) => (
              <div
                key={`${row.feature_key}-${row.signal_type}`}
                className={`grid grid-cols-[1fr_100px_50px_42px_42px_50px_70px_44px] gap-2 px-4 py-3
                  items-center text-sm min-w-[640px]
                  ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}
                  hover:bg-white/5 transition-colors`}
              >
                {/* Feature key */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-white/80 truncate font-mono text-xs">
                    {row.feature_key}
                  </span>
                  {!row.has_tooltip && (
                    <button
                      onClick={() => copySeedSQL(row.feature_key)}
                      className="shrink-0 p-1 rounded text-slate-500 hover:text-amber-400
                        hover:bg-amber-500/10 transition"
                      title="Copy seed SQL"
                    >
                      {copiedSlug === row.feature_key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Signal type */}
                <div className="text-xs text-slate-400 truncate">
                  {SIGNAL_LABELS[row.signal_type] || row.signal_type}
                </div>

                {/* Total count */}
                <div className="text-right text-white/70 font-mono text-xs">
                  {row.count}
                </div>

                {/* 24h */}
                <div className={`text-right font-mono text-xs ${
                  row.last_24h > 0 ? 'text-white/70' : 'text-slate-600'
                }`}>
                  {row.last_24h}
                </div>

                {/* 7d */}
                <div className={`text-right font-mono text-xs ${
                  row.last_7d > 0 ? 'text-white/50' : 'text-slate-600'
                }`}>
                  {row.last_7d}
                </div>

                {/* Trend */}
                <div className="text-center">
                  <TrendBadge trend={row.trend} />
                </div>

                {/* Last seen */}
                <div className="text-xs text-slate-500">
                  {formatDate(row.last_seen_at)}
                </div>

                {/* Tooltip exists */}
                <div className="text-center">
                  {row.has_tooltip ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
