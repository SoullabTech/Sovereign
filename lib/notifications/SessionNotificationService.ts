/**
 * SESSION NOTIFICATION SERVICE
 *
 * Sends multi-channel notifications for session events:
 * - Booking confirmations
 * - Appointment reminders (24h, 1h before)
 * - Cancellations/reschedules
 *
 * Channels: Email (always, if address exists) + WhatsApp + SMS (if phone exists)
 */

import { query } from '@/lib/db/postgres';
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';

// Twilio WhatsApp Content Template for appointments
const TWILIO_APPOINTMENT_TEMPLATE_SID = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

interface SessionDetails {
  id: string;
  /** practitioner_clients.id — the reminder recipient; used for the reminder-consent lookup */
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceName: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  locationType: string;
  locationDetails?: string;
  practitionerName: string;
  practitionerId?: string;
}

interface NotificationResult {
  success: boolean;
  channel: 'whatsapp' | 'sms' | 'email' | 'none';
  messageId?: string;
  error?: string;
}

/**
 * Multi-channel outcome for booking confirmations and reminders.
 * Each channel is optional — only present if a send was attempted.
 */
export interface BookingNotificationResults {
  email?: NotificationResult;
  whatsapp?: NotificationResult;
  sms?: NotificationResult;
  anySuccess: boolean;
}

/**
 * Format date for Twilio template (e.g., "2/15" or "Feb 15")
 */
function formatDateForTemplate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Format time for Twilio template (e.g., "3pm" or "10:30am")
 */
function formatTimeForTemplate(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const hour12 = hours % 12 || 12;

  if (minutes === 0) {
    return `${hour12}${ampm}`;
  }
  return `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

/**
 * Format duration between two dates for human-readable display
 */
function formatDuration(start: Date, end: Date): string {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${m}m`;
}

/**
 * Format location type + details for display
 */
function formatLocation(locationType: string, locationDetails?: string): string {
  const labels: Record<string, string> = {
    video: 'Video call',
    phone: 'Phone call',
    in_person: 'In person',
    async: 'Async',
  };
  const label = labels[locationType] ?? locationType;
  // For non-video types, append details inline; for video, show label only (link handled separately)
  if (locationDetails && locationType !== 'video') return `${label}: ${locationDetails}`;
  return label;
}

/**
 * Build plain-text and HTML body for the booking confirmation email.
 * Never logs or stores content — body lives only in the outbound Resend call.
 */
