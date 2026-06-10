'use client';

// Operations Monitors — /admin/ops
//
// The operational signals that previously required SSH / psql / docker-logs,
// surfaced read-only in Admin. Phase 1: make the signal visible. Six live
// panels + an honest "not yet instrumented" token/cost card (no fake data).
// Admin-gated by the same password contract as the rest of /admin.

import { useCallback, useState, type FormEvent, type ReactNode } from 'react';

interface OpsData {
  generatedAt: string;
  voice: { available: boolean; error?: string; total7d?: number; seconds7d?: number; bytes7d?: number; members7d?: number; status?: { ok: number; rejected: number; error: number } };
  providers: { available: boolean; error?: string; status?: string; primary?: string; claude?: boolean; local?: boolean; kimi?: boolean; model?: string | null };
  deploy: { uptimeSec: number; version: string; appVersion: string | null; buildDate: string | null; nodeEnv: string; safeMode: boolean; db: { ok: boolean; latencyMs: number | null } };
  members: { available: boolean; error?: string; total?: number; neverSignedIn?: number; onboardingIncomplete?: number; new7d?: number; active7d?: number };
  migrations: { available: boolean; error?: string; appliedCount?: number; requiredCount?: number; missing?: string[]; drift?: boolean; recent?: { filename: string; appliedAt: string }[] };
}

const fmtUptime = (s: number) => {
  const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const fmtBytes = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`);
const fmtSeconds = (s: number) => (s >= 3600 ? `${(s / 3600).toFixed(1)} h` : s >= 60 ? `${(s / 60).toFixed(0)} min` : `${s} s`);

function Dot({ on }: { on: boolean | undefined }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${on ? 'bg-emerald-400' : 'bg-rose-500'}`} />;
}
function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-white/90">{title}</h2>
        {sub && <span className="text-[11px] text-white/40">{sub}</span>}
      </div>
      {children}
    </div>
  );
}
function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: 'warn' | 'bad' | 'ok' }) {
  const c = tone === 'bad' ? 'text-rose-300' : tone === 'warn' ? 'text-amber-300' : tone === 'ok' ? 'text-emerald-300' : 'text-white';
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-white/50">{label}</span>
      <span className={`font-mono ${c}`}>{value}</span>
    </div>
  );
}
function Unavailable({ error }: { error?: string }) {
  return <p className="text-xs text-amber-300/80">Source unavailable{error ? `: ${error}` : ''}</p>;
}

