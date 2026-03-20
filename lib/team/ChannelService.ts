// SoulComms — Channel Service
// All DB operations for team messaging. Uses local PostgreSQL only.

import { query } from '@/lib/db/postgres';
import type { TeamChannel, TeamMessage, MessageReaction } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// CHANNELS
// ─────────────────────────────────────────────────────────────────────────────

export async function listChannels(memberId: string): Promise<TeamChannel[]> {
  const result = await query<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    channel_type: string;
    is_private: boolean;
    created_by: string;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
    unread_count: string;
  }>(
    `SELECT
       tc.*,
       COUNT(tm.id) FILTER (
         WHERE tm.created_at > COALESCE(tcr.last_read_at, '1970-01-01') AND tm.deleted_at IS NULL
       ) AS unread_count
     FROM team_channels tc
     LEFT JOIN team_messages tm ON tm.channel_id = tc.id
     LEFT JOIN team_channel_reads tcr ON tcr.channel_id = tc.id AND tcr.member_id = $1
     WHERE tc.archived_at IS NULL
       AND (
         tc.is_private = FALSE
         OR EXISTS (
           SELECT 1 FROM team_channel_members tcm
           WHERE tcm.channel_id = tc.id AND tcm.member_id = $1
         )
       )
     GROUP BY tc.id, tcr.last_read_at
     ORDER BY tc.channel_type DESC, tc.name ASC`,
    [memberId]
  );

  return result.rows.map(row => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    channelType: row.channel_type as 'text' | 'announcement',
    isPrivate: row.is_private,
    createdBy: row.created_by,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    unreadCount: parseInt(row.unread_count, 10) || 0,
  }));
}

export async function getChannelBySlug(slug: string): Promise<TeamChannel | null> {
  const result = await query<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    channel_type: string;
    is_private: boolean;
    created_by: string;
    archived_at: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT * FROM team_channels WHERE slug = $1 AND archived_at IS NULL`,
    [slug]
  );

  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    channelType: row.channel_type as 'text' | 'announcement',
    isPrivate: row.is_private,
    createdBy: row.created_by,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

export async function getMessages(
  channelId: string,
  opts: { limit?: number; before?: string } = {}
): Promise<TeamMessage[]> {
  const limit = opts.limit ?? 50;
  const params: (string | number)[] = [channelId, limit];

  let beforeClause = '';
  if (opts.before) {
    beforeClause = `AND tm.created_at < $3`;
    params.push(opts.before);
  }

  const result = await query<{
    id: string;
    channel_id: string;
    sender_id: string;
    sender_name: string;
    body: string;
    parent_id: string | null;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
    reply_count: string;
  }>(
    `SELECT
       tm.*,
       COALESCE(m.name, m.username, 'Unknown') AS sender_name,
       COUNT(replies.id) AS reply_count
     FROM team_messages tm
     JOIN members m ON m.id = tm.sender_id
     LEFT JOIN team_messages replies ON replies.parent_id = tm.id AND replies.deleted_at IS NULL
     WHERE tm.channel_id = $1
       AND tm.parent_id IS NULL
       AND tm.deleted_at IS NULL
       ${beforeClause}
     GROUP BY tm.id, m.name, m.username
     ORDER BY tm.created_at ASC
     LIMIT $2`,
    params
  );

  const messages = result.rows.map(row => ({
    id: row.id,
    channelId: row.channel_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    parentId: row.parent_id,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    reactions: [] as MessageReaction[],
    replyCount: parseInt(row.reply_count, 10) || 0,
  }));

  // Attach reactions in batch
  if (messages.length > 0) {
    const messageIds = messages.map(m => m.id);
    const reactResult = await query<{
      message_id: string;
      emoji: string;
      member_id: string;
    }>(
      `SELECT message_id, emoji, member_id FROM team_reactions WHERE message_id = ANY($1)`,
      [messageIds]
    );

    // Group by message → emoji
    const reactionMap = new Map<string, Map<string, string[]>>();
    for (const row of reactResult.rows) {
      if (!reactionMap.has(row.message_id)) reactionMap.set(row.message_id, new Map());
      const emojiMap = reactionMap.get(row.message_id)!;
      if (!emojiMap.has(row.emoji)) emojiMap.set(row.emoji, []);
      emojiMap.get(row.emoji)!.push(row.member_id);
    }

    for (const msg of messages) {
      const emojiMap = reactionMap.get(msg.id);
      if (emojiMap) {
        msg.reactions = Array.from(emojiMap.entries()).map(([emoji, memberIds]) => ({
          emoji,
          count: memberIds.length,
          memberIds,
          hasMine: false, // caller enriches this
        }));
      }
    }
  }

  return messages;
}

export async function getMessagesSince(
  channelId: string,
  afterTs: number
): Promise<TeamMessage[]> {
  const afterDate = new Date(afterTs).toISOString();
  const result = await query<{
    id: string;
    channel_id: string;
    sender_id: string;
    sender_name: string;
    body: string;
    parent_id: string | null;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
  }>(
    `SELECT
       tm.*,
       COALESCE(m.name, m.username, 'Unknown') AS sender_name
     FROM team_messages tm
     JOIN members m ON m.id = tm.sender_id
     WHERE tm.channel_id = $1
       AND tm.created_at > $2
       AND tm.deleted_at IS NULL
     ORDER BY tm.created_at ASC`,
    [channelId, afterDate]
  );

  return result.rows.map(row => ({
    id: row.id,
    channelId: row.channel_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    parentId: row.parent_id,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    reactions: [],
  }));
}

export async function sendMessage(
  channelId: string,
  senderId: string,
  body: string,
  parentId?: string
): Promise<TeamMessage> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message body cannot be empty');
  if (trimmed.length > 8000) throw new Error('Message too long (max 8000 chars)');

  const result = await query<{
    id: string;
    channel_id: string;
    sender_id: string;
    body: string;
    parent_id: string | null;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
  }>(
    `INSERT INTO team_messages (channel_id, sender_id, body, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [channelId, senderId, trimmed, parentId ?? null]
  );

  const row = result.rows[0];
  const nameResult = await query<{ name: string | null; username: string }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [senderId]
  );
  const sender = nameResult.rows[0];

  return {
    id: row.id,
    channelId: row.channel_id,
    senderId: row.sender_id,
    senderName: sender?.name || sender?.username || 'Unknown',
    body: row.body,
    parentId: row.parent_id,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    reactions: [],
  };
}