function buildConfirmationEmailBody(session: SessionDetails): { html: string; text: string } {
  const {
    clientName,
    practitionerName,
    serviceName,
    scheduledStart,
    scheduledEnd,
    locationType,
    locationDetails,
  } = session;

  const dateStr = scheduledStart.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = scheduledStart.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const duration = formatDuration(scheduledStart, scheduledEnd);
  const locationLabel = formatLocation(locationType, locationDetails);
  const isVideo = locationType === 'video' && locationDetails;

  // Plain-text version
  const textLines = [
    `Hi ${clientName},`,
    '',
    'Your session has been scheduled.',
    '',
    `Service:  ${serviceName}`,
    `Date:     ${dateStr}`,
    `Time:     ${timeStr}`,
    `Duration: ${duration}`,
    `Location: ${locationLabel}`,
    ...(isVideo ? ['', `Join: ${locationDetails}`] : []),
    '',
    `To reschedule or cancel, please contact ${practitionerName}.`,
    '',
    practitionerName,
    'Soullab',
  ];
  const text = textLines.join('\n');

  // HTML version
  const rows: [string, string][] = [
    ['Service', serviceName],
    ['Date', dateStr],
    ['Time', timeStr],
    ['Duration', duration],
    ['Location', locationLabel],
  ];
  const tableRows = rows
    .map(
      ([label, val]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top">${label}</td>` +
        `<td style="padding:4px 0">${val}</td></tr>`
    )
    .join('\n');

  const meetingLinkBlock = isVideo
    ? `<p style="margin:20px 0"><a href="${locationDetails}" style="display:inline-block;padding:10px 20px;background:#6b5cf6;color:#fff;text-decoration:none;border-radius:6px;font-weight:500">Join video call →</a></p>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px 16px;color:#111827;line-height:1.5">
  <p>Hi ${clientName},</p>
  <p>Your session has been scheduled.</p>
  <table style="border-collapse:collapse;margin:20px 0">
    ${tableRows}
  </table>
  ${meetingLinkBlock}
  <p>To reschedule or cancel, please contact ${practitionerName}.</p>
  <p style="margin-top:28px;color:#374151">${practitionerName}<br>Soullab</p>
</body>
</html>`;

  return { html, text };
}

/**
 * Send the booking confirmation email channel.
 * Returns a NotificationResult so it composes cleanly with phone channels.
 */
async function sendBookingConfirmationEmail(session: SessionDetails): Promise<NotificationResult> {
  if (!session.clientEmail) {
    return { success: false, channel: 'email', error: 'No client email' };
  }

  const { html, text } = buildConfirmationEmailBody(session);

  const result = await sendEmail({
    purpose: 'booking:confirmation',
    from: SENDERS.noreply,
    to: session.clientEmail,
    subject: `Session Confirmed — ${session.serviceName}`,
    html,
    text,
  });

  return {
    success: result.success,
    channel: 'email',
    messageId: result.id,
    error: result.error,
  };
}

/**
 * Core multi-channel send: email first (always, if address exists), then
 * WhatsApp → SMS (if phone exists). Logs each channel with the given type prefix.
 */
async function sendMultiChannelNotification(
  session: SessionDetails,
  notifTypePrefix: string,
  practitionerId?: string
): Promise<BookingNotificationResults> {
  const results: BookingNotificationResults = { anySuccess: false };

  // 1. Email — independent of Twilio; always attempt if address present
  if (session.clientEmail) {
    const emailResult = await sendBookingConfirmationEmail(session);
    results.email = emailResult;
    if (emailResult.success) {
      await logNotification(session.id, `${notifTypePrefix}_email`, 'email', emailResult.messageId);
      results.anySuccess = true;
    } else {
      console.warn(`[SessionNotifications] Email ${notifTypePrefix} failed for session ${session.id}:`, emailResult.error);
    }
  }

  // 2. Phone channels — WhatsApp first, SMS fallback — only if phone present
  if (session.clientPhone) {
    const credentials = await getTwilioCredentials(practitionerId);
    if (credentials) {
      const date = formatDateForTemplate(session.scheduledStart);
      const time = formatTimeForTemplate(session.scheduledStart);

      const whatsappResult = await sendWhatsAppReminder(session.clientPhone, date, time, credentials);
      if (whatsappResult.success) {
        results.whatsapp = { success: true, channel: 'whatsapp', messageId: whatsappResult.messageId };
        await logNotification(session.id, `${notifTypePrefix}_whatsapp`, 'whatsapp', whatsappResult.messageId);
        results.anySuccess = true;
      } else {
        results.whatsapp = { success: false, channel: 'whatsapp', error: whatsappResult.error };

        // SMS fallback
        const smsMessage = `Your session has been scheduled for ${date} at ${time}. Contact ${session.practitionerName} to reschedule.`;
        const smsResult = await sendSMSReminder(session.clientPhone, smsMessage, credentials);
        if (smsResult.success) {
          results.sms = { success: true, channel: 'sms', messageId: smsResult.messageId };
          await logNotification(session.id, `${notifTypePrefix}_sms`, 'sms', smsResult.messageId);
          results.anySuccess = true;
        } else {
          results.sms = { success: false, channel: 'sms', error: smsResult.error };
        }
      }
    } else {
      console.warn('[SessionNotifications] No Twilio credentials; phone channels skipped');
      results.whatsapp = { success: false, channel: 'whatsapp', error: 'No Twilio credentials' };
    }
  }

  return results;
}

/**
 * Send WhatsApp appointment reminder using Twilio Content Template
 */
async function sendWhatsAppReminder(
  to: string,
  date: string,
  time: string,
  credentials: { account_sid: string; auth_token: string; whatsapp_number: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { account_sid, auth_token, whatsapp_number } = credentials;

  // Format phone numbers with whatsapp: prefix
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromNumber = whatsapp_number.startsWith('whatsapp:') ? whatsapp_number : `whatsapp:${whatsapp_number}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;

  const body = new URLSearchParams({
    To: toNumber,
    From: fromNumber,
    ContentSid: TWILIO_APPOINTMENT_TEMPLATE_SID,
    ContentVariables: JSON.stringify({ '1': date, '2': time }),
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[SessionNotifications] WhatsApp sent to ${to}: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } else {
      console.error('[SessionNotifications] WhatsApp failed:', data);
      return { success: false, error: data.message || 'WhatsApp send failed' };
    }
  } catch (error) {
    console.error('[SessionNotifications] WhatsApp error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send SMS reminder using Twilio
 */
async function sendSMSReminder(
  to: string,
  message: string,
  credentials: { account_sid: string; auth_token: string; from_number: string; messaging_service_sid?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { account_sid, auth_token, from_number, messaging_service_sid } = credentials;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;

  // Prefer MessagingServiceSid (A2P 10DLC compliant) over From number
  const body = new URLSearchParams({
    To: to,
    Body: message,
  });

  if (messaging_service_sid) {
    body.append('MessagingServiceSid', messaging_service_sid);
  } else {
    body.append('From', from_number);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${account_sid}:${auth_token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[SessionNotifications] SMS sent to ${to}: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } else {
      console.error('[SessionNotifications] SMS failed:', data);
      return { success: false, error: data.message || 'SMS send failed' };
    }
  } catch (error) {
    console.error('[SessionNotifications] SMS error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send Telegram message for session reminder
 */
async function sendTelegramReminder(
  chatId: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log(`[SessionNotifications] Telegram sent to ${chatId}: ${data.result.message_id}`);
      return { success: true, messageId: data.result.message_id.toString() };
    } else {
      console.error('[SessionNotifications] Telegram failed:', data);
      return { success: false, error: data.description || 'Telegram send failed' };
    }
  } catch (error) {
    console.error('[SessionNotifications] Telegram error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get Twilio credentials from environment or practitioner integrations
 */
async function getTwilioCredentials(practitionerId?: string): Promise<{
  account_sid: string;
  auth_token: string;
  from_number: string;
  whatsapp_number: string;
  messaging_service_sid?: string;
} | null> {
  // Try practitioner-specific credentials first
  if (practitionerId) {
    try {
      const result = await query(
        `SELECT config_encrypted FROM practitioner_integrations
         WHERE practitioner_id = $1 AND integration_type = 'sms' AND status = 'connected'`,
        [practitionerId]
      );

      if (result.rows.length > 0 && result.rows[0].config_encrypted) {
        const config = typeof result.rows[0].config_encrypted === 'string'
          ? JSON.parse(result.rows[0].config_encrypted)
          : result.rows[0].config_encrypted;
        if (config.account_sid && config.auth_token && config.from_number) {
          return config;
        }
      }
    } catch (error) {
      // Don't let practitioner credential lookup failure prevent env var fallback
      console.warn('[SessionNotifications] Practitioner credential lookup failed, falling back to env vars:', error instanceof Error ? error.message : error);
    }
  }

  // Fall back to environment variables
  const account_sid = process.env.TWILIO_ACCOUNT_SID;
  const auth_token = process.env.TWILIO_AUTH_TOKEN;
  const from_number = process.env.TWILIO_FROM_NUMBER;
  const whatsapp_number = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const messaging_service_sid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (account_sid && auth_token && (from_number || messaging_service_sid)) {
    return { account_sid, auth_token, from_number: from_number || '', whatsapp_number, messaging_service_sid };
  }

  return null;
}

/**
 * CONSENT GATE — classifier for which notification types are CLIENT-recipient reminders.
 *
 * Only client reminder sends (to session.clientPhone) are consent-gated. Booking
 * confirmations and any practitioner_* types are intentionally excluded: practitioner
 * self-reminders run through sendPractitionerReminder and never reach the client
 * phone-send paths, and a booking confirmation is not a reminder. Matching on the literal
 * "reminder_" / "manual_reminder" prefixes keeps "practitioner_reminder_*" (which starts
 * with "practitioner_") correctly OUT of the gate.
 */
export function isClientReminderType(notifTypePrefix: string): boolean {
  return notifTypePrefix.startsWith('reminder_') || notifTypePrefix === 'manual_reminder';
}

/**
 * CONSENT GATE — has the client consented to receive appointment reminders at their phone?
 *
 * Consent lives on practitioner_clients.reminder_consent — the record that owns the actual
 * reminder recipient (practitioner_clients.phone). This is deliberately NOT client_contacts:
 * that table is reserved for third-party contacts (parent / caregiver / teacher) and is
 * never the recipient of a client reminder. (Supersedes the earlier client_contacts-based
 * gate, which could never grant consent for the client and so failed closed for everyone.)
 *
 * Fails CLOSED — a missing clientId, no matching row, reminder_consent false/null, or any
 * lookup error all return false (skip the send). Never throws, so the cron flow is never
 * broken by this check.
 */
async function clientHasReminderConsent(clientId: string | undefined): Promise<boolean> {
  if (!clientId) return false;

  try {
    const result = await query(
      `SELECT reminder_consent FROM practitioner_clients WHERE id = $1`,
      [clientId]
    );
    if (result.rows.length === 0) return false; // no client row => not consented
    return result.rows[0].reminder_consent === true; // false / null => not consented
  } catch (error) {
    console.error(
      '[SessionReminders] Reminder-consent lookup failed; failing closed (no send):',
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * CONSENT GATE — auditable counterpart to the [SessionReminders] skipped_no_client_consent
 * log marker. Records one row per (session, type) noting the reminder was suppressed for
 * lack of consent. The distinct *_skipped_no_client_consent type never collides with the
 * *_whatsapp / *_sms rows the reminder de-dup query checks, so the session stays eligible
 * and will send normally once consent is granted. Never throws.
 */
async function logSkippedNoClientConsent(sessionId: string, notifTypePrefix: string): Promise<void> {
  try {
    await query(
      `INSERT INTO session_notifications (session_id, notification_type, channel, status, error_message, sent_at)
       VALUES ($1, $2, 'none', 'skipped', 'no client consent (practitioner_clients.reminder_consent not true)', NOW())
       ON CONFLICT (session_id, notification_type) DO UPDATE
       SET status = 'skipped', error_message = EXCLUDED.error_message, sent_at = NOW()`,
      [sessionId, `${notifTypePrefix}_skipped_no_client_consent`]
    );
  } catch (error) {
    console.error(
      '[SessionReminders] Failed to log consent skip:',
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Send DUAL notification (WhatsApp + SMS) for better US coverage
 * Many US users don't check WhatsApp regularly, so we send both
 */
export async function sendDualChannelNotification(
  session: SessionDetails,
  notificationType: string,
  practitionerId?: string
): Promise<{ whatsapp: NotificationResult; sms: NotificationResult }> {
  const results = {
    whatsapp: { success: false, channel: 'whatsapp' as const, error: 'Not sent' },
    sms: { success: false, channel: 'sms' as const, error: 'Not sent' },
  };

  if (!session.clientPhone) {
    results.whatsapp.error = 'No phone number';
    results.sms.error = 'No phone number';
    return results;
  }

  // CONSENT GATE — a client reminder must not leave the system unless the client has
  // reminder_consent = true on their practitioner_clients record (the actual recipient of
  // this phone send). Evaluated BEFORE credentials so the decision is independent of send
  // capability (and unit-testable). Fails closed — see clientHasReminderConsent. Booking
  // confirmations and practitioner self-reminders are intentionally NOT gated here.
  if (isClientReminderType(notificationType)) {
    const consented = await clientHasReminderConsent(session.clientId);
    if (!consented) {
      console.warn(
        `[SessionReminders] skipped_no_client_consent { sessionId: ${session.id}, type: ${notificationType}, channels: whatsapp+sms }`
      );
      await logSkippedNoClientConsent(session.id, notificationType);
      const reason = 'Skipped: no client consent';
      results.whatsapp.error = reason;
      results.sms.error = reason;
      return results;
    }
  }

  const credentials = await getTwilioCredentials(practitionerId);
  if (!credentials) {
    console.warn('[SessionNotifications] No Twilio credentials configured');
    results.whatsapp.error = 'No credentials';
    results.sms.error = 'No credentials';
    return results;
  }

  const date = formatDateForTemplate(session.scheduledStart);
  const time = formatTimeForTemplate(session.scheduledStart);
  const smsMessage = `Your appointment is coming up on ${date} at ${time}. If you need to change it, please reply back and let us know. - ${session.practitionerName}`;

  // Send BOTH WhatsApp and SMS in parallel
  const [whatsappResult, smsResult] = await Promise.all([
    sendWhatsAppReminder(session.clientPhone, date, time, credentials),
    sendSMSReminder(session.clientPhone, smsMessage, credentials),
  ]);

  // Process WhatsApp result
  if (whatsappResult.success) {
    await logNotification(session.id, `${notificationType}_whatsapp`, 'whatsapp', whatsappResult.messageId);
    results.whatsapp = { success: true, channel: 'whatsapp', messageId: whatsappResult.messageId };
  } else {
    results.whatsapp.error = whatsappResult.error;
  }

  // Process SMS result
  if (smsResult.success) {
    await logNotification(session.id, `${notificationType}_sms`, 'sms', smsResult.messageId);
    results.sms = { success: true, channel: 'sms', messageId: smsResult.messageId };
  } else {
    results.sms.error = smsResult.error;
  }

  return results;
}

/**
 * Send booking confirmation to client across all available channels.
 * Email is always attempted first (if address exists).
 * WhatsApp → SMS follows if phone is present.
 * Booking succeeds regardless of notification outcome.
 */
export async function sendBookingConfirmation(
  session: SessionDetails,
  practitionerId?: string
): Promise<BookingNotificationResults> {
  return sendMultiChannelNotification(session, 'booking_confirmation', practitionerId);
}

/**
 * Send appointment reminder (called by scheduled job).
 * Uses same multi-channel logic as booking confirmation.
 */
export async function sendAppointmentReminder(
  session: SessionDetails,
  reminderType: '24h' | '1h',
  practitionerId?: string
): Promise<BookingNotificationResults> {
  return sendMultiChannelNotification(session, `reminder_${reminderType}`, practitionerId);
}

/**
 * Log notification to database for tracking
 */
async function logNotification(
  sessionId: string,
  notificationType: string,
  channel: string,
  externalId?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO session_notifications (session_id, notification_type, channel, external_id, sent_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (session_id, notification_type) DO UPDATE
       SET channel = EXCLUDED.channel, external_id = EXCLUDED.external_id, sent_at = NOW()`,
      [sessionId, notificationType, channel, externalId]
    );
  } catch (error) {
    // Don't fail the notification if logging fails
    console.error('[SessionNotifications] Failed to log notification:', error);
  }
}

