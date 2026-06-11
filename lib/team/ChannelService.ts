// SoulComms — Channel Service
// All DB operations for team messaging. Uses local PostgreSQL only.

import { query, transaction } from '@/lib/db/postgres';
import type { TeamChannel, TeamMessage, MessageReaction, PromptScaffoldField, ChannelMember, MessageKind, StoredMessageAttachment } from './types';
import { channelServeBase, parseStoredAttachments, toClientAttachments } from '@/lib/team/attachments';
import { notifyChannelMentions, notifyThreadReply } from '@/lib/team/notifications';
import { createAttentionItemsForMessage } from '@/lib/team/attention';
import { getActiveParticipants } from '@/lib/team/getActiveParticipants';

// System channels that can never be made private (or made public).
// Mirrors the delete-protection in app/api/team/admin/channels/route.ts.
const SYSTEM_CHANNEL_SLUGS = new Set(['general', 'announcements']);

export type SetVisibilityErrorCode =
  | 'NOT_FOUND'
  | 'SYSTEM_CHANNEL'
  | 'ALREADY_IN_TARGET_STATE';

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
    archetype: string | null;
    purpose_block: string | null;
    prompt_scaffold: PromptScaffoldField[] | null;
    response_mode: string | null;
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
    archetype: (row.archetype as TeamChannel['archetype']) ?? 'general',
    purposeBlock: row.purpose_block,
    promptScaffold: row.prompt_scaffold ?? null,
    responseMode: (row.response_mode as TeamChannel['responseMode']) ?? 'open',
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
    archetype: string | null;
    purpose_block: string | null;
    prompt_scaffold: PromptScaffoldField[] | null;
    response_mode: string | null;
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
    archetype: (row.archetype as TeamChannel['archetype']) ?? 'general',
    purposeBlock: row.purpose_block,
    promptScaffold: row.prompt_scaffold ?? null,
    responseMode: (row.response_mode as TeamChannel['responseMode']) ?? 'open',
  };
}

export async function updateChannelConfig(
  channelId: string,
  patch: {
    archetype?: string;
    purposeBlock?: string;
    promptScaffold?: PromptScaffoldField[] | null;
    responseMode?: string;
  }
): Promise<void> {
  await query(
    `UPDATE team_channels SET
       archetype = COALESCE($1, archetype),
       purpose_block = COALESCE($2, purpose_block),
       prompt_scaffold = COALESCE($3::jsonb, prompt_scaffold),
       response_mode = COALESCE($4, response_mode),
       updated_at = NOW()
     WHERE id = $5`,
    [
      patch.archetype ?? null,
      patch.purposeBlock ?? null,
      patch.promptScaffold !== undefined ? JSON.stringify(patch.promptScaffold) : null,
      patch.responseMode ?? null,
      channelId,
    ]
  );
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
    message_kind: string;
    attachments: unknown;
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
    messageKind: (row.message_kind as MessageKind) ?? 'build',
    reactions: [] as MessageReaction[],
    replyCount: parseInt(row.reply_count, 10) || 0,
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      channelServeBase(row.channel_id)
    ),
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
    message_kind: string;
    attachments: unknown;
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
    messageKind: (row.message_kind as MessageKind) ?? 'build',
    reactions: [],
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      channelServeBase(row.channel_id)
    ),
  }));
}

export async function getReplies(
  channelId: string,
  parentId: string,
  opts: { limit?: number } = {}
): Promise<TeamMessage[]> {
  const limit = opts.limit ?? 100;

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
    message_kind: string;
    attachments: unknown;
  }>(
    `SELECT
       tm.*,
       COALESCE(m.name, m.username, 'Unknown') AS sender_name
     FROM team_messages tm
     JOIN members m ON m.id = tm.sender_id
     WHERE tm.channel_id = $1
       AND tm.parent_id = $2
       AND tm.deleted_at IS NULL
     ORDER BY tm.created_at ASC
     LIMIT $3`,
    [channelId, parentId, limit]
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
    messageKind: (row.message_kind as MessageKind) ?? 'build',
    reactions: [] as MessageReaction[],
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      channelServeBase(row.channel_id)
    ),
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
          hasMine: false,
        }));
      }
    }
  }

  return messages;
}

