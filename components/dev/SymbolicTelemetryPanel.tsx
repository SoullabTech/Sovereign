'use client';

/**
 * Symbolic Telemetry Panel — Phase 22
 *
 * Inline debug/calibration surface for the governed symbolic pipeline.
 * Supports live (in-memory) and historical (DB) modes.
 *
 * ACTIVATION: add ?symbolic=1 to URL
 * REQUIREMENT: MAIA_DEBUG_PANEL_ENABLED=true
 *
 * Controls:
 *   Source: Live | 24h | 72h | 7d
 *   Domain: All | astrology | journal | pattern_ledger | field
 *
 * Live mode: in-memory snapshot, auto-refresh
 * DB mode: aggregate rows + hourly trend bars
 */

import * as React from 'react';
import type {
  TelemetrySummary,
  TelemetryAnomaly,
  SymbolicTelemetryEvent,
} from '@/lib/symbolic/symbolicTelemetry';
import type {
  TelemetryWindowRow,
  TelemetryTrendRow,
} from '@/lib/symbolic/symbolicTelemetryPersistence';

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface LiveResponse {
  ok: boolean;
  source: 'memory';
  eventCount: number;
  sessionId: string | null;
  summary: TelemetrySummary;
  anomalies: TelemetryAnomaly[];
  recentEvents: SymbolicTelemetryEvent[];
  generatedAt: string;
}

interface DbSummaryResponse {
  ok: boolean;
  source: 'db';
  windowHours: number;
  rows: TelemetryWindowRow[];
  totalEvents: number;
  generatedAt: string;
}

interface DbTrendResponse {
  ok: boolean;
  source: 'db';
  windowHours: number;
  trendRows: TelemetryTrendRow[];
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

type SourceMode = 'live' | '24' | '72' | '168';
type DomainFilter = 'all' | 'astrology' | 'journal' | 'pattern_ledger' | 'field';

const SOURCE_OPTIONS: { value: SourceMode; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: '24',   label: '24h' },
  { value: '72',   label: '72h' },
  { value: '168',  label: '7d'  },
];

const DOMAIN_OPTIONS: { value: DomainFilter; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'astrology',     label: 'Astrology' },
  { value: 'journal',       label: 'Journal' },
  { value: 'pattern_ledger', label: 'Patterns' },
  { value: 'field',         label: 'Field' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function pct(n: number, total: number): string {
  if (total === 0) return '—';
  return `${((n / total) * 100).toFixed(0)}%`;
}

function barWidth(n: number, max: number): string {
  if (max === 0) return '0%';
  return `${Math.max(2, (n / max) * 100).toFixed(0)}%`;
}

/** Group rows by a string key, summing the `count` field. */
function groupCount(rows: TelemetryWindowRow[], key: keyof TelemetryWindowRow): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r[key] ?? 'null');
    out[k] = (out[k] ?? 0) + r.count;
  }
  return out;
}

function sumField(rows: TelemetryWindowRow[], field: 'count' | 'memory_eligible' | 'prompt_eligible'): number {
  return rows.reduce((s, r) => s + r[field], 0);
}

/** Compute top block reasons from DB rows. */
function topBlockReasons(rows: TelemetryWindowRow[]): { reason: string; count: number }[] {
  const blocked = rows.filter(r => r.render_blocked && r.block_reason);
  const grouped: Record<string, number> = {};
  for (const r of blocked) {
    const k = r.block_reason!;
    grouped[k] = (grouped[k] ?? 0) + r.count;
  }
  return Object.entries(grouped)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
      {children}
    </div>
  );
}

function StatRow({ label, value, note, highlight }: {
  label: string; value: string | number; note?: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[12px]">
      <span className="text-white/60">{label}</span>
      <span className={highlight ? 'font-semibold text-amber-400' : 'tabular-nums text-white/80'}>
        {value}{note && <span className="ml-1 text-white/35">{note}</span>}
      </span>
    </div>
  );
}

function MiniBar({ value, max, color = 'bg-amber-500/40' }: {
  value: number; max: number; color?: string;
}) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: barWidth(value, max) }}
      />
    </div>
  );
}

