/**
 * BETWEEN-SESSION MESSAGES
 *
 * Bounded async messaging between practitioners and clients.
 * NOT live chat - intentional latency, digest over drip, boundaries first-class.
 *
 * Key principles:
 * - Practitioner sets check windows ("I read this Tues/Thurs")
 * - No real-time updates - refresh on page load only
 * - Response window display - "typically responds within 48h"
 * - Quick responses - "Noted" templates discourage back-and-forth
 * - Safety concerns route with immediate notification
 */

import { query, transaction } from '@/lib/db/postgres';
import type { PractitionerClient } from '@/lib/stellium/types';
import crypto from 'crypto';
import {
  getEncryptedColumnsForInsert,
  verifyEncryptedBody,
} from '@/lib/security/phiAccessors/clientMessages';
import { stripEncryptedColumns } from '@/lib/security/phiEncryption';
import { decryptJoinedClientFields, decryptClientRow } from '@/lib/stellium/clients';

// SQL fragment for selecting encrypted client name columns in JOINs
const CLIENT_NAME_JOIN_COLUMNS = `
  c.name as client_name,
  c.name_enc as client_name_enc,
  c.name_enc_meta as client_name_enc_meta,
  c.preferred_name_enc as client_preferred_name_enc,
  c.preferred_name_enc_meta as client_preferred_name_enc_meta
`;

// SQL fragment for selecting encrypted client name columns directly
const CLIENT_NAME_DIRECT_COLUMNS = `
  name,
  name_enc,
  name_enc_meta,
  preferred_name_enc,
  preferred_name_enc_meta
`;

// ============================================
// TYPES
// ============================================

export type MessageDirection = 'client_to_practitioner' | 'practitioner_to_client';
export type MessageType = 'reflection' | 'question' | 'win' | 'struggle' | 'logistics' | 'reply';
export type MessageUrgency = 'not_urgent' | 'time_sensitive' | 'safety_concern';
export type MessageStatus = 'sent' | 'read' | 'archived';
export type QuickResponseType = 'noted' | 'discuss_next_session' | 'acknowledged';

export interface MessagePolicy {
  id: string;
  practitioner_id: string;
  client_id: string | null; // null = default policy

  // When practitioner checks
  check_days: string[];
  check_window_start: string;
  check_window_end: string;
  timezone: string;

  // Response expectations
  max_response_hours: number;

  // Crisis messaging
  crisis_copy: string;

