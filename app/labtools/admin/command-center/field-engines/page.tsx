'use client';

import { adminFetch } from '@/lib/admin/adminFetch';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Target,
  Gauge,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface FieldEngineData {
  period: { start: string; end: string; days: number };
  processingPaths: { FAST: number; CORE: number; DEEP: number };
  elementDistribution: Record<string, number>;
  avgResponseQuality: number;
  fieldMonitorTurns: number;
  orchestratorData: null | {
    avgMs: number;
    hitRate: { pfi: number; resonance: number; unified: number };
    truncationRate: number;
  };
}

// ─── Element Colors ─────────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ef4444',
  water: '#3b82f6',
  earth: '#22c55e',
  air: '#a78bfa',
  aether: '#f59e0b',
};

// ─── Processing Path Colors ─────────────────────────────────────────
const PATH_COLORS: Record<string, string> = {
  FAST: '#22c55e',
  CORE: '#f59e0b',
  DEEP: '#8b5cf6',
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

// ─── Horizontal Bar Chart ───────────────────────────────────────────
function ElementDistributionChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(([_, count]) => count), 1);

  if (entries.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No element data</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([element, count]) => {
        const percentage = (count / maxCount) * 100;
        const color = ELEMENT_COLORS[element] || '#6b7280';
        return (
          <div key={element}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400 capitalize">{element}</span>
              <span className="text-xs text-gray-500">{count.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${percentage}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function FieldEnginesDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<FieldEngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminFetch('/api/admin/command-center/field-engines', {
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

  const paths = data?.processingPaths;
  const totalPaths = paths ? paths.FAST + paths.CORE + paths.DEEP : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Field Engines</h1>
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

      {/* Processing Path Distribution */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Processing Path Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="FAST (<2s)"
            value={paths?.FAST.toLocaleString() ?? '—'}
            subValue={paths ? `${Math.round((paths.FAST / totalPaths) * 100)}%` : ''}
            icon={Zap}
            color="emerald"
            barValue={paths ? (paths.FAST / totalPaths) * 100 : 0}
          />
          <StatCard
            label="CORE (2-6s)"
            value={paths?.CORE.toLocaleString() ?? '—'}
            subValue={paths ? `${Math.round((paths.CORE / totalPaths) * 100)}%` : ''}
            icon={Activity}
            color="amber"
            barValue={paths ? (paths.CORE / totalPaths) * 100 : 0}
          />
          <StatCard
            label="DEEP (6-20s)"
            value={paths?.DEEP.toLocaleString() ?? '—'}
            subValue={paths ? `${Math.round((paths.DEEP / totalPaths) * 100)}%` : ''}
            icon={Target}
            color="purple"
            barValue={paths ? (paths.DEEP / totalPaths) * 100 : 0}
          />
        </div>
      </div>

      {/* Element Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          Element Distribution
        </h2>
        <ElementDistributionChart data={data?.elementDistribution ?? {}} />
      </motion.div>

      {/* Field Quality */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 border-l-4 border-l-amber-500 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-500" />
          Field Quality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Response Quality</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">
              {data ? data.avgResponseQuality.toFixed(2) : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Score range: 0-1</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Monitored Turns</p>
            <p className="text-3xl font-bold text-gray-100 mt-1">
              {data?.fieldMonitorTurns.toLocaleString() ?? '—'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {data ? `${data.period.days}d period` : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Engine Performance */}
      {data?.orchestratorData ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            Engine Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="PFI Hit Rate"
              value={`${data.orchestratorData.hitRate.pfi.toFixed(1)}%`}
              subValue="Personal Field Index"
              icon={Target}
              color="blue"
            />
            <StatCard
              label="Resonance Hit Rate"
              value={`${data.orchestratorData.hitRate.resonance.toFixed(1)}%`}
              subValue="Resonance Engine"
              icon={Activity}
              color="purple"
            />
            <StatCard
              label="Unified Hit Rate"
              value={`${data.orchestratorData.hitRate.unified.toFixed(1)}%`}
              subValue="Unified Field"
              icon={Zap}
              color="emerald"
            />
            <StatCard
              label="Avg Latency"
              value={`${data.orchestratorData.avgMs}ms`}
              subValue={`Truncation: ${data.orchestratorData.truncationRate.toFixed(1)}%`}
              icon={Gauge}
              color="amber"
            />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Engine Telemetry Not Available</p>
            <p className="text-xs text-blue-400 mt-1">
              Field orchestrator telemetry not yet available. Run migration to enable detailed engine performance tracking.
            </p>
          </div>
        </motion.div>
      )}

      {/* Period Info */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
        >
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Period: {data.period.start?.slice(0, 10)} to {data.period.end?.slice(0, 10)}</span>
            <span>Window: {data.period.days} days</span>
            <span className="ml-auto">
              {data.avgResponseQuality > 0.7 && data.fieldMonitorTurns > 10
                ? '🟢 Engines Performing Well'
                : data.avgResponseQuality > 0.4
                ? '🟡 Engines Active'
                : '🔴 Quality Below Threshold'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