/**
 * Get session details for notification
 */
export async function getSessionForNotification(sessionId: string): Promise<SessionDetails | null> {
  const result = await query(
    `SELECT
       s.id,
       s.client_id,
       s.scheduled_start,
       s.scheduled_end,
       s.location_type,
       s.location_details,
       s.practitioner_id,
       c.name as client_name,
       c.phone as client_phone,
       c.email as client_email,
       sv.name as service_name,
       p.name as practitioner_name
     FROM sessions s
     JOIN practitioner_clients c ON s.client_id = c.id
     LEFT JOIN services sv ON s.service_id = sv.id
     JOIN practitioners p ON s.practitioner_id = p.id
     WHERE s.id = $1`,
    [sessionId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceName: row.service_name || 'Session',
    scheduledStart: new Date(row.scheduled_start),
    scheduledEnd: new Date(row.scheduled_end),
    locationType: row.location_type,
    locationDetails: row.location_details,
    practitionerName: row.practitioner_name,
    practitionerId: row.practitioner_id,
  };
}

/**
 * Find sessions that need reminders
 * @param reminderType '24h' or '1h'
 * @returns Sessions that need this reminder sent
 */
export async function getSessionsNeedingReminder(
  reminderType: '24h' | '1h' | '15m'
): Promise<Array<SessionDetails & { practitionerId: string }>> {
  // Calculate the time window for this reminder type
  const now = new Date();
  let windowStart: Date;
  let windowEnd: Date;

  if (reminderType === '24h') {
    // 24 hours before: look for sessions 23-25 hours from now
    windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  } else if (reminderType === '15m') {
    // 15 minutes before: look for sessions 10-20 minutes from now (ADHD final nudge)
    windowStart = new Date(now.getTime() + 10 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 20 * 60 * 1000);
  } else {
    // 1 hour before: look for sessions 50-70 minutes from now
    windowStart = new Date(now.getTime() + 50 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 70 * 60 * 1000);
  }

  // Find sessions in the window that haven't received this reminder type yet
  const result = await query(
    `SELECT
       s.id,
       s.client_id,
       s.scheduled_start,
       s.scheduled_end,
       s.location_type,
       s.location_details,
       s.practitioner_id,
       c.name as client_name,
       c.phone as client_phone,
       c.email as client_email,
       sv.name as service_name,
       p.name as practitioner_name
     FROM sessions s
     JOIN practitioner_clients c ON s.client_id = c.id
     LEFT JOIN services sv ON s.service_id = sv.id
     JOIN practitioners p ON s.practitioner_id = p.id
     WHERE s.status IN ('scheduled', 'confirmed')
       AND s.scheduled_start >= $1
       AND s.scheduled_start <= $2
       AND c.phone IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM session_notifications sn
         WHERE sn.session_id = s.id
         AND (sn.notification_type = $3 OR sn.notification_type = $4)
       )
     ORDER BY s.scheduled_start ASC`,
    [
      windowStart.toISOString(),
      windowEnd.toISOString(),
      `reminder_${reminderType}_whatsapp`,
      `reminder_${reminderType}_sms`,
    ]
  );

  return result.rows.map(row => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceName: row.service_name || 'Session',
    scheduledStart: new Date(row.scheduled_start),
    scheduledEnd: new Date(row.scheduled_end),
    locationType: row.location_type,
    locationDetails: row.location_details,
    practitionerName: row.practitioner_name,
    practitionerId: row.practitioner_id,
  }));
}

