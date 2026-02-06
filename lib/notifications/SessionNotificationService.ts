/**
 * SESSION NOTIFICATION SERVICE
 *
 * Sends multi-channel notifications for session events:
 * - Booking confirmations
 * - Appointment reminders (24h, 1h before)
 * - Cancellations/reschedules
 *
 * Channels: WhatsApp + SMS (dual delivery for US clients)
 */

import { query } from '@/lib/db/postgres';

// Twilio WhatsApp Content Template for appointments
const TWILIO_APPOINTMENT_TEMPLATE_SID = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

interface SessionDetails {
  id: string;
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
  credentials: { account_sid: string; auth_token: string; from_number: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { account_sid, auth_token, from_number } = credentials;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`;

  const body = new URLSearchParams({
    To: to,
    From: from_number,
    Body: message,
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
} | null> {
  // Try practitioner-specific credentials first
  if (practitionerId) {
    try {
      const result = await query(
        `SELECT config_encrypted FROM practitioner_integrations
         WHERE practitioner_id = $1 AND integration_type = 'twilio' AND status = 'connected'`,
        [practitionerId]
      );

      if (result.rows.length > 0 && result.rows[0].config_encrypted) {
        // config_encrypted is a JSON blob with Twilio creds
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

  if (account_sid && auth_token && from_number) {
    return { account_sid, auth_token, from_number, whatsapp_number };
  }

  return null;
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
  const credentials = await getTwilioCredentials(practitionerId);

  const results = {
    whatsapp: { success: false, channel: 'whatsapp' as const, error: 'Not sent' },
    sms: { success: false, channel: 'sms' as const, error: 'Not sent' },
  };

  if (!credentials) {
    console.warn('[SessionNotifications] No Twilio credentials configured');
    results.whatsapp.error = 'No credentials';
    results.sms.error = 'No credentials';
    return results;
  }

  if (!session.clientPhone) {
    results.whatsapp.error = 'No phone number';
    results.sms.error = 'No phone number';
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
 * Send session booking confirmation to client
 * Uses WhatsApp template if phone available, falls back to SMS, then email
 */
export async function sendBookingConfirmation(
  session: SessionDetails,
  practitionerId?: string
): Promise<NotificationResult> {
  const credentials = await getTwilioCredentials(practitionerId);

  if (!credentials) {
    console.warn('[SessionNotifications] No Twilio credentials configured');
    return { success: false, channel: 'none', error: 'No messaging credentials configured' };
  }

  const date = formatDateForTemplate(session.scheduledStart);
  const time = formatTimeForTemplate(session.scheduledStart);

  // Try WhatsApp first (if phone available)
  if (session.clientPhone) {
    const whatsappResult = await sendWhatsAppReminder(
      session.clientPhone,
      date,
      time,
      credentials
    );

    if (whatsappResult.success) {
      // Log the notification
      await logNotification(session.id, 'booking_confirmation', 'whatsapp', whatsappResult.messageId);
      return { success: true, channel: 'whatsapp', messageId: whatsappResult.messageId };
    }

    // Fall back to SMS
    const smsMessage = `Your appointment is coming up on ${date} at ${time}. If you need to change it, please reply back and let us know.`;
    const smsResult = await sendSMSReminder(session.clientPhone, smsMessage, credentials);

    if (smsResult.success) {
      await logNotification(session.id, 'booking_confirmation', 'sms', smsResult.messageId);
      return { success: true, channel: 'sms', messageId: smsResult.messageId };
    }
  }

  // TODO: Fall back to email if no phone or SMS failed
  // For now, return failure
  return {
    success: false,
    channel: 'none',
    error: 'No valid phone number for client'
  };
}

/**
 * Send appointment reminder (called by scheduled job)
 */
export async function sendAppointmentReminder(
  session: SessionDetails,
  reminderType: '24h' | '1h',
  practitionerId?: string
): Promise<NotificationResult> {
  // Same logic as booking confirmation but with different logging
  const result = await sendBookingConfirmation(session, practitionerId);

  if (result.success) {
    await logNotification(session.id, `reminder_${reminderType}`, result.channel, result.messageId);
  }

  return result;
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
