/**
 * COMMS SPINE: Reply Suggestion Service
 *
 * MAIA suggests, practitioner chooses.
 * Every send is a practitioner action.
 *
 * Phase 3A: Generate draft reply suggestions based on:
 * - Message classification (type, urgency)
 * - Thread context (client, history)
 * - Policy (crisis copy, boundaries)
 * - Safety flags (if unacknowledged, only safe suggestions)
 *
 * @module lib/comms/ReplySuggestionService
 */

import { query, queryOne } from '../db/postgres';
import { getEffectivePolicy } from './ThreadService';
import type { CommsMessageType, CommsUrgency, CommsDomain, CommsPolicy } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SuggestionKind = 'reply' | 'follow_up' | 'boundary' | 'safety';
export type SuggestionStatus = 'draft' | 'dismissed' | 'sent' | 'superseded';

export interface ReplySuggestion {
  id: string;
  thread_id: string;
  message_id: string;
  practitioner_id: string;
  kind: SuggestionKind;
  title: string | null;
  suggested_text: string;
  confidence: number;
  rationale: string | null;
  status: SuggestionStatus;
  created_at: string;
  updated_at: string;
}

export interface SuggestionFeedback {
  id: string;
  suggestion_id: string;
  practitioner_id: string;
  signal: 1 | -1;
  reason: string | null;
  note: string | null;
  created_at: string;
}

interface GenerateSuggestionsInput {
  thread_id: string;
  message_id?: string; // If not provided, uses latest client message
  practitioner_id: string;
}

interface ThreadContextForSuggestion {
  client_name: string | null;
  client_preferred_name: string | null;
  domain: CommsDomain;
  has_unacknowledged_safety: boolean;
  message_type: CommsMessageType | null;
  message_urgency: CommsUrgency;
  message_body: string;
  policy: CommsPolicy;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionTemplate {
  kind: SuggestionKind;
  title: string;
  template: (ctx: ThreadContextForSuggestion) => string;
  confidence: number;
  rationale: string;
}

/**
 * Safe response templates (used when safety flag is unacknowledged)
 */
const SAFETY_TEMPLATES: SuggestionTemplate[] = [
  {
    kind: 'safety',
    title: 'Crisis-Aware Response',
    template: (ctx) => {
      const name = ctx.client_preferred_name || ctx.client_name || 'there';
      return `${name}, thank you for sharing this with me. I want you to know I hear you.\n\n${ctx.policy.crisis_copy}\n\nI will respond during my regular hours (${ctx.policy.check_window_start}–${ctx.policy.check_window_end}).`;
    },
    confidence: 0.9,
    rationale: 'Crisis-aware template with emergency resources and clear boundaries.',
  },
];

/**
 * Standard templates by message type
 */
const TYPE_TEMPLATES: Record<string, SuggestionTemplate[]> = {
  // Wins / celebrations
  win: [
    {
      kind: 'reply',
      title: 'Warm Celebration',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        const greeting = name ? `${name}, ` : '';
        return `${greeting}this is wonderful to hear. Thank you for sharing this with me. I look forward to exploring what made this possible in our next session.`;
      },
      confidence: 0.75,
      rationale: 'Acknowledges win warmly and bridges to session.',
    },
    {
      kind: 'reply',
      title: 'Brief Acknowledgment',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        return name
          ? `That's really great, ${name}. Thank you for sharing.`
          : `That's really great. Thank you for sharing.`;
      },
      confidence: 0.7,
      rationale: 'Short, warm acknowledgment.',
    },
  ],

  // Struggles / challenges
  struggle: [
    {
      kind: 'reply',
      title: 'Supportive Acknowledgment',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        const greeting = name ? `${name}, ` : '';
        return `${greeting}thank you for sharing this with me. It sounds like a difficult moment. Let's explore this together in our next session.`;
      },
      confidence: 0.75,
      rationale: 'Validates struggle and creates space for deeper work.',
    },
    {
      kind: 'boundary',
      title: 'With Boundary Reminder',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        const greeting = name ? `${name}, ` : '';
        return `${greeting}I hear you, and I want to make space for this.\n\nI check messages during ${ctx.policy.check_window_start}–${ctx.policy.check_window_end}. If you need support before then:\n\n${ctx.policy.crisis_copy}`;
      },
      confidence: 0.7,
      rationale: 'Supportive with clear boundaries and resources.',
    },
  ],

  // Questions
  question: [
    {
      kind: 'reply',
      title: 'Acknowledge + Bridge',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        const greeting = name ? `${name}, ` : '';
        return `${greeting}good question. I'd like to explore this with you in our next session so we can give it the attention it deserves.`;
      },
      confidence: 0.7,
      rationale: 'Acknowledges question, defers to session for depth.',
    },
  ],

  // Reflections
  reflection: [
    {
      kind: 'reply',
      title: 'Encourage Reflection',
      template: (ctx) => {
        const name = ctx.client_preferred_name || ctx.client_name || '';
        const greeting = name ? `${name}, ` : '';
        return `${greeting}thank you for this reflection. I appreciate you taking the time to notice and articulate this. We'll continue building on this awareness together.`;
      },
      confidence: 0.7,
      rationale: 'Validates reflection and encourages continued awareness.',
    },
  ],

  // Logistics
  logistics: [
    {
      kind: 'reply',
      title: 'Professional Response',
      template: () => `Thank you for letting me know. I'll follow up on this shortly.`,
      confidence: 0.8,
      rationale: 'Clean, professional logistics acknowledgment.',
    },
  ],
};