/**
 * Process all pending reminders for a given type
 * This should be called by a cron job every 10-15 minutes
 */
export async function processScheduledReminders(
  reminderType: '24h' | '1h'
): Promise<{
  processed: number;
  successful: number;
  failed: number;
  results: Array<{ sessionId: string; whatsapp: boolean; sms: boolean }>;
}> {
  const sessions = await getSessionsNeedingReminder(reminderType);

  console.log(`[SessionReminders] Found ${sessions.length} sessions needing ${reminderType} reminder`);

  const results: Array<{ sessionId: string; whatsapp: boolean; sms: boolean }> = [];
  let successful = 0;
  let failed = 0;

  for (const session of sessions) {
    try {
      const notifResults = await sendDualChannelNotification(
        session,
        `reminder_${reminderType}`,
        session.practitionerId
      );

      const whatsappOk = notifResults.whatsapp.success;
      const smsOk = notifResults.sms.success;

      results.push({
        sessionId: session.id,
        whatsapp: whatsappOk,
        sms: smsOk,
      });

      if (whatsappOk || smsOk) {
        successful++;
        console.log(`[SessionReminders] Sent ${reminderType} reminder for session ${session.id}: WhatsApp=${whatsappOk}, SMS=${smsOk}`);
      } else {
        failed++;
        console.error(`[SessionReminders] Failed to send ${reminderType} reminder for session ${session.id}`);
      }
    } catch (error) {
      failed++;
      console.error(`[SessionReminders] Error processing session ${session.id}:`, error);
      results.push({
        sessionId: session.id,
        whatsapp: false,
        sms: false,
      });
    }
  }

  return {
    processed: sessions.length,
    successful,
    failed,
    results,
  };
}

