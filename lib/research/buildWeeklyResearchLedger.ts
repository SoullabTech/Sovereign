/**
 * Weekly Research Ledger Builder
 *
 * Aggregates system intelligence metrics for the ISO week (Mon 00:00 UTC → Sun 23:59:59 UTC)
 * containing the target date. Upserts into system_research_ledger.
 * Fire-and-forget safe — logs per-metric errors, never throws to caller.
 */

import { query } from '../db/postgres';
import { METRIC_REGISTRY } from './researchMetricRegistry';

function randomUUID(): string {
  try {
    return require('crypto').randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** Returns Monday 00:00:00.000 UTC for the week containing the given date. */
function weekStart(date: Date): Date {
  const dayOfWeek = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() - daysFromMonday,
    0, 0, 0, 0
  ));
}

/** Returns Sunday 23:59:59.999 UTC for the week whose Monday is provided. */
function weekEnd(monday: Date): Date {
  return new Date(monday.getTime() + 6 * 86400000 + 86399999);
}

export interface WeeklyLedgerRunResult {
  jobRunId: string;
  periodStart: string;
  periodEnd: string;
  computed: number;
  upserted: number;
  errors: string[];
}

export async function buildWeeklyResearchLedger(dateStr?: string): Promise<WeeklyLedgerRunResult> {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const jobRunId   = randomUUID();

  const periodStart = weekStart(targetDate);
  const periodEnd   = weekEnd(periodStart);

  // Prior week for direction comparison
  const priorStart = weekStart(new Date(periodStart.getTime() - 7 * 86400000));
  const priorEnd   = weekEnd(priorStart);

  const metrics = METRIC_REGISTRY.filter(
    m => m.periodType === 'weekly' || m.periodType === 'both'
  );

  const errors: string[] = [];
  let computed = 0;
  let upserted = 0;

  console.log(`[ResearchLedger:weekly] job=${jobRunId} week=${periodStart.toISOString().slice(0, 10)} metrics=${metrics.length}`);

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
          'weekly',
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
      const msg = `[ResearchLedger:weekly] ${metric.metricKey} failed: ${
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
