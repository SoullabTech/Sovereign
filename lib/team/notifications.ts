// SoulComms — Notification delivery module (email + SMS).
// All sends are fire-and-forget. Never throws. Never blocks message delivery.
//
// EMAIL and SMS are gated INDEPENDENTLY: a member may have email off but SMS on,
// or vice versa. SMS is ALERT-ONLY (content-free copy), opt-in (channel default
// OFF), and sends only to VERIFIED numbers — and only once SMS is configured
// (SMS_NOTIFICATIONS_ENABLED + Twilio creds; see lib/sms/config.ts). Until then
// the SMS branch is a no-op and behaviour is identical to email-only.

import { query } from '@/lib/db/postgres';
import Resend from 'resend';
import { resolveNotificationPreference } from '@/lib/team/notificationPreferences';
import type { NotificationEventType } from '@/lib/team/notificationTypes';
import { sendSMS } from '@/lib/sms/sendSMS';
import { isSmsConfigured } from '@/lib/sms/config';

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
}

// soullab.life is the verified Resend domain (reminders@soullab.life ships today).
// The previous onboarding@resend.dev sandbox sender only delivers to the Resend
// account owner — real recipients never received these.
const FROM = 'Soullab Team <team@soullab.life>';
const COLAB_URL = 'https://soullab.life/team';
const MANAGE_URL = 'https://soullab.life/team/notifications';
// One-click path to the consent surface (improves deliverability + honours opt-out).
const UNSUBSCRIBE_HEADERS = { 'List-Unsubscribe': `<${MANAGE_URL}>` };

function manageFooterHtml(): string {
  return `<p style="margin-top:24px;color:#999;font-size:12px;">You're receiving this because notifications are on for your Soullab Team account. <a href="${MANAGE_URL}">Manage your notifications</a>.</p>`;
}
function manageFooterText(): string {
  return `\n\n—\nManage your notifications: ${MANAGE_URL}`;
}

interface SmsTarget {
  phone: string | null;
  phone_verified: boolean | null;
}

/**
 * Send an ALERT-ONLY SMS if (and only if): SMS is configured, the recipient has
 * a VERIFIED number, and they have opted IN to this event on the 'sms' channel.
 * `body` must be content-free (sender / channel / action — never message text).
 * Fully fire-and-forget; sendSMS never throws.
 */
