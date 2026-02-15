'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  Database,
  TrendingUp,
  XCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface SystemData {
  period: { start: string; end: string; days: number };
  oracle: {
    total: number;
    byModel: Record<string, number>;
    byStatus: Record<string, number>;
    avgDurationMs: number;
    avgInputTokens: number;
    avgOutputTokens: number;
    totalTokens: number;
  };
  latencyByPath: Record<string, number>;
  recentErrors: Array<{ request_id: string; status: string; created_at: string; model: string }>;
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

// ─── Model Bar ──────────────────────────────────────────────────────
function ModelBar({ model, count, total }: { model: string; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-300 font-mono">{model}</span>
        <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status, count }: { status: string; count: number }) {
  const statusColors: Record<string, string> = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    timeout: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  const color = statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <span className="text-xs font-medium capitalize">{status}</span>
      <span className="text-xs opacity-75">{count}</span>
    </div>
  );
}

// ─── Latency Card ───────────────────────────────────────────────────
function LatencyCard({ path, latencyMs }: { path: string; latencyMs: number }) {
  const getColor = (ms: number) => {
    if (ms < 2000) return { border: 'border-l-green-500', text: 'text-green-400' };
    if (ms < 5000) return { border: 'border-l-amber-500', text: 'text-amber-400' };
    return { border: 'border-l-red-500', text: 'text-red-400' };
  };
  const colors = getColor(latencyMs);

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 border-l-4 ${colors.border} p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{path}</p>
          <p className={`text-xl font-bold mt-1 ${colors.text}`}>{latencyMs.toFixed(0)}ms</p>
        </div>
        <Clock className="w-4 h-4 text-gray-600" />
      </div>
    </div>
  );
}

// ─── Error Row ──────────────────────────────────────────────────────
function ErrorRow({ error }: { error: { request_id: string; status: string; created_at: string; model: string } }) {
  const truncatedId = error.request_id.slice(0, 8);
  const time = new Date(error.created_at).toLocaleString();

  return (
    <div className="flex items-center gap-4 py-2 px-3 bg-zinc-800/30 rounded-lg text-xs">
      <span className="font-mono text-gray-400 w-20">{truncatedId}</span>
      <span className="text-red-400 font-medium w-20">{error.status}</span>
      <span className="text-blue-400 font-mono flex-1">{error.model}</span>
      <span className="text-gray-500">{time}</span>
    </div>
  );
}

// ─── Format Number ──────────────────────────────────────────────────
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function SystemPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/command-center/system', {
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

  const totalModels = data?.oracle?.byModel
    ? Object.values(data.oracle.byModel).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">System Health</h1>
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

      {/* Oracle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Oracle Calls"
          value={data?.oracle?.total?.toLocaleString() ?? '—'}
          subValue={`${days}d period`}
          icon={Activity}
          accentColor="blue"
        />
        <StatCard
          label="Avg Duration"
          value={data ? `${(data.oracle.avgDurationMs / 1000).toFixed(2)}s` : '—'}
          subValue={data ? `${data.oracle.avgDurationMs.toFixed(0)}ms` : ''}
          icon={Clock}
          accentColor="purple"
        />
        <StatCard
          label="Total Tokens"
          value={data ? formatNumber(data.oracle.totalTokens) : '—'}
          subValue={data ? `${data.oracle.totalTokens.toLocaleString()} tokens` : ''}
          icon={Database}
          accentColor="amber"
        />
      </div>

      {/* Model Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Model Distribution
        </h2>
        <div className="space-y-3">
          {data?.oracle?.byModel &&
            Object.entries(data.oracle.byModel)
              .sort((a, b) => b[1] - a[1])
              .map(([model, count]) => (
                <ModelBar
                  key={model}
                  model={model}
                  count={count}
                  total={totalModels}
                />
              ))}
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          Status Distribution
        </h2>
        <div className="flex flex-wrap gap-2">
          {data?.oracle?.byStatus &&
            Object.entries(data.oracle.byStatus).map(([status, count]) => (
              <StatusBadge key={status} status={status} count={count} />
            ))}
        </div>
      </motion.div>

      {/* Latency by Path */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Latency by Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.latencyByPath &&
            Object.entries(data.latencyByPath).map(([path, latencyMs]) => (
              <LatencyCard
                key={path}
                path={path}
                latencyMs={latencyMs}
              />
            ))}
        </div>
      </motion.div>

      {/* Token Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          label="Avg Input Tokens"
          value={data?.oracle?.avgInputTokens?.toFixed(0) ?? '—'}
          subValue="Per request"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <StatCard
          label="Avg Output Tokens"
          value={data?.oracle?.avgOutputTokens?.toFixed(0) ?? '—'}
          subValue="Per request"
          icon={TrendingUp}
          accentColor="blue"
        />
      </div>

      {/* Recent Errors */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          Recent Errors
        </h2>
        {data?.recentErrors && data.recentErrors.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.recentErrors.slice(0, 10).map((error, i) => (
              <ErrorRow key={i} error={error} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4 text-center">No recent errors</p>
        )}
      </motion.div>
    </div>
  );
}
