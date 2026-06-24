// SoulComms — Direct Message Service

import { query } from '@/lib/db/postgres';
import { notifyDMRecipient } from '@/lib/team/notifications';
import {
  dmServeBase,
  parseStoredAttachments,
  toClientAttachments,
} from '@/lib/team/attachments';
import type { MessageAttachment, StoredMessageAttachment } from '@/lib/team/types';

export interface DMThread {
  id: string;
  createdAt: string;
  members: DMThreadMember[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface DMThreadMember {
  memberId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

export type MessageType = 'build' | 'decision' | 'insight' | 'question';

export interface DMMessage {
  id: string;
  dmThreadId: string;
  senderId: string;
  senderName: string;
  body: string;
  messageType: MessageType;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  attachments?: MessageAttachment[];
}

// Row shape for the message read paths (SELECT dm.*, ... sender_name). `attachments`
// is the JSONB column (already parsed by pg into a JS value).
type DMMessageRow = {
  id: string;
  dm_thread_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  message_type: string;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  attachments: unknown;
};

function mapDMRow(row: DMMessageRow): DMMessage {
  return {
    id: row.id,
    dmThreadId: row.dm_thread_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    messageType: (row.message_type ?? 'build') as MessageType,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      dmServeBase(row.dm_thread_id)
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export async function listDMThreads(memberId: string): Promise<DMThread[]> {
  const result = await query<{
    id: string;
    created_at: string;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: string;
  }>(
    `SELECT
       dt.id,
       dt.created_at,
       (SELECT body FROM team_dm_messages
        WHERE dm_thread_id = dt.id AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM team_dm_messages
        WHERE dm_thread_id = dt.id AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT 1) AS last_message_at,
       COUNT(dm.id) FILTER (
         WHERE dm.created_at > COALESCE(tdm.last_read_at, '1970-01-01') AND dm.deleted_at IS NULL
       ) AS unread_count
     FROM team_dm_threads dt
     JOIN team_dm_members tdm ON tdm.dm_thread_id = dt.id AND tdm.member_id = $1
     LEFT JOIN team_dm_messages dm ON dm.dm_thread_id = dt.id
     GROUP BY dt.id, tdm.last_read_at
     ORDER BY last_message_at DESC NULLS LAST`,
    [memberId]
  );

  const threads: DMThread[] = [];
  for (const row of result.rows) {
    const members = await getDMThreadMembers(row.id);
    threads.push({
      id: row.id,
      createdAt: row.created_at,
      members,
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at,
      unreadCount: parseInt(row.unread_count, 10) || 0,
    });
  }
  return threads;
}

export async function getDMThreadMembers(dmThreadId: string): Promise<DMThreadMember[]> {
  const result = await query<{
    member_id: string;
    name: string | null;
    username: string;
    status: string | null;
  }>(
    `SELECT tdm.member_id, m.name, m.username, tp.status
     FROM team_dm_members tdm
     JOIN members m ON m.id = tdm.member_id
     LEFT JOIN team_presence tp ON tp.member_id = tdm.member_id
     WHERE tdm.dm_thread_id = $1`,
    [dmThreadId]
  );
  return result.rows.map(row => ({
    memberId: row.member_id,
    name: row.name || row.username,
    status: (row.status as 'online' | 'away' | 'offline') || 'offline',
  }));
}

export async function findOrCreateDMThread(
  memberIdA: string,
  memberIdB: string
): Promise<string> {
  // Find existing 1:1 thread between exactly these two members
  const existing = await query<{ id: string }>(
    `SELECT dt.id FROM team_dm_threads dt
     WHERE (
       SELECT COUNT(*) FROM team_dm_members WHERE dm_thread_id = dt.id
     ) = 2
     AND EXISTS (SELECT 1 FROM team_dm_members WHERE dm_thread_id = dt.id AND member_id = $1)
     AND EXISTS (SELECT 1 FROM team_dm_members WHERE dm_thread_id = dt.id AND member_id = $2)
     LIMIT 1`,
    [memberIdA, memberIdB]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  // Create new thread
  const { rows } = await query<{ id: string }>(
    `INSERT INTO team_dm_threads DEFAULT VALUES RETURNING id`
  );
  const threadId = rows[0].id;

  await query(
    `INSERT INTO team_dm_members (dm_thread_id, member_id) VALUES ($1, $2), ($1, $3)`,
    [threadId, memberIdA, memberIdB]
  );

  return threadId;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

export async function getDMMessages(
  dmThreadId: string,
  memberId: string,
  opts: { limit?: number; before?: string } = {}
): Promise<DMMessage[]> {
  const limit = opts.limit ?? 50;

  // Verify membership
  const access = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
  if (!access.rows[0]) throw new Error('Not a member of this DM thread');

  let beforeClause = '';
  const params: (string | number)[] = [dmThreadId, limit];
  if (opts.before) {
    beforeClause = `AND dm.created_at < $3`;
    params.push(opts.before);
  }

  const result = await query<DMMessageRow>(
    `SELECT dm.*, COALESCE(m.name, m.username, 'Unknown') AS sender_name
     FROM team_dm_messages dm
     JOIN members m ON m.id = dm.sender_id
     WHERE dm.dm_thread_id = $1
       AND dm.deleted_at IS NULL
       ${beforeClause}
     ORDER BY dm.created_at ASC
     LIMIT $2`,
    params
  );

  return result.rows.map(mapDMRow);
}

export async function getDMMessagesSince(
  dmThreadId: string,
  memberId: string,
  afterTs: number
): Promise<DMMessage[]> {
  const access = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
  if (!access.rows[0]) return [];

  const afterDate = new Date(afterTs).toISOString();
  const result = await query<DMMessageRow>(
    `SELECT dm.*, COALESCE(m.name, m.username, 'Unknown') AS sender_name
     FROM team_dm_messages dm
     JOIN members m ON m.id = dm.sender_id
     WHERE dm.dm_thread_id = $1
       AND dm.created_at > $2
       AND dm.deleted_at IS NULL
     ORDER BY dm.created_at ASC`,
    [dmThreadId, afterDate]
  );

  return result.rows.map(mapDMRow);
}

export async function sendDMMessage(
  dmThreadId: string,
  senderId: string,
  body: string,
  messageType: MessageType = 'build',
  attachments: StoredMessageAttachment[] = []
): Promise<DMMessage> {
  const trimmed = body.trim();
  // An image-only message (empty text + ≥1 attachment) is allowed.
  if (!trimmed && attachments.length === 0) throw new Error('Message body cannot be empty');

  const validTypes: MessageType[] = ['build', 'decision', 'insight', 'question'];
  const safeType: MessageType = validTypes.includes(messageType) ? messageType : 'build';

  // Verify membership
  const access = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, senderId]
  );
  if (!access.rows[0]) throw new Error('Not a member of this DM thread');

  const result = await query<{
    id: string;
    dm_thread_id: string;
    sender_id: string;
    body: string;
    message_type: string;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
    attachments: unknown;
  }>(
    `INSERT INTO team_dm_messages (dm_thread_id, sender_id, body, message_type, attachments)
     VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING *`,
    [dmThreadId, senderId, trimmed, safeType, JSON.stringify(attachments)]
  );

  const row = result.rows[0];

  // Fire-and-forget email notification to the other participant
  const notifyPreview = trimmed || (attachments.length ? '📷 Image' : '');
  notifyDMRecipient(dmThreadId, senderId, notifyPreview).catch(() => {});

  const nameRes = await query<{ name: string | null; username: string }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [senderId]
  );
  const sender = nameRes.rows[0];

  // Update last_read_at for sender
  await query(
    `UPDATE team_dm_members SET last_read_at = NOW()
     WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, senderId]
  );

  return {
    id: row.id,
    dmThreadId: row.dm_thread_id,
    senderId: row.sender_id,
    senderName: sender?.name || sender?.username || 'Unknown',
    body: row.body,
    messageType: (row.message_type ?? 'build') as MessageType,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    attachments: toClientAttachments(
      parseStoredAttachments(row.attachments),
      dmServeBase(row.dm_thread_id)
    ),
  };
}

export async function markDMRead(dmThreadId: string, memberId: string): Promise<void> {
  await query(
    `UPDATE team_dm_members SET last_read_at = NOW()
     WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
}

/** True if the member participates in the DM thread — the DM access gate. */
export async function isDMThreadMember(
  dmThreadId: string,
  memberId: string
): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
  return !!res.rows[0];
}

/**
 * Locate one attachment within a DM thread by id, scoped to the thread (a foreign
 * attachment id cannot resolve). Returns server-only storage metadata for streaming.
 * The caller MUST verify thread membership first.
 */
export async function findDMAttachment(
  dmThreadId: string,
  attachmentId: string
): Promise<{ storagePath: string; mimeType: string; filename: string } | null> {
  const res = await query<{ storage_path: string; mime_type: string; filename: string }>(
    `SELECT att->>'storagePath' AS storage_path,
            att->>'mimeType'   AS mime_type,
            att->>'filename'   AS filename
       FROM team_dm_messages dm,
            jsonb_array_elements(dm.attachments) att
      WHERE dm.dm_thread_id = $1
        AND dm.deleted_at IS NULL
        AND att->>'id' = $2
      LIMIT 1`,
    [dmThreadId, attachmentId]
  );
  const row = res.rows[0];
  if (!row || !row.storage_path) return null;
  return { storagePath: row.storage_path, mimeType: row.mime_type, filename: row.filename };
}

/**
 * Total unread DM messages across all of a member's threads — the DM half of the
 * Co-lab rail badge. Matches listDMThreads' per-thread unread logic exactly (so the
 * rail total equals the sum of the sidebar's DM unread badges): a message counts if
 * it is newer than the member's last_read_at for that thread and not deleted.
 */
export async function countUnreadDMs(memberId: string): Promise<number> {
  const res = await query<{ n: number }>(
    `SELECT count(*)::int AS n
       FROM team_dm_members tdm
       JOIN team_dm_messages dm ON dm.dm_thread_id = tdm.dm_thread_id
      WHERE tdm.member_id = $1
        AND dm.created_at > COALESCE(tdm.last_read_at, '1970-01-01')
        AND dm.deleted_at IS NULL`,
    [memberId]
  );
  return res.rows[0]?.n ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS (for DM target selection)
// ─────────────────────────────────────────────────────────────────────────────

export async function listTeamMembers(): Promise<Array<{
  memberId: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}>> {
  const result = await query<{
    id: string;
    name: string | null;
    username: string;
    status: string | null;
  }>(
    `SELECT m.id, m.name, m.username, tp.status
     FROM members m
     LEFT JOIN team_presence tp ON tp.member_id = m.id
     ORDER BY tp.last_seen_at DESC NULLS LAST, m.name ASC`
  );

  return result.rows.map(row => ({
    memberId: row.id,
    name: row.name || row.username,
    status: (row.status as 'online' | 'away' | 'offline') || 'offline',
  }));
}