async function maybeNotifySms(args: {
  memberId: string;
  event: NotificationEventType;
  target: SmsTarget;
  body: string;
}): Promise<void> {
  if (!isSmsConfigured()) return; // dormant until flag + Twilio creds present
  if (!args.target.phone || args.target.phone_verified !== true) return; // verified only
  if (!(await resolveNotificationPreference(args.memberId, args.event, 'sms'))) return; // opt-in only
  await sendSMS({ to: args.target.phone, body: args.body, purpose: args.event }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// DM NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify the other DM participant of a new message (email and/or SMS).
 * Fire-and-forget: caller must attach .catch(() => {}).
 */
export async function notifyDMRecipient(
  dmThreadId: string,
  senderId: string,
  _messageBody: string
): Promise<void> {
  try {
    // Get the other participant
    const recipientResult = await query<{ member_id: string }>(
      `SELECT member_id FROM team_dm_members
       WHERE dm_thread_id = $1 AND member_id != $2`,
      [dmThreadId, senderId]
    );
    const recipientId = recipientResult.rows[0]?.member_id;
    if (!recipientId) return;

    // Recipient contact + SMS target in one read.
    const recipientData = await query<{
      email: string | null;
      name: string | null;
      username: string;
      phone: string | null;
      phone_verified: boolean | null;
    }>(
      `SELECT email, name, username, phone, phone_verified FROM members WHERE id = $1`,
      [recipientId]
    );
    const recipient = recipientData.rows[0];
    if (!recipient) return;

    // Sender name
    const senderData = await query<{ name: string | null; username: string }>(
      `SELECT name, username FROM members WHERE id = $1`,
      [senderId]
    );
    const sender = senderData.rows[0];
    const senderName = sender?.name || sender?.username || 'Someone';
    const recipientName = recipient.name || recipient.username;

    // EMAIL — isolated so a Resend failure never blocks the SMS branch.
    try {
      if (recipient.email && (await resolveNotificationPreference(recipientId, 'dm_received', 'email'))) {
        const resend = getResendClient();
        await resend.emails.send({
          from: FROM,
          to: recipient.email,
          subject: `New message from ${senderName} on SoulComms`,
          headers: UNSUBSCRIBE_HEADERS,
          html: `
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> sent you a message on SoulComms.</p>
            <p><a href="${COLAB_URL}">Open SoulComms</a></p>
            ${manageFooterHtml()}
          `,
          text: `Hi ${recipientName},\n\n${senderName} sent you a message on SoulComms.\n\nOpen SoulComms: ${COLAB_URL}${manageFooterText()}`,
        });
      }
    } catch {
      // Email failure is silent and must not block SMS.
    }

    // SMS — content-free alert, independent consent gate.
    await maybeNotifySms({
      memberId: recipientId,
      event: 'dm_received',
      target: recipient,
      body: `You have a new Co-lab message from ${senderName}. Open Co-lab: ${COLAB_URL}`,
    });
  } catch {
    // Silent — never surface notification errors to callers
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD REPLY NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify the author of a parent message when someone replies in their thread.
 * Fire-and-forget: caller must attach .catch(() => {}).
 */
export async function notifyThreadReply(
  channelId: string,
  parentMessageId: string,
  senderId: string,
  _messageBody: string
): Promise<void> {
  try {
    // Get parent message author
    const parentResult = await query<{ sender_id: string }>(
      `SELECT sender_id FROM team_messages WHERE id = $1`,
      [parentMessageId]
    );
    const parentAuthorId = parentResult.rows[0]?.sender_id;
    // Don't notify if the replier is the same person or parent not found
    if (!parentAuthorId || parentAuthorId === senderId) return;

    // Parent author contact + SMS target
    const recipientData = await query<{
      email: string | null;
      name: string | null;
      username: string;
      phone: string | null;
      phone_verified: boolean | null;
    }>(
      `SELECT email, name, username, phone, phone_verified FROM members WHERE id = $1`,
      [parentAuthorId]
    );
    const recipient = recipientData.rows[0];
    if (!recipient) return;

    // Sender name
    const senderData = await query<{ name: string | null; username: string }>(
      `SELECT name, username FROM members WHERE id = $1`,
      [senderId]
    );
    const sender = senderData.rows[0];
    const senderName = sender?.name || sender?.username || 'Someone';

    // Channel name
    const channelData = await query<{ name: string }>(
      `SELECT name FROM team_channels WHERE id = $1`,
      [channelId]
    );
    const channelName = channelData.rows[0]?.name ?? 'unknown';
    const recipientName = recipient.name || recipient.username;

    // EMAIL — isolated from the SMS branch.
    try {
      if (recipient.email && (await resolveNotificationPreference(parentAuthorId, 'thread_reply', 'email'))) {
        const resend = getResendClient();
        await resend.emails.send({
          from: FROM,
          to: recipient.email,
          subject: `${senderName} replied to your message in #${channelName}`,
          headers: UNSUBSCRIBE_HEADERS,
          html: `
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> replied to your message in <strong>#${channelName}</strong>.</p>
            <p><a href="${COLAB_URL}">Open SoulComms</a></p>
            ${manageFooterHtml()}
          `,
          text: `Hi ${recipientName},\n\n${senderName} replied to your message in #${channelName}.\n\nOpen SoulComms: ${COLAB_URL}${manageFooterText()}`,
        });
      }
    } catch {
      // Email failure is silent and must not block SMS.
    }

    // SMS — content-free alert.
    await maybeNotifySms({
      memberId: parentAuthorId,
      event: 'thread_reply',
      target: recipient,
      body: `${senderName} replied to your message in #${channelName} on Co-lab. Open: ${COLAB_URL}`,
    });
  } catch {
    // Silent — never surface notification errors to callers
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL MENTION NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notify each @username mentioned in a channel message (email and/or SMS).
 * Fire-and-forget: caller must attach .catch(() => {}).
 */
export async function notifyChannelMentions(
  channelId: string,
  senderId: string,
  messageBody: string
): Promise<void> {
  try {
    // Parse @username mentions
    const mentionPattern = /@(\w+)/g;
    const usernames: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionPattern.exec(messageBody)) !== null) {
      usernames.push(match[1]);
    }
    if (usernames.length === 0) return;

    // Get channel name
    const channelData = await query<{ name: string }>(
      `SELECT name FROM team_channels WHERE id = $1`,
      [channelId]
    );
    const channelName = channelData.rows[0]?.name ?? 'unknown';

    // Get sender name
    const senderData = await query<{ name: string | null; username: string }>(
      `SELECT name, username FROM members WHERE id = $1`,
      [senderId]
    );
    const sender = senderData.rows[0];
    const senderName = sender?.name || sender?.username || 'Someone';

    for (const username of usernames) {
      try {
        const memberData = await query<{
          id: string;
          email: string | null;
          name: string | null;
          username: string;
          phone: string | null;
          phone_verified: boolean | null;
        }>(
          `SELECT id, email, name, username, phone, phone_verified FROM members WHERE username = $1`,
          [username]
        );
        const member = memberData.rows[0];

        // Skip if not found or is the sender.
        if (!member || member.id === senderId) continue;

        const recipientName = member.name || member.username;

        // EMAIL — isolated from the SMS branch.
        try {
          if (member.email && (await resolveNotificationPreference(member.id, 'mentioned', 'email'))) {
            const resend = getResendClient();
            await resend.emails.send({
              from: FROM,
              to: member.email,
              subject: `${senderName} mentioned you in #${channelName}`,
              headers: UNSUBSCRIBE_HEADERS,
              html: `
                <p>Hi ${recipientName},</p>
                <p><strong>${senderName}</strong> mentioned you in <strong>#${channelName}</strong>.</p>
                <p><a href="${COLAB_URL}">Open SoulComms</a></p>
                ${manageFooterHtml()}
              `,
              text: `Hi ${recipientName},\n\n${senderName} mentioned you in #${channelName}.\n\nOpen SoulComms: ${COLAB_URL}${manageFooterText()}`,
            });
          }
        } catch {
          // Per-mention email failure is silent — SMS + next mention still proceed.
        }

        // SMS — content-free alert.
        await maybeNotifySms({
          memberId: member.id,
          event: 'mentioned',
          target: member,
          body: `${senderName} mentioned you in #${channelName} on Co-lab. Open: ${COLAB_URL}`,
        });
      } catch {
        // Per-mention failure is silent — continue to next mention
      }
    }
  } catch {
    // Silent — never surface notification errors to callers
  }
}