  // Permissions
  allow_client_messages: boolean;
  allow_practitioner_reply: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface ClientMessage {
  id: string;
  client_id: string;
  practitioner_id: string;
  direction: MessageDirection;
  message_type: MessageType | null;
  urgency: MessageUrgency;
  body: string;
  is_quick_response: boolean;
  quick_response_type: QuickResponseType | null;
  reply_to_id: string | null;
  status: MessageStatus;
  read_at: string | null;
  safety_reviewed: boolean;
  safety_reviewed_at: string | null;
  safety_reviewed_by: string | null;
  created_at: string;
  updated_at: string;

  // Joined data (optional)
  client?: PractitionerClient;
  reply_to?: ClientMessage;
}

export interface ClientMessageToken {
  id: string;
  client_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
  is_revoked: boolean;
  revoked_at: string | null;
  created_at: string;
}

// Input types
export interface CreateMessagePolicyInput {
  check_days?: string[];
  check_window_start?: string;
  check_window_end?: string;
  timezone?: string;
  max_response_hours?: number;
  crisis_copy?: string;
  allow_client_messages?: boolean;
  allow_practitioner_reply?: boolean;
}

export interface CreateMessageInput {
  message_type?: MessageType;
  urgency?: MessageUrgency;
  body: string;
  reply_to_id?: string;
}

export interface SendReplyInput {
  body: string;
  is_quick_response?: boolean;
  quick_response_type?: QuickResponseType;
  reply_to_id?: string;
}

// View types
export interface MessageInboxItem {
  client_id: string;
  client_name: string;
  client_preferred_name: string | null;
  unread_count: number;
  safety_count: number;
  latest_message_at: string;
  latest_message_preview: string;
  latest_message_type: MessageType | null;
  latest_urgency: MessageUrgency;
  // Safety log data (if latest message is a safety concern)
  safety_log_id?: string | null;
  safety_acknowledged_at?: string | null;
}

// Extended message type with safety log data
export interface ClientMessageWithSafety extends ClientMessage {
  safety_log_id?: string | null;
  safety_log_acknowledged_at?: string | null;
  safety_log_review_note?: string | null;
}

export interface MessageDigestCounts {
  by_type: {
    reflection: number;
    question: number;
    win: number;
    struggle: number;
    logistics: number;
    reply: number;
    untyped: number;
  };
  safety: {
    total: number;
    reviewed: number;
    needs_review: number;
  };
  unanswered: number;
}

export interface MessageDigest {
  client_id: string;
  client_name: string;
  messages_since_last_session: number;
  has_safety_concerns: boolean;
  has_time_sensitive: boolean;
  counts: MessageDigestCounts;
  synthesis: string; // Rule-based one-liner summary
  messages: Array<{
    id: string;
    message_type: MessageType | null;
    urgency: MessageUrgency;
    body: string;
    created_at: string;
    safety_acknowledged?: boolean;
  }>;
}

export interface MessageThread {
  messages: ClientMessageWithSafety[];
  client: PractitionerClient;
  policy: MessagePolicy;
  unread_count: number;
}

// ============================================
// MESSAGE POLICY FUNCTIONS
// ============================================

/**
 * Get the effective policy for a client
 * Falls back to default if no client-specific override exists
 */
export async function getEffectivePolicy(
  practitionerId: string,
  clientId?: string
): Promise<MessagePolicy | null> {
  // Try client-specific first if clientId provided
  if (clientId) {
    const clientPolicy = await query(
      `SELECT * FROM message_policies
       WHERE practitioner_id = $1 AND client_id = $2 AND is_active = TRUE`,
      [practitionerId, clientId]
    );
    if (clientPolicy.rows[0]) {
      return clientPolicy.rows[0] as MessagePolicy;
    }
  }

  // Fall back to default policy (client_id IS NULL)
  const defaultPolicy = await query(
    `SELECT * FROM message_policies
     WHERE practitioner_id = $1 AND client_id IS NULL AND is_active = TRUE`,
    [practitionerId]
  );

  return defaultPolicy.rows[0] as MessagePolicy | null;
}

/**
 * Get default policy for practitioner (not client-specific)
 */
export async function getDefaultPolicy(
  practitionerId: string
): Promise<MessagePolicy | null> {
  const result = await query(
    `SELECT * FROM message_policies
     WHERE practitioner_id = $1 AND client_id IS NULL`,
    [practitionerId]
  );
  return result.rows[0] as MessagePolicy | null;
}

/**
 * Create or update the default message policy for a practitioner
 */
export async function upsertDefaultPolicy(
  practitionerId: string,
  input: CreateMessagePolicyInput
): Promise<MessagePolicy> {
  const {
    check_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    check_window_start = '09:00',
    check_window_end = '17:00',
    timezone = 'America/New_York',
    max_response_hours = 48,
    crisis_copy = 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
    allow_client_messages = true,
    allow_practitioner_reply = true,
  } = input;

  const result = await query(
    `INSERT INTO message_policies (
      practitioner_id, client_id,
      check_days, check_window_start, check_window_end, timezone,
      max_response_hours, crisis_copy,
      allow_client_messages, allow_practitioner_reply
    ) VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (practitioner_id, client_id)
    DO UPDATE SET
      check_days = EXCLUDED.check_days,
      check_window_start = EXCLUDED.check_window_start,
      check_window_end = EXCLUDED.check_window_end,
      timezone = EXCLUDED.timezone,
      max_response_hours = EXCLUDED.max_response_hours,
      crisis_copy = EXCLUDED.crisis_copy,
      allow_client_messages = EXCLUDED.allow_client_messages,
      allow_practitioner_reply = EXCLUDED.allow_practitioner_reply,
      updated_at = NOW()
    RETURNING *`,
    [
      practitionerId,
      check_days,
      check_window_start,
      check_window_end,
      timezone,
      max_response_hours,
      crisis_copy,
      allow_client_messages,
      allow_practitioner_reply,
    ]
  );

  return result.rows[0] as MessagePolicy;
}

/**
 * Get or create client-specific policy override
 */
export async function getClientPolicy(
  practitionerId: string,
  clientId: string
): Promise<MessagePolicy | null> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (!clientCheck.rows[0]) {
    return null;
  }

  const result = await query(
    `SELECT * FROM message_policies
     WHERE practitioner_id = $1 AND client_id = $2`,
    [practitionerId, clientId]
  );
  return result.rows[0] as MessagePolicy | null;
}

