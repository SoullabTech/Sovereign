'use client';

import React from 'react';
import { LedgerRow } from './SystemQualityPanel';

interface Props {
  metrics: Record<string, LedgerRow[]>;
}

function mostRecentDaily(rows: LedgerRow[]): LedgerRow | null {
  if (!rows || rows.length === 0) return null;
  return rows
    .filter((r) => r.period_type === 'daily')
    .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())[0] ?? null;
}

function mostRecentAny(rows: LedgerRow[]): LedgerRow | null {
  if (!rows || rows.length === 0) return null;
  return rows
    .slice()
    .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())[0];
}

function StatRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-700/30 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-mono">{value !== null && value !== undefined ? String(value) : '—'}</span>
    </div>
  );
}

export function PopulationPatternsPanel({ metrics }: Props) {
  const growthEdgeRow = mostRecentDaily(metrics['growth_edge_frequency'] ?? []);
  const patternInsightRow = mostRecentDaily(metrics['pattern_insight_frequency'] ?? []);
  const patternLedgerRow = mostRecentDaily(metrics['pattern_ledger_growth'] ?? []);
  const spiralogicRow = mostRecentAny(metrics['spiralogic_distribution'] ?? []);

  const spiraPayload = spiralogicRow?.metric_payload ?? {};
  const totalMembers = typeof spiraPayload.total_members === 'number' ? spiraPayload.total_members : null;
  const byElement = (spiraPayload.by_element ?? {}) as Record<string, number>;
  const byPhase = (spiraPayload.by_phase ?? {}) as Record<string, number>;

  const elements = ['fire', 'water', 'earth', 'air', 'aether', 'unknown'];

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase mb-4">
        Population Patterns
      </h2>

      {/* Growth Edge Insights */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Growth Edge Insights</p>
        <StatRow
          label="Count (daily)"
          value={growthEdgeRow?.metric_value ?? null}
        />
        <StatRow
          label="Avg Significance"
          value={
            typeof growthEdgeRow?.metric_payload?.avg_significance === 'number'
              ? (growthEdgeRow.metric_payload.avg_significance as number).toFixed(3)
              : null
          }
        />
      </div>

      {/* Pattern Insights */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Pattern Insights</p>
        <StatRow
          label="Count (daily)"
          value={patternInsightRow?.metric_value ?? null}
        />
        <StatRow
          label="Avg Significance"
          value={
            typeof patternInsightRow?.metric_payload?.avg_significance === 'number'
              ? (patternInsightRow.metric_payload.avg_significance as number).toFixed(3)
              : null
          }
        />
      </div>

      {/* Pattern Ledger Growth */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-1.5 font-medium">New Pattern Keys (daily)</p>
        <StatRow label="New keys discovered" value={patternLedgerRow?.metric_value ?? null} />
      </div>

      {/* Spiralogic Snapshot */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Spiralogic Snapshot</p>
        {spiralogicRow ? (
          <>
            <p className="text-xs text-slate-500 mb-2">Total members: <span className="text-slate-200 font-mono">{totalMembers ?? '—'}</span></p>
            <p className="text-xs text-slate-500 mb-1">By element</p>
            <table className="w-full text-xs mb-3">
              <tbody>
                {elements.map((el) => {
                  const cnt = byElement[el];
                  if (cnt === undefined) return null;
                  return (
                    <tr key={el} className="border-b border-slate-700/30">
                      <td className="py-1 text-slate-400 capitalize">{el}</td>
                      <td className="py-1 text-right text-slate-200 font-mono">{cnt}</td>
                      {totalMembers ? (
                        <td className="py-1 text-right text-slate-500 font-mono pl-2">
                          {((cnt / totalMembers) * 100).toFixed(1)}%
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-500 mb-1">By phase</p>
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(byPhase)
                  .sort(([a], [b]) => (parseInt(a) || 0) - (parseInt(b) || 0))
                  .map(([phase, cnt]) => (
                    <tr key={phase} className="border-b border-slate-700/30">
                      <td className="py-1 text-slate-400">Phase {phase}</td>
                      <td className="py-1 text-right text-slate-200 font-mono">{cnt}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-xs text-slate-500 italic">No spiralogic data (weekly — run sweep first)</p>
        )}
      </div>
    </div>
  );
}
