// SoulComms — Email Notification Module
// All sends are fire-and-forget. Never throws. Never blocks message delivery.

import { query } from '@/lib/db/postgres';
import Resend from 'resend';

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
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

    const resend = getResendClient();
    await resend.emails.send({
      from: 'Soullab <onboarding@resend.dev>',
      to: recipient.email,
      subject: `New message from ${senderName} on SoulComms`,
      html: `
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> sent you a message on SoulComms.</p>
        <p><a href="https://soullab.life/team">Open SoulComms</a></p>
      `,
      text: `Hi ${recipientName},\n\n${senderName} sent you a message on SoulComms.\n\nOpen SoulComms: https://soullab.life/team`,
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
    const resend = getResendClient();
    await resend.emails.send({
      from: 'Soullab <onboarding@resend.dev>',
      to: recipient.email,
      subject: `${senderName} replied to your message in #${channelName}`,
      html: `
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> replied to your message in <strong>#${channelName}</strong>.</p>
        <p><a href="https://soullab.life/team">Open SoulComms</a></p>
      `,
      text: `Hi ${recipientName},\n\n${senderName} replied to your message in #${channelName}.\n\nOpen SoulComms: https://soullab.life/team`,
    });
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

    const resend = getResendClient();

    for (const username of usernames) {
      try {
        const memberData = await query<{ id: string; email: string | null; name: string | null; username: string }>(
          `SELECT id, email, name, username FROM members WHERE username = $1`,
          [username]
        );
        const member = memberData.rows[0];

        // Skip if not found, no email, or is the sender
        if (!member || !member.email || member.id === senderId) continue;

        const recipientName = member.name || member.username;

        await resend.emails.send({
          from: 'Soullab <onboarding@resend.dev>',
          to: member.email,
          subject: `${senderName} mentioned you in #${channelName}`,
          html: `
            <p>Hi ${recipientName},</p>
            <p><strong>${senderName}</strong> mentioned you in <strong>#${channelName}</strong>.</p>
            <p><a href="https://soullab.life/team">Open SoulComms</a></p>
          `,
          text: `Hi ${recipientName},\n\n${senderName} mentioned you in #${channelName}.\n\nOpen SoulComms: https://soullab.life/team`,
        });
      } catch {
        // Per-mention failure is silent — continue to next mention
      }
    }
  } catch {
    // Silent — never surface notification errors to callers
  }
}
