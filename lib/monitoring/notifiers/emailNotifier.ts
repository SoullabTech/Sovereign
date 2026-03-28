/**
 * Email alert notifier — sends via Resend.
 *
 * Matches existing Soullab email pattern (from kelly@soullab.life).
 * Sends to ALERT_EMAIL env var (defaults to kelly@soullab.life).
 */

import type { AlertAction } from '../alertEvaluator';

const ALERT_FROM = 'Soullab System <kelly@soullab.life>';
const ALERT_TO = process.env.ALERT_EMAIL || 'Soullab1@gmail.com';

/**
 * Send an alert or recovery email.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendAlertEmail(action: AlertAction): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'warn',
      tag: 'monitor.email',
      msg: 'RESEND_API_KEY not set — alert email skipped',
      alertKey: action.key,
    }));
    return false;
  }

  const isRecovery = action.type === 'recovery';
  const severityLabel = isRecovery ? 'RECOVERED' : action.severity.toUpperCase();
  const emoji = isRecovery ? '✅' : action.severity === 'critical' ? '🔴' : '⚠️';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; padding: 20px;">
      <h2 style="color: ${isRecovery ? '#22c55e' : action.severity === 'critical' ? '#ef4444' : '#f59e0b'};">
        ${emoji} ${severityLabel}: ${action.key.replace(/_/g, ' ')}
      </h2>
      <p style="font-size: 16px; color: #374151;">${action.message.replace(/\n/g, '<br>')}</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <table style="font-size: 14px; color: #6b7280;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Alert Key</td><td>${action.key}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Severity</td><td>${severityLabel}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Time</td><td>${new Date().toISOString()}</td></tr>
      </table>
      ${Object.keys(action.metrics).length > 0 ? `
        <h3 style="color: #374151; margin-top: 20px;">Metrics</h3>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto;">${JSON.stringify(action.metrics, null, 2)}</pre>
      ` : ''}
      <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        Soullab Infrastructure Monitor &mdash; ${process.env.MAIA_HOST_ID || 'unknown host'}
      </p>
    </div>
  `;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: ALERT_FROM,
      to: ALERT_TO,
      subject: action.subject,
      html: htmlBody,
    });

    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      tag: 'monitor.email',
      msg: `Alert email sent: ${action.key} (${severityLabel})`,
      to: ALERT_TO,
    }));

    return true;
  } catch (err) {
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      tag: 'monitor.email',
      msg: 'Failed to send alert email',
      error: err instanceof Error ? err.message : String(err),
      alertKey: action.key,
    }));
    return false;
  }
}
