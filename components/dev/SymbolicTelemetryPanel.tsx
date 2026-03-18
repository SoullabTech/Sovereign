'use client';

/**
 * Symbolic Telemetry Panel — Phase 18
 *
 * Inline debug/calibration surface for the governed symbolic pipeline.
 * Renders live telemetry from /api/debug/symbolic-telemetry.
 *
 * ACTIVATION: Visit any page with this panel and add ?symbolic=1 to the URL.
 * REQUIREMENT: MAIA_DEBUG_PANEL_ENABLED=true in environment.
 *
 * Shows:
 *   - Authority distribution (authoritative / derived / fallback)
 *   - Surface eligibility (prompt / practitioner / user / memory) with yield rates
 *   - Prompt role distribution (fact / interpretation / uncertainty / question_seed / excluded)
 *   - Blocked reasons breakdown
 *   - Domain breakdown
 *   - Anomaly badges
 */

import * as React from 'react';
import type {
  TelemetrySummary,
  TelemetryAnomaly,
  SymbolicTelemetryEvent,
} from '@/lib/symbolic/symbolicTelemetry';

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPE
// ─────────────────────────────────────────────────────────────────────────────

interface SymbolicTelemetryResponse {
  ok: boolean;
  eventCount: number;
  sessionId: string | null;
  summary: TelemetrySummary;
  anomalies: TelemetryAnomaly[];
  recentEvents: SymbolicTelemetryEvent[];
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${((n / total) * 100).toFixed(0)}%`;
}

function yieldRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
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

function StatRow({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string | number;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5 text-[12px]">
      <span className="text-white/60">{label}</span>
      <span className={highlight ? 'font-semibold text-amber-400' : 'tabular-nums text-white/80'}>
        {value}
        {note && <span className="ml-1 text-white/35">{note}</span>}
      </span>
    </div>
  );
}

function AnomalyBadge({ anomaly }: { anomaly: TelemetryAnomaly }) {
  const isWarn = anomaly.severity === 'warn';
  return (
    <div
      className={`rounded-md border px-2 py-1 text-[11px] ${
        isWarn
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          : 'border-white/10 bg-white/5 text-white/50'
      }`}
      title={anomaly.details}
    >
      <span className="font-medium">{anomaly.kind.replace(/_/g, ' ')}</span>
      <span className="ml-1 opacity-60">— {anomaly.details.slice(0, 80)}{anomaly.details.length > 80 ? '…' : ''}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolicTelemetryPanelProps {
  /** Auto-refresh interval in ms. 0 = disabled. Default: 30000 (30s) */
  autoRefreshMs?: number;
}

export function SymbolicTelemetryPanel({
  autoRefreshMs = 30_000,
}: SymbolicTelemetryPanelProps) {
  const [data, setData] = React.useState<SymbolicTelemetryResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFetch, setLastFetch] = React.useState<Date | null>(null);

  const fetch_ = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/debug/symbolic-telemetry');
      if (res.status === 404) {
        setError('Debug endpoint not available. Set MAIA_DEBUG_PANEL_ENABLED=true.');
        return;
      }
      if (!res.ok) {
        setError(`Fetch failed: ${res.status}`);
        return;
      }
      const json: SymbolicTelemetryResponse = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown fetch error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  React.useEffect(() => {
    fetch_();
  }, [fetch_]);

  // Auto-refresh
  React.useEffect(() => {
    if (autoRefreshMs <= 0) return;
    const id = setInterval(fetch_, autoRefreshMs);
    return () => clearInterval(id);
  }, [fetch_, autoRefreshMs]);

  // ── Render: error state ──
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[12px] text-red-300">
        {error}
      </div>
    );
  }

  // ── Render: loading (first load only) ──
  if (!data && loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-[12px] text-white/40">
        Loading symbolic telemetry…
      </div>
    );
  }

  // ── Render: empty state ──
  if (!data || data.eventCount === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <div className="mb-1 text-[12px] font-semibold text-white/60">Symbolic Telemetry</div>
        <div className="text-[11px] text-white/35">
          No symbolic events recorded yet.
        </div>
        <div className="mt-2 rounded-md bg-white/5 p-2 font-mono text-[10px] text-white/30">
          {`// Phase 19+: Wire in oracle route after buildPromptIngressItem():\nrecordSymbolicEvent(telemetryFromIngressItem(item, sessionId));`}
        </div>
        <button
          onClick={fetch_}
          className="mt-2 text-[11px] text-white/30 underline hover:text-white/50"
        >
          Refresh
        </button>
      </div>
    );
  }

  const { summary, anomalies, recentEvents, eventCount } = data;
  const { surfaces, blocks, byAuthority, byRole, byDomain } = summary;
  const total = summary.totalEvents;

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-semibold text-white/80">Symbolic Telemetry</div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/35">
            {eventCount} events
            {lastFetch && ` · ${lastFetch.toLocaleTimeString()}`}
          </span>
          <button
            onClick={fetch_}
            disabled={loading}
            className="text-[11px] text-white/40 underline hover:text-white/60 disabled:opacity-40"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="space-y-1">
          <SectionLabel>Anomalies ({anomalies.length})</SectionLabel>
          {anomalies.map((a, i) => <AnomalyBadge key={i} anomaly={a} />)}
        </div>
      )}

      {/* Authority Distribution */}
      <div>
        <SectionLabel>Authority Distribution</SectionLabel>
        {byAuthority.map(a => (
          <StatRow
            key={a.authority}
            label={a.authority}
            value={a.totalItems}
            note={`(${pct(a.totalItems, total)})`}
            highlight={a.authority === 'fallback' && a.totalItems > total * 0.5}
          />
        ))}
      </div>

      {/* Surface Eligibility */}
      <div>
        <SectionLabel>Surface Eligibility</SectionLabel>
        <StatRow label="prompt" value={surfaces.allowedInPrompt} note={`(${pct(surfaces.allowedInPrompt, total)})`} />
        <StatRow label="practitioner view" value={surfaces.allowedInPractitionerView} note={`(${pct(surfaces.allowedInPractitionerView, total)})`} />
        <StatRow label="user view" value={surfaces.allowedInUserView} note={`yield ${yieldRate(surfaces.userViewYieldRate)}`} />
        <StatRow label="memory" value={surfaces.allowedInMemory} note={`yield ${yieldRate(surfaces.memoryYieldRate)}`} />
        <StatRow label="excluded from all" value={surfaces.excludedFromAll} highlight={surfaces.excludedFromAll > total * 0.5} />
      </div>

      {/* Prompt Role Distribution */}
      <div>
        <SectionLabel>Prompt Role Distribution</SectionLabel>
        {byRole.map(r => (
          <StatRow
            key={r.role}
            label={r.role}
            value={r.count}
            note={r.count > 0 ? `(${pct(r.count, total)})` : undefined}
          />
        ))}
      </div>

      {/* Blocked Reasons */}
      <div>
        <SectionLabel>Blocked Reasons ({blocks.totalBlocked} blocked · {blocks.blockRate.toFixed(1)}%)</SectionLabel>
        {Object.keys(blocks.byReason).length === 0 ? (
          <div className="text-[11px] text-white/30">No blocks recorded.</div>
        ) : (
          Object.entries(blocks.byReason)
            .sort(([, a], [, b]) => b - a)
            .map(([reason, count]) => (
              <StatRow key={reason} label={reason} value={count} />
            ))
        )}
      </div>

      {/* Domain Breakdown */}
      <div>
        <SectionLabel>Domain Breakdown</SectionLabel>
        {byDomain.length === 0 ? (
          <div className="text-[11px] text-white/30">No domain data.</div>
        ) : (
          byDomain.map(d => (
            <div key={d.domain} className="py-0.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-white/60">{d.domain}</span>
                <span className="tabular-nums text-white/80">
                  {d.totalItems} total · {d.blockedCount} blocked · {d.fallbackCount} fallback
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Events (collapsed table) */}
      {recentEvents.length > 0 && (
        <div>
          <SectionLabel>Recent Events ({recentEvents.length})</SectionLabel>
          <div className="overflow-x-auto rounded-md border border-white/10">
            <table className="w-full text-[10px] text-white/50">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-white/40">
                  <th className="p-1 text-left">domain</th>
                  <th className="p-1 text-left">authority</th>
                  <th className="p-1 text-left">role</th>
                  <th className="p-1 text-left">blocked</th>
                  <th className="p-1 text-left">reason</th>
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

      <div className="text-[10px] text-white/25">
        Toggle: add <span className="font-mono">?symbolic=1</span> · Auto-refresh {autoRefreshMs / 1000}s
      </div>
    </div>
  );
}