export async function markChannelRead(channelId: string, memberId: string): Promise<void> {
  await query(
    `INSERT INTO team_channel_reads (channel_id, member_id, last_read_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (channel_id, member_id) DO UPDATE SET last_read_at = NOW()`,
    [channelId, memberId]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function toggleReaction(
  messageId: string,
  memberId: string,
  emoji: string
): Promise<'added' | 'removed'> {
  const existing = await query(
    `SELECT id FROM team_reactions WHERE message_id = $1 AND member_id = $2 AND emoji = $3`,
    [messageId, memberId, emoji]
  );

  if (existing.rows.length > 0) {
    await query(
      `DELETE FROM team_reactions WHERE message_id = $1 AND member_id = $2 AND emoji = $3`,
      [messageId, memberId, emoji]
    );
    return 'removed';
  } else {
    await query(
      `INSERT INTO team_reactions (message_id, member_id, emoji) VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [messageId, memberId, emoji]
    );
    return 'added';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENCE
// ─────────────────────────────────────────────────────────────────────────────

export async function heartbeat(memberId: string): Promise<void> {
  await query(
    `INSERT INTO team_presence (member_id, status, last_seen_at)
     VALUES ($1, 'online', NOW())
     ON CONFLICT (member_id) DO UPDATE SET status = 'online', last_seen_at = NOW()`,
    [memberId]
  );
}

export async function getPresence(): Promise<Array<{
  memberId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  lastSeenAt: string;
}>> {
  // Mark anyone not seen in 90s as offline
  await query(
    `UPDATE team_presence SET status = 'offline'
     WHERE last_seen_at < NOW() - INTERVAL '90 seconds' AND status != 'offline'`
  );
  await query(
    `UPDATE team_presence SET status = 'away'
     WHERE last_seen_at < NOW() - INTERVAL '30 seconds'
       AND last_seen_at >= NOW() - INTERVAL '90 seconds'
       AND status = 'online'`
  );

  const result = await query<{
    member_id: string;
    name: string | null;
    username: string;
    status: string;
    last_seen_at: string;
  }>(
    `SELECT tp.member_id, m.name, m.username, tp.status, tp.last_seen_at
     FROM team_presence tp
     JOIN members m ON m.id = tp.member_id
     WHERE tp.status != 'offline'
     ORDER BY tp.last_seen_at DESC`
  );

  return result.rows.map(row => ({
    memberId: row.member_id,
    name: row.name || row.username,
    status: row.status as 'online' | 'away' | 'offline',
    lastSeenAt: row.last_seen_at,
  }));
}