/**
 * Default templates when no specific type matches
 */
const DEFAULT_TEMPLATES: SuggestionTemplate[] = [
  {
    kind: 'reply',
    title: 'Warm Acknowledgment',
    template: (ctx) => {
      const name = ctx.client_preferred_name || ctx.client_name || '';
      const greeting = name ? `${name}, ` : '';
      return `${greeting}thank you for sharing this with me. I've received your message and will give it thought.`;
    },
    confidence: 0.6,
    rationale: 'Generic warm acknowledgment.',
  },
  {
    kind: 'boundary',
    title: 'With Boundaries',
    template: (ctx) => {
      const name = ctx.client_preferred_name || ctx.client_name || '';
      const greeting = name ? `${name}, t` : 'T';
      return `${greeting}hank you for reaching out. I check messages ${ctx.policy.check_window_start}–${ctx.policy.check_window_end}.\n\nIf this needs immediate attention:\n${ctx.policy.crisis_copy}`;
    },
    confidence: 0.5,
    rationale: 'Generic with clear boundaries.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate reply suggestions for a message.
 */
export async function generateSuggestions(
  input: GenerateSuggestionsInput
): Promise<ReplySuggestion[]> {
  // Get thread context
  const context = await getThreadContextForSuggestion(
    input.thread_id,
    input.practitioner_id,
    input.message_id
  );

  if (!context) {
    return [];
  }

  // Select templates based on context
  let templates: SuggestionTemplate[];

  if (context.has_unacknowledged_safety) {
    // Safety mode: only return crisis-aware suggestions
    templates = SAFETY_TEMPLATES;
  } else {
    // Normal mode: get templates by message type
    const typeKey = context.message_type || 'default';
    templates = TYPE_TEMPLATES[typeKey] || DEFAULT_TEMPLATES;

    // Limit to 2-3 suggestions
    templates = templates.slice(0, 3);
  }

  // Generate and store suggestions
  const suggestions: ReplySuggestion[] = [];

  for (const template of templates) {
    const suggestion = await createSuggestion({
      thread_id: input.thread_id,
      message_id: context.message_id,
      practitioner_id: input.practitioner_id,
      kind: template.kind,
      title: template.title,
      suggested_text: template.template(context),
      confidence: template.confidence,
      rationale: template.rationale,
    });

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

/**
 * Get suggestions for a thread (most recent first).
 */
export async function getSuggestions(
  threadId: string,
  practitionerId: string,
  options: { status?: SuggestionStatus; limit?: number } = {}
): Promise<ReplySuggestion[]> {
  const { status, limit = 10 } = options;

  let sql = `
    SELECT s.*
    FROM comms_reply_suggestions s
    JOIN comms_threads t ON t.id = s.thread_id
    WHERE s.thread_id = $1
      AND t.practitioner_id = $2
  `;
  const params: (string | number)[] = [threadId, practitionerId];

  if (status) {
    sql += ` AND s.status = $3`;
    params.push(status);
  }

  sql += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query<ReplySuggestion>(sql, params);
  return result.rows;
}

/**
 * Get suggestions for a specific message.
 */
export async function getSuggestionsForMessage(
  messageId: string,
  practitionerId: string
): Promise<ReplySuggestion[]> {
  const result = await query<ReplySuggestion>(
    `SELECT s.*
     FROM comms_reply_suggestions s
     JOIN comms_threads t ON t.id = s.thread_id
     WHERE s.message_id = $1
       AND t.practitioner_id = $2
       AND s.status = 'draft'
     ORDER BY s.confidence DESC, s.created_at DESC`,
    [messageId, practitionerId]
  );
  return result.rows;
}

/**
 * Dismiss a suggestion.
 */
export async function dismissSuggestion(
  suggestionId: string,
  practitionerId: string
): Promise<ReplySuggestion | null> {
  const result = await queryOne<ReplySuggestion>(
    `UPDATE comms_reply_suggestions s
     SET status = 'dismissed', updated_at = NOW()
     FROM comms_threads t
     WHERE s.id = $1
       AND s.thread_id = t.id
       AND t.practitioner_id = $2
       AND s.status = 'draft'
     RETURNING s.*`,
    [suggestionId, practitionerId]
  );
  return result;
}

/**
 * Mark a suggestion as sent (when practitioner uses it).
 */
export async function markSuggestionSent(
  suggestionId: string,
  practitionerId: string
): Promise<ReplySuggestion | null> {
  const result = await queryOne<ReplySuggestion>(
    `UPDATE comms_reply_suggestions s
     SET status = 'sent', updated_at = NOW()
     FROM comms_threads t
     WHERE s.id = $1
       AND s.thread_id = t.id
       AND t.practitioner_id = $2
     RETURNING s.*`,
    [suggestionId, practitionerId]
  );
  return result;
}

/**
 * Supersede old suggestions when new message arrives.
 */
export async function supersedeSuggestions(
  threadId: string,
  excludeMessageId?: string
): Promise<number> {
  let sql = `
    UPDATE comms_reply_suggestions
    SET status = 'superseded', updated_at = NOW()
    WHERE thread_id = $1
      AND status = 'draft'
  `;
  const params: string[] = [threadId];

  if (excludeMessageId) {
    sql += ` AND message_id != $2`;
    params.push(excludeMessageId);
  }

  const result = await query(sql, params);
  return result.rowCount || 0;
}

/**
 * Submit feedback on a suggestion.
 */
export async function submitSuggestionFeedback(
  suggestionId: string,
  practitionerId: string,
  signal: 1 | -1,
  reason?: string,
  note?: string
): Promise<SuggestionFeedback | null> {
  // Verify suggestion belongs to practitioner
  const suggestion = await queryOne<{ id: string }>(
    `SELECT s.id
     FROM comms_reply_suggestions s
     JOIN comms_threads t ON t.id = s.thread_id
     WHERE s.id = $1 AND t.practitioner_id = $2`,
    [suggestionId, practitionerId]
  );

  if (!suggestion) {
    return null;
  }

  const result = await queryOne<SuggestionFeedback>(
    `INSERT INTO comms_reply_suggestion_feedback (suggestion_id, practitioner_id, signal, reason, note)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (suggestion_id, practitioner_id)
     DO UPDATE SET
       signal = EXCLUDED.signal,
       reason = EXCLUDED.reason,
       note = EXCLUDED.note
     RETURNING *`,
    [suggestionId, practitionerId, signal, reason || null, note || null]
  );

  return result;
}

/**
 * Get feedback for a suggestion.
 */
export async function getSuggestionFeedback(
  suggestionId: string,
  practitionerId: string
): Promise<SuggestionFeedback | null> {
  return queryOne<SuggestionFeedback>(
    `SELECT * FROM comms_reply_suggestion_feedback
     WHERE suggestion_id = $1 AND practitioner_id = $2`,
    [suggestionId, practitionerId]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface ExtendedThreadContext extends ThreadContextForSuggestion {
  message_id: string;
}

async function getThreadContextForSuggestion(
  threadId: string,
  practitionerId: string,
  messageId?: string
): Promise<ExtendedThreadContext | null> {
  // Get thread with client info
  const thread = await queryOne<{
    id: string;
    domain: CommsDomain;
    client_id: string | null;
    client_name: string | null;
    client_preferred_name: string | null;
  }>(
    `SELECT t.id, t.domain, t.client_id,
            pc.name as client_name, pc.preferred_name as client_preferred_name
     FROM comms_threads t
     LEFT JOIN practitioner_clients pc ON pc.id = t.client_id
     WHERE t.id = $1 AND t.practitioner_id = $2`,
    [threadId, practitionerId]
  );

  if (!thread) {
    return null;
  }

  // Get the message to respond to (either provided or latest client message)
  let message: {
    id: string;
    body: string;
    message_type: CommsMessageType | null;
    urgency: CommsUrgency;
  } | null = null;

  if (messageId) {
    message = await queryOne(
      `SELECT id, body, message_type, urgency
       FROM comms_messages
       WHERE id = $1 AND thread_id = $2`,
      [messageId, threadId]
    );
  } else {
    // Get latest client message
    message = await queryOne(
      `SELECT id, body, message_type, urgency
       FROM comms_messages
       WHERE thread_id = $1 AND sender_type = 'client'
       ORDER BY created_at DESC
       LIMIT 1`,
      [threadId]
    );
  }

  if (!message) {
    return null;
  }

  // Check for unacknowledged safety flags
  const safetyFlag = await queryOne<{ id: string }>(
    `SELECT id FROM comms_safety_flags
     WHERE thread_id = $1 AND acknowledged_at IS NULL
     LIMIT 1`,
    [threadId]
  );

  // Get policy
  const policy = await getEffectivePolicy(practitionerId, thread.client_id, thread.domain);

  return {
    message_id: message.id,
    client_name: thread.client_name,
    client_preferred_name: thread.client_preferred_name,
    domain: thread.domain,
    has_unacknowledged_safety: !!safetyFlag,
    message_type: message.message_type,
    message_urgency: message.urgency,
    message_body: message.body,
    policy,
  };
}

interface CreateSuggestionInput {
  thread_id: string;
  message_id: string;
  practitioner_id: string;
  kind: SuggestionKind;
  title: string | null;
  suggested_text: string;
  confidence: number;
  rationale: string | null;
}

async function createSuggestion(input: CreateSuggestionInput): Promise<ReplySuggestion | null> {
  return queryOne<ReplySuggestion>(
    `INSERT INTO comms_reply_suggestions
       (thread_id, message_id, practitioner_id, kind, title, suggested_text, confidence, rationale)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.thread_id,
      input.message_id,
      input.practitioner_id,
      input.kind,
      input.title,
      input.suggested_text,
      input.confidence,
      input.rationale,
    ]
  );
}
