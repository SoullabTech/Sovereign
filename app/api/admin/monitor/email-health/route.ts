/**
 * GET /api/admin/monitor/email-health — is the email transport working?
 * Admin-gated, read-only. Counts, classes and timestamps from the delivery
 * ledger only: no recipient fingerprint, subject, body or address is selected.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { deriveEmailHealth, type EmailAttemptRow } from '@/lib/admin/emailHealth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth(request)).authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await query<EmailAttemptRow>(
      `SELECT provider, state, purpose, failure_class, created_at
         FROM email_delivery_attempts
        ORDER BY created_at DESC
        LIMIT 300`,
    );
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      health: deriveEmailHealth(result.rows),
      // Presence of the settings only; never their values.
      smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD_FILE),
      alertRecipientConfigured: Boolean(process.env.OPS_ALERT_PHONE || process.env.OPS_ALERT_SLACK_WEBHOOK_URL),
    });
  } catch (err) {
    console.error('[admin/monitor/email-health] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
