/**
 * Daily Research Ledger Builder
 *
 * Aggregates system intelligence metrics for a single UTC day.
 * Upserts into system_research_ledger — safe to re-run for the same date.
 * Fire-and-forget safe — logs per-metric errors, never throws to caller.
 *
 * Build sequence: run dry-run first, then actual write, then inspect DB.
 */

import { query } from '../db/postgres';
import { METRIC_REGISTRY } from './researchMetricRegistry';

function randomUUID(): string {
  // Node 14.17+ has crypto.randomUUID; fall back gracefully
  try {
    return require('crypto').randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export interface LedgerRunResult {
  jobRunId: string;
  periodStart: string;
  periodEnd: string;
  computed: number;
  upserted: number;
  errors: string[];
}

export async function buildDailyResearchLedger(dateStr?: string): Promise<LedgerRunResult> {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const jobRunId   = randomUUID();

  // Period boundaries — full UTC day
  const periodStart = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    0, 0, 0, 0
  ));
  const periodEnd = new Date(Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    23, 59, 59, 999
  ));

  // Prior day for direction comparison
  const priorStart = new Date(periodStart.getTime() - 86400000);
  const priorEnd   = new Date(periodEnd.getTime()   - 86400000);

  const metrics = METRIC_REGISTRY.filter(
    m => m.periodType === 'daily' || m.periodType === 'both'
  );

  const errors: string[] = [];
  let computed = 0;
  let upserted = 0;

  console.log(`[ResearchLedger:daily] job=${jobRunId} period=${periodStart.toISOString().slice(0, 10)} metrics=${metrics.length}`);

  for (const metric of metrics) {
    try {
      const current  = await metric.compute(periodStart.toISOString(), periodEnd.toISOString());
      const previous = await metric.compute(priorStart.toISOString(), priorEnd.toISOString());
      const direction = metric.evaluateDirection(current, previous);

      await query(
        `INSERT INTO system_research_ledger
           (period_type, period_start, period_end,
            metric_key, metric_version,
            metric_value, metric_payload, direction, baseline_value,
            job_run_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::uuid)
         ON CONFLICT (period_type, period_start, metric_key, metric_version)
         DO UPDATE SET
           metric_value   = EXCLUDED.metric_value,
           metric_payload = EXCLUDED.metric_payload,
           direction      = EXCLUDED.direction,
           baseline_value = EXCLUDED.baseline_value,
           job_run_id     = EXCLUDED.job_run_id`,
        [
          'daily',
          periodStart.toISOString(),
          periodEnd.toISOString(),
          metric.metricKey,
          metric.metricVersion,
          current.metricValue,
          JSON.stringify(current.metricPayload),
          direction,
          previous.metricValue,
          jobRunId,
        ]
      );

      console.log(`  ✓ ${metric.metricKey} = ${current.metricValue} (${direction})`);
      computed++;
      upserted++;
    } catch (err) {
      const msg = `[ResearchLedger:daily] ${metric.metricKey} failed: ${
        err instanceof Error ? err.message : String(err)
      }`;
      console.warn(msg);
      errors.push(msg);
    }
  }

  return {
    jobRunId,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    computed,
    upserted,
    errors,
  };
}
