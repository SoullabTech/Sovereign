'use client';

import React from 'react';

export interface LedgerRow {
  id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  metric_key: string;
  metric_version: string;
  metric_value: number | null;
  metric_payload: Record<string, unknown>;
  direction: string | null;
  baseline_value: number | null;
  created_at: string;
}

interface Props {
  metrics: Record<string, LedgerRow[]>;
}

function directionBadge(direction: string | null): React.ReactElement {
  const map: Record<string, { label: string; className: string }> = {
    improving: { label: 'improving', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
    degrading: { label: 'degrading', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
    stable: { label: 'stable', className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
    insufficient_data: { label: 'insufficient data', className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  };
  const d = direction ?? 'insufficient_data';
  const cfg = map[d] ?? map['insufficient_data'];
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function mostRecent(rows: LedgerRow[]): LedgerRow | null {
  if (!rows || rows.length === 0) return null;
  return rows.slice().sort(
    (a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
  )[0];
}

function last7DailyRows(rows: LedgerRow[]): LedgerRow[] {
  return rows
    .filter((r) => r.period_type === 'daily')
    .sort((a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime())
    .slice(-7);
}

export function SystemQualityPanel({ metrics }: Props) {
  const ainRows = metrics['ain_shape_pass_rate'] ?? [];
  const latencyRows = metrics['response_latency_p50_ms'] ?? [];

  const ain7 = last7DailyRows(ainRows);
  const latestAin = mostRecent(ainRows);
  const latestLatency = mostRecent(latencyRows);

  const latencyP50 = latestLatency?.metric_value ?? null;
  const latencyP90 = typeof latestLatency?.metric_payload?.p90 === 'number'
    ? latestLatency.metric_payload.p90
    : null;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase mb-4">
        AIN Shape Quality
      </h2>

      {/* AIN Shape Pass Rate — last 7 days */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 mb-2">AIN Shape Pass Rate — last 7 days</p>
        {ain7.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No data</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left pb-1.5 font-normal">Date</th>
                <th className="text-right pb-1.5 font-normal">Pass Rate</th>
                <th className="text-right pb-1.5 font-normal">Turns</th>
                <th className="text-right pb-1.5 font-normal">Direction</th>
              </tr>
            </thead>
            <tbody>
              {ain7.map((row) => {
                const isZero = row.metric_value === 0;
                const total = typeof row.metric_payload?.total === 'number'
                  ? row.metric_payload.total
                  : '—';
                return (
                  <tr
                    key={row.period_start}
                    className={`border-b border-slate-700/30 ${isZero ? 'bg-red-900/20' : ''}`}
                  >
                    <td className="py-1.5 text-slate-300 font-mono">{formatDate(row.period_start)}</td>
                    <td className={`py-1.5 text-right font-mono ${isZero ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                      {row.metric_value !== null ? `${row.metric_value}%` : '—'}
                    </td>
                    <td className="py-1.5 text-right text-slate-400 font-mono">{String(total)}</td>
                    <td className="py-1.5 text-right">{directionBadge(row.direction)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* AIN Component Breakdown — most recent row */}
      {latestAin && (
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-2">
            Component Breakdown — {formatDate(latestAin.period_start)}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {(
              [
                ['next_step_rate', 'Next Step'],
                ['permission_rate', 'Permission'],
                ['bridge_rate', 'Bridge'],
                ['mirror_rate', 'Mirror'],
                ['menu_mode_rate', 'Menu Mode'],
              ] as [string, string][]
            ).map(([key, label]) => {
              const val = latestAin.metric_payload?.[key];
              return (
                <div key={key} className="flex justify-between py-0.5">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-slate-300 font-mono">
                    {typeof val === 'number' ? `${val}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Latency */}
      <div>
        <p className="text-xs text-slate-400 mb-2">Response Latency</p>
        {latestLatency ? (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">p50</span>
              <span className="text-slate-200 font-mono">
                {latencyP50 !== null ? `${Math.round(latencyP50)} ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">p90</span>
              <span className="text-slate-200 font-mono">
                {latencyP90 !== null ? `${Math.round(latencyP90 as number)} ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">trend</span>
              {directionBadge(latestLatency.direction)}
            </div>
            <p className="text-slate-600 text-xs mt-1">
              data from {formatDate(latestLatency.period_start)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No latency data</p>
        )}
      </div>
    </div>
  );
}
