/**
 * Security Alert Engine
 *
 * Checks the audit_logs and auth_sessions tables for suspicious patterns.
 * Inserts rows into security_alerts for anything that crosses a threshold.
 * Uses the security_alerts table itself for cooldown (no Redis needed).
 *
 * Thresholds:
 *   CRITICAL  20+ failed auths in 15 min  ─ email immediately
 *   WARNING    5+ failed auths in 15 min  ─ DB only
 *   CRITICAL  10+ unique failing IPs/hr   ─ email immediately
 *   WARNING    3+ unique failing IPs/hr   ─ DB only
 *   WARNING    3+ session revocations/hr  ─ DB only
 *   CRITICAL  10+ session revocations/hr  ─ email immediately
 *
 * Cooldown: 15 minutes per alert_type + severity combination.
 */

import { query } from '@/lib/db/postgres';
import { sendEmail } from '@/lib/email/sendEmail';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SecurityAlert {
  id: string;
  severity: AlertSeverity;
  alertType: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  notified: boolean;
  acknowledged: boolean;
  createdAt: string;
}

interface CheckResult {
  newAlerts: SecurityAlert[];
  emailsSent: number;
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS = {
  authFailures15m: { warning: 5,  critical: 20 },
  uniqueFailingIPs1h: { warning: 3, critical: 10 },
  sessionRevocations1h: { warning: 3, critical: 10 },
};

const COOLDOWN_MINUTES = 15;

// ─── Cooldown check ───────────────────────────────────────────────────────────

async function isOnCooldown(alertType: string, severity: AlertSeverity): Promise<boolean> {
  try {
    const result = await query(
      `SELECT 1 FROM security_alerts
       WHERE alert_type = $1
         AND severity   = $2
         AND created_at > now() - ($3::int || ' minutes')::interval
       LIMIT 1`,
      [alertType, severity, COOLDOWN_MINUTES]
    );
    return result.rows.length > 0;
  } catch {
    return false; // If table doesn't exist yet, proceed
  }
}

// ─── Insert alert ─────────────────────────────────────────────────────────────

async function insertAlert(
  severity: AlertSeverity,
  alertType: string,
  title: string,
  message: string,
  metadata: Record<string, unknown>
): Promise<SecurityAlert | null> {
  try {
    const result = await query(
      `INSERT INTO security_alerts (severity, alert_type, title, message, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, severity, alert_type, title, message, metadata, notified, acknowledged, created_at`,
      [severity, alertType, title, message, JSON.stringify(metadata)]
    );
    const row = result.rows[0];
    return {
      id:           row.id,
      severity:     row.severity,
      alertType:    row.alert_type,
      title:        row.title,
      message:      row.message,
      metadata:     row.metadata,
      notified:     row.notified,
      acknowledged: row.acknowledged,
      createdAt:    row.created_at,
    };
  } catch (err) {
    console.error('[AlertEngine] Failed to insert alert:', err);
    return null;
  }
}

// ─── Email dispatch ────────────────────────────────────────────────────────────

async function sendAlertEmail(alert: SecurityAlert): Promise<boolean> {
  const recipientEmail = process.env.DEV_EMAIL;

  if (!recipientEmail) {
    console.warn('[AlertEngine] Email not configured — alert stored in DB only');
    return false;
  }

  try {
    const severityColor = alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
    const severityBg    = alert.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb';

    const result = await sendEmail({
      purpose: 'security:alert',
      from:    'Soullab Security <noreply@soullab.life>',
      to:      recipientEmail,
      subject: `[${alert.severity}] MAIA Security: ${alert.title}`,
      metadata: { severity: alert.severity },
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f8fafc;">
          <div style="background:${severityBg};border:2px solid ${severityColor};border-radius:12px;padding:24px;margin-bottom:24px;">
            <h2 style="margin:0 0 8px;color:${severityColor};font-size:20px;">${alert.title}</h2>
            <p style="margin:0;color:#374151;font-size:15px;">${alert.message}</p>
          </div>

          <table style="width:100%;background:#fff;border-radius:8px;border-collapse:collapse;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr style="background:#f1f5f9;">
              <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Field</td>
              <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Value</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;">Severity</td>
              <td style="padding:10px 16px;font-size:13px;color:${severityColor};font-weight:600;border-top:1px solid #f1f5f9;">${alert.severity}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;">Type</td>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;">${alert.alertType}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;">Time</td>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;">${new Date(alert.createdAt).toLocaleString()}</td>
            </tr>
            ${Object.keys(alert.metadata).length > 0 ? `
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#374151;border-top:1px solid #f1f5f9;vertical-align:top;">Details</td>
              <td style="padding:10px 16px;font-size:12px;color:#374151;border-top:1px solid #f1f5f9;font-family:monospace;white-space:pre-wrap;">${JSON.stringify(alert.metadata, null, 2)}</td>
            </tr>` : ''}
          </table>

          <div style="text-align:center;margin-top:24px;">
            <a href="https://soullab.life/admin/security"
               style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
              View Security Monitor →
            </a>
          </div>

          <p style="text-align:center;margin-top:20px;font-size:11px;color:#94a3b8;">
            MAIA Sovereign Security · soullab.life
          </p>
        </div>
      `,
    });

    // A refused alert is not a delivered alert. Marking it notified would
    // suppress the retry AND leave an operator believing security paging works.
    if (!result.success) {
      console.error(
        `[AlertEngine] alert email REFUSED failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
      );
      return false;
    }

    // Mark as notified
    await query(
      `UPDATE security_alerts SET notified = TRUE WHERE id = $1`,
      [alert.id]
    );

    return true;
  } catch (err) {
    console.error('[AlertEngine] Email send failed:', err);
    return false;
  }
}

// ─── Main check function ──────────────────────────────────────────────────────

export async function runSecurityCheck(): Promise<CheckResult> {
  const newAlerts: SecurityAlert[] = [];
  let emailsSent = 0;

  try {
    // ── Auth failures in last 15 min ─────────────────────────────────────
    const failResult = await query(`
      SELECT
        COUNT(*)::int                            AS total,
        COUNT(DISTINCT ip_address)::int          AS unique_ips
      FROM audit_logs
      WHERE action_result = 'failure'
        AND created_at   > now() - interval '15 minutes'
    `);
    const { total: failCount, unique_ips: failUniqueIPs } = failResult.rows[0] ?? { total: 0, unique_ips: 0 };

    if (failCount >= THRESHOLDS.authFailures15m.critical) {
      if (!await isOnCooldown('auth_spike', 'CRITICAL')) {
        const alert = await insertAlert(
          'CRITICAL', 'auth_spike',
          'Brute force detected',
          `${failCount} failed auth attempts in 15 minutes from ${failUniqueIPs} IP${failUniqueIPs !== 1 ? 's' : ''}`,
          { failCount, failUniqueIPs, window: '15m' }
        );
        if (alert) {
          newAlerts.push(alert);
          if (await sendAlertEmail(alert)) emailsSent++;
        }
      }
    } else if (failCount >= THRESHOLDS.authFailures15m.warning) {
      if (!await isOnCooldown('auth_spike', 'WARNING')) {
        const alert = await insertAlert(
          'WARNING', 'auth_spike',
          'Elevated auth failures',
          `${failCount} failed attempts in the last 15 minutes`,
          { failCount, failUniqueIPs, window: '15m' }
        );
        if (alert) newAlerts.push(alert);
      }
    }

    // ── Unique failing IPs in last 1 hour ────────────────────────────────
    const ipResult = await query(`
      SELECT COUNT(DISTINCT ip_address)::int AS unique_ips
      FROM audit_logs
      WHERE action_result = 'failure'
        AND ip_address IS NOT NULL
        AND created_at > now() - interval '1 hour'
    `);
    const uniqueIPs1h = ipResult.rows[0]?.unique_ips ?? 0;

    if (uniqueIPs1h >= THRESHOLDS.uniqueFailingIPs1h.critical) {
      if (!await isOnCooldown('distributed_attack', 'CRITICAL')) {
        const alert = await insertAlert(
          'CRITICAL', 'distributed_attack',
          'Possible distributed attack',
          `${uniqueIPs1h} unique IPs with auth failures in the last hour`,
          { uniqueIPs1h, window: '1h' }
        );
        if (alert) {
          newAlerts.push(alert);
          if (await sendAlertEmail(alert)) emailsSent++;
        }
      }
    } else if (uniqueIPs1h >= THRESHOLDS.uniqueFailingIPs1h.warning) {
      if (!await isOnCooldown('distributed_attack', 'WARNING')) {
        const alert = await insertAlert(
          'WARNING', 'distributed_attack',
          'Multiple IPs with auth failures',
          `${uniqueIPs1h} unique IPs with failures in the last hour`,
          { uniqueIPs1h, window: '1h' }
        );
        if (alert) newAlerts.push(alert);
      }
    }

    // ── Session revocations in last 1 hour ───────────────────────────────
    const revokeResult = await query(`
      SELECT COUNT(*)::int AS count
      FROM auth_sessions
      WHERE revoked     = TRUE
        AND revoked_at  > now() - interval '1 hour'
        AND revoked_reason != 'user_signout'  -- exclude normal sign-outs
    `);
    const revokeCount = revokeResult.rows[0]?.count ?? 0;

    if (revokeCount >= THRESHOLDS.sessionRevocations1h.critical) {
      if (!await isOnCooldown('session_revoke_spike', 'CRITICAL')) {
        const alert = await insertAlert(
          'CRITICAL', 'session_revoke_spike',
          'Mass session revocation',
          `${revokeCount} sessions revoked in the last hour (excluding user sign-outs)`,
          { revokeCount, window: '1h' }
        );
        if (alert) {
          newAlerts.push(alert);
          if (await sendAlertEmail(alert)) emailsSent++;
        }
      }
    } else if (revokeCount >= THRESHOLDS.sessionRevocations1h.warning) {
      if (!await isOnCooldown('session_revoke_spike', 'WARNING')) {
        const alert = await insertAlert(
          'WARNING', 'session_revoke_spike',
          'Unusual session revocations',
          `${revokeCount} sessions revoked non-voluntarily in the last hour`,
          { revokeCount, window: '1h' }
        );
        if (alert) newAlerts.push(alert);
      }
    }

  } catch (err) {
    console.error('[AlertEngine] Check failed:', err);
  }

  return { newAlerts, emailsSent };
}

// ─── List recent alerts ───────────────────────────────────────────────────────

export async function listRecentAlerts(limit = 50): Promise<SecurityAlert[]> {
  try {
    const result = await query(
      `SELECT id, severity, alert_type, title, message, metadata, notified, acknowledged, created_at
       FROM security_alerts
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => ({
      id:           row.id,
      severity:     row.severity,
      alertType:    row.alert_type,
      title:        row.title,
      message:      row.message,
      metadata:     row.metadata,
      notified:     row.notified,
      acknowledged: row.acknowledged,
      createdAt:    row.created_at,
    }));
  } catch {
    return []; // Table may not exist yet
  }
}

// ─── Acknowledge alert ────────────────────────────────────────────────────────

export async function acknowledgeAlert(alertId: string): Promise<boolean> {
  try {
    await query(
      `UPDATE security_alerts SET acknowledged = TRUE WHERE id = $1`,
      [alertId]
    );
    return true;
  } catch {
    return false;
  }
}
