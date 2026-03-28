/**
 * Alert evaluator — compares health snapshot against thresholds.
 *
 * Returns alert/recovery actions. Does NOT send notifications itself.
 * Caller (monitor runner) decides what to do with the results.
 */

import { ALERT_THRESHOLDS } from './alertThresholds';
import { recordBreach, recordRecovery, type AlertSeverity } from './alertState';
import type { HealthSnapshot } from './healthClient';

export interface AlertAction {
  type: 'alert' | 'recovery';
  key: string;
  severity: AlertSeverity;
  subject: string;
  message: string;
  metrics: Record<string, unknown>;
}

/**
 * Evaluate a health snapshot against all thresholds.
 * Returns list of actions (alerts to send, recoveries to notify).
 */
export async function evaluateHealth(snapshot: HealthSnapshot): Promise<AlertAction[]> {
  const actions: AlertAction[] = [];

  // 1. Health endpoint failure (can't reach MAIA at all)
  await evaluateRule({
    key: 'service_health',
    breaching: snapshot.status !== 'ok',
    severity: snapshot.status === 'error' || snapshot.error ? 'critical' : 'warning',
    warningChecks: ALERT_THRESHOLDS.health.degradedWarningChecks,
    criticalChecks: ALERT_THRESHOLDS.health.failureCriticalChecks,
    subject: snapshot.status === 'error'
      ? 'CRITICAL: MAIA health endpoint unreachable'
      : 'Warning: MAIA health status degraded',
    message: snapshot.error
      ? `Health endpoint failed: ${snapshot.error}`
      : `Health status: ${snapshot.status}`,
    metrics: { status: snapshot.status, error: snapshot.error, uptime: snapshot.uptime },
    actions,
  });

  // 2. DB pool waiting (queue forming)
  if (snapshot.pool) {
    const waiting = snapshot.pool.waiting;
    const isCritical = waiting >= ALERT_THRESHOLDS.db.waitingCriticalValue;

    await evaluateRule({
      key: 'db_pool_pressure',
      breaching: waiting > 0,
      severity: isCritical ? 'critical' : 'warning',
      warningChecks: ALERT_THRESHOLDS.db.waitingWarningChecks,
      criticalChecks: ALERT_THRESHOLDS.db.waitingCriticalChecks,
      subject: isCritical
        ? `CRITICAL: DB pool saturated (${waiting} waiting)`
        : `Warning: DB pool pressure detected (${waiting} waiting)`,
      message: `Pool: ${snapshot.pool.total}/${snapshot.pool.max} connections, ${waiting} waiting, ${snapshot.pool.utilizationPercent}% utilization.`,
      metrics: snapshot.pool,
      actions,
    });

    // 3. DB utilization high
    await evaluateRule({
      key: 'db_utilization',
      breaching: snapshot.pool.utilizationPercent >= ALERT_THRESHOLDS.db.utilizationWarningPercent,
      severity: 'warning',
      warningChecks: ALERT_THRESHOLDS.db.utilizationWarningChecks,
      criticalChecks: ALERT_THRESHOLDS.db.utilizationWarningChecks,
      subject: `Warning: DB pool utilization at ${snapshot.pool.utilizationPercent}%`,
      message: `Pool: ${snapshot.pool.total}/${snapshot.pool.max} connections, ${snapshot.pool.utilizationPercent}% utilization.`,
      metrics: snapshot.pool,
      actions,
    });
  }

  // 4. Memory pressure (Node heap)
  if (snapshot.memory) {
    const heap = snapshot.memory.heapPercent;
    const isCritical = heap >= ALERT_THRESHOLDS.memory.criticalPercent;

    await evaluateRule({
      key: 'memory_pressure',
      breaching: heap >= ALERT_THRESHOLDS.memory.warningPercent,
      severity: isCritical ? 'critical' : 'warning',
      warningChecks: ALERT_THRESHOLDS.memory.warningChecks,
      criticalChecks: ALERT_THRESHOLDS.memory.criticalChecks,
      subject: isCritical
        ? `CRITICAL: Memory at ${heap}% (${snapshot.memory.heapUsedMB}MB used)`
        : `Warning: Memory pressure at ${heap}%`,
      message: `Heap: ${snapshot.memory.heapUsedMB}MB used, RSS: ${snapshot.memory.rssMB}MB, ${heap}% of limit.`,
      metrics: snapshot.memory,
      actions,
    });
  }

  return actions;
}

// --- Internal helpers ---

interface RuleParams {
  key: string;
  breaching: boolean;
  severity: AlertSeverity;
  warningChecks: number;
  criticalChecks: number;
  subject: string;
  message: string;
  metrics: Record<string, unknown>;
  actions: AlertAction[];
}

async function evaluateRule(params: RuleParams): Promise<void> {
  const { key, breaching, severity, warningChecks, criticalChecks, subject, message, metrics, actions } = params;

  if (breaching) {
    const { shouldAlert, state } = await recordBreach(key, severity);
    const requiredChecks = severity === 'critical' ? criticalChecks : warningChecks;

    if (shouldAlert && state.consecutive_breaches >= requiredChecks) {
      actions.push({
        type: 'alert',
        key,
        severity,
        subject: `Soullab ${severity}: ${subject}`,
        message: `${message}\n\nSustained for ${state.consecutive_breaches} consecutive checks (~${state.consecutive_breaches} minutes).`,
        metrics,
      });
    }
  } else {
    const { shouldNotify } = await recordRecovery(key);
    if (shouldNotify) {
      actions.push({
        type: 'recovery',
        key,
        severity: 'ok',
        subject: `Soullab recovered: ${key.replace(/_/g, ' ')}`,
        message: `${key.replace(/_/g, ' ')} has returned to normal for ${ALERT_THRESHOLDS.recoveryChecks} consecutive checks.`,
        metrics,
      });
    }
  }
}
