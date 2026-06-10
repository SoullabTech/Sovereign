'use client';

// The Monitor Field — /admin/monitor.
//
// One surface, several signals entering the same field of awareness. Bugs is
// wired today; feedback / requests / system-alerts are reserved slots, shown
// honestly as not-yet-wired (no fake function). Admin-gated by the same
// password contract as the rest of /admin (LABTOOLS_ADMIN_PASSWORD).

import { useCallback, useEffect, useState, type FormEvent } from 'react';

type BugSource = 'member' | 'claude' | 'system';
type BugSeverity = 'low' | 'normal' | 'high' | 'critical';
type BugStatus = 'new' | 'seen' | 'resolved' | 'wont_fix';

interface BugReport {
  id: string;
  title: string | null;
  message: string;
  source: BugSource;
  reporterName: string | null;
  url: string | null;
  userAgent: string | null;
  context: Record<string, unknown>;
  severity: BugSeverity;
  status: BugStatus;
  resolvedByName: string | null;
  resolvedAt: string | null;
  adminNote: string | null;
  mirrorChannelSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BugStatusCounts {
  new: number;
  seen: number;
  resolved: number;
  wont_fix: number;
  total: number;
}

const SEVERITY_DOT: Record<BugSeverity, string> = {
  low: 'bg-sky-400/60',
  normal: 'bg-maia-ink-40',
  high: 'bg-amber-400',
  critical: 'bg-rose-500',
};

const STATUS_BADGE: Record<BugStatus, string> = {
  new: 'text-amber-200 border-amber-400/40',
  seen: 'text-sky-200 border-sky-400/40',
  resolved: 'text-emerald-200 border-emerald-400/40',
  wont_fix: 'text-maia-ink-40 border-maia-ink-40/30',
};

const STATUS_LABEL: Record<BugStatus, string> = {
  new: 'New',
  seen: 'Seen',
  resolved: 'Resolved',
  wont_fix: "Won't fix",
};

const SOURCE_LABEL: Record<BugSource, string> = {
  member: 'member',
  claude: 'claude',
  system: 'system',
};

const STATUSES: BugStatus[] = ['new', 'seen', 'resolved', 'wont_fix'];
const SEVERITIES: BugSeverity[] = ['low', 'normal', 'high', 'critical'];

type Tab = 'bugs' | 'feedback' | 'requests' | 'alerts';

export default function MonitorFieldPage() {
  const [authed, setAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('bugs');

  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [counts, setCounts] = useState<BugStatusCounts | null>(null);
  const [statusFilter, setStatusFilter] = useState<BugStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Deep link: /admin/monitor?bug=<id> pre-expands that report.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('bug');
    if (id) setExpandedId(id);
  }, []);

