/**
 * Turns Store
 *
 * Stores and retrieves conversation turns for session recall.
 * This provides the "what did we just talk about" continuity.
 */

import { query } from '../../db/postgres';

export interface TurnMeta {
  kind?: 'normal' | 'translation';
  parentTurnId?: string;       // Matches DB column; used for threading in meta if needed
  parentLocalId?: string;      // Client-side ID when parent not yet persisted
  toSystem?: string;
  fromSystem?: string;
  lens?: string;
  style?: string;
  [key: string]: unknown;
}

export interface ConversationTurn {
  id?: string;
  userId: string;
  sessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  meta?: TurnMeta;
  parentTurnId?: string;
  fieldSlug?: string;  // Master field scoping — null = MAIA core
}

export const TurnsStore = {
  /**
   * Get recent turns for a user (most recent N, returned in chronological order).
   *
   * When fieldSlug is provided, only returns turns from that master field.
   * When fieldSlug is undefined, only returns MAIA core turns (field_slug IS NULL).
   * This ensures memory partitioning: masters never see each other's conversations.
   */
  async getRecentTurns(
    userId: string,
    limit: number = 12,
    fieldSlug?: string
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const fieldCondition = fieldSlug
      ? 'AND field_slug = $3'
      : 'AND field_slug IS NULL';
    const params: unknown[] = fieldSlug
      ? [userId, limit, fieldSlug]
      : [userId, limit];

    const result = await query<{ role: 'user' | 'assistant'; content: string; createdAt: string }>(
      `
      SELECT
        role,
        content,
        created_at as "createdAt"
      FROM conversation_turns
      WHERE user_id = $1
      ${fieldCondition}
      ORDER BY created_at DESC, seq DESC
      LIMIT $2
      `,
      params
    );

    // Return in chronological order (oldest first) for natural prompt flow
    return (result.rows ?? []).reverse();
  },

  /**
   * Get turns for a specific session
   */
  async getSessionTurns(
    sessionId: string
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const result = await query<{ role: 'user' | 'assistant'; content: string; createdAt: string }>(
      `
      SELECT
        role,
        content,
        created_at as "createdAt"
      FROM conversation_turns
      WHERE session_id = $1
      ORDER BY created_at ASC, seq ASC
      `,
      [sessionId]
    );

    return result.rows ?? [];
  },

  /**
   * Store a new turn
   */
  async addTurn(turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<string | null> {
    // Note: meta and parent_turn_id are not in the production schema — omitted
    const result = await query<{ id: string }>(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content, field_slug)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [
        turn.userId,
        turn.sessionId ?? null,
        turn.role,
        turn.content,
        turn.fieldSlug ?? null,
      ]
    );
    return result.rows[0]?.id ?? null;
  },

  /**
   * Store a translation turn (assistant response with translation metadata)
   *
   * parentTurnId: Valid UUID FK to parent turn (used for DB threading)
   * parentLocalId: Client-side ID when parent not yet persisted (stored in meta only)
   */
  async addTranslation(opts: {
    userId: string;
    sessionId?: string;
    content: string;
    parentTurnId?: string;     // Valid UUID for FK column
    parentLocalId?: string;    // Non-UUID client ID → stored in meta
    toSystem: string;
    fromSystem?: string;
    lens?: string;
    style?: string;
  }): Promise<string | null> {
    const meta: TurnMeta = {
      kind: 'translation',
      toSystem: opts.toSystem,
      fromSystem: opts.fromSystem ?? 'auto',
      lens: opts.lens ?? 'member-default',
      style: opts.style ?? 'meaning',
      // Store local ID in meta if parent wasn't a valid UUID
      ...(opts.parentLocalId ? { parentLocalId: opts.parentLocalId } : {}),
    };

    return this.addTurn({
      userId: opts.userId,
      sessionId: opts.sessionId,
      role: 'assistant',
      content: opts.content,
      meta,
      parentTurnId: opts.parentTurnId, // Only set if valid UUID
    });
  },

  /**
   * Store a user message and assistant response pair.
   *
   * Uses two sequential INSERTs so created_at timestamps differ by at least
   * one clock tick — guarantees user < assistant ordering when sorted by
   * (created_at ASC, seq ASC).
   *
   * exchangeId: supply the same UUID to make the write idempotent on retry.
   * ON CONFLICT DO NOTHING drops a duplicate silently when exchange_id is set.
   * Omitting exchangeId falls back to the original non-idempotent behaviour.
   */
  async addExchange(
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string,
    exchangeId?: string,
    fieldSlug?: string
  ): Promise<void> {
    if (!exchangeId) {
      console.warn('[TurnsStore] addExchange called without exchangeId — turns will not be idempotent');
    }
    const eid = exchangeId ?? null;
    const fSlug = fieldSlug ?? null;
    // User turn first (seq=0) — use clock_timestamp() so each INSERT gets its
    // own wall-clock value even inside the same transaction.
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at, field_slug)
       VALUES ($1, $2, 'user', $3, $4, 0, clock_timestamp(), $5)
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, userMessage, eid, fSlug]
    );
    // Assistant turn second (seq=1) — clock_timestamp() will be strictly later
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at, field_slug)
       VALUES ($1, $2, 'assistant', $3, $4, 1, clock_timestamp(), $5)
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, assistantResponse, eid, fSlug]
    );
  },

  /**
   * Delete all turns for a session (Sanctuary purge)
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    const result = await query(
      `DELETE FROM conversation_turns WHERE session_id = $1`,
      [sessionId]
    );
    return result.rowCount ?? 0;
  },

  /**
   * Clean up old turns (keep last N per user)
   */
  async pruneOldTurns(userId: string, keepCount: number = 100, fieldSlug?: string): Promise<number> {
    const fieldCondition = fieldSlug
      ? 'AND field_slug = $3'
      : 'AND field_slug IS NULL';
    const params: unknown[] = fieldSlug
      ? [userId, keepCount, fieldSlug]
      : [userId, keepCount];

    const result = await query(
      `
      WITH turns_to_keep AS (
        SELECT id FROM conversation_turns
        WHERE user_id = $1 ${fieldCondition}
        ORDER BY created_at DESC
        LIMIT $2
      )
      DELETE FROM conversation_turns
      WHERE user_id = $1 ${fieldCondition}
        AND id NOT IN (SELECT id FROM turns_to_keep)
      `,
      params
    );

    return result.rowCount ?? 0;
  },
};
