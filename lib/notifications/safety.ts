/**
 * SAFETY NOTIFICATIONS
 *
 * Email notifications for safety concerns in between-session messaging.
 * When a client marks a message as a safety concern, the practitioner
 * receives an immediate email notification.
 *
 * PRIVACY FIRST:
 * - Emails contain NO message content by default (link-only)
 * - Set SAFETY_EMAIL_INCLUDE_PREVIEW=true to include a short preview
 * - This protects practitioners from accidental PHI exposure via email
 */

import { sendEmail } from '@/lib/email/sendEmail';
import { query } from '@/lib/db/postgres';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

// Config: whether to include message preview in email (default: false for privacy)
const INCLUDE_PREVIEW = process.env.SAFETY_EMAIL_INCLUDE_PREVIEW === 'true';
const PREVIEW_MAX_LENGTH = 120; // Hard cap if preview is enabled


export interface SafetyNotificationParams {
  practitionerId: string;
  clientId: string;
  messageId: string;
  messageBody?: string; // Only used if INCLUDE_PREVIEW is true
  clientName: string;
}

export interface SafetyLogResult {
  logged: boolean;
  isNew: boolean;
  logId?: string;
  error?: string;
}

/**
 * Generate safety notification email HTML
 * Link-only by default — no PHI in email
 */
function generateSafetyEmailHtml(
  practitionerName: string,
  clientName: string,
  viewUrl: string,
  messagePreview?: string
): string {
  // Build preview section only if enabled and provided
  const previewSection = INCLUDE_PREVIEW && messagePreview
    ? `
              <!-- Message Preview (opt-in only) -->
              <div style="background: rgba(212, 72, 72, 0.08); border-left: 3px solid #D48B8B; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                  Preview
                </p>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6; font-style: italic;">
                  "${sanitizePreview(messagePreview)}"
                </p>
              </div>
`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1f2e;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #0D0B14; border-radius: 16px; border: 1px solid rgba(212, 72, 72, 0.4);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; background: rgba(212, 72, 72, 0.1); border-radius: 16px 16px 0 0;">
              <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
              <h1 style="margin: 0; color: #D48B8B; font-size: 20px; font-weight: 600;">
                Safety Concern Flagged
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; color: rgba(255,255,255,0.9); font-size: 16px;">
                Hi ${escapeHtml(practitionerName)},
              </p>
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">
                <strong style="color: #E5C158;">${escapeHtml(clientName)}</strong> has sent a between-session message marked as a <strong style="color: #D48B8B;">safety concern</strong>.
              </p>
${previewSection}
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">
                Please sign in to review the full message and take appropriate action.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #D48B8B 0%, #b07070 100%); color: #0D0B14; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Sign In to View Message
              </a>
            </td>
          </tr>

          <!-- Reminder -->
          <tr>
            <td style="padding: 20px 32px; background: rgba(255,255,255,0.03); border-radius: 0 0 16px 16px; border-top: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.6; text-align: center;">
                If this is an emergency, follow your standard crisis protocols.
                <br>
                Between-session messaging is not a substitute for crisis intervention.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize message preview: truncate, strip newlines, escape
 */
function sanitizePreview(text: string): string {
  const cleaned = text
    .replace(/[\r\n]+/g, ' ') // Replace newlines with space
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim();

  const truncated = cleaned.length > PREVIEW_MAX_LENGTH
    ? cleaned.slice(0, PREVIEW_MAX_LENGTH) + '...'
    : cleaned;

  return escapeHtml(truncated);
}

/**
 * Log safety concern for audit trail
 * Returns whether this was a NEW log entry (for idempotency)
 *
 * This is the SOURCE OF TRUTH for whether to send a notification.
 * If isNew === true, send the email. If false, it's a duplicate.
 */
export async function logSafetyConcern(
  practitionerId: string,
  clientId: string,
  messageId: string
): Promise<SafetyLogResult> {
  try {
    const result = await query(
      `INSERT INTO safety_concern_logs (
        practitioner_id, client_id, message_id, logged_at, email_status
      ) VALUES ($1, $2, $3, NOW(), 'pending')
      ON CONFLICT (message_id) DO NOTHING
      RETURNING id`,
      [practitionerId, clientId, messageId]
    );

    // If rowCount > 0, this was a new insert
    const isNew = (result.rowCount ?? 0) > 0;
    const logId = result.rows[0]?.id;

    return {
      logged: true,
      isNew,
      logId,
    };
  } catch (error) {
    console.error('Failed to log safety concern:', error);
    return {
      logged: false,
      isNew: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update safety concern log with email status
 */
export async function updateSafetyLogEmailStatus(
  logId: string,
  status: 'sent' | 'failed',
  error?: string
): Promise<void> {
  try {
    await query(
      `UPDATE safety_concern_logs
       SET email_status = $1,
           email_sent = $2,
           email_sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE NULL END,
           email_error = $3
       WHERE id = $4`,
      [status, status === 'sent', error || null, logId]
    );
  } catch (err) {
    console.error('Failed to update safety log email status:', err);
  }
}

/**
 * Send safety concern notification to practitioner
 *
 * IMPORTANT: Call logSafetyConcern() FIRST and only call this if isNew === true.
 * This prevents duplicate emails on request retries.
 */
export async function sendSafetyConcernNotification(
  params: SafetyNotificationParams,
  logId?: string
): Promise<{ success: boolean; error?: string }> {
  const { practitionerId, clientId, messageId, messageBody, clientName } = params;

  try {
    // Get practitioner email and name
    const practitionerResult = await query(
      `SELECT email, name, preferred_name FROM members WHERE id = $1`,
      [practitionerId]
    );

    if (!practitionerResult.rows[0]) {
      if (logId) await updateSafetyLogEmailStatus(logId, 'failed', 'Practitioner not found');
      return { success: false, error: 'Practitioner not found' };
    }

    const practitioner = practitionerResult.rows[0];
    const practitionerEmail = practitioner.email;
    const practitionerName = resolveMemberDisplayName(practitioner, 'there');

    if (!practitionerEmail) {
      console.warn(`Practitioner ${practitionerId} has no email - skipping safety notification`);
      if (logId) await updateSafetyLogEmailStatus(logId, 'failed', 'No email address');
      return { success: false, error: 'Practitioner has no email address' };
    }

    // Build view URL (requires sign-in)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://soullab.ai';
    const viewUrl = `${baseUrl}/stellium/messages?client=${clientId}`;

    // Generate email HTML (link-only by default, preview only if enabled)
    const html = generateSafetyEmailHtml(
      practitionerName,
      clientName,
      viewUrl,
      INCLUDE_PREVIEW ? messageBody : undefined
    );

    // Send email
    const result = await sendEmail({
      purpose: 'notify:safety',
      from: 'Stellium <notifications@soullab.ai>',
      to: practitionerEmail,
      subject: `Safety Concern: ${clientName} needs attention`,
      html,
    });

    if (!result.success) {
      console.error(
        `Safety notification REFUSED: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
      );
      if (logId) await updateSafetyLogEmailStatus(logId, 'failed', result.error ?? 'Send refused');
      return { success: false, error: result.error };
    }

    console.log(`Safety notification sent for message ${messageId}`);
    if (logId) await updateSafetyLogEmailStatus(logId, 'sent');
    return { success: true };
  } catch (error) {
    console.error('Error sending safety notification:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    if (logId) await updateSafetyLogEmailStatus(logId, 'failed', errorMsg);
    return { success: false, error: errorMsg };
  }
}
