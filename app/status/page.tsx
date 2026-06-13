'use client';

import { useEffect, useRef, useState } from 'react';

interface UptimeBar {
  bars: boolean[];
  pct: number;
}

interface ServiceRow {
  id: string;
  name: string;
  display_name: string;
  category: string;
  current_status: 'up' | 'down' | 'degraded' | null;
  last_checked_at: string | null;
  response_ms: number | null;
  uptime_bar: boolean[];
  uptime_pct_24h: number;
  open_incident: unknown;
}

interface IncidentRow {
  id: string;
  service_name: string;
  display_name?: string;
  started_at: string;
  resolved_at: string | null;
  downtime_formatted: string;
}

interface ContainerInfo {
  name: string;
  status: string;
  healthy: boolean;
}

interface SystemMetrics {
  memory: { used_mb: number; total_mb: number; pct: number };
  cpu: { load1: number; load5: number; load15: number };
  disk: { used_gb: number; total_gb: number; pct: number; available_gb: number } | null;
  containers: ContainerInfo[];
  deploy_age_hours: number | null;
  ollama: { available: boolean; models?: string[] } | null;
  collected_at: string;
}

interface StatusPayload {
  services: ServiceRow[];
  incidents: IncidentRow[];
  system: SystemMetrics;
  checkedAt: string;
}

function StatusDot({ status }: { status: 'up' | 'down' | 'degraded' | null }) {
  if (status === 'up') return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />;
  if (status === 'degraded') return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />;
  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />;
}

function UptimeStrip({ bars }: { bars: boolean[] }) {
  const filled = bars.length === 0 ? Array(90).fill(true) : bars;
  const display = filled.length < 90
    ? [...Array(90 - filled.length).fill(true), ...filled]
    : filled.slice(-90);
  return (
    <div className="flex gap-px">
      {display.map((up, i) => (
        <div
          key={i}
          className={`w-1 h-5 rounded-sm ${up ? 'bg-emerald-500' : 'bg-rose-500'}`}
        />
      ))}
    </div>
  );
}

