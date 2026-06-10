'use client';

import { adminFetch } from '@/lib/admin/adminFetch';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Brain,
  AlertTriangle,
  RefreshCw,
  Target,
  Zap,
  Activity,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface ConversationData {
  period: { start: string; end: string; days: number };
  ainShape: { total: number; passed: number; passRate: number; avgScore: number };
  socratic: { total: number; avgScore: number };
  cognitive: {
    total: number;
    bloomDistribution: Record<number, number>;
    bypassingSpiritual: number;
    bypassingIntellectual: number;
  };
  expansionEvents: { total: number; byType: Record<string, number> };
}

// ─── Bloom Level Labels ─────────────────────────────────────────────
const BLOOM_LABELS: Record<number, string> = {
  1: 'Remember',
  2: 'Understand',
  3: 'Apply',
  4: 'Analyze',
  5: 'Evaluate',
  6: 'Create',
};

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, value, subValue, icon: Icon, color = 'amber', barValue }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  color?: string;
  barValue?: number;
}) {
  const borderColors: Record<string, string> = {
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-zinc-900 rounded-xl border border-zinc-800 border-l-4 ${borderColors[color] || borderColors.amber} p-5`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      {barValue !== undefined && (
        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-current transition-all duration-500"
            style={{ width: `${Math.min(100, barValue)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ─── Time Range Selector ────────────────────────────────────────────
function TimeRange({ value, onChange }: { value: number; onChange: (d: number) => void }) {
  const options = [1, 7, 30, 90];
  return (
    <div className="flex gap-1">
      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === d
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-gray-500 hover:text-gray-300 hover:bg-zinc-800'
          }`}
        >
          {d}d
        </button>
      ))}
    </div>
  );
}

// ─── Bloom's Taxonomy Bar Chart ─────────────────────────────────────
function BloomDistributionChart({ data }: { data: Record<number, number> }) {
  const entries = Object.entries(data)
    .map(([level, count]) => ({ level: Number(level), count }))
    .sort((a, b) => a.level - b.level);

  const maxCount = Math.max(...entries.map((e) => e.count), 1);

  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No Bloom data</p>;
  }

  return (
    <div className="flex items-end justify-between gap-3 h-48">
      {[1, 2, 3, 4, 5, 6].map((level) => {
        const entry = entries.find((e) => e.level === level);
        const count = entry?.count || 0;
        const heightPercent = (count / maxCount) * 100;
        return (
          <div key={level} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col justify-end h-full">
              <div
                className="w-full bg-purple-500 rounded-t-lg transition-all duration-500"
                style={{ height: `${heightPercent}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">{BLOOM_LABELS[level]}</p>
              <p className="text-xs text-gray-500 font-medium">{count}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Expansion Events Table ─────────────────────────────────────────
function ExpansionEventsTable({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No expansion events</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([type, count]) => (
        <div key={type} className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-gray-300 capitalize">{type.replace(/_/g, ' ')}</span>
          <span className="text-sm font-medium text-gray-400">{count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ConversationsDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminFetch('/api/admin/command-center/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ain = data?.ainShape;
  const soc = data?.socratic;
  const cog = data?.cognitive;
  const exp = data?.expansionEvents;

  // Socratic score color
  const socraticColor = soc
    ? soc.avgScore > 0.7
      ? 'emerald'
      : soc.avgScore > 0.4
      ? 'amber'
      : 'red'
    : 'amber';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Conversation Quality</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TimeRange value={days} onChange={setDays} />
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={fetchData} className="ml-auto text-xs text-red-400 hover:text-red-300 underline">Retry</button>
        </div>
      )}

      {/* AIN Shape Quality */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 border-l-4 border-l-amber-500 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          AIN Shape Quality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-4xl font-bold text-amber-400 mt-1">
              {ain ? `${ain.passRate.toFixed(1)}%` : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {ain ? `${ain.passed.toLocaleString()} / ${ain.total.toLocaleString()} turns` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Average Score</p>
            <p className="text-4xl font-bold text-gray-100 mt-1">
              {ain ? ain.avgScore.toFixed(2) : '—'}
            </p>
            {ain && (
              <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${ain.passRate}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Socratic Validator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Socratic Validator Events"
          value={soc?.total.toLocaleString() ?? '—'}
          subValue={soc ? `Avg score: ${soc.avgScore.toFixed(2)}` : ''}
          icon={Target}
          color={socraticColor}
        />
        <StatCard
          label="Cognitive Turn Events"
          value={cog?.total.toLocaleString() ?? '—'}
          subValue="Total cognitive evaluations"
          icon={Brain}
          color="purple"
        />
      </div>

      {/* Bloom's Taxonomy Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          Bloom's Taxonomy Distribution
        </h2>
        <BloomDistributionChart data={data?.cognitive.bloomDistribution ?? {}} />
      </motion.div>

      {/* Bypassing Detection */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Bypassing Detection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label="Spiritual Bypassing"
            value={cog?.bypassingSpiritual.toLocaleString() ?? '—'}
            subValue={
              cog && cog.total > 0
                ? `${Math.round((cog.bypassingSpiritual / cog.total) * 100)}% of total`
                : ''
            }
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            label="Intellectual Bypassing"
            value={cog?.bypassingIntellectual.toLocaleString() ?? '—'}
            subValue={
              cog && cog.total > 0
                ? `${Math.round((cog.bypassingIntellectual / cog.total) * 100)}% of total`
                : ''
            }
            icon={AlertTriangle}
            color="red"
          />
        </div>
      </div>

      {/* Expansion Events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Expansion Events
          {exp && <span className="ml-auto text-xs text-gray-500">{exp.total.toLocaleString()} total</span>}
        </h2>
        <ExpansionEventsTable data={data?.expansionEvents.byType ?? {}} />
      </motion.div>

      {/* Period Info */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
        >
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Period: {data.period.start?.slice(0, 10)} to {data.period.end?.slice(0, 10)}</span>
            <span>Window: {data.period.days} days</span>
            <span className="ml-auto">
              {ain && ain.passRate > 50 && soc && soc.avgScore > 0.5
                ? '🟢 Quality High'
                : ain && ain.passRate > 30
                ? '🟡 Quality Moderate'
                : '🔴 Quality Needs Attention'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
