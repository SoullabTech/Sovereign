// SoulComms — Email Notification Module
// All sends are fire-and-forget. Never throws. Never blocks message delivery.

import { query } from '@/lib/db/postgres';
import { sendEmail } from '@/lib/email/sendEmail';

/** Ceiling on mention notifications from one message. Exceeding it logs loudly. */
const MAX_MENTION_FANOUT = 25;

/** Failures that mean every remaining send would fail too. */
const TRANSPORT_WIDE_FAILURES = new Set<string>([
  'quota_exceeded', 'provider_auth', 'provider_config', 'not_configured',
]);

/**
 * Team notifications stay non-fatal — a refused notification must never break
 * the message that triggered it. But `catch {}` around a provider that reports
 * refusals by RESOLVING recorded nothing at all, so an outage in this lane was
 * completely invisible. Non-fatal is not the same as unobserved.
 */
async function reportIfRefused(
  purpose: string,
  result: { success: boolean; failureKind?: string; providerCode?: string }
): Promise<void> {
  if (result.success) return;
  console.error(
    `[team/notify] ${purpose} REFUSED failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
  );
}
import { resolveNotificationPreference } from '@/lib/team/notificationPreferences';


// soullab.life is the verified Resend domain (reminders@soullab.life ships today).
// The previous onboarding@resend.dev sandbox sender only delivers to the Resend
// account owner — real recipients never received these.
const FROM = 'Soullab Team <team@soullab.life>';
const MANAGE_URL = 'https://soullab.life/team/notifications';
// One-click path to the consent surface (improves deliverability + honours opt-out).
const UNSUBSCRIBE_HEADERS = { 'List-Unsubscribe': `<${MANAGE_URL}>` };

function manageFooterHtml(): string {
  return `<p style="margin-top:24px;color:#999;font-size:12px;">You're receiving this because notifications are on for your Soullab Team account. <a href="${MANAGE_URL}">Manage your notifications</a>.</p>`;
}
function manageFooterText(): string {
  return `\n\n—\nManage your notifications: ${MANAGE_URL}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DM NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send email when a DM message is received.
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

    // Consent gate: respect the recipient's dm_received / email preference.
    if (!(await resolveNotificationPreference(recipientId, 'dm_received', 'email'))) return;

    // Get recipient email + name
    const recipientData = await query<{ email: string | null; name: string | null; username: string }>(
      `SELECT email, name, username FROM members WHERE id = $1`,
      [recipientId]
    );
    const recipient = recipientData.rows[0];
    if (!recipient?.email) return;

    // Get sender name
    const senderData = await query<{ name: string | null; username: string }>(
      `SELECT name, username FROM members WHERE id = $1`,
      [senderId]
    );
    const sender = senderData.rows[0];
    const senderName = sender?.name || sender?.username || 'Someone';
    const recipientName = recipient.name || recipient.username;

    await reportIfRefused('notify:dm', await sendEmail({
      purpose: 'notify:dm',
      from: FROM,
      to: recipient.email,
      subject: `New message from ${senderName} on SoulComms`,
      headers: UNSUBSCRIBE_HEADERS,
      html: `
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> sent you a message on SoulComms.</p>
        <p><a href="https://soullab.life/team">Open SoulComms</a></p>
        ${manageFooterHtml()}
      `,
      text: `Hi ${recipientName},\n\n${senderName} sent you a message on SoulComms.\n\nOpen SoulComms: https://soullab.life/team${manageFooterText()}`,
    }));
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

    // Consent gate: respect the author's thread_reply / email preference.
    if (!(await resolveNotificationPreference(parentAuthorId, 'thread_reply', 'email'))) return;

    // Get parent author email + name
    const recipientData = await query<{ email: string | null; name: string | null; username: string }>(
      `SELECT email, name, username FROM members WHERE id = $1`,
      [parentAuthorId]
    );
    const recipient = recipientData.rows[0];
    if (!recipient?.email) return;

    // Get sender name
    const senderData = await query<{ name: string | null; username: string }>(
      `SELECT name, username FROM members WHERE id = $1`,
      [senderId]
    );
    const sender = senderData.rows[0];
    const senderName = sender?.name || sender?.username || 'Someone';

    // Get channel name
    const channelData = await query<{ name: string }>(
      `SELECT name FROM team_channels WHERE id = $1`,
      [channelId]
    );
    const channelName = channelData.rows[0]?.name ?? 'unknown';

    const recipientName = recipient.name || recipient.username;
    await reportIfRefused('notify:channel', await sendEmail({
      purpose: 'notify:channel',
      from: FROM,
      to: recipient.email,
      subject: `${senderName} replied to your message in #${channelName}`,
      headers: UNSUBSCRIBE_HEADERS,
      html: `
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> replied to your message in <strong>#${channelName}</strong>.</p>
        <p><a href="https://soullab.life/team">Open SoulComms</a></p>
        ${manageFooterHtml()}
      `,
      text: `Hi ${recipientName},\n\n${senderName} replied to your message in #${channelName}.\n\nOpen SoulComms: https://soullab.life/team${manageFooterText()}`,
    }));
  } catch {
    // Silent — never surface notification errors to callers
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL MENTION NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send email when a channel message contains @username mentions.
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

    // VOLUME GUARD. This is the only unbounded per-recipient email fan-out in
    // the system: one chat message with N mentions sends N emails, and nothing
    // upstream bounds N. A ceiling here is what stops a single crafted or
    // scripted message from becoming a mass send.
    //
    // Deduplicated first: `@alice @alice @alice` is one person, and was three
    // emails.
    const unique = [...new Set(usernames)];
    const targets = unique.slice(0, MAX_MENTION_FANOUT);
    if (unique.length > targets.length) {
      // NO SILENT CAP.
      console.warn(
        `[team/notify] mention fan-out of ${unique.length} exceeds MAX_MENTION_FANOUT=${MAX_MENTION_FANOUT}; ` +
          `notifying ${targets.length}, DROPPING ${unique.length - targets.length}.`
      );
    }

    for (const username of targets) {
      try {
        const memberData = await query<{ id: string; email: string | null; name: string | null; username: string }>(
          `SELECT id, email, name, username FROM members WHERE username = $1`,
          [username]
        );
        const member = memberData.rows[0];

        // Skip if not found, no email, or is the sender
        if (!member || !member.email || member.id === senderId) continue;

        // Consent gate: respect the mentioned member's mentioned / email preference.
        if (!(await resolveNotificationPreference(member.id, 'mentioned', 'email'))) continue;

        const recipientName = member.name || member.username;

        const sent = await sendEmail({
          purpose: 'notify:mention',
          triggerType: 'route',
          triggerRef: 'team/notifyMentions',
          from: FROM,
          to: member.email,
          subject: `${senderName} mentioned you in #${channelName}`,
          headers: UNSUBSCRIBE_HEADERS,
          html: `
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> mentioned you in <strong>#${channelName}</strong>.</p>
            <p><a href="https://soullab.life/team">Open SoulComms</a></p>
            ${manageFooterHtml()}
          `,
          text: `Hi ${recipientName},\n\n${senderName} mentioned you in #${channelName}.\n\nOpen SoulComms: https://soullab.life/team${manageFooterText()}`,
        });

        await reportIfRefused('notify:mention', sent);

        // A transport-wide refusal fails for every remaining mention too.
        // Continuing would hammer a provider that is refusing everything.
        if (!sent.success && TRANSPORT_WIDE_FAILURES.has(sent.failureKind ?? '')) {
          console.error(
            `[team/notify] ABORTING mention fan-out — failureKind=${sent.failureKind} is transport-wide.`
          );
          break;
        }
      } catch {
        // Per-mention failure is silent — continue to next mention
      }
    }
  } catch {
    // Silent — never surface notification errors to callers
  }
}
