'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  IntegritySummary,
  CaseIntegrityEntry,
  RepairPriority,
} from '@/lib/consciousness/elementNodeGenerator';

// ─── Priority display config ──────────────────────────────────────────────

const PRIORITY = {
  high: {
    label: 'HIGH',
    icon: AlertTriangle,
    badge: 'bg-red-500/15 text-red-300 border border-red-500/30',
    row: 'border-l-2 border-l-red-500/50',
  },
  medium: {
    label: 'MEDIUM',
    icon: Clock,
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    row: 'border-l-2 border-l-amber-500/50',
  },
  clean: {
    label: 'CLEAN',
    icon: CheckCircle,
    badge: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    row: 'border-l-2 border-l-transparent',
  },
} as const satisfies Record<RepairPriority, unknown>;

// ─── Sub-components ───────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: RepairPriority }) {
  const { label, icon: Icon, badge } = PRIORITY[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono ${badge}`}>
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function StatCell({ value, label, dim }: { value: number; label: string; dim?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-mono tabular-nums ${dim ? 'text-slate-500' : 'text-slate-300'}`}>
        {value}
      </div>
      <div className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function CoercedBreakdown({ entry }: { entry: CaseIntegrityEntry }) {
  const { coercedFromAetherSingleton, coercedFromInvalidString, coercedFromEmptyOrNull } = entry.provenance;
  if (entry.provenance.legacyCoerced === 0) {
    return <span className="text-xs text-slate-600 font-mono">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1 text-[11px] font-mono">
      {coercedFromAetherSingleton > 0 && (
        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ⊕ {coercedFromAetherSingleton} aether
        </span>
      )}
      {coercedFromInvalidString > 0 && (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
          ✕ {coercedFromInvalidString} invalid
        </span>
      )}
      {coercedFromEmptyOrNull > 0 && (
        <span className="px-1.5 py-0.5 rounded bg-red-600/15 text-red-300 border border-red-600/20">
          ∅ {coercedFromEmptyOrNull} empty
        </span>
      )}
    </div>
  );
}

function SummaryBar({ totals }: { totals: IntegritySummary['totals'] }) {
  return (
    <div className="flex items-center gap-6 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm">
      <StatCell value={totals.totalCases} label="Cases" />
      <div className="w-px h-8 bg-slate-700" />
      <StatCell
        value={totals.casesNeedingAttention}
        label="Need Attention"
        dim={totals.casesNeedingAttention === 0}
      />
      <div className="w-px h-8 bg-slate-700" />
      <StatCell
        value={totals.totalCanonicalNodes}
        label="Canonical"
      />
      <StatCell
        value={totals.totalLegacyNodes}
        label="Legacy"
        dim={totals.totalLegacyNodes === 0}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function ElementNodeIntegrityPage() {
  const [data, setData] = useState<IntegritySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/studio/element-nodes/integrity');
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? `Error ${res.status}`);
        return;
      }
      setData(await res.json() as IntegritySummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load integrity summary');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">Element Node Integrity</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Provenance repair queue — canonical vs legacy-coerced node breakdown by case
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-8">
            <Loader2 size={14} className="animate-spin" />
            Loading integrity summary…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            <SummaryBar totals={data.totals} />

            {data.cases.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No cases with element nodes found.</p>
            ) : (
              <div className="rounded-lg border border-slate-800 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[100px_1fr_60px_60px_60px_1fr_80px] gap-4 px-4 py-2 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <span>Priority</span>
                  <span>Case ID</span>
                  <span className="text-center">Total</span>
                  <span className="text-center">Canon.</span>
                  <span className="text-center">Legacy</span>
                  <span>Coercion Detail</span>
                  <span className="text-center">Transitions</span>
                </div>

                {/* Rows */}
                {data.cases.map((entry) => {
                  const cfg = PRIORITY[entry.repairPriority];
                  return (
                    <div
                      key={entry.caseId}
                      className={`grid grid-cols-[100px_1fr_60px_60px_60px_1fr_80px] gap-4 px-4 py-3 items-center border-b border-slate-800/60 last:border-b-0 ${cfg.row} hover:bg-slate-900/40 transition-colors`}
                    >
                      {/* Priority */}
                      <PriorityBadge priority={entry.repairPriority} />

                      {/* Case ID */}
                      <span className="font-mono text-xs text-slate-400 truncate" title={entry.caseId}>
                        {entry.caseId.slice(0, 8)}…
                      </span>

                      {/* Counts */}
                      <span className="text-center font-mono text-xs text-slate-300 tabular-nums">
                        {entry.totalNodes}
                      </span>
                      <span className="text-center font-mono text-xs text-emerald-400/80 tabular-nums">
                        {entry.provenance.canonical}
                      </span>
                      <span className={`text-center font-mono text-xs tabular-nums ${entry.provenance.legacyCoerced > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                        {entry.provenance.legacyCoerced || '—'}
                      </span>

                      {/* Coercion detail */}
                      <CoercedBreakdown entry={entry} />

                      {/* Transitions flag — warns when movement graph may be incomplete */}
                      <div className="text-center">
                        {entry.hasLegacyTransitions ? (
                          <span className="inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⚠ mixed
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-slate-600">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="text-[11px] text-slate-600 space-y-0.5 pt-2">
              <p>⊕ aether — pre-triadic singleton &apos;aether&apos; (expected in older cases; recommend practitioner review)</p>
              <p>✕ invalid — non-canonical non-empty string (indicates write-path bypass; investigate source)</p>
              <p>∅ empty — empty or null facet at write time (incomplete data; highest repair priority)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
