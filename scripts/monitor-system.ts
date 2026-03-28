/**
 * MAIA System Health Monitor — Phase 1.5
 *
 * Lightweight polling loop that:
 * 1. Fetches /api/health every 60 seconds
 * 2. Evaluates sustained thresholds
 * 3. Sends email alerts on breach / recovery
 *
 * Runs as a separate Docker service (maia-health-monitor).
 * Does NOT modify MAIA behavior — observation only.
 *
 * Usage:
 *   npx tsx scripts/monitor-system.ts
 *
 * Environment:
 *   MONITOR_HEALTH_URL  — health endpoint (default: http://maia-sovereign:3000/api/health)
 *   MONITOR_INTERVAL_MS — poll interval (default: 60000)
 *   RESEND_API_KEY      — for email alerts
 *   ALERT_EMAIL         — recipient (default: Soullab1@gmail.com)
 *   DATABASE_URL        — for alert state persistence
 */

import { fetchHealthSnapshot } from '../lib/monitoring/healthClient';
import { evaluateHealth } from '../lib/monitoring/alertEvaluator';
import { sendAlertEmail } from '../lib/monitoring/notifiers/emailNotifier';

const INTERVAL_MS = parseInt(process.env.MONITOR_INTERVAL_MS || '60000', 10);
const LOG_PREFIX = 'monitor';

function log(level: 'info' | 'warn' | 'error', msg: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level,
    tag: LOG_PREFIX,
    msg,
    ...data,
  }));
}

async function runCheck(): Promise<void> {
  const checkStart = Date.now();

  try {
    // 1. Fetch health snapshot
    const snapshot = await fetchHealthSnapshot();

    log('info', 'Health check complete', {
      status: snapshot.status,
      poolWaiting: snapshot.pool?.waiting ?? null,
      poolUtilization: snapshot.pool?.utilizationPercent ?? null,
      heapPercent: snapshot.memory?.heapPercent ?? null,
      uptime: snapshot.uptime,
      fetchMs: snapshot.fetchDurationMs,
    });

    // 2. Evaluate against thresholds
    const actions = await evaluateHealth(snapshot);

    // 3. Send alerts / recovery notices
    for (const action of actions) {
      log(action.type === 'alert' ? 'warn' : 'info',
        `${action.type}: ${action.key} (${action.severity})`,
        { key: action.key, severity: action.severity }
      );

      await sendAlertEmail(action);
    }
  } catch (err) {
    log('error', 'Monitor check failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const checkDuration = Date.now() - checkStart;
  if (checkDuration > INTERVAL_MS * 0.8) {
    log('warn', 'Monitor check took too long', { durationMs: checkDuration });
  }
}

// --- Main loop ---

async function main() {
  log('info', 'Soullab health monitor starting', {
    interval: INTERVAL_MS,
    healthUrl: process.env.MONITOR_HEALTH_URL || 'http://maia-sovereign:3000/api/health',
    alertEmail: process.env.ALERT_EMAIL || 'Soullab1@gmail.com',
  });

  // Initial delay — let services start before first check
  await sleep(10_000);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await runCheck();
    await sleep(INTERVAL_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  log('error', 'Monitor crashed', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
