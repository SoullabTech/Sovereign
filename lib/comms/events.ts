/**
 * COMMS SPINE: Event System
 *
 * Append-only event emission for audit trail and automation triggers.
 * All communication actions flow through this event system.
 *
 * @module lib/comms/events
 */

import { query } from '@/lib/db';
import type { CommsEventType, CommsSenderType } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// EVENT EMISSION
// ─────────────────────────────────────────────────────────────────────────────

export interface EmitEventOptions {
  thread_id?: string;
  message_id?: string;
  identity_id?: string;
  actor_type?: CommsSenderType;
  actor_id?: string;
  data?: Record<string, unknown>;
}

/**
 * Emit a communication event to the append-only log.
 *
 * Events are immutable once written - they form an audit trail
 * that can be replayed for debugging, analytics, or automation.
 *
 * @example
 * await emitEvent('message.created', {
 *   thread_id: threadId,
 *   message_id: messageId,
 *   actor_type: 'client',
 *   actor_id: clientId,
 *   data: { domain: 'clinical', urgency: 'normal' }
 * });
 */
export async function emitEvent(
  event_type: CommsEventType,
  options: EmitEventOptions = {}
): Promise<string> {
  const {
    thread_id = null,
    message_id = null,
    identity_id = null,
    actor_type = null,
    actor_id = null,
    data = {},
  } = options;

  const result = await query<{ id: string }>(
    `INSERT INTO comms_events (
      event_type,
      thread_id,
      message_id,
      identity_id,
      actor_type,
      actor_id,
      data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [event_type, thread_id, message_id, identity_id, actor_type, actor_id, JSON.stringify(data)]
  );

  return result.rows[0].id;
}

/**
 * Emit multiple events in a single transaction.
 * Useful when a single action triggers multiple events.
 */
export async function emitEvents(
  events: Array<{ type: CommsEventType; options: EmitEventOptions }>
): Promise<string[]> {
  if (events.length === 0) return [];

  // Build multi-row insert
  const values: unknown[] = [];
  const placeholders: string[] = [];

  events.forEach((event, i) => {
    const baseIdx = i * 7;
    placeholders.push(
      `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7})`
    );
    values.push(
      event.type,
      event.options.thread_id || null,
      event.options.message_id || null,
      event.options.identity_id || null,
      event.options.actor_type || null,
      event.options.actor_id || null,
      JSON.stringify(event.options.data || {})
    );
  });

  const result = await query<{ id: string }>(
    `INSERT INTO comms_events (
      event_type,
      thread_id,
      message_id,
      identity_id,
      actor_type,
      actor_id,
      data
    ) VALUES ${placeholders.join(', ')}
    RETURNING id`,
    values
  );

  return result.rows.map(r => r.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT QUERYING (for debugging/analytics)
// ─────────────────────────────────────────────────────────────────────────────

export interface EventQueryOptions {
  thread_id?: string;
  message_id?: string;
  event_types?: CommsEventType[];
  since?: Date;
  limit?: number;
}

/**
 * Query events for a specific thread or message.
 * Useful for debugging and building activity logs.
 */
export async function getEvents(options: EventQueryOptions) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  if (options.thread_id) {
    conditions.push(`thread_id = $${paramIdx++}`);
    params.push(options.thread_id);
  }

  if (options.message_id) {
    conditions.push(`message_id = $${paramIdx++}`);
    params.push(options.message_id);
  }

  if (options.event_types && options.event_types.length > 0) {
    conditions.push(`event_type = ANY($${paramIdx++})`);
    params.push(options.event_types);
  }

  if (options.since) {
    conditions.push(`created_at >= $${paramIdx++}`);
    params.push(options.since);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options.limit || 100;

  const result = await query(
    `SELECT * FROM comms_events
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ${limit}`,
    params
  );

  return result.rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE EMITTERS
// ─────────────────────────────────────────────────────────────────────────────

/** Emit message.created event */
export async function emitMessageCreated(
  thread_id: string,
  message_id: string,
  actor_type: CommsSenderType,
  actor_id: string | null,
  data: {
    domain: string;
    channel_type: string;
    message_type?: string;
    urgency: string;
  }
): Promise<string> {
  return emitEvent('message.created', {
    thread_id,
    message_id,
    actor_type,
    actor_id: actor_id || undefined,
    data,
  });
}

/** Emit safety.flagged event */
export async function emitSafetyFlagged(
  thread_id: string,
  message_id: string,
  data: {
    severity: string;
    detected_by: string;
    confidence?: number;
    cues: string[];
  }
): Promise<string> {
  return emitEvent('safety.flagged', {
    thread_id,
    message_id,
    actor_type: 'maia',
    data,
  });
}

/** Emit safety.acknowledged event */
export async function emitSafetyAcknowledged(
  flag_id: string,
  thread_id: string,
  practitioner_id: string,
  data: { review_note?: string }
): Promise<string> {
  return emitEvent('safety.acknowledged', {
    thread_id,
    actor_type: 'practitioner',
    actor_id: practitioner_id,
    data: { flag_id, ...data },
  });
}

/** Emit maia.message_classified event */
export async function emitMAIAClassified(
  thread_id: string,
  message_id: string,
  data: {
    inferred_type: string | null;
    inferred_urgency: string;
    safety_cues: string[];
    sentiment: number;
    confidence: number;
  }
): Promise<string> {
  return emitEvent('maia.message_classified', {
    thread_id,
    message_id,
    actor_type: 'maia',
    data,
  });
}

/** Emit thread.created event */
export async function emitThreadCreated(
  thread_id: string,
  actor_type: CommsSenderType,
  actor_id: string | null,
  data: {
    domain: string;
    thread_type: string;
    participants: Record<string, unknown>;
  }
): Promise<string> {
  return emitEvent('thread.created', {
    thread_id,
    actor_type,
    actor_id: actor_id || undefined,
    data,
  });
}
