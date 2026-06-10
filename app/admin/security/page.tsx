'use client';

/**
 * Security Monitor
 *
 * Live security telemetry for the MAIA stack:
 *   - Auth events (failed sign-ins, active sessions, revocations)
 *   - Active sessions with IP / user-agent
 *   - Environment variable health
 *   - Container security posture
 *   - Sanctuary boundary status
 *
 * Data source: GET /api/admin/security
 * Auto-refreshes every 60 seconds.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { adminFetch } from '@/lib/admin/adminFetch';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Server,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Clock,
  Globe,
  Ban,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AuthEvent {
  actionType: string;
  result: string;
  ip: string | null;
  ua: string | null;
  ts: string;
  error: string | null;
}

interface ActiveSession {
  id: string;
  username: string | null;
  ip: string | null;
  ua: string | null;
  createdAt: string;
  lastActive: string;
  expiresAt: string;
}

interface ContainerEntry {
  name: string;
  networks: string[];
  noNewPrivileges: boolean;
  capDrop: boolean;
  securityNote: string | null;
}

interface SecurityData {
  generatedAt: string;
  auth: {
    failedSignins24h: number;
    activeSessionsCount: number;
    revokedSessions24h: number;
    uniqueFailedIPs24h: number;
    recentEvents: AuthEvent[];
  };
  sessions: {
    activeSessions: ActiveSession[];
    expiringSoon: number;
  };
  trend: { date: string; failed: number; success: number }[];
  environment: {
    nodeEnv: string;
    vars: Record<string, boolean>;
  };
  sanctuary: {
    boundaryVerified: boolean;
    oracleRouteGated: boolean;
    clientBypassFixed: boolean;
    note: string;
  };
  containers: ContainerEntry[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function StatusDot({ ok, warn }: { ok: boolean; warn?: boolean }) {
  const color = ok ? 'bg-emerald-400' : warn ? 'bg-amber-400' : 'bg-red-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-2 flex-shrink-0`} />;
}

function SectionCard({
  title,
  icon: Icon,
  children,
  badge,
  badgeColor = 'text-slate-400',
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{title}</h2>
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-mono ${badgeColor}`}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityMonitorPage() {
  const router = useRouter();
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [revokeMessage, setRevokeMessage] = useState<{ id: string; ok: boolean } | null>(null);
  const [alerts, setAlerts] = useState<{
    id: string; severity: string; alertType: string;
    title: string; message: string; notified: boolean; acknowledged: boolean; createdAt: string;
  }[]>([]);
  const [checkingNow, setCheckingNow] = useState(false);

  useEffect(() => {
    const user = betaSession.getUser();
    if (!user) {
      router.push('/signin');
    }
  }, [router]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/security/alerts');
      if (!res.ok) return;
      const json = await res.json();
      setAlerts(json.alerts ?? []);
    } catch { /* non-fatal */ }
  }, []);

  const runCheck = useCallback(async () => {
    setCheckingNow(true);
    try {
      await adminFetch('/api/admin/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });
      await fetchAlerts();
    } finally {
      setCheckingNow(false);
    }
  }, [fetchAlerts]);

  const ackAlert = useCallback(async (alertId: string) => {
    await adminFetch('/api/admin/security/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ack', alertId }),
    });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminFetch('/api/admin/security');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    setRevokingSession(sessionId);
    setRevokeMessage(null);
    try {
      const res = await adminFetch('/api/admin/security/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action: 'revoke' }),
      });
      const ok = res.ok;
      setRevokeMessage({ id: sessionId, ok });
      if (ok) {
        // Optimistically remove from list
        setData(prev => prev ? {
          ...prev,
          sessions: {
            ...prev.sessions,
            activeSessions: prev.sessions.activeSessions.filter(s => s.id !== sessionId),
          },
          auth: {
            ...prev.auth,
            activeSessionsCount: Math.max(0, prev.auth.activeSessionsCount - 1),
            revokedSessions24h: prev.auth.revokedSessions24h + 1,
          },
        } : prev);
      }
    } catch {
      setRevokeMessage({ id: sessionId, ok: false });
    } finally {
      setRevokingSession(null);
      setTimeout(() => setRevokeMessage(null), 3000);
    }
  }, []);

  // Initial load + 60s auto-refresh
  useEffect(() => {
    fetchData();
    fetchAlerts();
    const interval = setInterval(() => { fetchData(); fetchAlerts(); }, 60_000);
    return () => clearInterval(interval);
  }, [fetchData, fetchAlerts]);

  const envAllPresent = data
    ? Object.values(data.environment.vars).every(Boolean)
    : false;

  const overallThreatLevel: 'clear' | 'watch' | 'alert' =
    !data ? 'clear'
    : data.auth.failedSignins24h > 10 ? 'alert'
    : data.auth.failedSignins24h > 3  ? 'watch'
    : 'clear';

  const threatColor = {
    clear: 'text-emerald-400',
    watch: 'text-amber-400',
    alert: 'text-red-400',
  }[overallThreatLevel];

  const ThreatIcon = overallThreatLevel === 'alert' ? ShieldAlert
    : overallThreatLevel === 'watch' ? Shield
    : ShieldCheck;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-4 md:p-8">
      {/* ── Header ── */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <ThreatIcon className={`w-6 h-6 ${threatColor}`} />
              <div>
                <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                  Security Monitor
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lastRefresh
                    ? `Updated ${timeAgo(lastRefresh.toISOString())} · auto-refreshes every 60s`
                    : 'Loading…'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runCheck}
              disabled={checkingNow}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {checkingNow
                ? <><RefreshCw className="w-3 h-3 animate-spin" /> Checking…</>
                : <><Shield className="w-3 h-3" /> Check Now</>}
            </button>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
              overallThreatLevel === 'alert' ? 'border-red-500/50 text-red-400 bg-red-500/10'
              : overallThreatLevel === 'watch' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
              : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
            }`}>
              {overallThreatLevel === 'alert' ? 'ALERT'
                : overallThreatLevel === 'watch' ? 'WATCH'
                : 'ALL CLEAR'}
            </span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ── Alert Panel ── */}
        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.filter(a => !a.acknowledged).slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-900/25 border-red-500/40'
                    : 'bg-amber-900/20 border-amber-500/30'
                }`}
              >
                {alert.severity === 'CRITICAL'
                  ? <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold ${alert.severity === 'CRITICAL' ? 'text-red-300' : 'text-amber-300'}`}>
                    {alert.title}
                  </span>
                  <span className="text-slate-400 ml-2">{alert.message}</span>
                  {alert.notified && (
                    <span className="ml-2 text-xs text-emerald-500">· email sent</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-500">{timeAgo(alert.createdAt)}</span>
                  <button
                    onClick={() => ackAlert(alert.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Acknowledge"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Stat Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'Failed Auths 24h',
              value: data?.auth.failedSignins24h ?? '—',
              icon: AlertTriangle,
              color: (data?.auth.failedSignins24h ?? 0) > 3 ? 'text-red-400' : 'text-emerald-400',
            },
            {
              label: 'Active Sessions',
              value: data?.auth.activeSessionsCount ?? '—',
              icon: Activity,
              color: 'text-teal-400',
            },
            {
              label: 'Unique Fail IPs',
              value: data?.auth.uniqueFailedIPs24h ?? '—',
              icon: Globe,
              color: (data?.auth.uniqueFailedIPs24h ?? 0) > 2 ? 'text-amber-400' : 'text-slate-300',
            },
            {
              label: 'Revoked 24h',
              value: data?.auth.revokedSessions24h ?? '—',
              icon: Lock,
              color: 'text-slate-300',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* ── Auth Event Feed ── */}
          <SectionCard
            title="Auth Event Feed"
            icon={Activity}
            badge={`${data?.auth.recentEvents.length ?? 0} events`}
          >
            {!data || data.auth.recentEvents.length === 0 ? (
              <p className="text-slate-500 text-sm">No events recorded.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {data.auth.recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded-lg ${
                      ev.result === 'failure'
                        ? 'bg-red-900/20 border border-red-500/20'
                        : 'bg-slate-700/30 border border-slate-600/20'
                    }`}
                  >
                    {ev.result === 'failure'
                      ? <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      : <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-slate-200">{ev.actionType}</span>
                      {ev.ip && (
                        <span className="text-slate-400 ml-2">{ev.ip}</span>
                      )}
                      {ev.error && (
                        <span className="text-red-400 ml-2 truncate">{ev.error}</span>
                      )}
                    </div>
                    <span className="text-slate-500 flex-shrink-0">{timeAgo(ev.ts)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Active Sessions ── */}
          <SectionCard
            title="Active Sessions"
            icon={Eye}
            badge={`${data?.sessions.activeSessions.length ?? 0} active`}
            badgeColor={
              (data?.sessions.expiringSoon ?? 0) > 0 ? 'text-amber-400' : 'text-slate-400'
            }
          >
            {(data?.sessions.expiringSoon ?? 0) > 0 && (
              <div className="mb-3 px-2 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {data!.sessions.expiringSoon} session{data!.sessions.expiringSoon !== 1 ? 's' : ''} expiring in 6h
              </div>
            )}
            {!data || data.sessions.activeSessions.length === 0 ? (
              <p className="text-slate-500 text-sm">No active sessions.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {data.sessions.activeSessions.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                      revokeMessage?.id === s.id
                        ? revokeMessage.ok
                          ? 'bg-emerald-900/20 border-emerald-500/30'
                          : 'bg-red-900/20 border-red-500/30'
                        : 'bg-slate-700/30 border-slate-600/20'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="font-mono text-slate-200 flex-shrink-0">
                      {s.username ?? 'anon'}
                    </span>
                    {s.ip && <span className="text-slate-400">{s.ip}</span>}
                    <span className="text-slate-500 ml-auto flex-shrink-0">
                      {timeAgo(s.lastActive)}
                    </span>
                    <button
                      onClick={() => revokeSession(s.id)}
                      disabled={revokingSession === s.id}
                      title="Revoke session"
                      className="flex-shrink-0 p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      {revokingSession === s.id
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <Ban className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── 7-Day Auth Trend ── */}
        <div className="mb-6">
        <SectionCard title="7-Day Auth Trend" icon={Activity} badge="failed vs success">
          {!data || data.trend.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No trend data yet — audit_logs populates this over time.</p>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data.trend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={d => d.slice(5)} // MM-DD
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', fontSize: '11px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="failed"  stroke="#f87171" strokeWidth={2} dot={false} name="Failed" />
                <Line type="monotone" dataKey="success" stroke="#34d399" strokeWidth={2} dot={false} name="Success" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* ── Environment Health ── */}
          <SectionCard
            title="Environment"
            icon={Key}
            badge={envAllPresent ? '✓ all present' : '⚠ missing vars'}
            badgeColor={envAllPresent ? 'text-emerald-400' : 'text-red-400'}
          >
            {data ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs mb-3">
                  <StatusDot ok={data.environment.nodeEnv === 'production'} />
                  <span className="text-slate-400">NODE_ENV</span>
                  <span className={`ml-auto font-mono ${
                    data.environment.nodeEnv === 'production' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {data.environment.nodeEnv}
                  </span>
                </div>
                {Object.entries(data.environment.vars).map(([name, present]) => (
                  <div key={name} className="flex items-center gap-2 text-xs">
                    <StatusDot ok={present} />
                    <span className="text-slate-400 font-mono truncate">{name}</span>
                    {present
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto flex-shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-700/50 rounded" />
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Sanctuary Boundary ── */}
          <SectionCard title="Sanctuary Boundary" icon={Shield}>
            {data ? (
              <div className="space-y-3">
                {[
                  {
                    label: 'Oracle route gated',
                    ok: data.sanctuary.oracleRouteGated,
                    detail: '4 write points blocked when active',
                  },
                  {
                    label: 'Client bypass fixed',
                    ok: data.sanctuary.clientBypassFixed,
                    detail: 'OracleConversation sends real state',
                  },
                  {
                    label: 'Boundary verified',
                    ok: data.sanctuary.boundaryVerified,
                    detail: 'No content written to DB in sanctuary',
                  },
                ].map(({ label, ok, detail }) => (
                  <div key={label} className="flex items-start gap-2 text-xs">
                    {ok
                      ? <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <div className={ok ? 'text-slate-200' : 'text-red-300'}>{label}</div>
                      <div className="text-slate-500">{detail}</div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/50 italic">
                  {data.sanctuary.note}
                </p>
              </div>
            ) : (
              <div className="animate-pulse h-32 bg-slate-700/30 rounded" />
            )}
          </SectionCard>

          {/* ── Cookie Security ── */}
          <SectionCard title="Cookie Security" icon={Lock}>
            <div className="space-y-3 text-xs">
              {[
                {
                  name: 'maia_session',
                  httpOnly: true,
                  sameSite: 'Lax',
                  secure: true,
                },
                {
                  name: 'maia_tier',
                  httpOnly: true,
                  sameSite: 'Lax',
                  secure: true,
                },
                {
                  name: 'maia_roles',
                  httpOnly: true,
                  sameSite: 'Lax',
                  secure: true,
                },
                {
                  name: 'maia_member_id',
                  httpOnly: true,
                  sameSite: 'Lax',
                  secure: true,
                },
              ].map(({ name, httpOnly, sameSite, secure }) => (
                <div key={name} className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="font-mono text-slate-200 flex-shrink-0">{name}</span>
                  <div className="ml-auto flex gap-1">
                    {httpOnly && (
                      <span className="px-1 py-0.5 rounded bg-emerald-900/40 text-emerald-400 text-[10px]">
                        HttpOnly
                      </span>
                    )}
                    {secure && (
                      <span className="px-1 py-0.5 rounded bg-teal-900/40 text-teal-400 text-[10px]">
                        Secure
                      </span>
                    )}
                    <span className="px-1 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                      {sameSite}
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-slate-500 text-[11px] pt-2 border-t border-slate-700/50">
                Fixed this session — maia_tier + maia_roles are no longer JS-readable.
              </p>
            </div>
          </SectionCard>
        </div>

        {/* ── Container Posture ── */}
        <SectionCard title="Container Security Posture" icon={Server}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-left">
                  <th className="pb-2 pr-4 font-medium">Container</th>
                  <th className="pb-2 pr-4 font-medium">Networks</th>
                  <th className="pb-2 pr-4 font-medium text-center">no-new-privs</th>
                  <th className="pb-2 pr-4 font-medium text-center">cap_drop</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {(data?.containers ?? CONTAINER_POSTURE_FALLBACK).map((c) => (
                  <tr key={c.name} className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-2 pr-4 font-mono text-slate-200">{c.name}</td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {c.networks.map(n => (
                          <span
                            key={n}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              n === 'maia-internal'
                                ? 'bg-blue-900/40 text-blue-300'
                                : n === 'maia-public'
                                ? 'bg-teal-900/40 text-teal-300'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {c.noNewPrivileges
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-2 pr-4 text-center">
                      {c.capDrop
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                        : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-2">
                      {c.securityNote ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          {c.securityNote}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-900/40 border border-blue-500/30" />
              maia-internal — no public exposure
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-teal-900/40 border border-teal-500/30" />
              maia-public — Caddy-proxied
            </span>
            <span className="ml-auto italic">
              Posture reflects docker-compose.production.yml configuration
            </span>
          </div>
        </SectionCard>

        {/* ── Security Debt ── */}
        <div className="mt-6 p-4 bg-amber-900/15 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300">Open Security Debt</h2>
          </div>
          <div className="space-y-2 text-xs text-amber-200/80">
            {[
              'rudeboy-baking uses hardcoded soullab:soullab database password — create a restricted DB user',
              'Legacy SHA256 password hashes still active — force bcrypt rehash on next login for legacy accounts',
              'pnpm audit not yet wired into CI deploy script — add audit --prod --audit-level=moderate gate',
              'Privacy Policy contains Supabase references and unfilled [INSERT …] placeholders',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-amber-500 flex-shrink-0 mt-0.5">#{i + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-slate-600 text-xs">
          MAIA Security Monitor · data from audit_logs + auth_sessions
          {data ? ` · snapshot at ${new Date(data.generatedAt).toLocaleTimeString()}` : ''}
        </p>
      </div>
    </div>
  );
}

// Fallback for when API hasn't loaded yet (matches API data shape)
const CONTAINER_POSTURE_FALLBACK: ContainerEntry[] = [];