export async function sendMessage(
  channelId: string,
  senderId: string,
  body: string,
  parentId?: string,
  messageKind?: MessageKind,
  attachments: StoredMessageAttachment[] = []
): Promise<TeamMessage> {
  const trimmed = body.trim();
  // An image-only message (empty text + ≥1 attachment) is allowed.
  if (!trimmed && attachments.length === 0) throw new Error('Message body cannot be empty');
  if (trimmed.length > 8000) throw new Error('Message too long (max 8000 chars)');

  const kind: MessageKind = messageKind ?? 'build';

  const result = await query<{
    id: string;
    channel_id: string;
    sender_id: string;
    body: string;
    parent_id: string | null;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
    message_kind: string;
    attachments: unknown;
  }>(
    `INSERT INTO team_messages (channel_id, sender_id, body, parent_id, message_kind, attachments)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING *`,
    [channelId, senderId, trimmed, parentId ?? null, kind, JSON.stringify(attachments)]
  );

  const row = result.rows[0];

  // Create per-recipient attention items for @mentions (the For-You loop).
  // Awaited (not fire-and-forget): the attention record is the durable part. Safe — never throws.
  await createAttentionItemsForMessage({
    messageId: row.id,
    channelId,
    senderId,
    body: trimmed,
    messageKind: kind,
  });

  // Fire-and-forget email notifications for @mentions
  notifyChannelMentions(channelId, senderId, trimmed).catch(() => {});

  // Fire-and-forget thread reply notification (notify parent author if different member)
  if (parentId) {
    notifyThreadReply(channelId, parentId, senderId, trimmed).catch(() => {});
  }

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
    messageKind: (row.message_kind as MessageKind) ?? 'build',
    reactions: [],
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      channelServeBase(row.channel_id)
    ),
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

/**
 * Locate one attachment within a channel by id, scoped to the channel (a foreign
 * attachment id cannot resolve). Returns server-only storage metadata for streaming.
 * The caller MUST verify channel access first.
 */