function ProgressBar({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StatusPage() {
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchStatus(): Promise<boolean> {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const json = (await res.json()) as StatusPayload;
        setData(json);
        setAuthed(true);
        return true;
      }
      setAuthed(false);
      return false;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    fetchStatus().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [authed]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch('/api/status/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const ok = await fetchStatus();
      if (!ok) setAuthError('Could not load status after login.');
    } else {
      setAuthError('Incorrect password.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">MAIAUptime</h1>
            <p className="text-zinc-500 text-sm mt-1">Soullab System Monitor</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-sm"
              autoFocus
            />
            {authError && <p className="text-rose-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-lg text-sm font-medium transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const services = data?.services ?? [];
  const incidents = data?.incidents ?? [];
  const system = data?.system ?? null;

  const degraded = services.filter((s) => s.current_status === 'degraded').length;
  const down = services.filter((s) => s.current_status === 'down').length;
  const allGood = degraded === 0 && down === 0;

  const memPct = system?.memory.pct ?? 0;
  const diskPct = system?.disk?.pct ?? 0;
  const cpuLoad1 = system?.cpu.load1 ?? 0;
  const cpuColor = cpuLoad1 < 2 ? 'text-emerald-400' : cpuLoad1 < 4 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">MAIAUptime</h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Last updated: {data ? formatDateTime(data.checkedAt) : '—'}
            </p>
          </div>
          <button
            onClick={() => fetchStatus()}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Overall banner */}
        <div
          className={`rounded-xl px-5 py-4 mb-6 ${
            allGood ? 'bg-emerald-950 border border-emerald-800' : 'bg-rose-950 border border-rose-800'
          }`}
        >
          <p className={`font-semibold text-sm ${allGood ? 'text-emerald-300' : 'text-rose-300'}`}>
            {allGood
              ? 'All Systems Operational'
              : `${down > 0 ? `${down} service${down > 1 ? 's' : ''} down` : ''}${
                  down > 0 && degraded > 0 ? ', ' : ''
                }${degraded > 0 ? `${degraded} degraded` : ''}`}
          </p>
        </div>

        {/* Services grid */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Services</h2>
          <div className="space-y-2">
            {services.map((svc) => (
              <div key={svc.id} className="bg-zinc-900 rounded-xl px-5 py-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={svc.current_status} />
                    <span className="text-sm font-medium text-zinc-100">{svc.display_name}</span>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">
                      {svc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {svc.response_ms !== null && (
                      <span>{svc.response_ms}ms</span>
                    )}
                    <span>checked {formatTime(svc.last_checked_at)}</span>
                    <span className="font-medium text-zinc-400">{svc.uptime_pct_24h}%</span>
                  </div>
                </div>
                <UptimeStrip bars={svc.uptime_bar} />
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-zinc-600 text-sm py-4 text-center">No services configured.</p>
            )}
          </div>
        </div>

        {/* System Health */}
        {system && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">System Health</h2>
            <div className="bg-zinc-900 rounded-xl px-5 py-5 border border-zinc-800 space-y-4">
              {/* Memory */}
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Memory</span>
                  <span>{system.memory.used_mb} / {system.memory.total_mb} MB ({system.memory.pct}%)</span>
                </div>
                <ProgressBar
                  pct={memPct}
                  colorClass={memPct < 70 ? 'bg-emerald-500' : memPct < 85 ? 'bg-amber-500' : 'bg-rose-500'}
                />
              </div>

              {/* CPU */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">CPU Load</span>
                <span className={`text-xs font-mono ${cpuColor}`}>
                  {cpuLoad1.toFixed(2)} / {system.cpu.load5.toFixed(2)} / {system.cpu.load15.toFixed(2)}
                  <span className="text-zinc-600 ml-1">(1m / 5m / 15m)</span>
                </span>
              </div>

              {/* Disk */}
              {system.disk && (
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Disk</span>
                    <span>
                      {system.disk.used_gb} / {system.disk.total_gb} GB ({diskPct}%)
                    </span>
                  </div>
                  <ProgressBar
                    pct={diskPct}
                    colorClass={diskPct < 70 ? 'bg-emerald-500' : diskPct < 85 ? 'bg-amber-500' : 'bg-rose-500'}
                  />
                </div>
              )}

              {/* Deploy age */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Last Deploy</span>
                <span className="text-xs text-zinc-300">
                  {system.deploy_age_hours !== null ? `${system.deploy_age_hours}h ago` : '—'}
                </span>
              </div>

              {/* Ollama */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Ollama</span>
                {system.ollama?.available ? (
                  <span className="text-xs text-emerald-400">Available</span>
                ) : (
                  <span className="text-xs text-rose-400">Unavailable</span>
                )}
              </div>

              {/* Containers */}
              {system.containers.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Containers</p>
                  <div className="space-y-1">
                    {system.containers.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${c.healthy ? 'bg-emerald-400' : 'bg-rose-500'}`}
                        />
                        <span className="text-xs text-zinc-300 font-mono">{c.name}</span>
                        <span className="text-xs text-zinc-600">{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Incidents */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Incidents</h2>
          {incidents.length === 0 ? (
            <div className="bg-zinc-900 rounded-xl px-5 py-5 border border-zinc-800 text-center text-zinc-600 text-sm">
              No incidents recorded.
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-zinc-500 font-medium">Service</th>
                    <th className="text-left px-4 py-3 text-zinc-500 font-medium">Started</th>
                    <th className="text-left px-4 py-3 text-zinc-500 font-medium">Duration</th>
                    <th className="text-left px-4 py-3 text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="border-b border-zinc-800 last:border-0">
                      <td className="px-4 py-3 text-zinc-200">{inc.display_name ?? inc.service_name}</td>
                      <td className="px-4 py-3 text-zinc-400">{formatDateTime(inc.started_at)}</td>
                      <td className="px-4 py-3 text-zinc-400">{inc.downtime_formatted}</td>
                      <td className="px-4 py-3">
                        {inc.resolved_at ? (
                          <span className="text-emerald-400">Resolved</span>
                        ) : (
                          <span className="text-rose-400">Open</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