/**
 * Create or update client-specific policy
 */
export async function upsertClientPolicy(
  practitionerId: string,
  clientId: string,
  input: CreateMessagePolicyInput
): Promise<MessagePolicy | null> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (!clientCheck.rows[0]) {
    return null;
  }

  // Get defaults from default policy or use sensible defaults
  const defaultPolicy = await getDefaultPolicy(practitionerId);
  const defaults = defaultPolicy || {
    check_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    check_window_start: '09:00',
    check_window_end: '17:00',
    timezone: 'America/New_York',
    max_response_hours: 48,
    crisis_copy: 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
    allow_client_messages: true,
    allow_practitioner_reply: true,
  };

  const {
    check_days = defaults.check_days,
    check_window_start = defaults.check_window_start,
    check_window_end = defaults.check_window_end,
    timezone = defaults.timezone,
    max_response_hours = defaults.max_response_hours,
    crisis_copy = defaults.crisis_copy,
    allow_client_messages = defaults.allow_client_messages,
    allow_practitioner_reply = defaults.allow_practitioner_reply,
  } = input;

  const result = await query(
    `INSERT INTO message_policies (
      practitioner_id, client_id,
      check_days, check_window_start, check_window_end, timezone,
      max_response_hours, crisis_copy,
      allow_client_messages, allow_practitioner_reply
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (practitioner_id, client_id)
    DO UPDATE SET
      check_days = EXCLUDED.check_days,
      check_window_start = EXCLUDED.check_window_start,
      check_window_end = EXCLUDED.check_window_end,
      timezone = EXCLUDED.timezone,
      max_response_hours = EXCLUDED.max_response_hours,
      crisis_copy = EXCLUDED.crisis_copy,
      allow_client_messages = EXCLUDED.allow_client_messages,
      allow_practitioner_reply = EXCLUDED.allow_practitioner_reply,
      updated_at = NOW()
    RETURNING *`,
    [
      practitionerId,
      clientId,
      check_days,
      check_window_start,
      check_window_end,
      timezone,
      max_response_hours,
      crisis_copy,
      allow_client_messages,
      allow_practitioner_reply,
    ]
  );

  return result.rows[0] as MessagePolicy;
}

/**
 * Delete client-specific policy (reverts to default)
 */
