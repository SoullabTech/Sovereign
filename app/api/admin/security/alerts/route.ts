export const dynamic = 'force-dynamic';

/**
 * Security Alerts API
 *
 * GET  /api/admin/security/alerts            — list recent alerts
 * POST /api/admin/security/alerts            — trigger a check or acknowledge
 *   body: { action: 'check' }               — run thresholds, send emails if needed
 *   body: { action: 'ack', alertId: string } — mark acknowledged
 *
 * Secured by middleware (admin role required via accessMatrix).
 * Also accepts x-internal-token header for cron calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runSecurityCheck,
  listRecentAlerts,
  acknowledgeAlert,
} from '@/lib/security/alertEngine';

export async function GET() {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ alerts: [] });

  const alerts = await listRecentAlerts(50);
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });

  // Also allow calls from the cron script via internal token
  const internalToken = request.headers.get('x-internal-token');
  const isInternalCron =
    internalToken &&
    process.env.INTERNAL_ALERT_TOKEN &&
    internalToken === process.env.INTERNAL_ALERT_TOKEN;

  // (Middleware handles admin-role auth for browser requests;
  //  cron calls come in with the internal token.)

  try {
    const body = await request.json().catch(() => ({}));
    const { action, alertId } = body;

    if (action === 'check' || isInternalCron) {
      const { newAlerts, emailsSent } = await runSecurityCheck();
      return NextResponse.json({
        checked: true,
        newAlerts: newAlerts.length,
        emailsSent,
        alerts: newAlerts,
      });
    }

    if (action === 'ack' && alertId) {
      const ok = await acknowledgeAlert(alertId);
      return NextResponse.json({ acknowledged: ok });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[SecurityAlerts] POST error: ${msg}`);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
