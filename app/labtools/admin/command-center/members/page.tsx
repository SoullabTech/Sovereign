'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Sparkles,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Award,
  RotateCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface MemberData {
  totalMembers: number;
  onboardedMembers: number;
  spiralState: {
    elementDistribution: Record<string, number>;
    phaseDistribution: Record<number, number>;
    motionDistribution: Record<string, number>;
    avgAutonomyStreak: number;
    avgReturnCount: number;
    relationalPhases: Record<number, number>;
  };
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

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, value, subValue, icon: Icon, accentColor = 'amber' }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  accentColor?: string;
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
      className={`bg-zinc-900 rounded-xl border border-zinc-800 border-l-4 ${borderColors[accentColor] || borderColors.amber} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
    </motion.div>
  );
}

// ─── Element Bar ────────────────────────────────────────────────────
function ElementBar({ element, count, total }: { element: string; count: number; total: number }) {
  const elementColors: Record<string, { bg: string; text: string }> = {
    fire: { bg: 'bg-red-500', text: 'text-red-400' },
    water: { bg: 'bg-blue-500', text: 'text-blue-400' },
    earth: { bg: 'bg-green-500', text: 'text-green-400' },
    air: { bg: 'bg-purple-400', text: 'text-purple-400' },
    aether: { bg: 'bg-amber-500', text: 'text-amber-400' },
  };
  const colors = elementColors[element] || { bg: 'bg-gray-500', text: 'text-gray-400' };
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={`capitalize font-medium ${colors.text}`}>{element}</span>
        <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`h-full ${colors.bg}`}
        />
      </div>
    </div>
  );
}

// ─── Phase Bar ──────────────────────────────────────────────────────
function PhaseBar({ phase, count, max }: { phase: number; count: number; max: number }) {
  const percentage = max > 0 ? (count / max) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-16">Phase {phase}</span>
      <div className="flex-1 h-6 bg-zinc-800 rounded overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: phase * 0.05 }}
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
        />
        <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-300">
          {count}
        </span>
      </div>
    </div>
  );
}

// ─── Motion Badge ───────────────────────────────────────────────────
function MotionBadge({ motion, count }: { motion: string; count: number }) {
  const motionColors: Record<string, string> = {
    ascending: 'bg-green-500/20 text-green-400 border-green-500/30',
    stuck: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    breakthrough: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  const color = motionColors[motion] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <span className="text-xs font-medium capitalize">{motion}</span>
      <span className="text-xs text-stone-400">{count}</span>
    </div>
  );
}

// ─── Relational Phase Row ───────────────────────────────────────────
function RelationalPhaseRow({ phase, name, count }: { phase: number; name: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-amber-400">Phase {phase}</span>
        <span className="text-sm text-gray-300">{name}</span>
      </div>
      <span className="text-sm font-bold text-gray-100">{count}</span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function MembersPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/command-center/members', {
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

  const onboardedPercentage = data
    ? ((data.onboardedMembers / data.totalMembers) * 100).toFixed(1)
    : '0';

  const totalElements = data?.spiralState?.elementDistribution
    ? Object.values(data.spiralState.elementDistribution).reduce((a, b) => a + b, 0)
    : 0;

  const maxPhaseCount = data?.spiralState?.phaseDistribution
    ? Math.max(...Object.values(data.spiralState.phaseDistribution), 1)
    : 1;

  const relationalPhaseNames: Record<number, string> = {
    1: 'Orientation',
    2: 'Capacity',
    3: 'Autonomy',
    4: 'Seasonal Return',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Member Spiral State</h1>
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

      {/* Member Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Total Members"
          value={data?.totalMembers?.toLocaleString() ?? '—'}
          subValue="All registered"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          label="Onboarded Members"
          value={data?.onboardedMembers?.toLocaleString() ?? '—'}
          subValue={`${onboardedPercentage}% completion rate`}
          icon={Sparkles}
          accentColor="amber"
        />
      </div>

      {/* Element Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Element Distribution
        </h2>
        <div className="space-y-3">
          {data?.spiralState?.elementDistribution &&
            Object.entries(data.spiralState.elementDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([element, count]) => (
                <ElementBar
                  key={element}
                  element={element}
                  count={count}
                  total={totalElements}
                />
              ))}
        </div>
      </motion.div>

      {/* Phase Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Phase Distribution
        </h2>
        <div className="space-y-2">
          {data?.spiralState?.phaseDistribution &&
            Object.entries(data.spiralState.phaseDistribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([phase, count]) => (
                <PhaseBar
                  key={phase}
                  phase={Number(phase)}
                  count={count}
                  max={maxPhaseCount}
                />
              ))}
        </div>
      </motion.div>

      {/* Motion Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-amber-500" />
          Motion Patterns
        </h2>
        <div className="flex flex-wrap gap-2">
          {data?.spiralState?.motionDistribution &&
            Object.entries(data.spiralState.motionDistribution).map(([motion, count]) => (
              <MotionBadge key={motion} motion={motion} count={count} />
            ))}
        </div>
      </motion.div>

      {/* Autonomy & Return */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Avg Autonomy Streak"
          value={data?.spiralState?.avgAutonomyStreak?.toFixed(1) ?? '—'}
          subValue="Consecutive autonomous sessions"
          icon={Award}
          accentColor="emerald"
        />
        <StatCard
          label="Avg Return Count"
          value={data?.spiralState?.avgReturnCount?.toFixed(1) ?? '—'}
          subValue="Times returned after autonomy"
          icon={RotateCw}
          accentColor="purple"
        />
      </div>

      {/* Relational Phases */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          Relational Phases
        </h2>
        <div className="space-y-2">
          {data?.spiralState?.relationalPhases &&
            Object.entries(data.spiralState.relationalPhases)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([phase, count]) => (
                <RelationalPhaseRow
                  key={phase}
                  phase={Number(phase)}
                  name={relationalPhaseNames[Number(phase)] || 'Unknown'}
                  count={count}
                />
              ))}
        </div>
      </motion.div>
    </div>
  );
}
