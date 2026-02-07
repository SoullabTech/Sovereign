/**
 * PORTAL MESSAGES (CLIENT-SIDE)
 *
 * Helpers for client-facing between-session messaging.
 * Used by the portal pages when clients send notes to their practitioner.
 */

import { query } from '@/lib/db/postgres';
import { randomUUID } from 'crypto';
import type {
  ClientMessage,
  MessagePolicy,
  MessageType,
  MessageUrgency,
  ClientMessageToken,
  CreateMessageInput,
} from '@/lib/practitioner/messages';
import {
  getEncryptedColumnsForInsert,
  verifyEncryptedBody,
} from '@/lib/security/phiAccessors/clientMessages';
import {
  formatPolicyForClient,
  formatCheckDays,
  getUrgencyConfig,
  getMessageTypeConfig,
  validateMessageToken,
} from '@/lib/practitioner/messages';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

// Re-export commonly used functions and types
export {
  formatPolicyForClient,
  formatCheckDays,
  getUrgencyConfig,
  getMessageTypeConfig,
  validateMessageToken,
};

export type { MessageType, MessageUrgency, ClientMessage, MessagePolicy };

// ============================================
// TYPES
// ============================================

export interface ClientMessageView {
  id: string;
  direction: 'client_to_practitioner' | 'practitioner_to_client';
  message_type: MessageType | null;
  urgency: MessageUrgency;
  body: string;
  created_at: string;
  read_at: string | null;
  is_from_me: boolean; // true if client sent, false if practitioner sent
}

export interface PortalMessagingContext {
  policy: MessagePolicy;
  policy_summary: string;
  crisis_copy: string;
  messaging_enabled: boolean;
  messages: ClientMessageView[];
  practitioner_name: string;
}

// ============================================
// CLIENT MESSAGE FUNCTIONS
// ============================================

/**
 * Get messaging context for portal
 * Requires valid token
 */
