// SoulComms — Direct Message Service
//
// Co-Lab sovereign: DM threads are scoped to the active Co-Lab (team_id).
// A member may only DM people who share membership in the same Co-Lab.
// No global roster exposure. No cross-Co-Lab DM threads.

import { query } from '@/lib/db/postgres';
import { notifyDMRecipient } from '@/lib/team/notifications';
import { getTeamRole } from '@/lib/auth/teamPermissions';

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
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export async function listDMThreads(memberId: string, teamId: string): Promise<DMThread[]> {
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
     WHERE dt.team_id = $2
     GROUP BY dt.id, tdm.last_read_at
     ORDER BY last_message_at DESC NULLS LAST`,
    [memberId, teamId]
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
  memberIdB: string,
  teamId: string
): Promise<string> {
  // Both participants must be members of the active Co-Lab.
  const [roleA, roleB] = await Promise.all([
    getTeamRole(memberIdA, teamId),
    getTeamRole(memberIdB, teamId),
  ]);

  // Allow if either participant is in the team, or fall back to default-team
  // membership check (for backward compat with the legacy shared workspace).
  const { rows: defaultTeam } = await query<{ id: string }>(
    `SELECT id FROM studio_teams ORDER BY created_at ASC, id ASC LIMIT 1`
  );
  const defaultId = defaultTeam[0]?.id;
  const isDefault = teamId === defaultId;

  if (!isDefault && (!roleA || !roleB)) {
    throw new Error('Both participants must be members of the active Co-Lab to start a DM');
  }

  // Find existing 1:1 thread scoped to this Co-Lab
  const existing = await query<{ id: string }>(
    `SELECT dt.id FROM team_dm_threads dt
     WHERE dt.team_id = $3
       AND (
         SELECT COUNT(*) FROM team_dm_members WHERE dm_thread_id = dt.id
       ) = 2
       AND EXISTS (SELECT 1 FROM team_dm_members WHERE dm_thread_id = dt.id AND member_id = $1)
       AND EXISTS (SELECT 1 FROM team_dm_members WHERE dm_thread_id = dt.id AND member_id = $2)
     LIMIT 1`,
    [memberIdA, memberIdB, teamId]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  // Create new thread scoped to this Co-Lab
  const { rows } = await query<{ id: string }>(
    `INSERT INTO team_dm_threads (team_id) VALUES ($1) RETURNING id`,
    [teamId]
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

  // Verify membership in this thread
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

  const result = await query<{
    id: string;
    dm_thread_id: string;
    sender_id: string;
    sender_name: string;
    body: string;
    message_type: string;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
  }>(
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

  return result.rows.map(row => ({
    id: row.id,
    dmThreadId: row.dm_thread_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    messageType: (row.message_type ?? 'build') as MessageType,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
  }));
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
  const result = await query<{
    id: string;
    dm_thread_id: string;
    sender_id: string;
    sender_name: string;
    body: string;
    message_type: string;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
  }>(
    `SELECT dm.*, COALESCE(m.name, m.username, 'Unknown') AS sender_name
     FROM team_dm_messages dm
     JOIN members m ON m.id = dm.sender_id
     WHERE dm.dm_thread_id = $1
       AND dm.created_at > $2
       AND dm.deleted_at IS NULL
     ORDER BY dm.created_at ASC`,
    [dmThreadId, afterDate]
  );

  return result.rows.map(row => ({
    id: row.id,
    dmThreadId: row.dm_thread_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    messageType: (row.message_type ?? 'build') as MessageType,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
  }));
}

export async function sendDMMessage(
  dmThreadId: string,
  senderId: string,
  body: string,
  messageType: MessageType = 'build'
): Promise<DMMessage> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Message body cannot be empty');

  const validTypes: MessageType[] = ['build', 'decision', 'insight', 'question'];
  const safeType: MessageType = validTypes.includes(messageType) ? messageType : 'build';

  // Verify membership in this thread
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
  }>(
    `INSERT INTO team_dm_messages (dm_thread_id, sender_id, body, message_type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [dmThreadId, senderId, trimmed, safeType]
  );

  const row = result.rows[0];

  notifyDMRecipient(dmThreadId, senderId, trimmed).catch(() => {});

  const nameRes = await query<{ name: string | null; username: string }>(
    `SELECT name, username FROM members WHERE id = $1`,
    [senderId]
  );
  const sender = nameRes.rows[0];

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
  };
}

