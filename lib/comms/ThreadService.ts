/**
 * COMMS SPINE: Thread Service
 *
 * Operations for conversation threads and messages.
 *
 * @module lib/comms/ThreadService
 */

import { query, queryOne, transaction } from '../db/postgres';
import { emitMessageCreated, emitThreadCreated } from './events';
import type {
  CommsThread,
  CommsMessage,
  CommsMessageWithSafety,
  ThreadContext,
  ThreadResponse,
  SendMessageInput,
  CommsDomain,
  CommsThreadType,
  CommsPolicy,
  formatCheckDays,
  formatTimeWindow,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// THREAD RETRIEVAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a thread with all context needed for display.
 */
export async function getThread(
  practitionerId: string,
  threadId: string
): Promise<ThreadResponse | null> {
  // Get thread
  const thread = await queryOne<CommsThread>(
    `SELECT * FROM comms_threads
     WHERE id = $1 AND practitioner_id = $2`,
    [threadId, practitionerId]
  );

  if (!thread) {
    return null;
  }

  // Get messages with safety flags
  const messages = await query<CommsMessageWithSafety>(
    `SELECT
      m.*,
      sf.id as "safety_flag.id",
      sf.severity as "safety_flag.severity",
      sf.detected_cues as "safety_flag.detected_cues",
      sf.acknowledged_at as "safety_flag.acknowledged_at"
    FROM comms_messages m
    LEFT JOIN comms_safety_flags sf ON sf.message_id = m.id
    WHERE m.thread_id = $1
    ORDER BY m.created_at ASC`,
    [threadId]
  );

  // Transform flat results to nested safety_flag
  const messagesWithSafety: CommsMessageWithSafety[] = messages.rows.map(row => {
    const { 'safety_flag.id': sfId, 'safety_flag.severity': sfSeverity,
            'safety_flag.detected_cues': sfCues, 'safety_flag.acknowledged_at': sfAck,
            ...message } = row as any;

    return {
      ...message,
      safety_flag: sfId ? {
        id: sfId,
        severity: sfSeverity,
        detected_cues: sfCues,
        acknowledged_at: sfAck,
      } : null,
    };
  });

  // Get context
  const context = await getThreadContext(practitionerId, thread);

  // Count unread
  const unreadCount = messagesWithSafety.filter(
    m => m.sender_type === 'client' && m.delivery_status !== 'read'
  ).length;

  return {
    thread,
    context,
    messages: messagesWithSafety,
    unread_count: unreadCount,
  };
}

/**
 * Get context panel data for a thread.
 */
async function getThreadContext(
  practitionerId: string,
  thread: CommsThread
): Promise<ThreadContext> {
  // Get policy (client-specific or default)
  const policy = await getEffectivePolicy(practitionerId, thread.client_id, thread.domain);

  // Get client info if clinical thread
  let client: ThreadContext['client'] = undefined;
  if (thread.client_id) {
    const clientRow = await queryOne<{
      id: string;
      name: string;
      preferred_name: string | null;
    }>(
      `SELECT id, name, preferred_name
       FROM practitioner_clients
       WHERE id = $1`,
      [thread.client_id]
    );

    if (clientRow) {
      // Get case info if exists
      let caseInfo: { spiral_stage: string; primary_element: string } | null = null;
      if (thread.case_id) {
        caseInfo = await queryOne<{
          spiral_stage: string;
          primary_element: string;
        }>(
          `SELECT spiral_stage, primary_element
           FROM practitioner_cases
           WHERE id = $1`,
          [thread.case_id]
        );
      }

      // Get last session
      const lastSession = await queryOne<{ last_session: string }>(
        `SELECT MAX(session_date) as last_session
         FROM case_notes
         WHERE case_id = $1`,
        [thread.case_id]
      );

      client = {
        id: clientRow.id,
        name: clientRow.name,
        preferred_name: clientRow.preferred_name,
        case_id: thread.case_id,
        spiral_stage: caseInfo?.spiral_stage || null,
        primary_element: caseInfo?.primary_element || null,
        last_session: lastSession?.last_session || null,
      };
    }
  }

  return {
    client,
    policy: {
      check_days_formatted: formatCheckDaysHelper(policy.check_days),
      check_window: `${policy.check_window_start} - ${policy.check_window_end}`,
      timezone: policy.timezone,
      max_response_hours: policy.max_response_hours,
      crisis_copy: policy.crisis_copy,
      boundary_message: policy.boundary_message,
    },
  };
}

/**
 * Get the effective policy for a thread.
 * Checks for client-specific override, falls back to domain default.
 */
export async function getEffectivePolicy(
  practitionerId: string,
  clientId: string | null,
  domain: CommsDomain
): Promise<CommsPolicy> {
  // Try client-specific first
  if (clientId) {
    const clientPolicy = await queryOne<CommsPolicy>(
      `SELECT * FROM comms_policies
       WHERE practitioner_id = $1
         AND client_id = $2
         AND domain = $3
         AND is_active = TRUE`,
      [practitionerId, clientId, domain]
    );
    if (clientPolicy) return clientPolicy;
  }

  // Fall back to domain default
  const defaultPolicy = await queryOne<CommsPolicy>(
    `SELECT * FROM comms_policies
     WHERE practitioner_id = $1
       AND client_id IS NULL
       AND domain = $2
       AND is_active = TRUE`,
    [practitionerId, domain]
  );

  if (defaultPolicy) return defaultPolicy;

  // Return system defaults
  return {
    id: 'default',
    practitioner_id: practitionerId,
    client_id: null,
    domain,
    check_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    check_window_start: '09:00',
    check_window_end: '17:00',
    timezone: 'America/New_York',
    max_response_hours: 48,
    crisis_copy: 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
    boundary_message: null,
    allow_inbound: true,
    allow_outbound: true,
    is_active: true,
    emergency_contact_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a message in a thread.
 */
export async function sendMessage(
  practitionerId: string,
  threadId: string,
  input: SendMessageInput
): Promise<CommsMessage> {
  // Verify thread belongs to practitioner
  const thread = await queryOne<CommsThread>(
    `SELECT * FROM comms_threads
     WHERE id = $1 AND practitioner_id = $2`,
    [threadId, practitionerId]
  );

  if (!thread) {
    throw new Error('Thread not found');
  }

  // Check policy allows outbound
  const policy = await getEffectivePolicy(practitionerId, thread.client_id, thread.domain);
  if (!policy.allow_outbound) {
    throw new Error('Outbound messages disabled for this thread');
  }

  // Phase 4: Validate suggestion_id if provided (forgiving mode - ignore invalid)
  let usedSuggestionId: string | null = null;
  if (input.suggestion_id) {
    const suggestion = await queryOne<{
      id: string;
      thread_id: string;
      status: string;
    }>(
      `SELECT id, thread_id, status
       FROM comms_reply_suggestions
       WHERE id = $1`,
      [input.suggestion_id]
    );

    // Only link if suggestion exists, belongs to this thread, and is draft
    if (suggestion && suggestion.thread_id === threadId && suggestion.status === 'draft') {
      usedSuggestionId = suggestion.id;
    }
  }

  // Insert message with used_suggestion_id + trust metadata
  const message = await queryOne<CommsMessage>(
    `INSERT INTO comms_messages (
      thread_id,
      sender_type,
      sender_id,
      channel_type,
      body,
      message_type,
      urgency,
      delivery_status,
      is_quick_response,
      quick_response_type,
      reply_to_id,
      used_suggestion_id,
      ai_assist_mode,
      disclosure_mode,
      disclosure_text,
      trust_scope,
      ai_permitted,
      contains_relational_inference,
      trust_checked_at
    ) VALUES ($1, 'practitioner', $2, $3, $4, $5, $6, 'sent', $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *`,
    [
      threadId,
      practitionerId,
      input.channel_type || 'in_app',
      input.body,
      input.message_type || 'reply',
      input.urgency || 'normal',
      input.is_quick_response || false,
      input.quick_response_type || null,
      input.reply_to_id || null,
      usedSuggestionId,
      input.ai_assist_mode || 'none',
      input.disclosure_mode || 'none',
      input.disclosure_text || null,
      input.trust_scope || 'direct_only',
      input.ai_permitted ?? false,
      input.contains_relational_inference ?? false,
      input.trust_checked_at || new Date().toISOString(),
    ]
  );

  if (!message) {
    throw new Error('Failed to create message');
  }

  // Phase 4: Mark suggestion as sent + supersede siblings
  if (usedSuggestionId) {
    // Mark the used suggestion as sent
    await query(
      `UPDATE comms_reply_suggestions
       SET status = 'sent',
           sent_message_id = $2,
           sent_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [usedSuggestionId, message.id]
    );

    // Supersede other draft suggestions for this thread
    await query(
      `UPDATE comms_reply_suggestions
       SET status = 'superseded',
           updated_at = NOW()
       WHERE thread_id = $1
         AND status = 'draft'
         AND id <> $2`,
      [threadId, usedSuggestionId]
    );
  }

  // Emit event
  await emitMessageCreated(
    threadId,
    message.id,
    'practitioner',
    practitionerId,
    {
      domain: thread.domain,
      channel_type: message.channel_type,
      message_type: message.message_type || undefined,
      urgency: message.urgency,
    }
  );

  return message;
}

/**
 * Mark messages as read.
 */
export async function markMessagesRead(
  practitionerId: string,
  threadId: string,
  messageIds?: string[]
): Promise<number> {
  // Verify thread
  const thread = await queryOne<{ id: string }>(
    `SELECT id FROM comms_threads
     WHERE id = $1 AND practitioner_id = $2`,
    [threadId, practitionerId]
  );

  if (!thread) {
    throw new Error('Thread not found');
  }

  let result;
  if (messageIds && messageIds.length > 0) {
    // Mark specific messages
    result = await query(
      `UPDATE comms_messages
       SET delivery_status = 'read', read_at = NOW()
       WHERE thread_id = $1
         AND id = ANY($2)
         AND sender_type = 'client'
         AND delivery_status != 'read'`,
      [threadId, messageIds]
    );
  } else {
    // Mark all client messages in thread
    result = await query(
      `UPDATE comms_messages
       SET delivery_status = 'read', read_at = NOW()
       WHERE thread_id = $1
         AND sender_type = 'client'
         AND delivery_status != 'read'`,
      [threadId]
    );
  }

  return result.rowCount || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// THREAD CREATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find or create a thread for client communication.
 */
export async function findOrCreateThread(
  practitionerId: string,
  clientId: string,
  domain: CommsDomain = 'clinical',
  threadType: CommsThreadType = 'between_session'
): Promise<CommsThread> {
  // Try to find existing active thread
  const existing = await queryOne<CommsThread>(
    `SELECT * FROM comms_threads
     WHERE practitioner_id = $1
       AND client_id = $2
       AND domain = $3
       AND thread_type = $4
       AND status = 'active'`,
    [practitionerId, clientId, domain, threadType]
  );

  if (existing) {
    return existing;
  }

  // Create new thread
  const participants = {
    practitioner_id: practitionerId,
    client_id: clientId,
  };

  const thread = await queryOne<CommsThread>(
    `INSERT INTO comms_threads (
      domain,
      thread_type,
      participants,
      practitioner_id,
      client_id
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [domain, threadType, JSON.stringify(participants), practitionerId, clientId]
  );

  if (!thread) {
    throw new Error('Failed to create thread');
  }

  // Emit event
  await emitThreadCreated(
    thread.id,
    'system',
    null,
    { domain, thread_type: threadType, participants }
  );

  return thread;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatCheckDaysHelper(days: string[]): string {
  const dayAbbrev: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return days.map(d => dayAbbrev[d] || d).join(', ');
}