/**
 * Send a manual reminder for a specific session
 */
export async function sendManualReminder(
  sessionId: string
): Promise<{ whatsapp: NotificationResult; sms: NotificationResult }> {
  const session = await getSessionForNotification(sessionId);

  if (!session) {
    return {
      whatsapp: { success: false, channel: 'whatsapp', error: 'Session not found' },
      sms: { success: false, channel: 'sms', error: 'Session not found' },
    };
  }

  return sendDualChannelNotification(
    session,
    'manual_reminder',
    (session as SessionDetails & { practitionerId?: string }).practitionerId
  );
}

/**
 * PRACTITIONER SELF-REMINDERS
 * Send reminders TO the practitioner about their upcoming sessions
 * Supports Telegram (primary) + SMS (fallback)
 */

interface PractitionerNotificationResult {
  telegram: { success: boolean; messageId?: string; error?: string };
  sms: { success: boolean; messageId?: string; error?: string };
}

/**
 * Get practitioner's notification preferences and contact info
 */
async function getPractitionerNotificationConfig(practitionerId: string): Promise<{
  telegramChatId?: string;
  phone?: string;
  enabled: boolean;
} | null> {
  // Get from practitioner's notification_settings JSON and telegram integrations
  const result = await query(
    `SELECT
       p.email,
       p.notification_settings,
       pi.config_encrypted as telegram_config
     FROM practitioners p
     LEFT JOIN practitioner_integrations pi ON p.id = pi.practitioner_id
       AND pi.integration_type = 'telegram' AND pi.status = 'connected'
     WHERE p.id = $1`,
    [practitionerId]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const settings = row.notification_settings || {};

  // telegram_config may be a JSON string (config_encrypted column) or already parsed
  let telegramConfig = row.telegram_config;
  if (typeof telegramConfig === 'string') {
    try { telegramConfig = JSON.parse(telegramConfig); } catch { telegramConfig = null; }
  }

  return {
    telegramChatId: telegramConfig?.chat_id || settings.telegram_chat_id,
    phone: settings.phone,
    enabled: true,
  };
}

/**
 * Send reminder to practitioner about an upcoming session
 */
export async function sendPractitionerReminder(
  session: SessionDetails,
  notificationType: string
): Promise<PractitionerNotificationResult> {
  const results: PractitionerNotificationResult = {
    telegram: { success: false, error: 'Not sent' },
    sms: { success: false, error: 'Not sent' },
  };

  if (!session.practitionerId) {
    results.telegram.error = 'No practitioner ID';
    results.sms.error = 'No practitioner ID';
    return results;
  }

  const config = await getPractitionerNotificationConfig(session.practitionerId);

  if (!config) {
    results.telegram.error = 'Practitioner not found';
    results.sms.error = 'Practitioner not found';
    return results;
  }

  const date = formatDateForTemplate(session.scheduledStart);
  const time = formatTimeForTemplate(session.scheduledStart);
  const message = `🗓 <b>Session Reminder</b>\n\nYou have a session with <b>${session.clientName}</b> on ${date} at ${time}.\n\nService: ${session.serviceName}`;
  const smsMessage = `Session reminder: ${session.clientName} on ${date} at ${time} - ${session.serviceName}`;

  // Try Telegram first (preferred for ADHD - visual + persistent)
  if (config.telegramChatId) {
    const telegramResult = await sendTelegramReminder(config.telegramChatId, message);
    if (telegramResult.success) {
      await logNotification(session.id, `practitioner_${notificationType}_telegram`, 'telegram', telegramResult.messageId);
      results.telegram = { success: true, messageId: telegramResult.messageId };
    } else {
      results.telegram.error = telegramResult.error;
    }
  } else {
    // Fall back to hardcoded Telegram chat_id from env (for sole practitioner)
    const fallbackChatId = process.env.PRACTITIONER_TELEGRAM_CHAT_ID;
    if (fallbackChatId) {
      const telegramResult = await sendTelegramReminder(fallbackChatId, message);
      if (telegramResult.success) {
        await logNotification(session.id, `practitioner_${notificationType}_telegram`, 'telegram', telegramResult.messageId);
        results.telegram = { success: true, messageId: telegramResult.messageId };
      } else {
        results.telegram.error = telegramResult.error;
      }
    } else {
      results.telegram.error = 'No Telegram chat ID configured';
    }
  }

  // Also send SMS if phone is configured (belt + suspenders for ADHD)
  if (config.phone) {
    const credentials = await getTwilioCredentials(session.practitionerId);
    if (credentials) {
      const smsResult = await sendSMSReminder(config.phone, smsMessage, credentials);
      if (smsResult.success) {
        await logNotification(session.id, `practitioner_${notificationType}_sms`, 'sms', smsResult.messageId);
        results.sms = { success: true, messageId: smsResult.messageId };
      } else {
        results.sms.error = smsResult.error;
      }
    }
  } else {
    // Fall back to hardcoded phone from env
    const fallbackPhone = process.env.PRACTITIONER_PHONE;
    if (fallbackPhone) {
      const credentials = await getTwilioCredentials();
      if (credentials) {
        const smsResult = await sendSMSReminder(fallbackPhone, smsMessage, credentials);
        if (smsResult.success) {
          await logNotification(session.id, `practitioner_${notificationType}_sms`, 'sms', smsResult.messageId);
          results.sms = { success: true, messageId: smsResult.messageId };
        } else {
          results.sms.error = smsResult.error;
        }
      }
    }
  }

  return results;
}

/**
 * Get sessions for practitioner reminders (separate from client reminders)
 * Practitioner reminders should fire even if client reminder was already sent
 */
async function getSessionsForPractitionerReminder(
  reminderType: '24h' | '1h' | '15m'
): Promise<Array<SessionDetails & { practitionerId: string }>> {
  const now = new Date();
  let windowStart: Date;
  let windowEnd: Date;

  if (reminderType === '24h') {
    windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  } else if (reminderType === '15m') {
    windowStart = new Date(now.getTime() + 10 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 20 * 60 * 1000);
  } else {
    windowStart = new Date(now.getTime() + 50 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 70 * 60 * 1000);
  }

  // Find sessions - only filter by practitioner reminder status, not client
  const result = await query(
    `SELECT
       s.id,
       s.scheduled_start,
       s.scheduled_end,
       s.location_type,
       s.location_details,
       s.practitioner_id,
       c.name as client_name,
       c.phone as client_phone,
       c.email as client_email,
       sv.name as service_name,
       p.name as practitioner_name
     FROM sessions s
     JOIN practitioner_clients c ON s.client_id = c.id
     LEFT JOIN services sv ON s.service_id = sv.id
     JOIN practitioners p ON s.practitioner_id = p.id
     WHERE s.status IN ('scheduled', 'confirmed')
       AND s.scheduled_start >= $1
       AND s.scheduled_start <= $2
       AND NOT EXISTS (
         SELECT 1 FROM session_notifications sn
         WHERE sn.session_id = s.id
         AND sn.notification_type LIKE $3
       )
     ORDER BY s.scheduled_start ASC`,
    [
      windowStart.toISOString(),
      windowEnd.toISOString(),
      `practitioner_reminder_${reminderType}%`,
    ]
  );

  return result.rows.map(row => ({
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    serviceName: row.service_name || 'Session',
    scheduledStart: new Date(row.scheduled_start),
    scheduledEnd: new Date(row.scheduled_end),
    locationType: row.location_type,
    locationDetails: row.location_details,
    practitionerName: row.practitioner_name,
    practitionerId: row.practitioner_id,
  }));
}

/**
 * Process practitioner reminders for upcoming sessions
 * Called by cron job alongside client reminders
 */
export async function processPractitionerReminders(
  reminderType: '24h' | '1h' | '15m'
): Promise<{ processed: number; successful: number; failed: number }> {
  const sessions = await getSessionsForPractitionerReminder(reminderType);

  let processed = 0;
  let successful = 0;
  let failed = 0;

  for (const session of sessions) {
    // Check if practitioner reminder already sent
    const alreadySent = await query(
      `SELECT 1 FROM session_notifications
       WHERE session_id = $1 AND notification_type LIKE 'practitioner_${reminderType}%'`,
      [session.id]
    );

    if (alreadySent.rows.length > 0) continue;

    processed++;
    const result = await sendPractitionerReminder(session, `reminder_${reminderType}`);

    if (result.telegram.success || result.sms.success) {
      successful++;
      console.log(`[SessionNotifications] Practitioner reminder sent for session ${session.id}`);
    } else {
      failed++;
      console.error(`[SessionNotifications] Practitioner reminder failed for session ${session.id}`);
    }
  }

  return { processed, successful, failed };
}
