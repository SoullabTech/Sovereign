/**
 * Alert state persistence — Postgres-backed.
 *
 * Tracks consecutive breaches, cooldowns, and recovery across container restarts.
 * Each alert type has a stable key (e.g. 'db_pool_pressure', 'service_degraded').
 */

import { query } from '@/lib/db/postgres';
import { ALERT_THRESHOLDS } from './alertThresholds';

export type AlertSeverity = 'ok' | 'warning' | 'critical';

export interface AlertStateRow {
  alert_key: string;
  severity: AlertSeverity;
  consecutive_breaches: number;
  last_alerted_at: string | null;
  last_recovered_at: string | null;
  suppressed_count: number;
  updated_at: string;
}

/**
 * Load current state for an alert key. Returns defaults if not found.
 */
export async function loadAlertState(alertKey: string): Promise<AlertStateRow> {
  try {
    const result = await query<AlertStateRow>(
      `SELECT * FROM alert_state WHERE alert_key = $1`,
      [alertKey]
    );
    if (result.rows[0]) return result.rows[0];
  } catch {
    // Table may not exist yet — graceful fallback
  }
  return {
    alert_key: alertKey,
    severity: 'ok',
    consecutive_breaches: 0,
    last_alerted_at: null,
    last_recovered_at: null,
    suppressed_count: 0,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Record a breach for an alert key. Returns whether an alert should fire.
 */
export async function recordBreach(
  alertKey: string,
  newSeverity: AlertSeverity
): Promise<{ shouldAlert: boolean; shouldEscalate: boolean; state: AlertStateRow }> {
  const state = await loadAlertState(alertKey);
  const newBreaches = state.consecutive_breaches + 1;
  const now = new Date();

  // Determine cooldown based on severity
  const cooldownMs = newSeverity === 'critical'
    ? 15 * 60 * 1000   // 15 min for critical
    : ALERT_THRESHOLDS.cooldownMinutes * 60 * 1000; // 30 min for warning

  const lastAlerted = state.last_alerted_at ? new Date(state.last_alerted_at) : null;
  const inCooldown = lastAlerted && (now.getTime() - lastAlerted.getTime()) < cooldownMs;

  // Escalation: severity increased since last alert
  const shouldEscalate = state.severity === 'warning' && newSeverity === 'critical';

  // Alert fires if: not in cooldown, OR severity escalated
  const shouldAlert = !inCooldown || shouldEscalate;

  await query(
    `INSERT INTO alert_state (alert_key, severity, consecutive_breaches, last_alerted_at, suppressed_count, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (alert_key) DO UPDATE SET
       severity = $2,
       consecutive_breaches = $3,
       last_alerted_at = CASE WHEN $6 THEN $4 ELSE alert_state.last_alerted_at END,
       suppressed_count = CASE WHEN $6 THEN 0 ELSE alert_state.suppressed_count + 1 END,
       updated_at = NOW()`,
    [
      alertKey,
      newSeverity,
      newBreaches,
      shouldAlert ? now.toISOString() : state.last_alerted_at,
      0,
      shouldAlert,
    ]
  );

  return {
    shouldAlert,
    shouldEscalate,
    state: { ...state, severity: newSeverity, consecutive_breaches: newBreaches },
  };
}

/**
 * Record recovery for an alert key. Returns whether a recovery notice should fire.
 */
export async function recordRecovery(alertKey: string): Promise<{ shouldNotify: boolean }> {
  const state = await loadAlertState(alertKey);

  // Only notify recovery if we were previously in warning/critical
  const wasAlerting = state.severity !== 'ok';
  // Require sustained recovery before notifying
  const newBreaches = wasAlerting ? state.consecutive_breaches + 1 : 0;
  const shouldNotify = wasAlerting && newBreaches >= ALERT_THRESHOLDS.recoveryChecks;

  if (shouldNotify) {
    // Reset to clean state
    await query(
      `INSERT INTO alert_state (alert_key, severity, consecutive_breaches, last_recovered_at, suppressed_count, updated_at)
       VALUES ($1, 'ok', 0, NOW(), 0, NOW())
       ON CONFLICT (alert_key) DO UPDATE SET
         severity = 'ok',
         consecutive_breaches = 0,
         last_recovered_at = NOW(),
         suppressed_count = 0,
         updated_at = NOW()`,
      [alertKey]
    );
  } else if (wasAlerting) {
    // Still counting toward recovery
    await query(
      `UPDATE alert_state SET consecutive_breaches = $2, updated_at = NOW() WHERE alert_key = $1`,
      [alertKey, newBreaches]
    );
  }

  return { shouldNotify };
}
