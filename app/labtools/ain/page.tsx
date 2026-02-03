'use client';

/**
 * AIN Shape Telemetry Dashboard
 *
 * Visualizes structural evaluation of MAIA responses.
 * Tracks mirror/bridge/permission/nextStep flags and scores.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Activity, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TelemetryEntry = {
  id: number;
  formed_at: string;
  pass: boolean;
  score: number;
  mirror: boolean;
  bridge: boolean;
  permission: boolean;
  next_step: boolean;
  menu_mode: boolean;
  menu_signals: Record<string, unknown> | null;
  route: string;
  processing_profile: string | null;
  model: string | null;
  explorer_id: string | null;
  session_id: string | null;
};

type TelemetryStats = {
  total: number;
  passes: number;
  fails: number;
  avg_score: number;
  mirror_count: number;
  bridge_count: number;
  permission_count: number;
  next_step_count: number;
  menu_mode_count: number;
  unique_sessions: number;
  unique_explorers: number;
};

type HourlyData = {
  hour: string;
  total: number;
  passes: number;
  avg_score: number;
};

type RouteData = {
  route: string;
  count: number;
  avg_score: number;
  passes: number;
};

type TelemetryResponse = {
  success: boolean;
  entries: TelemetryEntry[];
  stats: TelemetryStats;
  hourly: HourlyData[];
  byRoute: RouteData[];
  pagination: { limit: number; offset: number; hours: number };
};

export default function AINTelemetryPage() {
  const router = useRouter();
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState(24);
  const [selectedEntry, setSelectedEntry] = useState<TelemetryEntry | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ain/telemetry?hours=${hours}&limit=100`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [hours]);

  const passRate = data?.stats?.total
    ? Math.round((data.stats.passes / data.stats.total) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/labtools')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-white">AIN Shape Telemetry</h1>
              <p className="text-sm text-white/60">
                Structural evaluation of MAIA responses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              {[6, 24, 48, 168].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    hours === h
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {h < 24 ? `${h}h` : h === 24 ? '24h' : h === 48 ? '48h' : '7d'}
                </button>
              ))}
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Evaluations"
                value={data.stats.total}
                icon={<Activity className="w-5 h-5" />}
              />
              <StatCard
                label="Pass Rate"
                value={`${passRate}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                accent={passRate >= 80 ? 'emerald' : passRate >= 60 ? 'amber' : 'red'}
              />
              <StatCard
                label="Avg Score"
                value={data.stats.avg_score?.toFixed(1) || '0'}
                icon={<CheckCircle className="w-5 h-5" />}
                subtitle="out of 4"
              />
              <StatCard
                label="Unique Sessions"
                value={data.stats.unique_sessions}
                icon={<Activity className="w-5 h-5" />}
              />
            </div>

            {/* Flag Breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold text-white/80 mb-4">Flag Distribution</h2>
              <div className="grid grid-cols-5 gap-4">
                <FlagStat label="Mirror" count={data.stats.mirror_count} total={data.stats.total} />
                <FlagStat label="Bridge" count={data.stats.bridge_count} total={data.stats.total} />
                <FlagStat label="Permission" count={data.stats.permission_count} total={data.stats.total} />
                <FlagStat label="Next Step" count={data.stats.next_step_count} total={data.stats.total} />
                <FlagStat label="Menu Mode" count={data.stats.menu_mode_count} total={data.stats.total} />
              </div>
            </div>

            {/* Route breakdown */}
            {data.byRoute.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white/80 mb-4">By Route</h2>
                <div className="space-y-2">
                  {data.byRoute.map((r) => (
                    <div
                      key={r.route}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5"
                    >
                      <span className="text-sm text-white/90 font-mono">{r.route}</span>
                      <div className="flex items-center gap-4 text-xs text-white/60">
                        <span>{r.count} calls</span>
                        <span>avg {r.avg_score}</span>
                        <span>{Math.round((r.passes / r.count) * 100)}% pass</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Entries Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold text-white/80 mb-4">
                Recent Entries ({data.entries.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/50 border-b border-white/10">
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Pass</th>
                      <th className="pb-2 pr-4">Score</th>
                      <th className="pb-2 pr-4">Flags</th>
                      <th className="pb-2 pr-4">Route</th>
                      <th className="pb-2">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="text-white/80 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="py-2 pr-4 text-xs text-white/60">
                          {new Date(entry.formed_at).toLocaleString()}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.pass ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <span className={getScoreColor(entry.score)}>{entry.score}/4</span>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-1">
                            <FlagPill active={entry.mirror} label="M" title="Mirror" />
                            <FlagPill active={entry.bridge} label="B" title="Bridge" />
                            <FlagPill active={entry.permission} label="P" title="Permission" />
                            <FlagPill active={entry.next_step} label="N" title="Next Step" />
                            {entry.menu_mode && <FlagPill active label="Menu" title="Menu Mode" />}
                          </div>
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">{entry.route}</td>
                        <td className="py-2 font-mono text-xs text-white/50 truncate max-w-[100px]">
                          {entry.session_id?.slice(0, 8) || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Entry Detail Modal */}
            {selectedEntry && (
              <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
            )}
          </>
        )}

        {loading && !data && (
          <div className="text-center py-12 text-white/50">Loading telemetry data...</div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtitle,
  accent = 'white',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: 'white' | 'emerald' | 'amber' | 'red';
}) {
  const accentClasses = {
    white: 'text-white',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-white/30">{icon}</span>
      </div>
      <div className={`text-2xl font-semibold ${accentClasses[accent]}`}>{value}</div>
      {subtitle && <div className="text-xs text-white/40">{subtitle}</div>}
    </div>
  );
}

function FlagStat({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-white">{pct}%</div>
      <div className="text-xs text-white/50">{label}</div>
      <div className="text-xs text-white/30">{count}/{total}</div>
    </div>
  );
}

function FlagPill({ active, label, title }: { active: boolean; label: string; title: string }) {
  return (
    <span
      title={title}
      className={`px-1.5 py-0.5 rounded text-xs font-mono ${
        active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'
      }`}
    >
      {label}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score === 4) return 'text-emerald-400';
  if (score >= 3) return 'text-emerald-300';
  if (score >= 2) return 'text-amber-400';
  return 'text-red-400';
}

function EntryDetailModal({
  entry,
  onClose,
}: {
  entry: TelemetryEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Entry #{entry.id}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            &times;
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Time</span>
            <span className="text-white">{new Date(entry.formed_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Pass</span>
            <span className={entry.pass ? 'text-emerald-400' : 'text-red-400'}>
              {entry.pass ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Score</span>
            <span className={getScoreColor(entry.score)}>{entry.score}/4</span>
          </div>

          <div className="border-t border-white/10 pt-3">
            <span className="text-white/50 text-xs">Flags</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <FlagRow label="Mirror" active={entry.mirror} />
              <FlagRow label="Bridge" active={entry.bridge} />
              <FlagRow label="Permission" active={entry.permission} />
              <FlagRow label="Next Step" active={entry.next_step} />
              <FlagRow label="Menu Mode" active={entry.menu_mode} />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <span className="text-white/50 text-xs">Context</span>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Route</span>
                <span className="text-white/80 font-mono">{entry.route}</span>
              </div>
              {entry.processing_profile && (
                <div className="flex justify-between">
                  <span className="text-white/40">Profile</span>
                  <span className="text-white/80">{entry.processing_profile}</span>
                </div>
              )}
              {entry.model && (
                <div className="flex justify-between">
                  <span className="text-white/40">Model</span>
                  <span className="text-white/80">{entry.model}</span>
                </div>
              )}
              {entry.session_id && (
                <div className="flex justify-between">
                  <span className="text-white/40">Session</span>
                  <span className="text-white/80 font-mono">{entry.session_id}</span>
                </div>
              )}
              {entry.explorer_id && (
                <div className="flex justify-between">
                  <span className="text-white/40">Explorer</span>
                  <span className="text-white/80 font-mono">{entry.explorer_id}</span>
                </div>
              )}
            </div>
          </div>

          {entry.menu_signals && (
            <div className="border-t border-white/10 pt-3">
              <span className="text-white/50 text-xs">Menu Signals</span>
              <pre className="mt-2 text-xs text-white/70 bg-black/30 rounded-lg p-2 overflow-auto">
                {JSON.stringify(entry.menu_signals, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FlagRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30">
      <span className="text-white/70">{label}</span>
      {active ? (
        <CheckCircle className="w-4 h-4 text-emerald-400" />
      ) : (
        <XCircle className="w-4 h-4 text-white/20" />
      )}
    </div>
  );
}
