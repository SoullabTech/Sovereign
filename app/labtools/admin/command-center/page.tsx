'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Clock,
  Zap,
  Award,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface OverviewData {
  period: { start: string; end: string; days: number };
  vitals: {
    totalConversations: number;
    activeMembers: number;
    avgResponseMs: number;
    fieldEngineHitRate: number;
    ainGoldRate: number;
    errorRate: number;
  };
  alerts: Array<{ level: 'info' | 'warn' | 'critical'; message: string; timestamp: string }>;
  sparklines: {
    conversations: number[];
    errors: number[];
    avgLatency: number[];
  };
}

// ─── Mini Sparkline (inline for zero deps) ──────────────────────────
function Sparkline({ data, color = '#f59e0b', width = 120, height = 32 }: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} className="opacity-30"><line x1="0" y1={height/2} x2={width} y2={height/2} stroke={color} strokeWidth="1.5" /></svg>;
  }
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(' L')}`;
  const fillD = `${pathD} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-fill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#spark-fill-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({ label, value, subValue, icon: Icon, sparkline, sparkColor, accentColor = 'amber' }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  sparkline?: number[];
  sparkColor?: string;
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
      {sparkline && sparkline.length > 1 && (
        <div className="mt-3">
          <Sparkline data={sparkline} color={sparkColor || '#f59e0b'} width={160} height={28} />
        </div>
      )}
    </motion.div>
  );
}

// ─── Alert Feed ─────────────────────────────────────────────────────
function AlertFeed({ alerts }: { alerts: Array<{ level: string; message: string; timestamp: string }> }) {
  if (!alerts || alerts.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">No active alerts</p>;
  }
  const levelColors: Record<string, string> = {
    info: 'bg-blue-500',
    warn: 'bg-amber-500',
    critical: 'bg-red-500',
  };
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {alerts.map((alert, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2 bg-zinc-800/50 rounded-lg">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${levelColors[alert.level] || levelColors.info}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-0.5">{alert.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
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

// ─── Main Page ──────────────────────────────────────────────────────
export default function CommandCenterOverview() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/command-center/overview', {
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

  const v = data?.vitals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Platform Overview</h1>
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

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Conversations"
          value={v?.totalConversations?.toLocaleString() ?? '—'}
          subValue={`${days}d period`}
          icon={Activity}
          sparkline={data?.sparklines?.conversations}
          sparkColor="#f59e0b"
          accentColor="amber"
        />
        <StatCard
          label="Active Members"
          value={v?.activeMembers?.toLocaleString() ?? '—'}
          subValue="Distinct users"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          label="Avg Response"
          value={v ? `${(v.avgResponseMs / 1000).toFixed(1)}s` : '—'}
          subValue={v ? `${v.avgResponseMs.toLocaleString()}ms` : ''}
          icon={Clock}
          sparkline={data?.sparklines?.avgLatency}
          sparkColor="#8b5cf6"
          accentColor="purple"
        />
        <StatCard
          label="Field Engine Hit Rate"
          value={v ? `${v.fieldEngineHitRate.toFixed(1)}%` : '—'}
          subValue="Turns with active frameworks"
          icon={Zap}
          accentColor="emerald"
        />
        <StatCard
          label="AIN Gold Rate"
          value={v ? `${v.ainGoldRate.toFixed(1)}%` : '—'}
          subValue="Turns passing AIN shape"
          icon={Award}
          accentColor="amber"
        />
        <StatCard
          label="Error Rate"
          value={v ? `${v.errorRate.toFixed(2)}%` : '—'}
          subValue={v && v.errorRate > 5 ? 'Above threshold!' : 'Within bounds'}
          icon={AlertTriangle}
          sparkline={data?.sparklines?.errors}
          sparkColor={v && v.errorRate > 5 ? '#ef4444' : '#22c55e'}
          accentColor={v && v.errorRate > 5 ? 'red' : 'emerald'}
        />
      </div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Active Alerts
        </h2>
        <AlertFeed alerts={data?.alerts ?? []} />
      </motion.div>

      {/* Quick Status */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
        >
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Period: {data.period.start?.slice(0, 10)} to {data.period.end?.slice(0, 10)}</span>
            <span>Window: {data.period.days} days</span>
            <span className="ml-auto">
              {v && v.errorRate < 2 && v.ainGoldRate > 50
                ? '🟢 Platform Healthy'
                : v && v.errorRate > 5
                ? '🔴 Attention Needed'
                : '🟡 Monitoring'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