export async function deleteClientPolicy(
  practitionerId: string,
  clientId: string
): Promise<boolean> {
  const result = await query(
    `DELETE FROM message_policies
     WHERE practitioner_id = $1 AND client_id = $2
     RETURNING id`,
    [practitionerId, clientId]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================
// MESSAGE FUNCTIONS - PRACTITIONER
// ============================================

/**
 * Get inbox summary - clients with unread messages
 */
export async function getInbox(
  practitionerId: string,
  options?: {
    includeRead?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<MessageInboxItem[]> {
  const { includeRead = false, limit = 50, offset = 0 } = options || {};

  const whereClause = includeRead
    ? ''
    : 'WHERE uc.unread_count > 0';

  const result = await query(
    `WITH unread_counts AS (
      SELECT
        client_id,
        COUNT(*) as unread_count,
        COUNT(*) FILTER (WHERE urgency = 'safety_concern' AND safety_reviewed = FALSE) as safety_count,
        MAX(created_at) as latest_message_at
      FROM client_messages
      WHERE practitioner_id = $1
        AND direction = 'client_to_practitioner'
        AND status = 'sent'
      GROUP BY client_id
    ),
    latest_messages AS (
      SELECT DISTINCT ON (client_id)
        client_id,
        id as message_id,
        body,
        message_type,
        urgency
      FROM client_messages
      WHERE practitioner_id = $1
        AND direction = 'client_to_practitioner'
      ORDER BY client_id, created_at DESC
    )
    SELECT
      c.id as client_id,
      ${CLIENT_NAME_JOIN_COLUMNS},
      COALESCE(uc.unread_count, 0) as unread_count,
      COALESCE(uc.safety_count, 0) as safety_count,
      COALESCE(uc.latest_message_at, lm.created_at) as latest_message_at,
      LEFT(lm.body, 100) as latest_message_preview,
      lm.message_type as latest_message_type,
      lm.urgency as latest_urgency,
      scl.id as safety_log_id,
      scl.acknowledged_at as safety_acknowledged_at
    FROM practitioner_clients c
    LEFT JOIN unread_counts uc ON c.id = uc.client_id
    LEFT JOIN latest_messages lm ON c.id = lm.client_id
    LEFT JOIN safety_concern_logs scl ON lm.message_id = scl.message_id
    WHERE c.practitioner_id = $1
      AND (uc.unread_count > 0 OR $4 = true)
      AND lm.body IS NOT NULL
    ORDER BY uc.safety_count DESC NULLS LAST, uc.latest_message_at DESC NULLS LAST
    LIMIT $2 OFFSET $3`,
    [practitionerId, limit, offset, includeRead]
  );

  // Decrypt client names in results
  return result.rows.map(row => {
    const decrypted = decryptJoinedClientFields(row, practitionerId);
    return {
      ...row,
      client_name: decrypted.client_name || row.client_name,
      client_preferred_name: decrypted.client_preferred_name || null,
    };
  }) as MessageInboxItem[];
}

/**
 * Get all messages for a specific client (thread view)
 * SECURITY: Decrypts client names and strips *_enc columns before returning
 */
export async function getClientThread(
  practitionerId: string,
  clientId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<MessageThread | null> {
  const { limit = 50, offset = 0 } = options || {};

  // Verify client and get client data
  const clientResult = await query(
    `SELECT * FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientResult.rows[0]) {
    return null;
  }

  // SECURITY: Decrypt client row and strip encrypted columns
  const client = decryptClientRow(clientResult.rows[0], practitionerId);

  // Get messages with safety log data (explicit columns to avoid body_enc leak)
  const messagesResult = await query(
    `SELECT
      m.id, m.client_id, m.practitioner_id, m.direction, m.message_type,
      m.urgency, m.body, m.status, m.safety_reviewed, m.read_at, m.created_at, m.updated_at,
      scl.id as safety_log_id,
      scl.acknowledged_at as safety_log_acknowledged_at,
      scl.review_note as safety_log_review_note
     FROM client_messages m
     LEFT JOIN safety_concern_logs scl ON m.id = scl.message_id
     WHERE m.client_id = $1 AND m.practitioner_id = $2
     ORDER BY m.created_at DESC
     LIMIT $3 OFFSET $4`,
    [clientId, practitionerId, limit, offset]
  );

  // SECURITY: Strip any remaining encrypted columns from messages
  const messages = stripEncryptedColumns(messagesResult.rows) as ClientMessageWithSafety[];

  // Get effective policy
  const policy = await getEffectivePolicy(practitionerId, clientId);
  if (!policy) {
    // Create default if none exists
    const defaultPolicy = await upsertDefaultPolicy(practitionerId, {});
    return {
      messages,
      client,
      policy: defaultPolicy,
      unread_count: 0,
    };
  }

  // Get unread count
  const unreadResult = await query(
    `SELECT COUNT(*) as count FROM client_messages
     WHERE client_id = $1 AND practitioner_id = $2
       AND direction = 'client_to_practitioner'
       AND status = 'sent'`,
    [clientId, practitionerId]
  );

  return {
    messages,
    client,
    policy,
    unread_count: parseInt(unreadResult.rows[0]?.count || '0', 10),
  };
}

/**
 * Get a single message by ID
 * SECURITY: Decrypts client names and strips *_enc columns before returning
 */
export async function getMessage(
  practitionerId: string,
  messageId: string
): Promise<ClientMessage | null> {
  const result = await query(
    `SELECT m.id, m.client_id, m.practitioner_id, m.direction, m.message_type,
            m.urgency, m.body, m.status, m.safety_reviewed, m.read_at, m.created_at, m.updated_at,
            ${CLIENT_NAME_JOIN_COLUMNS}
     FROM client_messages m
     JOIN practitioner_clients c ON m.client_id = c.id
     WHERE m.id = $1 AND m.practitioner_id = $2`,
    [messageId, practitionerId]
  );

  if (!result.rows[0]) return null;

  // Decrypt client name fields and strip encrypted columns
  const row = result.rows[0];
  const decrypted = decryptJoinedClientFields(row, practitionerId);
  return stripEncryptedColumns({
    ...row,
    client_name: decrypted.client_name || row.client_name,
    client_preferred_name: decrypted.client_preferred_name || null,
  }) as ClientMessage;
}

/**
 * Mark message as read
 */
export async function markMessageRead(
  practitionerId: string,
  messageId: string
): Promise<ClientMessage | null> {
  const result = await query(
    `UPDATE client_messages
     SET status = 'read', read_at = NOW()
     WHERE id = $1 AND practitioner_id = $2 AND status = 'sent'
     RETURNING *`,
    [messageId, practitionerId]
  );
  return result.rows[0] as ClientMessage | null;
}

/**
 * Mark all messages from a client as read
 */
export async function markAllClientMessagesRead(
  practitionerId: string,
  clientId: string
): Promise<number> {
  const result = await query(
    `UPDATE client_messages
     SET status = 'read', read_at = NOW()
     WHERE practitioner_id = $1
       AND client_id = $2
       AND direction = 'client_to_practitioner'
       AND status = 'sent'`,
    [practitionerId, clientId]
  );
  return result.rowCount ?? 0;
}

/**
 * Send a reply to a client
 */
export async function sendReply(
  practitionerId: string,
  clientId: string,
  input: SendReplyInput
): Promise<ClientMessage | null> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (!clientCheck.rows[0]) {
    return null;
  }

  // Check policy allows replies
  const policy = await getEffectivePolicy(practitionerId, clientId);
  if (policy && !policy.allow_practitioner_reply) {
    throw new Error('Replies are disabled for this client');
  }

  const { body, is_quick_response = false, quick_response_type, reply_to_id } = input;

  // Generate UUID client-side (needed for encryption context)
  const messageId = crypto.randomUUID();

  // PHI encryption: plaintext + encrypted columns
  const { bodyEnc, bodyEncMeta } = getEncryptedColumnsForInsert(body, {
    rowId: messageId,
    practitionerId,
  });

  const result = await query(
    `INSERT INTO client_messages (
      id, client_id, practitioner_id, direction,
      message_type, body, body_enc, body_enc_meta,
      is_quick_response, quick_response_type,
      reply_to_id, status
    ) VALUES ($1, $2, $3, 'practitioner_to_client', 'reply', $4, $5, $6, $7, $8, $9, 'sent')
    RETURNING *`,
    [
      messageId,
      clientId,
      practitionerId,
      body,
      bodyEnc,
      bodyEncMeta,
      is_quick_response,
      quick_response_type || null,
      reply_to_id || null,
    ]
  );

  // Background verification
  verifyEncryptedBody(messageId, practitionerId, body).catch(() => {});

  return result.rows[0] as ClientMessage;
}

/**
 * Review and acknowledge a safety concern
 */
export async function reviewSafetyConcern(
  practitionerId: string,
  messageId: string
): Promise<ClientMessage | null> {
  const result = await query(
    `UPDATE client_messages
     SET safety_reviewed = TRUE,
         safety_reviewed_at = NOW(),
         safety_reviewed_by = $2
     WHERE id = $1
       AND practitioner_id = $2
       AND urgency = 'safety_concern'
     RETURNING *`,
    [messageId, practitionerId]
  );
  return result.rows[0] as ClientMessage | null;
}

/**
 * Generate a human-readable one-liner synthesis from message counts
 * Rule-based: no AI dependency
 *
 * INVARIANT: Output contains ONLY counts and statuses — never message bodies,
 * client names, or any quoted content. This is PHI-safe by design.
 *
 * Priority ordering (clinically sane):
 * 1. Safety concerns (needs review → reviewed)
 * 2. Unanswered (actionable)
 * 3. Questions (need response)
 * 4. Reflections (high-signal but not urgent)
 * 5. Everything else (wins, struggles, logistics)
 */
export function generateDigestSynthesis(counts: MessageDigestCounts, total: number): string {
  if (total === 0) {
    return 'No messages since last session';
  }

  const parts: string[] = [];

  // Start with total
  parts.push(`${total} message${total > 1 ? 's' : ''}`);

  // Build content breakdown (priority order: actionable first)
  const contentParts: string[] = [];

  // 1. Safety concerns always first (most important)
  if (counts.safety.total > 0) {
    if (counts.safety.needs_review > 0) {
      contentParts.push(`${counts.safety.total} safety (${counts.safety.needs_review} need${counts.safety.needs_review > 1 ? '' : 's'} review)`);
    } else {
      contentParts.push(`${counts.safety.total} safety (reviewed)`);
    }
  }

  // 2. Unanswered - actionable, needs response
  if (counts.unanswered > 0) {
    contentParts.push(`${counts.unanswered} unanswered`);
  }

  // 3. Questions - need response
  if (counts.by_type.question > 0) {
    contentParts.push(`${counts.by_type.question} question${counts.by_type.question > 1 ? 's' : ''}`);
  }

  // 4. Reflections - high-signal but not urgent
  if (counts.by_type.reflection > 0) {
    contentParts.push(`${counts.by_type.reflection} reflection${counts.by_type.reflection > 1 ? 's' : ''}`);
  }

  // 5. Everything else (wins, struggles)
  if (counts.by_type.win > 0) {
    contentParts.push(`${counts.by_type.win} win${counts.by_type.win > 1 ? 's' : ''}`);
  }
  if (counts.by_type.struggle > 0) {
    contentParts.push(`${counts.by_type.struggle} struggle${counts.by_type.struggle > 1 ? 's' : ''}`);
  }

  // Combine: "Since last session: 5 messages — 1 safety (needs review), 2 unanswered, 1 question"
  if (contentParts.length > 0) {
    return `Since last session: ${parts[0]} — ${contentParts.slice(0, 4).join(', ')}`;
  }

  return `Since last session: ${parts[0]}`;
}

/**
 * Get message digest for session prep
 * Returns messages since last session with counts and synthesis
 */
export async function getMessageDigest(
  practitionerId: string,
  clientId: string
): Promise<MessageDigest | null> {
  // Get client and last session date (including encrypted name columns)
  const clientResult = await query(
    `SELECT id, ${CLIENT_NAME_DIRECT_COLUMNS}, last_session
     FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );

  if (!clientResult.rows[0]) {
    return null;
  }

  // Decrypt client name fields
  const rawClient = clientResult.rows[0];
  const decrypted = decryptJoinedClientFields({
    client_id: rawClient.id,
    client_name: rawClient.name,
    client_name_enc: rawClient.name_enc,
    client_name_enc_meta: rawClient.name_enc_meta,
    client_preferred_name: undefined,
    client_preferred_name_enc: rawClient.preferred_name_enc,
    client_preferred_name_enc_meta: rawClient.preferred_name_enc_meta,
  }, practitionerId);
  const client = {
    ...rawClient,
    name: decrypted.client_name || rawClient.name,
    preferred_name: decrypted.client_preferred_name || null,
  };
  const lastSession = client.last_session;

  // Get messages since last session with safety log acknowledgment status
  const messagesResult = await query(
    `SELECT
       m.id,
       m.message_type,
       m.urgency,
       m.body,
       m.created_at,
       m.reply_to_id,
       scl.acknowledged_at IS NOT NULL as safety_acknowledged
     FROM client_messages m
     LEFT JOIN safety_concern_logs scl ON scl.message_id = m.id
     WHERE m.client_id = $1
       AND m.practitioner_id = $2
       AND m.direction = 'client_to_practitioner'
       AND m.created_at > COALESCE($3, '1970-01-01'::timestamptz)
     ORDER BY m.created_at DESC`,
    [clientId, practitionerId, lastSession]
  );

  const messages = messagesResult.rows;

  // Calculate counts
  const counts: MessageDigestCounts = {
    by_type: {
      reflection: 0,
      question: 0,
      win: 0,
      struggle: 0,
      logistics: 0,
      reply: 0,
      untyped: 0,
    },
    safety: {
      total: 0,
      reviewed: 0,
      needs_review: 0,
    },
    unanswered: 0,
  };

  // Check which messages have replies (to calculate unanswered)
  const messageIds = messages.map((m: { id: string }) => m.id);
  let repliedIds = new Set<string>();

  if (messageIds.length > 0) {
    const repliesResult = await query(
      `SELECT DISTINCT reply_to_id
       FROM client_messages
       WHERE reply_to_id = ANY($1)
         AND direction = 'practitioner_to_client'`,
      [messageIds]
    );
    repliedIds = new Set(repliesResult.rows.map((r: { reply_to_id: string }) => r.reply_to_id));
  }

  for (const msg of messages) {
    // Count by type
    const msgType = msg.message_type as MessageType | null;
    if (msgType && counts.by_type[msgType] !== undefined) {
      counts.by_type[msgType]++;
    } else {
      counts.by_type.untyped++;
    }

    // Count safety concerns
    if (msg.urgency === 'safety_concern') {
      counts.safety.total++;
      if (msg.safety_acknowledged) {
        counts.safety.reviewed++;
      } else {
        counts.safety.needs_review++;
      }
    }

    // Count unanswered (no reply from practitioner)
    if (!repliedIds.has(msg.id)) {
      counts.unanswered++;
    }
  }

  const hasSafetyConcerns = counts.safety.total > 0;
  const hasTimeSensitive = messages.some((m: { urgency: string }) => m.urgency === 'time_sensitive');

  // Generate synthesis
  const synthesis = generateDigestSynthesis(counts, messages.length);

  return {
    client_id: client.id,
    client_name: client.preferred_name || client.name,
    messages_since_last_session: messages.length,
    has_safety_concerns: hasSafetyConcerns,
    has_time_sensitive: hasTimeSensitive,
    counts,
    synthesis,
    messages: messages.map((m: { id: string; message_type: MessageType | null; urgency: MessageUrgency; body: string; created_at: string; safety_acknowledged: boolean }) => ({
      id: m.id,
      message_type: m.message_type,
      urgency: m.urgency,
      body: m.body,
      created_at: m.created_at,
      safety_acknowledged: m.safety_acknowledged,
    })),
  };
}

/**
 * Get unreviewed safety concerns
 * SECURITY: Decrypts client names and strips *_enc columns before returning
 */
export async function getUnreviewedSafetyConcerns(
  practitionerId: string
): Promise<ClientMessage[]> {
  const result = await query(
    `SELECT m.id, m.client_id, m.practitioner_id, m.direction, m.message_type,
            m.urgency, m.body, m.status, m.safety_reviewed, m.read_at, m.created_at, m.updated_at,
            ${CLIENT_NAME_JOIN_COLUMNS}
     FROM client_messages m
     JOIN practitioner_clients c ON m.client_id = c.id
     WHERE m.practitioner_id = $1
       AND m.urgency = 'safety_concern'
       AND m.safety_reviewed = FALSE
     ORDER BY m.created_at ASC`,
    [practitionerId]
  );

  // Decrypt client names and strip encrypted columns
  return result.rows.map((row) => {
    const decrypted = decryptJoinedClientFields(row, practitionerId);
    return stripEncryptedColumns({
      ...row,
      client_name: decrypted.client_name || row.client_name,
      client_preferred_name: decrypted.client_preferred_name || null,
    }) as ClientMessage;
  });
}

/**
 * Get total unread count for practitioner
 */
export async function getUnreadCount(
  practitionerId: string
): Promise<{ total: number; safety: number }> {
  const result = await query(
    `SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE urgency = 'safety_concern' AND safety_reviewed = FALSE) as safety
     FROM client_messages
     WHERE practitioner_id = $1
       AND direction = 'client_to_practitioner'
       AND status = 'sent'`,
    [practitionerId]
  );

  return {
    total: parseInt(result.rows[0]?.total || '0', 10),
    safety: parseInt(result.rows[0]?.safety || '0', 10),
  };
}

// ============================================
// MESSAGE TOKEN FUNCTIONS
// ============================================

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a message access token for a client
 * Default expiration: 7 days
 */
export async function createMessageToken(
  clientId: string,
  expirationDays: number = 7
): Promise<ClientMessageToken> {
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  const result = await query(
    `INSERT INTO client_message_tokens (client_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [clientId, token, expiresAt.toISOString()]
  );

  return result.rows[0] as ClientMessageToken;
}

/**
 * Validate a message token and get client info
 * Also updates last_accessed_at and access_count
 */
export async function validateMessageToken(
  token: string
): Promise<{ valid: boolean; clientId?: string; practitionerId?: string; error?: string }> {
  const result = await query(
    `SELECT t.*, c.practitioner_id
     FROM client_message_tokens t
     JOIN practitioner_clients c ON t.client_id = c.id
     WHERE t.token = $1
       AND t.is_revoked = FALSE
       AND t.expires_at > NOW()`,
    [token]
  );

  if (!result.rows[0]) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  const tokenRecord = result.rows[0];

  // Update access tracking
  await query(
    `UPDATE client_message_tokens
     SET used_at = COALESCE(used_at, NOW()),
         last_accessed_at = NOW(),
         access_count = access_count + 1
     WHERE id = $1`,
    [tokenRecord.id]
  );

  return {
    valid: true,
    clientId: tokenRecord.client_id,
    practitionerId: tokenRecord.practitioner_id,
  };
}

/**
 * Revoke a message token
 */
export async function revokeMessageToken(
  tokenId: string,
  clientId: string
): Promise<boolean> {
  const result = await query(
    `UPDATE client_message_tokens
     SET is_revoked = TRUE, revoked_at = NOW()
     WHERE id = $1 AND client_id = $2
     RETURNING id`,
    [tokenId, clientId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Revoke all tokens for a client
 */
export async function revokeAllClientTokens(
  clientId: string
): Promise<number> {
  const result = await query(
    `UPDATE client_message_tokens
     SET is_revoked = TRUE, revoked_at = NOW()
     WHERE client_id = $1 AND is_revoked = FALSE`,
    [clientId]
  );
  return result.rowCount ?? 0;
}

/**
 * Get active tokens for a client
 */
export async function getClientTokens(
  practitionerId: string,
  clientId: string
): Promise<ClientMessageToken[]> {
  // Verify ownership
  const check = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (!check.rows[0]) {
    return [];
  }

  const result = await query(
    `SELECT * FROM client_message_tokens
     WHERE client_id = $1 AND is_revoked = FALSE
     ORDER BY created_at DESC`,
    [clientId]
  );
  return result.rows as ClientMessageToken[];
}

// ============================================
// QUICK RESPONSE TEMPLATES
// ============================================

export const QUICK_RESPONSES: Record<QuickResponseType, { label: string; body: string }> = {
  noted: {
    label: 'Noted',
    body: "Thank you for sharing this. I've noted it and we can discuss further in our next session.",
  },
  discuss_next_session: {
    label: 'Discuss Next Session',
    body: "Thank you for this. Let's discuss this in depth during our next session together.",
  },
  acknowledged: {
    label: 'Acknowledged',
    body: 'Received and acknowledged. Thank you for keeping me informed.',
  },
};

/**
 * Send a quick response using a template
 */
export async function sendQuickResponse(
  practitionerId: string,
  clientId: string,
  responseType: QuickResponseType,
  replyToId?: string
): Promise<ClientMessage | null> {
  const template = QUICK_RESPONSES[responseType];
  if (!template) {
    throw new Error(`Invalid quick response type: ${responseType}`);
  }

  return sendReply(practitionerId, clientId, {
    body: template.body,
    is_quick_response: true,
    quick_response_type: responseType,
    reply_to_id: replyToId,
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format check days for display
 * e.g., ['monday', 'wednesday', 'friday'] => "Mon, Wed, Fri"
 */
export function formatCheckDays(days: string[]): string {
  const dayMap: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return days.map(d => dayMap[d.toLowerCase()] || d).join(', ');
}

/**
 * Format policy for client display
 * e.g., "I check messages Mon, Wed, Fri between 9am-5pm (EST). I typically respond within 48 hours."
 */
export function formatPolicyForClient(policy: MessagePolicy): string {
  const days = formatCheckDays(policy.check_days);
  const start = policy.check_window_start;
  const end = policy.check_window_end;
  const tz = policy.timezone.split('/').pop()?.replace('_', ' ') || policy.timezone;
  const hours = policy.max_response_hours;

  return `I check messages ${days} between ${start}-${end} (${tz}). I typically respond within ${hours} hours.`;
}

/**
 * Get urgency badge config
 */
export function getUrgencyConfig(urgency: MessageUrgency): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (urgency) {
    case 'safety_concern':
      return {
        label: 'Safety Concern',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      };
    case 'time_sensitive':
      return {
        label: 'Time Sensitive',
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
      };
    case 'not_urgent':
    default:
      return {
        label: 'Not Urgent',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
      };
  }
}

/**
 * Get message type config
 */
export function getMessageTypeConfig(type: MessageType | null): {
  label: string;
  icon: string;
  color: string;
} {
  switch (type) {
    case 'reflection':
      return { label: 'Reflection', icon: 'thought-bubble', color: 'text-purple-600' };
    case 'question':
      return { label: 'Question', icon: 'help-circle', color: 'text-blue-600' };
    case 'win':
      return { label: 'Win', icon: 'star', color: 'text-green-600' };
    case 'struggle':
      return { label: 'Struggle', icon: 'heart', color: 'text-orange-600' };
    case 'logistics':
      return { label: 'Logistics', icon: 'calendar', color: 'text-gray-600' };
    case 'reply':
      return { label: 'Reply', icon: 'reply', color: 'text-gray-600' };
    default:
      return { label: 'Note', icon: 'message', color: 'text-gray-600' };
  }
}