  const fetchBugs = useCallback(
    async (pwd: string, status: BugStatus | '', q: string): Promise<boolean> => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/admin/monitor/bugs?${params.toString()}`, {
        headers: { 'x-admin-password': pwd },
      });
      if (res.status === 401) return false;
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setBugs(data.bugs ?? []);
      setCounts(data.counts ?? null);
      return true;
    },
    [],
  );

  const load = useCallback(
    async (pwd: string, status: BugStatus | '', q: string) => {
      setLoading(true);
      setFetchError(null);
      try {
        const ok = await fetchBugs(pwd, status, q);
        if (!ok) {
          setAuthError('Incorrect admin password.');
          setAuthed(false);
          return;
        }
        setAuthed(true);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Fetch error');
      } finally {
        setLoading(false);
      }
    },
    [fetchBugs],
  );

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAdminPassword(passwordInput);
    load(passwordInput, statusFilter, search);
  }

  // Refetch on filter change once authed.
  useEffect(() => {
    if (authed) load(adminPassword, statusFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function patchBug(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/monitor/bugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      const updated: BugReport = data.bug;
      setBugs((prev) => prev.map((b) => (b.id === id ? updated : b)));
      // Reload counts (status may have moved between buckets).
      load(adminPassword, statusFilter, search);
    }
  }

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 flex items-center justify-center p-6">
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="text-2xl font-light tracking-wide">Monitor Field</h1>
            <p className="text-sm text-maia-ink-60 mt-1">Admin access required.</p>
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full rounded border border-maia-ink-40/30 bg-maia-navy-900/60 px-3 py-2 text-sm focus:border-amber-300/40 focus:outline-none"
          />
          {authError && <div className="text-sm text-rose-300">{authError}</div>}
          <button
            type="submit"
            disabled={loading || !passwordInput}
            className="w-full rounded border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200 hover:bg-amber-300/20 disabled:opacity-40"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    );
  }

  // ── Field ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-light tracking-wide">Monitor Field</h1>
          <p className="text-maia-ink-60 text-sm mt-1 max-w-2xl">
            Signals entering one field of awareness. The table is memory; the{' '}
            <span className="font-mono text-maia-ink-100">#bugs</span> Co-lab channel is attention.
          </p>
        </header>

        {/* Tabs */}
        <nav className="flex flex-wrap gap-1 border-b border-maia-ink-40/15">
          <TabButton label="Bugs" active={tab === 'bugs'} onClick={() => setTab('bugs')} badge={counts?.new || undefined} />
          <TabButton label="Feedback" active={tab === 'feedback'} onClick={() => setTab('feedback')} muted />
          <TabButton label="Requests" active={tab === 'requests'} onClick={() => setTab('requests')} muted />
          <TabButton label="System alerts" active={tab === 'alerts'} onClick={() => setTab('alerts')} muted />
        </nav>

        {tab === 'bugs' && (
          <BugsPanel
            bugs={bugs}
            counts={counts}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            search={search}
            setSearch={setSearch}
            onSearchSubmit={() => load(adminPassword, statusFilter, search)}
            loading={loading}
            fetchError={fetchError}
            onRefresh={() => load(adminPassword, statusFilter, search)}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            patchBug={patchBug}
          />
        )}

        {tab === 'feedback' && (
          <ReservedSlot
            title="Feedback"
            detail="Member feedback — praise, friction, requests for change. Reserved slot in the field; not yet wired."
          />
        )}
        {tab === 'requests' && (
          <ReservedSlot
            title="Requests"
            detail="Feature requests and practitioner observations. Reserved slot in the field; not yet wired."
          />
        )}
        {tab === 'alerts' && (
          <ReservedSlot
            title="System alerts"
            detail="Automated warnings — health, deploy, capacity. Reserved slot in the field; not yet wired."
          />
        )}
      </div>
    </div>
  );
}

// ── Bugs panel ────────────────────────────────────────────────────────────────

function BugsPanel(props: {
  bugs: BugReport[];
  counts: BugStatusCounts | null;
  statusFilter: BugStatus | '';
  setStatusFilter: (s: BugStatus | '') => void;
  search: string;
  setSearch: (s: string) => void;
  onSearchSubmit: () => void;
  loading: boolean;
  fetchError: string | null;
  onRefresh: () => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  patchBug: (id: string, patch: Record<string, unknown>) => void;
}) {
  const { bugs, counts, statusFilter, setStatusFilter, search, setSearch, onSearchSubmit, loading, fetchError, onRefresh, expandedId, setExpandedId, patchBug } = props;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" count={counts?.total} active={statusFilter === ''} onClick={() => setStatusFilter('')} />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={STATUS_LABEL[s]}
              count={counts?.[s]}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            placeholder="Search…"
            className="rounded border border-maia-ink-40/30 bg-maia-navy-900/60 px-2.5 py-1.5 text-xs focus:border-amber-300/40 focus:outline-none"
          />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded border border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/60 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="rounded border border-rose-400/40 bg-rose-950/30 text-rose-200 p-3 text-sm">{fetchError}</div>
      )}

      {bugs.length === 0 && !loading && (
        <div className="rounded border border-maia-ink-40/20 bg-maia-navy-900/40 p-6 text-sm text-maia-ink-40">
          No reports{statusFilter ? ` with status “${STATUS_LABEL[statusFilter]}”` : ''}. Quiet field.
        </div>
      )}

      <div className="space-y-2">
        {bugs.map((bug) => (
          <BugRow
            key={bug.id}
            bug={bug}
            expanded={expandedId === bug.id}
            onToggle={() => setExpandedId(expandedId === bug.id ? null : bug.id)}
            patchBug={patchBug}
          />
        ))}
      </div>
    </section>
  );
}

function BugRow({
  bug,
  expanded,
  onToggle,
  patchBug,
}: {
  bug: BugReport;
  expanded: boolean;
  onToggle: () => void;
  patchBug: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [note, setNote] = useState(bug.adminNote ?? '');

  return (
    <div className={`rounded border bg-maia-navy-900/40 ${expanded ? 'border-amber-300/30' : 'border-maia-ink-40/20'}`}>
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[bug.severity]}`} title={`severity: ${bug.severity}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-block px-2 py-0.5 rounded border text-[11px] ${STATUS_BADGE[bug.status]}`}>
              {STATUS_LABEL[bug.status]}
            </span>
            <span className="text-[11px] text-maia-ink-40">{SOURCE_LABEL[bug.source]}</span>
            <span className="text-[11px] text-maia-ink-60">{bug.reporterName ?? 'Anonymous'}</span>
            <span className="text-[11px] text-maia-ink-40">· {formatTime(bug.createdAt)}</span>
          </div>
          <div className="mt-1 truncate text-sm text-maia-ink-100">{bug.message}</div>
          {bug.url && <div className="mt-0.5 truncate font-mono text-[11px] text-maia-ink-40">{bug.url}</div>}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-maia-ink-40/10 px-4 py-3 space-y-3">
          <p className="whitespace-pre-wrap text-sm text-maia-ink-100">{bug.message}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-maia-ink-60">
            <Meta label="Route" value={bug.url ?? '—'} mono />
            <Meta label="Browser" value={bug.userAgent ? bug.userAgent.slice(0, 60) : '—'} />
            <Meta label="Source" value={bug.source} />
            <Meta label="Reported" value={formatTime(bug.createdAt)} />
            {bug.mirrorChannelSlug && <Meta label="Mirrored" value={`#${bug.mirrorChannelSlug}`} />}
            {bug.resolvedAt && <Meta label="Resolved" value={`${formatTime(bug.resolvedAt)}${bug.resolvedByName ? ` · ${bug.resolvedByName}` : ''}`} />}
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => patchBug(bug.id, { status: s })}
                disabled={bug.status === s}
                className={`text-[11px] px-2 py-1 rounded border transition ${
                  bug.status === s
                    ? `${STATUS_BADGE[s]} opacity-100`
                    : 'border-maia-ink-40/25 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/50'
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
            <span className="mx-1 text-maia-ink-40/40">|</span>
            <select
              value={bug.severity}
              onChange={(e) => patchBug(bug.id, { severity: e.target.value })}
              className="rounded border border-maia-ink-40/25 bg-maia-navy-900/60 px-1.5 py-1 text-[11px] text-maia-ink-80 focus:outline-none"
              title="severity"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s} className="bg-maia-navy-950">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Admin note */}
          <div className="flex items-start gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Admin note (internal)…"
              className="flex-1 resize-none rounded border border-maia-ink-40/20 bg-maia-navy-900/60 p-2 text-[12px] text-maia-ink-100 placeholder:text-maia-ink-40/60 focus:border-amber-300/40 focus:outline-none"
            />
            <button
              onClick={() => patchBug(bug.id, { adminNote: note })}
              disabled={note === (bug.adminNote ?? '')}
              className="shrink-0 text-[11px] px-2.5 py-1.5 rounded border border-maia-ink-40/30 text-maia-ink-60 hover:text-maia-ink-100 hover:border-maia-ink-40/60 disabled:opacity-40"
            >
              Save note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────

function TabButton({ label, active, onClick, badge, muted }: { label: string; active: boolean; onClick: () => void; badge?: number; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 text-sm -mb-px border-b-2 transition ${
        active
          ? 'border-amber-300/60 text-maia-ink-100'
          : `border-transparent ${muted ? 'text-maia-ink-40' : 'text-maia-ink-60'} hover:text-maia-ink-100`
      }`}
    >
      {label}
      {badge ? <span className="ml-1.5 rounded-full bg-amber-300/20 px-1.5 py-0.5 text-[10px] text-amber-200">{badge}</span> : null}
    </button>
  );
}

function FilterChip({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition ${
        active ? 'border-amber-300/50 text-amber-200 bg-amber-300/10' : 'border-maia-ink-40/25 text-maia-ink-60 hover:text-maia-ink-100'
      }`}
    >
      {label}
      {count != null && <span className="ml-1 text-maia-ink-40">{count}</span>}
    </button>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="uppercase tracking-wider text-maia-ink-40">{label}: </span>
      <span className={mono ? 'font-mono text-maia-ink-100 break-all' : 'text-maia-ink-100 break-words'}>{value}</span>
    </div>
  );
}

function ReservedSlot({ title, detail }: { title: string; detail: string }) {
  return (
    <section className="rounded border border-dashed border-maia-ink-40/25 bg-maia-navy-900/30 p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-light tracking-wide text-maia-ink-60">{title}</h2>
        <span className="text-[10px] uppercase tracking-wider text-maia-ink-40 border border-maia-ink-40/30 rounded px-1.5 py-0.5">
          reserved · not wired
        </span>
      </div>
      <p className="mt-2 text-sm text-maia-ink-40 max-w-xl">{detail}</p>
    </section>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