export async function findChannelAttachment(
  channelId: string,
  attachmentId: string
): Promise<{ storagePath: string; mimeType: string; filename: string } | null> {
  const res = await query<{ storage_path: string; mime_type: string; filename: string }>(
    `SELECT att->>'storagePath' AS storage_path,
            att->>'mimeType'   AS mime_type,
            att->>'filename'   AS filename
       FROM team_messages tm,
            jsonb_array_elements(tm.attachments) att
      WHERE tm.channel_id = $1
        AND tm.deleted_at IS NULL
        AND att->>'id' = $2
      LIMIT 1`,
    [channelId, attachmentId]
  );
  const row = res.rows[0];
  if (!row || !row.storage_path) return null;
  return { storagePath: row.storage_path, mimeType: row.mime_type, filename: row.filename };
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

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────

export async function getChannelMembers(channelId: string): Promise<ChannelMember[]> {
  const result = await query<{
    member_id: string;
    name: string | null;
    username: string;
    role: string;
    joined_at: string;
    status: string;
  }>(
    `SELECT
       tcm.member_id,
       m.name,
       m.username,
       tcm.role,
       tcm.joined_at,
       CASE
         WHEN tp.last_seen_at > NOW() - INTERVAL '2 minutes' THEN 'online'
         WHEN tp.last_seen_at > NOW() - INTERVAL '10 minutes' THEN 'away'
         ELSE 'offline'
       END AS status
     FROM team_channel_members tcm
     JOIN members m ON m.id = tcm.member_id
     LEFT JOIN team_presence tp ON tp.member_id = tcm.member_id
     WHERE tcm.channel_id = $1
     ORDER BY
       CASE tcm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
       m.name ASC`,
    [channelId]
  );

  return result.rows.map(row => ({
    memberId: row.member_id,
    name: row.name || row.username,
    status: row.status as 'online' | 'away' | 'offline',
    role: row.role as 'owner' | 'admin' | 'member',
    joinedAt: row.joined_at,
  }));
}

export async function addChannelMember(
  channelId: string,
  memberId: string,
  invitedBy: string,
  role: string = 'member'
): Promise<void> {
  await query(
    `INSERT INTO team_channel_members (channel_id, member_id, invited_by, role, joined_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (channel_id, member_id) DO NOTHING`,
    [channelId, memberId, invitedBy, role]
  );
}

export async function removeChannelMember(channelId: string, memberId: string): Promise<void> {
  await query(
    `DELETE FROM team_channel_members WHERE channel_id = $1 AND member_id = $2`,
    [channelId, memberId]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISIBILITY (public ⇄ private)
// ─────────────────────────────────────────────────────────────────────────────

export type SetVisibilityResult =
  | {
      ok: true;
      isPrivate: boolean;
      seededMemberCount: number;
      slug: string;
    }
  | {
      ok: false;
      code: SetVisibilityErrorCode;
      message?: string;
    };

/**
 * Flip a channel between public and private.
 *
 * Public → private:
 *   - Seeds team_channel_members with active participants (sender of ≥1
 *     non-deleted message) + the channel creator + the requester.
 *   - Requester is upgraded to 'owner' regardless of prior role.
 *   - Uses lib/team/getActiveParticipants.ts as the single source of truth
 *     for the participant set (also used by the preview endpoint).
 *
 * Private → public:
 *   - Flips the flag only. team_channel_members rows are PRESERVED so role
 *     state survives a round trip back to private.
 *
 * Refuses (returns { ok: false, code }):
 *   - System channels (general, announcements)
 *   - No-op flips (already in target state)
 *   - Nonexistent channels
 *
 * Runs inside a transaction with FOR UPDATE on the channel row, so two
 * simultaneous flips serialize cleanly. Validation failures are returned
 * as result objects rather than thrown so the transaction commits cleanly
 * (no rollback noise in logs for expected business errors).
 */
export async function setChannelVisibility(
  channelId: string,
  isPrivate: boolean,
  requesterId: string
): Promise<SetVisibilityResult> {
  return transaction(async (client): Promise<SetVisibilityResult> => {
    // Lock the channel row
    const cur = await client.query<{ is_private: boolean; slug: string }>(
      `SELECT is_private, slug
         FROM team_channels
        WHERE id = $1
        FOR UPDATE`,
      [channelId]
    );
    const row = cur.rows[0];
    if (!row) {
      return { ok: false, code: 'NOT_FOUND' };
    }

    if (SYSTEM_CHANNEL_SLUGS.has(row.slug)) {
      return {
        ok: false,
        code: 'SYSTEM_CHANNEL',
        message: `#${row.slug} is a system channel and cannot change visibility`,
      };
    }

    if (row.is_private === isPrivate) {
      return { ok: false, code: 'ALREADY_IN_TARGET_STATE' };
    }

    // Flip the flag
    await client.query(
      `UPDATE team_channels
          SET is_private = $1, updated_at = NOW()
        WHERE id = $2`,
      [isPrivate, channelId]
    );

    let seededMemberCount = 0;

    if (isPrivate) {
      // Resolve the participant set via the shared helper.
      // Pass the transaction client so it sees the locked row.
      const participants = await getActiveParticipants(channelId, client);
      const ids = Array.from(new Set([...participants, requesterId]));

      // Seed any participant who isn't already a channel member.
      const inserted = await client.query<{ member_id: string }>(
        `INSERT INTO team_channel_members (channel_id, member_id, role, invited_by, joined_at)
         SELECT $1, m.id, 'member', $2, NOW()
           FROM members m
          WHERE m.id = ANY($3::uuid[])
            AND m.id NOT IN (
              SELECT member_id FROM team_channel_members WHERE channel_id = $1
            )
         ON CONFLICT (channel_id, member_id) DO NOTHING
         RETURNING member_id`,
        [channelId, requesterId, ids]
      );
      seededMemberCount = inserted.rowCount ?? 0;

      // Ensure requester is the owner (idempotent upgrade if they were
      // already a 'member', or fresh insert if seed missed them).
      await client.query(
        `INSERT INTO team_channel_members (channel_id, member_id, role, invited_by, joined_at)
         VALUES ($1, $2, 'owner', $2, NOW())
         ON CONFLICT (channel_id, member_id)
           DO UPDATE SET role = 'owner'`,
        [channelId, requesterId]
      );
    }
    // private → public: do not touch team_channel_members; preserve roles.

    return {
      ok: true,
      isPrivate,
      seededMemberCount,
      slug: row.slug,
    };
  });
}

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
