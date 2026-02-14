/**
 * Wisdom Graph Service
 *
 * Fire-and-forget event emission for the Wisdom Explorer substrate.
 * Records when Library wisdom touches a member's session so the
 * graph engine has signal to compute over.
 *
 * Design:
 *   - emitWisdomEvent() is fire-and-forget (never blocks oracle)
 *   - ensureNode() lazily creates/updates member-scoped nodes
 *   - No conversation content is stored — only structural references
 *   - Member-scoped: every operation requires a member_id
 *
 * The service is the write path. Read/query comes later (Explorer API).
 */

import { query } from '@/lib/db/postgres';

// =============================================================================
// TYPES
// =============================================================================

export type WisdomEventType = 'retrieved' | 'session_used' | 'saved' | 'shared';

export interface WisdomEvent {
  memberId: string;
  eventType: WisdomEventType;
  refType?: string;       // 'library_chunk' | 'library_source'
  refId: string;          // chunk or source ID
  sourceId?: string;      // library_sources.id (for fast source-level queries)
  element?: string;       // element at time of event
  phase?: number;         // phase at time of event
  sessionId?: string;     // conversation session
  meta?: Record<string, any>;  // extra context (score, query_snippet, etc.)
}

// =============================================================================
// EVENT EMISSION (fire-and-forget)
// =============================================================================

/**
 * Record a wisdom event. Fire-and-forget — never awaited in the oracle path.
 *
 * Usage:
 *   emitWisdomEvent({ memberId, eventType: 'retrieved', refId: chunkId, ... });
 *   // No await — fire and forget
 */
export function emitWisdomEvent(event: WisdomEvent): void {
  // Fire-and-forget: errors are logged but never propagate
  _emitWisdomEventAsync(event).catch(err => {
    console.warn('[WisdomGraph] Event emission failed (non-critical):', err?.message || err);
  });
}

async function _emitWisdomEventAsync(event: WisdomEvent): Promise<void> {
  await query(
    `INSERT INTO wisdom_events (member_id, event_type, ref_type, ref_id, source_id, element, phase, session_id, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      event.memberId,
      event.eventType,
      event.refType || 'library_chunk',
      event.refId,
      event.sourceId || null,
      event.element || null,
      event.phase || null,
      event.sessionId || null,
      JSON.stringify(event.meta || {}),
    ]
  );
}

// =============================================================================
// BATCH EVENT EMISSION
// =============================================================================

/**
 * Emit multiple wisdom events in a single transaction.
 * Fire-and-forget — used after Library consultation returns multiple chunks.
 */
export function emitWisdomEvents(events: WisdomEvent[]): void {
  if (events.length === 0) return;
  _emitWisdomEventsAsync(events).catch(err => {
    console.warn('[WisdomGraph] Batch event emission failed (non-critical):', err?.message || err);
  });
}

async function _emitWisdomEventsAsync(events: WisdomEvent[]): Promise<void> {
  if (events.length === 0) return;

  // Build a multi-row INSERT for efficiency
  const values: any[] = [];
  const placeholders: string[] = [];

  events.forEach((event, i) => {
    const offset = i * 9;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
    );
    values.push(
      event.memberId,
      event.eventType,
      event.refType || 'library_chunk',
      event.refId,
      event.sourceId || null,
      event.element || null,
      event.phase || null,
      event.sessionId || null,
      JSON.stringify(event.meta || {}),
    );
  });

  await query(
    `INSERT INTO wisdom_events (member_id, event_type, ref_type, ref_id, source_id, element, phase, session_id, meta)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

// =============================================================================
// NODE MANAGEMENT (lazy upsert)
// =============================================================================

/**
 * Ensure a source node exists for this member, incrementing touched_count.
 * Fire-and-forget — called alongside event emission.
 *
 * Creates the node on first encounter, updates on subsequent.
 */
export function ensureSourceNode(
  memberId: string,
  sourceId: string,
  title: string,
  element?: string,
  phase?: number
): void {
  _ensureSourceNodeAsync(memberId, sourceId, title, element, phase).catch(err => {
    console.warn('[WisdomGraph] Node upsert failed (non-critical):', err?.message || err);
  });
}

async function _ensureSourceNodeAsync(
  memberId: string,
  sourceId: string,
  title: string,
  element?: string,
  phase?: number
): Promise<void> {
  await query(
    `INSERT INTO wisdom_nodes (member_id, node_type, ref_type, ref_id, title, element, phase, touched_count, last_seen_at)
     VALUES ($1, 'source', 'library_source', $2, $3, $4, $5, 1, NOW())
     ON CONFLICT (member_id, ref_type, ref_id)
     DO UPDATE SET
       touched_count = wisdom_nodes.touched_count + 1,
       last_seen_at = NOW(),
       element = COALESCE(EXCLUDED.element, wisdom_nodes.element),
       phase = COALESCE(EXCLUDED.phase, wisdom_nodes.phase),
       updated_at = NOW()`,
    [memberId, sourceId, title, element || null, phase || null]
  );
}

// =============================================================================
// QUERY HELPERS (for future Explorer/Graph endpoints)
// =============================================================================

/**
 * Get a member's touched sources, ordered by recency.
 * Used by the Wisdom Explorer to show "What's been alive."
 */
export async function getMemberTouchedSources(
  memberId: string,
  options: { limit?: number; sinceDays?: number } = {}
): Promise<Array<{
  id: string;
  title: string;
  element: string | null;
  phase: number | null;
  touched_count: number;
  last_seen_at: string;
  labels: string[];
}>> {
  const limit = options.limit || 50;
  const sinceDays = options.sinceDays || 90;

  const result = await query(
    `SELECT
       n.id, n.title, n.element, n.phase,
       n.touched_count, n.last_seen_at,
       COALESCE(
         array_agg(DISTINCT l.label) FILTER (WHERE l.label IS NOT NULL),
         '{}'
       ) as labels
     FROM wisdom_nodes n
     LEFT JOIN wisdom_labels l ON l.target_node_id = n.id
     WHERE n.member_id = $1
       AND n.node_type = 'source'
       AND n.last_seen_at >= NOW() - INTERVAL '1 day' * $2
     GROUP BY n.id
     ORDER BY n.last_seen_at DESC
     LIMIT $3`,
    [memberId, sinceDays, limit]
  );

  return result.rows;
}

/**
 * Get "waiting" sources — high relevance, low touch.
 * These are sources semantically close to the member's active themes
 * but not yet surfaced frequently.
 */
export async function getWaitingSources(
  memberId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  title: string;
  element: string | null;
  waiting_score: number;
}>> {
  const result = await query(
    `SELECT id, title, element, waiting_score
     FROM wisdom_nodes
     WHERE member_id = $1
       AND node_type = 'source'
       AND waiting_score > 0
     ORDER BY waiting_score DESC
     LIMIT $2`,
    [memberId, limit]
  );

  return result.rows;
}
