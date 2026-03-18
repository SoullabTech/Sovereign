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

function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

function findLatestPeriodStart(metrics: Record<string, LedgerRow[]>): string | null {
  let latest: string | null = null;
  for (const rows of Object.values(metrics)) {
    for (const row of rows) {
      if (!latest || row.period_start > latest) {
        latest = row.period_start;
      }
    }
  }
  return latest;
}

export function SystemHealthPanel({ metrics }: Props) {
  const oracleRow = mostRecentDaily(metrics['total_oracle_turns'] ?? []);
  const safetyRow = mostRecentDaily(metrics['safety_concern_count'] ?? []);
  const latestPeriodStart = findLatestPeriodStart(metrics);

  const oraclePayload = oracleRow?.metric_payload ?? {};
  const errorRate = typeof oraclePayload.error_rate === 'number' ? oraclePayload.error_rate : null;
  const isHighError = errorRate !== null && errorRate > 20;

  const safetyCount = safetyRow?.metric_value ?? null;
  const hasSafetyConcerns = safetyCount !== null && safetyCount > 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase mb-4">
        System Health
      </h2>

      {/* Oracle Volume */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Oracle Volume (today)</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span className="text-slate-400">Total turns</span>
            <span className="text-slate-200 font-mono">{oracleRow?.metric_value ?? '—'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span className="text-slate-400">Successes</span>
            <span className="text-slate-200 font-mono">
              {typeof oraclePayload.success_count === 'number' ? oraclePayload.success_count : '—'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span className="text-slate-400">Errors</span>
            <span className={`font-mono ${typeof oraclePayload.error_count === 'number' && (oraclePayload.error_count as number) > 0 ? 'text-amber-300' : 'text-slate-200'}`}>
              {typeof oraclePayload.error_count === 'number' ? oraclePayload.error_count : '—'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/30">
            <span className="text-slate-400">Error rate</span>
            <span className={`font-mono ${isHighError ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
              {errorRate !== null ? `${errorRate}%` : '—'}
              {isHighError && <span className="ml-1 text-red-400">HIGH</span>}
            </span>
          </div>
        </div>
        {!oracleRow && (
          <p className="text-xs text-slate-500 italic mt-1">No oracle volume data</p>
        )}
      </div>

      {/* Latency Freshness */}
      <div className="mb-5">
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Data Freshness</p>
        <p className="text-xs text-slate-300">
          {latestPeriodStart
            ? <>Most recent ledger entry: <span className="font-mono">{formatDate(latestPeriodStart)}</span></>
            : <span className="text-slate-500 italic">No ledger data present</span>
          }
        </p>
      </div>

      {/* Safety Concerns */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5 font-medium">Safety Concerns (today)</p>
        {safetyRow ? (
          <div className={`text-xs rounded px-3 py-2 ${hasSafetyConcerns ? 'bg-red-900/30 border border-red-500/30 text-red-300' : 'bg-emerald-900/20 border border-emerald-500/20 text-emerald-400'}`}>
            {hasSafetyConcerns
              ? `${safetyCount} concern${(safetyCount as number) === 1 ? '' : 's'} flagged — review practitioner logs`
              : 'No concerns flagged'
            }
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No safety data</p>
        )}
      </div>
    </div>
  );
}