export default function OpsMonitorsPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdInput, setPwdInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOps = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch('/api/admin/ops', { headers: { 'x-admin-password': password } });
    if (res.status === 401) return false;
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    setData(await res.json());
    return true;
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null); setLoading(true);
    try {
      const ok = await fetchOps(pwdInput);
      if (!ok) { setAuthError('Incorrect admin password.'); return; }
      setPwd(pwdInput); setAuthed(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Request failed');
    } finally { setLoading(false); }
  };

  const refresh = async () => {
    setLoading(true); setFetchError(null);
    try { await fetchOps(pwd); } catch (err) { setFetchError(err instanceof Error ? err.message : 'Request failed'); } finally { setLoading(false); }
  };

  if (!authed) {
    return (
      <div className="mx-auto mt-24 max-w-sm px-6">
        <h1 className="mb-1 text-lg font-semibold text-white">Operations Monitors</h1>
        <p className="mb-6 text-sm text-white/50">Admin access required.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)}
            placeholder="Admin password" autoFocus
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/40"
          />
          <button type="submit" disabled={loading || !pwdInput}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-40">
            {loading ? 'Checking…' : 'Enter'}
          </button>
          {authError && <p className="text-xs text-rose-300">{authError}</p>}
        </form>
      </div>
    );
  }

  const d = data;
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Operations Monitors</h1>
          <p className="text-xs text-white/40">Read-only operational signals. {d ? `Generated ${new Date(d.generatedAt).toLocaleTimeString()}` : ''}</p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40">
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {fetchError && <p className="mb-4 text-xs text-rose-300">{fetchError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Deploy health */}
        <Panel title="Deploy Health" sub="this process">
          {d ? (
            <>
              <Stat label="Uptime" value={fmtUptime(d.deploy.uptimeSec)} />
              <Stat label="Commit" value={d.deploy.version.slice(0, 12)} />
              <Stat label="Env" value={d.deploy.nodeEnv} />
              <Stat label="Safe mode" value={d.deploy.safeMode ? 'ON' : 'off'} tone={d.deploy.safeMode ? 'warn' : undefined} />
              <Stat label="Database" value={d.deploy.db.ok ? `ok ${d.deploy.db.latencyMs}ms` : 'DOWN'} tone={d.deploy.db.ok ? 'ok' : 'bad'} />
              {d.deploy.buildDate && <Stat label="Built" value={new Date(d.deploy.buildDate).toLocaleDateString()} />}
            </>
          ) : <Unavailable />}
        </Panel>

        {/* Provider health */}
        <Panel title="Provider Health" sub="Claude / local">
          {d?.providers.available ? (
            <>
              <Stat label="Status" value={d.providers.status} tone={d.providers.status === 'healthy' ? 'ok' : d.providers.status === 'degraded' ? 'warn' : 'bad'} />
              <Stat label="Primary" value={d.providers.primary} />
              <Stat label="Model" value={d.providers.model ?? '—'} />
              <div className="mt-2 flex gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1"><Dot on={d.providers.claude} /> Claude</span>
                <span className="flex items-center gap-1"><Dot on={d.providers.local} /> Local</span>
                <span className="flex items-center gap-1"><Dot on={d.providers.kimi} /> Kimi</span>
              </div>
            </>
          ) : <Unavailable error={d?.providers.error} />}
        </Panel>

        {/* Voice usage */}
        <Panel title="Voice Usage" sub="last 7 days">
          {d?.voice.available ? (
            <>
              <Stat label="Turns" value={d.voice.total7d} />
              <Stat label="Audio" value={fmtSeconds(d.voice.seconds7d ?? 0)} />
              <Stat label="Transferred" value={fmtBytes(d.voice.bytes7d ?? 0)} />
              <Stat label="Members" value={d.voice.members7d} />
              <Stat label="ok / rejected / error" value={`${d.voice.status?.ok ?? 0} / ${d.voice.status?.rejected ?? 0} / ${d.voice.status?.error ?? 0}`}
                tone={(d.voice.status?.error ?? 0) > 0 ? 'warn' : undefined} />
            </>
          ) : <Unavailable error={d?.voice.error} />}
        </Panel>

        {/* Member state */}
        <Panel title="Member State" sub="anomalies">
          {d?.members.available ? (
            <>
              <Stat label="Total members" value={d.members.total} />
              <Stat label="Never signed in" value={d.members.neverSignedIn} tone={(d.members.neverSignedIn ?? 0) > 0 ? 'warn' : undefined} />
              <Stat label="Onboarding incomplete" value={d.members.onboardingIncomplete} tone={(d.members.onboardingIncomplete ?? 0) > 0 ? 'warn' : undefined} />
              <Stat label="New (7d)" value={d.members.new7d} />
              <Stat label="Active (7d)" value={d.members.active7d} />
            </>
          ) : <Unavailable error={d?.members.error} />}
        </Panel>

        {/* Migration status */}
        <Panel title="Migration Status" sub="schema vs required">
          {d?.migrations.available ? (
            <>
              <Stat label="Applied" value={d.migrations.appliedCount} />
              <Stat label="Required" value={d.migrations.requiredCount} />
              <Stat label="Drift" value={d.migrations.drift ? `${d.migrations.missing?.length} MISSING` : 'none'} tone={d.migrations.drift ? 'bad' : 'ok'} />
              {d.migrations.drift && (
                <ul className="mt-1 space-y-0.5 text-[11px] text-rose-300/80">
                  {d.migrations.missing?.slice(0, 5).map((m) => <li key={m} className="truncate font-mono">{m}</li>)}
                </ul>
              )}
              <p className="mt-2 text-[11px] text-white/30">latest: {d.migrations.recent?.[0]?.filename ?? '—'}</p>
            </>
          ) : <Unavailable error={d?.migrations.error} />}
        </Panel>

        {/* Security / auth — link out, don't rebuild */}
        <Panel title="Security & Auth" sub="existing surface">
          <p className="text-sm text-white/60">Auth events, active sessions, impersonation attempts, and container posture live on the dedicated security page.</p>
          <a href="/admin/security" className="mt-3 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">
            Open Security →
          </a>
        </Panel>

        {/* Token / cost — honest, not yet instrumented */}
        <Panel title="Token / Cost Usage" sub="not instrumented">
          <p className="text-sm text-white/70">Not currently instrumented in production.</p>
          <p className="mt-2 text-xs text-white/40">
            Historical instrumentation exists but is not active on the deployed line.
          </p>
        </Panel>
      </div>
    </div>
  );
}