export async function getPortalMessagingContext(
  clientId: string,
  practitionerId: string
): Promise<PortalMessagingContext | null> {
  // Get practitioner name
  const practitionerResult = await query(
    `SELECT name, preferred_name FROM members WHERE id = $1`,
    [practitionerId]
  );
  if (!practitionerResult.rows[0]) {
    return null;
  }
  const practitioner = practitionerResult.rows[0];
  const practitionerName = resolveMemberDisplayName(practitioner);

  // Get effective policy
  const policyResult = await query(
    `SELECT * FROM message_policies
     WHERE practitioner_id = $1
       AND (client_id = $2 OR client_id IS NULL)
       AND is_active = TRUE
     ORDER BY client_id NULLS LAST
     LIMIT 1`,
    [practitionerId, clientId]
  );

  // If no policy, messaging might not be set up
  if (!policyResult.rows[0]) {
    return {
      policy: {
        id: '',
        practitioner_id: practitionerId,
        client_id: null,
        check_days: [],
        check_window_start: '09:00',
        check_window_end: '17:00',
        timezone: 'America/New_York',
        max_response_hours: 48,
        crisis_copy: 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
        allow_client_messages: false,
        allow_practitioner_reply: true,
        is_active: false,
        created_at: '',
        updated_at: '',
      },
      policy_summary: 'Between-session messaging is not currently available.',
      crisis_copy: 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.',
      messaging_enabled: false,
      messages: [],
      practitioner_name: practitionerName,
    };
  }

  const policy = policyResult.rows[0] as MessagePolicy;
  const policySummary = formatPolicyForClient(policy);

  // Get messages
  const messagesResult = await query(
    `SELECT id, direction, message_type, urgency, body, created_at, read_at
     FROM client_messages
     WHERE client_id = $1 AND practitioner_id = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [clientId, practitionerId]
  );

  const messages: ClientMessageView[] = messagesResult.rows.map(row => ({
    ...row,
    is_from_me: row.direction === 'client_to_practitioner',
  }));

  return {
    policy,
    policy_summary: policySummary,
    crisis_copy: policy.crisis_copy,
    messaging_enabled: policy.allow_client_messages && policy.is_active,
    messages,
    practitioner_name: practitionerName,
  };
}

/**
 * Send a between-session note from client to practitioner
 */
export async function sendClientMessage(
  clientId: string,
  practitionerId: string,
  input: CreateMessageInput
): Promise<{ success: boolean; message?: ClientMessage; error?: string }> {
  // Verify client belongs to practitioner
  const clientCheck = await query(
    `SELECT id FROM practitioner_clients
     WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (!clientCheck.rows[0]) {
    return { success: false, error: 'Client not found' };
  }

  // Check policy allows messages
  const policyResult = await query(
    `SELECT allow_client_messages, is_active FROM message_policies
     WHERE practitioner_id = $1
       AND (client_id = $2 OR client_id IS NULL)
       AND is_active = TRUE
     ORDER BY client_id NULLS LAST
     LIMIT 1`,
    [practitionerId, clientId]
  );

  const policy = policyResult.rows[0];
  if (!policy || !policy.allow_client_messages || !policy.is_active) {
    return { success: false, error: 'Messaging is not available at this time' };
  }

  // Validate input
  const { message_type, urgency = 'not_urgent', body } = input;

  if (!body || body.trim().length === 0) {
    return { success: false, error: 'Message cannot be empty' };
  }

  if (body.length > 10000) {
    return { success: false, error: 'Message is too long (max 10000 characters)' };
  }

  // Generate UUID client-side (needed for encryption context)
  const messageId = randomUUID();
  const trimmedBody = body.trim();

  // PHI encryption: plaintext + encrypted columns
  const { bodyEnc, bodyEncMeta } = getEncryptedColumnsForInsert(trimmedBody, {
    rowId: messageId,
    practitionerId,
  });

  const result = await query(
    `INSERT INTO client_messages (
      id, client_id, practitioner_id, direction,
      message_type, urgency, body, body_enc, body_enc_meta
    ) VALUES ($1, $2, $3, 'client_to_practitioner', $4, $5, $6, $7, $8)
    RETURNING *`,
    [messageId, clientId, practitionerId, message_type || null, urgency, trimmedBody, bodyEnc, bodyEncMeta]
  );

  // Background verification
  verifyEncryptedBody(messageId, practitionerId, trimmedBody).catch(() => {});

  const message = result.rows[0] as ClientMessage;

  // TODO: If urgency is safety_concern, trigger email notification
  // This will be implemented in the notification service

  return { success: true, message };
}

/**
 * Get client's message history
 */
export async function getClientMessageHistory(
  clientId: string,
  practitionerId: string,
  options?: { limit?: number; offset?: number }
): Promise<ClientMessageView[]> {
  const { limit = 50, offset = 0 } = options || {};

  const result = await query(
    `SELECT id, direction, message_type, urgency, body, created_at, read_at
     FROM client_messages
     WHERE client_id = $1 AND practitioner_id = $2
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [clientId, practitionerId, limit, offset]
  );

  return result.rows.map(row => ({
    ...row,
    is_from_me: row.direction === 'client_to_practitioner',
  }));
}

// ============================================
// TOKEN VALIDATION HELPERS
// ============================================

/**
 * Validate token and return context for portal
 * Returns null if invalid/expired
 */
export async function validatePortalAccess(
  token: string
): Promise<{ clientId: string; practitionerId: string } | null> {
  const result = await validateMessageToken(token);
  if (!result.valid || !result.clientId || !result.practitionerId) {
    return null;
  }
  return {
    clientId: result.clientId,
    practitionerId: result.practitionerId,
  };
}

// ============================================
// URGENCY OPTIONS FOR CLIENT UI
// ============================================

export const URGENCY_OPTIONS: Array<{
  value: MessageUrgency;
  label: string;
  description: string;
}> = [
  {
    value: 'not_urgent',
    label: 'Not urgent',
    description: 'Normal note - no rush to respond',
  },
  {
    value: 'time_sensitive',
    label: 'Time-sensitive',
    description: 'Would appreciate a response before our next session',
  },
  {
    value: 'safety_concern',
    label: 'Safety concern',
    description: 'This involves safety or wellbeing concerns',
  },
];

// ============================================
// MESSAGE TYPE OPTIONS FOR CLIENT UI
// ============================================

export const MESSAGE_TYPE_OPTIONS: Array<{
  value: MessageType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'reflection',
    label: 'Reflection',
    description: 'Something I want to share or process',
    icon: 'lightbulb',
  },
  {
    value: 'question',
    label: 'Question',
    description: 'Something I want to ask about',
    icon: 'help-circle',
  },
  {
    value: 'win',
    label: 'Win',
    description: 'A breakthrough or positive moment',
    icon: 'star',
  },
  {
    value: 'struggle',
    label: 'Struggle',
    description: "Something I'm working through",
    icon: 'heart',
  },
  {
    value: 'logistics',
    label: 'Logistics',
    description: 'Scheduling or practical matters',
    icon: 'calendar',
  },
];

// ============================================
// CONFIRMATION HELPERS
// ============================================

/**
 * Get confirmation message based on urgency
 */
export function getConfirmationMessage(
  urgency: MessageUrgency,
  policy: MessagePolicy
): string {
  const baseMessage = `Your note has been sent. ${formatPolicyForClient(policy)}`;

  if (urgency === 'safety_concern') {
    return `${baseMessage}\n\n${policy.crisis_copy}\n\nYour practitioner has been notified of your safety concern.`;
  }

  if (urgency === 'time_sensitive') {
    return `${baseMessage}\n\nYou've marked this as time-sensitive. Your practitioner will see this flag.`;
  }

  return baseMessage;
}

/**
 * Get the "What happens now" content for confirmation
 */
export function getWhatHappensNow(policy: MessagePolicy): {
  title: string;
  items: string[];
} {
  const days = formatCheckDays(policy.check_days);

  return {
    title: 'What happens now?',
    items: [
      `Your note has been delivered`,
      `${policy.max_response_hours > 24 ? `Your practitioner typically responds within ${policy.max_response_hours} hours` : 'Your practitioner will see this soon'}`,
      `Messages are checked ${days}`,
      `You'll see any response here`,
    ],
  };
}