function AnomalyBadge({ anomaly }: { anomaly: TelemetryAnomaly }) {
  const isWarn = anomaly.severity === 'warn';
  return (
    <div
      className={`rounded-md border px-2 py-1 text-[11px] ${isWarn
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        : 'border-white/10 bg-white/5 text-white/50'}`}
      title={anomaly.details}
    >
      <span className="font-medium">{anomaly.kind.replace(/_/g, ' ')}</span>
      <span className="ml-1 opacity-60">— {anomaly.details.slice(0, 80)}{anomaly.details.length > 80 ? '…' : ''}</span>
    </div>
  );
}

function PillButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${active
        ? 'bg-amber-500/20 text-amber-400'
        : 'text-white/40 hover:text-white/60'}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DB MODE VIEW
// ─────────────────────────────────────────────────────────────────────────────

function DbModeView({ rows, trendRows, windowHours, generatedAt }: {
  rows: TelemetryWindowRow[];
  trendRows: TelemetryTrendRow[];
  windowHours: number;
  generatedAt: string;
}) {
  const total = sumField(rows, 'count');
  const memoryEligible = sumField(rows, 'memory_eligible');
  const promptEligible = sumField(rows, 'prompt_eligible');
  const blocked = rows.filter(r => r.render_blocked).reduce((s, r) => s + r.count, 0);

  const authorityGroups = groupCount(rows, 'authority');
  const roleGroups = groupCount(rows, 'prompt_role');
  const domainGroups = groupCount(rows, 'domain');
  const reasons = topBlockReasons(rows);

  const maxAuthorityCount = Math.max(...Object.values(authorityGroups), 1);
  const maxRoleCount = Math.max(...Object.values(roleGroups), 1);
  const maxDomainCount = Math.max(...Object.values(domainGroups), 1);
  const maxReasonCount = Math.max(...reasons.map(r => r.count), 1);

  // Trend: aggregate hourly event_count + blocked across all domains
  const trendByHour: Record<string, { count: number; blocked: number; memory: number }> = {};
  for (const t of trendRows) {
    const k = t.hour_bucket;
    if (!trendByHour[k]) trendByHour[k] = { count: 0, blocked: 0, memory: 0 };
    trendByHour[k].count += t.event_count;
    trendByHour[k].blocked += t.blocked;
    trendByHour[k].memory += t.memory_eligible;
  }
  const trendEntries = Object.entries(trendByHour)
    .sort(([a], [b]) => b.localeCompare(a))  // most recent first
    .slice(0, 24);
  const maxTrendCount = Math.max(...trendEntries.map(([, v]) => v.count), 1);

  if (total === 0) {
    return (
      <div className="text-[11px] text-white/35">
        No events in the past {windowHours}h window.
        {generatedAt && <span className="ml-2 text-white/20">{new Date(generatedAt).toLocaleTimeString()}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, note: '' },
          { label: 'Block rate', value: pct(blocked, total), note: `${blocked} blocked` },
          { label: 'Memory yield', value: pct(memoryEligible, total), note: `${memoryEligible} eligible` },
          { label: 'Prompt yield', value: pct(promptEligible, total), note: `${promptEligible} eligible` },
        ].map(c => (
          <div key={c.label} className="rounded-md border border-white/10 bg-white/5 p-2">
            <div className="text-[10px] text-white/35">{c.label}</div>
            <div className="mt-0.5 text-[14px] font-semibold text-white/80">{c.value}</div>
            {c.note && <div className="text-[10px] text-white/30">{c.note}</div>}
          </div>
        ))}
      </div>

      {/* Authority distribution */}
      <div>
        <SectionLabel>Authority Distribution</SectionLabel>
        {['authoritative', 'derived', 'fallback'].map(auth => {
          const count = authorityGroups[auth] ?? 0;
          return (
            <div key={auth} className="mb-1.5">
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span className="text-white/60">{auth}</span>
                <span className={`tabular-nums ${auth === 'fallback' && count > total * 0.5 ? 'text-amber-400 font-semibold' : 'text-white/80'}`}>
                  {count} <span className="text-white/35">({pct(count, total)})</span>
                </span>
              </div>
              <MiniBar value={count} max={maxAuthorityCount}
                color={auth === 'authoritative' ? 'bg-amber-500/50' : auth === 'derived' ? 'bg-blue-500/40' : 'bg-red-500/30'} />
            </div>
          );
        })}
      </div>

      {/* Role distribution */}
      <div>
        <SectionLabel>Prompt Role Distribution</SectionLabel>
        {['fact', 'interpretation', 'uncertainty', 'question_seed', 'excluded'].map(role => {
          const count = roleGroups[role] ?? 0;
          return (
            <div key={role} className="mb-1.5">
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span className="text-white/60">{role}</span>
                <span className="tabular-nums text-white/80">
                  {count} <span className="text-white/35">({pct(count, total)})</span>
                </span>
              </div>
              <MiniBar value={count} max={maxRoleCount} />
            </div>
          );
        })}
      </div>

      {/* Domain breakdown */}
      <div>
        <SectionLabel>Domain Breakdown</SectionLabel>
        {Object.entries(domainGroups)
          .sort(([, a], [, b]) => b - a)
          .map(([dom, count]) => (
            <div key={dom} className="mb-1.5">
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span className="text-white/60">{dom}</span>
                <span className="tabular-nums text-white/80">{count} <span className="text-white/35">({pct(count, total)})</span></span>
              </div>
              <MiniBar value={count} max={maxDomainCount} color="bg-indigo-500/40" />
            </div>
          ))}
      </div>

      {/* Top block reasons */}
      <div>
        <SectionLabel>Top Block Reasons {reasons.length === 0 ? '(none)' : `(${blocked} blocked · ${pct(blocked, total)})`}</SectionLabel>
        {reasons.length === 0 ? (
          <div className="text-[11px] text-white/30">No blocks recorded in this window.</div>
        ) : (
          reasons.slice(0, 8).map(({ reason, count }) => (
            <div key={reason} className="mb-1.5">
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span className="text-white/60">{reason}</span>
                <span className="tabular-nums text-white/80">{count}</span>
              </div>
              <MiniBar value={count} max={maxReasonCount} color="bg-red-500/30" />
            </div>
          ))
        )}
      </div>

      {/* Hourly trend (if trend data available) */}
      {trendEntries.length > 0 && (
        <div>
          <SectionLabel>Hourly Trend (last {Math.min(trendEntries.length, 24)} buckets)</SectionLabel>
          <div className="flex items-end gap-0.5 h-12">
            {trendEntries.slice(0, 24).reverse().map(([bucket, v]) => (
              <div
                key={bucket}
                className="flex-1 flex flex-col items-center gap-0.5"
                title={`${new Date(bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${v.count} events, ${v.blocked} blocked`}
              >
                <div
                  className="w-full rounded-sm bg-amber-500/40"
                  style={{ height: `${Math.max(2, (v.count / maxTrendCount) * 40)}px` }}
                />
                {v.blocked > 0 && (
                  <div
                    className="w-full rounded-sm bg-red-500/50"
                    style={{ height: `${Math.max(1, (v.blocked / maxTrendCount) * 40)}px`, marginTop: '-2px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-3 text-[10px] text-white/25">
            <span><span className="inline-block w-2 h-2 rounded-sm bg-amber-500/40 mr-1" />events</span>
            <span><span className="inline-block w-2 h-2 rounded-sm bg-red-500/50 mr-1" />blocked</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE MODE VIEW (preserved from Phase 18)
// ─────────────────────────────────────────────────────────────────────────────

function LiveModeView({ data }: { data: LiveResponse }) {
  const { summary, anomalies, recentEvents } = data;
  const { surfaces, blocks, byAuthority, byRole, byDomain } = summary;
  const total = summary.totalEvents;

  return (
    <div className="space-y-5">
      {anomalies.length > 0 && (
        <div className="space-y-1">
          <SectionLabel>Anomalies ({anomalies.length})</SectionLabel>
          {anomalies.map((a, i) => <AnomalyBadge key={i} anomaly={a} />)}
        </div>
      )}

      <div>
        <SectionLabel>Authority Distribution</SectionLabel>
        {byAuthority.map(a => (
          <StatRow key={a.authority} label={a.authority} value={a.totalItems}
            note={`(${pct(a.totalItems, total)})`}
            highlight={a.authority === 'fallback' && a.totalItems > total * 0.5} />
        ))}
      </div>

      <div>
        <SectionLabel>Surface Eligibility</SectionLabel>
        <StatRow label="prompt" value={surfaces.allowedInPrompt} note={`(${pct(surfaces.allowedInPrompt, total)})`} />
        <StatRow label="practitioner view" value={surfaces.allowedInPractitionerView} note={`(${pct(surfaces.allowedInPractitionerView, total)})`} />
        <StatRow label="user view" value={surfaces.allowedInUserView} note={`yield ${(surfaces.userViewYieldRate * 100).toFixed(0)}%`} />
        <StatRow label="memory" value={surfaces.allowedInMemory} note={`yield ${(surfaces.memoryYieldRate * 100).toFixed(0)}%`} />
        <StatRow label="excluded from all" value={surfaces.excludedFromAll} highlight={surfaces.excludedFromAll > total * 0.5} />
      </div>

      <div>
        <SectionLabel>Prompt Role Distribution</SectionLabel>
        {byRole.map(r => (
          <StatRow key={r.role} label={r.role} value={r.count}
            note={r.count > 0 ? `(${pct(r.count, total)})` : undefined} />
        ))}
      </div>

      <div>
        <SectionLabel>Blocked Reasons ({blocks.totalBlocked} blocked · {blocks.blockRate.toFixed(1)}%)</SectionLabel>
        {Object.keys(blocks.byReason).length === 0 ? (
          <div className="text-[11px] text-white/30">No blocks recorded.</div>
        ) : (
          Object.entries(blocks.byReason)
            .sort(([, a], [, b]) => b - a)
            .map(([reason, count]) => <StatRow key={reason} label={reason} value={count} />)
        )}
      </div>

      <div>
        <SectionLabel>Domain Breakdown</SectionLabel>
        {byDomain.length === 0 ? (
          <div className="text-[11px] text-white/30">No domain data.</div>
        ) : (
          byDomain.map(d => (
            <div key={d.domain} className="flex items-center justify-between py-0.5 text-[12px]">
              <span className="text-white/60">{d.domain}</span>
              <span className="tabular-nums text-white/80">{d.totalItems} · {d.blockedCount} blocked · {d.fallbackCount} fallback</span>
            </div>
          ))
        )}
      </div>

      {recentEvents.length > 0 && (
        <div>
          <SectionLabel>Recent Events ({recentEvents.length})</SectionLabel>
          <div className="overflow-x-auto rounded-md border border-white/10">
            <table className="w-full text-[10px] text-white/50">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40">
                  {['domain', 'authority', 'role', 'ok', 'reason'].map(h => (
                    <th key={h} className="p-1 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((e, i) => (
                  <tr key={`${e.traceId}-${i}`} className="border-b border-white/5">
                    <td className="p-1">{e.domain}</td>
                    <td className="p-1">{e.authority}</td>
                    <td className="p-1">{e.promptRole}</td>
                    <td className="p-1">{e.renderBlocked ? '✕' : '✓'}</td>
                    <td className="p-1 text-white/30">{e.blockReason ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicTelemetryPanelProps {
  /** Auto-refresh interval for live mode in ms. 0 = disabled. Default: 30s */
  autoRefreshMs?: number;
}

export function SymbolicTelemetryPanel({ autoRefreshMs = 30_000 }: SymbolicTelemetryPanelProps) {
  const [source, setSource] = React.useState<SourceMode>('live');
  const [domain, setDomain] = React.useState<DomainFilter>('all');

  const [liveData, setLiveData] = React.useState<LiveResponse | null>(null);
  const [dbData, setDbData] = React.useState<DbSummaryResponse | null>(null);
  const [trendData, setTrendData] = React.useState<DbTrendResponse | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFetch, setLastFetch] = React.useState<Date | null>(null);

  const buildUrl = React.useCallback((src: SourceMode, dom: DomainFilter) => {
    const params = new URLSearchParams();
    if (src !== 'live') {
      params.set('source', 'db');
      params.set('window', src);
    }
    if (dom !== 'all') params.set('domain', dom);
    const q = params.toString();
    return `/api/debug/symbolic-telemetry${q ? `?${q}` : ''}`;
  }, []);

  const fetch_ = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(source, domain));
      if (res.status === 404) {
        setError('Debug endpoint not available. Set MAIA_DEBUG_PANEL_ENABLED=true.');
        return;
      }
      if (!res.ok) { setError(`Fetch failed: ${res.status}`); return; }
      const json = await res.json();

      if (source === 'live') {
        setLiveData(json as LiveResponse);
      } else {
        setDbData(json as DbSummaryResponse);
        // Fetch trend data in parallel for DB modes
        const trendRes = await fetch(`${buildUrl(source, domain)}&trend=1`);
        if (trendRes.ok) {
          const trendJson = await trendRes.json();
          setTrendData(trendJson as DbTrendResponse);
        }
      }
      setLastFetch(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown fetch error');
    } finally {
      setLoading(false);
    }
  }, [source, domain, buildUrl]);

  // Refetch on control changes
  React.useEffect(() => { fetch_(); }, [fetch_]);

  // Auto-refresh live mode only
  React.useEffect(() => {
    if (source !== 'live' || autoRefreshMs <= 0) return;
    const id = setInterval(fetch_, autoRefreshMs);
    return () => clearInterval(id);
  }, [fetch_, source, autoRefreshMs]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[12px] text-red-300">
        {error}
      </div>
    );
  }

  const isEmpty = source === 'live'
    ? (!liveData || liveData.eventCount === 0)
    : (!dbData || dbData.totalEvents === 0);

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-4">

      {/* Header + controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-semibold text-white/80">Symbolic Telemetry</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/25">
              {lastFetch && lastFetch.toLocaleTimeString()}
            </span>
            <button
              onClick={fetch_}
              disabled={loading}
              className="text-[11px] text-white/40 underline hover:text-white/60 disabled:opacity-40"
            >
              {loading ? '…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Source toggle */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/30 mr-1">Source:</span>
          {SOURCE_OPTIONS.map(o => (
            <PillButton key={o.value} active={source === o.value} onClick={() => setSource(o.value)}>
              {o.label}
            </PillButton>
          ))}
          <span className="ml-3 text-[10px] text-white/30 mr-1">Domain:</span>
          {DOMAIN_OPTIONS.map(o => (
            <PillButton key={o.value} active={domain === o.value} onClick={() => setDomain(o.value)}>
              {o.label}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Loading first fetch */}
      {!liveData && !dbData && loading && (
        <div className="text-[12px] text-white/40">Loading…</div>
      )}

      {/* Empty state */}
      {!loading && isEmpty && (
        <div className="text-[11px] text-white/35">
          {source === 'live'
            ? 'No live events. Wire recordSymbolicEvent() in oracle route (Phase 19+).'
            : `No events in the past ${source}h window.`}
        </div>
      )}

      {/* Live mode */}
      {source === 'live' && liveData && !isEmpty && (
        <LiveModeView data={liveData} />
      )}

      {/* DB mode */}
      {source !== 'live' && dbData && !isEmpty && (
        <DbModeView
          rows={dbData.rows}
          trendRows={trendData?.trendRows ?? []}
          windowHours={dbData.windowHours}
          generatedAt={dbData.generatedAt}
        />
      )}

      <div className="text-[10px] text-white/20">
        Toggle: <span className="font-mono">?symbolic=1</span>
        {source === 'live' && ` · auto-refresh ${autoRefreshMs / 1000}s`}
      </div>
    </div>
  );
}