export type DeleteDMMessageResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'forbidden' };

export async function deleteDMMessage(
  dmThreadId: string,
  messageId: string,
  requesterId: string
): Promise<DeleteDMMessageResult> {
  const member = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, requesterId]
  );
  if (!member.rows[0]) return { ok: false, reason: 'forbidden' };

  const existing = await query<{ sender_id: string }>(
    `SELECT sender_id FROM team_dm_messages
     WHERE id = $1 AND dm_thread_id = $2 AND deleted_at IS NULL`,
    [messageId, dmThreadId]
  );
  const row = existing.rows[0];
  if (!row) return { ok: false, reason: 'not_found' };
  if (row.sender_id !== requesterId) return { ok: false, reason: 'forbidden' };

  await query(`UPDATE team_dm_messages SET deleted_at = NOW() WHERE id = $1`, [messageId]);
  return { ok: true };
}

export type EditDMMessageResult =
  | { ok: true; editedAt: string }
  | { ok: false; reason: 'not_found' | 'forbidden' | 'empty' | 'too_long' };

export async function editDMMessage(
  dmThreadId: string,
  messageId: string,
  requesterId: string,
  newBody: string
): Promise<EditDMMessageResult> {
  const trimmed = newBody.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (trimmed.length > 8000) return { ok: false, reason: 'too_long' };

  const member = await query(
    `SELECT 1 FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, requesterId]
  );
  if (!member.rows[0]) return { ok: false, reason: 'forbidden' };

  const existing = await query<{ sender_id: string }>(
    `SELECT sender_id FROM team_dm_messages
     WHERE id = $1 AND dm_thread_id = $2 AND deleted_at IS NULL`,
    [messageId, dmThreadId]
  );
  const row = existing.rows[0];
  if (!row) return { ok: false, reason: 'not_found' };
  if (row.sender_id !== requesterId) return { ok: false, reason: 'forbidden' };

  const upd = await query<{ edited_at: string }>(
    `UPDATE team_dm_messages SET body = $2, edited_at = NOW()
     WHERE id = $1 RETURNING edited_at`,
    [messageId, trimmed]
  );
  return { ok: true, editedAt: upd.rows[0].edited_at };
}

export async function getLastReadAt(dmThreadId: string, memberId: string): Promise<string | null> {
  const res = await query<{ last_read_at: string | null }>(
    `SELECT last_read_at FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
  return res.rows[0]?.last_read_at ?? null;
}

export async function markDMRead(dmThreadId: string, memberId: string): Promise<void> {
  await query(
    `UPDATE team_dm_members SET last_read_at = NOW()
     WHERE dm_thread_id = $1 AND member_id = $2`,
    [dmThreadId, memberId]
  );
}

export async function countUnreadDMs(memberId: string, teamId: string): Promise<number> {
  const res = await query<{ n: number }>(
    `SELECT count(*)::int AS n
       FROM team_dm_members tdm
       JOIN team_dm_messages dm ON dm.dm_thread_id = tdm.dm_thread_id
       JOIN team_dm_threads dt ON dt.id = tdm.dm_thread_id
      WHERE tdm.member_id = $1
        AND dt.team_id = $2
        AND dm.created_at > COALESCE(tdm.last_read_at, '1970-01-01')
        AND dm.deleted_at IS NULL`,
    [memberId, teamId]
  );
  return res.rows[0]?.n ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS (DM target selection — Co-Lab scoped)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Members eligible to DM within the active Co-Lab. Returns only members who
 * explicitly belong to the given team — no global roster exposure.
 */
export async function listTeamMembers(teamId: string): Promise<Array<{
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
     FROM studio_team_members stm
     JOIN members m ON m.id = stm.member_id
     LEFT JOIN team_presence tp ON tp.member_id = m.id
     WHERE stm.team_id = $1
     ORDER BY tp.last_seen_at DESC NULLS LAST, m.name ASC`,
    [teamId]
  );

  return result.rows.map(row => ({
    memberId: row.id,
    name: row.name || row.username,
    status: (row.status as 'online' | 'away' | 'offline') || 'offline',
  }));
}
