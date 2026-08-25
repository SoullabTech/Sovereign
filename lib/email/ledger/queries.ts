/**
 * OPERATIONAL VOLUME QUERIES — counts, and no thresholds.
 * ======================================================
 *
 * There is no trustworthy baseline yet. A threshold chosen from a guess produces
 * either alert fatigue or false confidence, so MAIL-02 ships the numbers and
 * MAIL-03+ decides what is abnormal once real data exists.
 *
 * EVERY figure carries `ledgerWriteFailures`. A best-effort ledger under-reports
 * hardest when the system is stressed, so a count with an unknown number of
 * dropped writes behind it is a FLOOR, not a total — and `isFloor` says so rather
 * than leaving a reader to infer it.
 */

import { query } from '@/lib/db/postgres';
import { ledgerWriteFailuresTotal } from './metrics';

export interface VolumeWindow<T> {
  rows: T[];
  /** Dropped ledger writes in this process since start. */
  ledgerWriteFailures: number;
  /** True when the counts are a lower bound rather than a total. */
  isFloor: boolean;
  /** Ready-to-print, so no caller has to phrase the caveat itself. */
  caveat: string;
}

function wrap<T>(rows: T[]): VolumeWindow<T> {
  const lost = ledgerWriteFailuresTotal();
  const observed = rows.reduce((n, r) => n + Number((r as { attempts?: number }).attempts ?? 0), 0);
  return {
    rows,
    ledgerWriteFailures: lost,
    isFloor: lost > 0,
    caveat:
      lost > 0
        ? `${observed} sends observed · ${lost} ledger write(s) lost — this is a FLOOR, not a total`
        : `${observed} sends observed · 0 ledger writes lost`,
  };
}

export interface LaneVolumeRow {
  lane: string;
  state: string;
  attempts: number;
}

/** Volume by lane and outcome over the last N hours. */
export async function volumeByLane(hours = 24): Promise<VolumeWindow<LaneVolumeRow>> {
  const r = await query<LaneVolumeRow>(
    `SELECT lane, state, count(*)::int AS attempts
       FROM email_delivery_attempts
      WHERE created_at > NOW() - ($1 || ' hours')::interval
      GROUP BY lane, state
      ORDER BY lane, state`,
    [String(hours)]
  );
  return wrap(r.rows);
}

export interface PurposeVolumeRow {
  purpose: string;
  lane: string;
  provider: string;
  state: string;
  attempts: number;
}

export async function volumeByPurpose(hours = 24): Promise<VolumeWindow<PurposeVolumeRow>> {
  const r = await query<PurposeVolumeRow>(
    `SELECT purpose, lane, provider, state, count(*)::int AS attempts
       FROM email_delivery_attempts
      WHERE created_at > NOW() - ($1 || ' hours')::interval
      GROUP BY purpose, lane, provider, state
      ORDER BY attempts DESC`,
    [String(hours)]
  );
  return wrap(r.rows);
}

/**
 * What is SENDING the mail — the question that ranks 60,000-send suspects by
 * evidence instead of by code shape.
 */
export async function volumeByTrigger(hours = 24): Promise<VolumeWindow<{ triggerType: string; triggerRef: string; attempts: number }>> {
  const r = await query<{ triggerType: string; triggerRef: string; attempts: number }>(
    `SELECT COALESCE(trigger_type,'unattributed') AS "triggerType",
            COALESCE(trigger_ref,'unattributed')  AS "triggerRef",
            count(*)::int AS attempts
       FROM email_delivery_attempts
      WHERE created_at > NOW() - ($1 || ' hours')::interval
      GROUP BY 1,2
      ORDER BY attempts DESC`,
    [String(hours)]
  );
  return wrap(r.rows);
}

/** Refusal rate by classification — which failure is actually biting. */
export async function refusalsByClass(hours = 24) {
  const r = await query<{ failureClass: string; failureCode: string; attempts: number }>(
    `SELECT COALESCE(failure_class,'unclassified') AS "failureClass",
            COALESCE(failure_code,'unnamed')       AS "failureCode",
            count(*)::int AS attempts
       FROM email_delivery_attempts
      WHERE created_at > NOW() - ($1 || ' hours')::interval
        AND state IN ('refused','indeterminate')
      GROUP BY 1,2
      ORDER BY attempts DESC`,
    [String(hours)]
  );
  return wrap(r.rows);
}

/**
 * Repeated idempotency keys — VISIBLE, not suppressed.
 *
 * This is the evidence MAIL-03 will need to choose per-lane suppression rules. It
 * deliberately does nothing about what it finds.
 */
export async function repeatedIdempotencyKeys(hours = 24) {
  const r = await query<{ idempotencyKey: string; purpose: string; lane: string; occurrences: number }>(
    `SELECT idempotency_key AS "idempotencyKey", purpose, lane, count(*)::int AS occurrences
       FROM email_delivery_attempts
      WHERE created_at > NOW() - ($1 || ' hours')::interval
        AND idempotency_key IS NOT NULL
      GROUP BY 1,2,3
     HAVING count(*) > 1
      ORDER BY occurrences DESC`,
    [String(hours)]
  );
  return wrap(r.rows);
}

/**
 * Rows that never settled.
 *
 * A row still 'attempting' long after creation means the process died between the
 * provider call and the outcome write — so the send's real outcome is unknown, and
 * unknown is exactly what it says. A boolean `accepted` column could not have
 * expressed this.
 */
export async function unsettledAttempts(olderThanMinutes = 15) {
  const r = await query<{ id: string; purpose: string; lane: string; createdAt: string }>(
    `SELECT id, purpose, lane, created_at AS "createdAt"
       FROM email_delivery_attempts
      WHERE state = 'attempting'
        AND created_at < NOW() - ($1 || ' minutes')::interval
      ORDER BY created_at DESC
      LIMIT 200`,
    [String(olderThanMinutes)]
  );
  return wrap(r.rows);
}
