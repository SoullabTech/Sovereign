/**
 * Turns Store
 *
 * Stores and retrieves conversation turns for session recall.
 * This provides the "what did we just talk about" continuity.
 */

import { query } from '../../db/postgres';
import { TurnPosture, contentWritable } from '../../sanctuary/turnPosture';

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
}

export const TurnsStore = {
  /**
   * Get recent turns for a user (most recent N, returned in chronological order)
   */
  async getRecentTurns(
    userId: string,
    limit: number = 12
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const result = await query<{ role: 'user' | 'assistant'; content: string; createdAt: string }>(
      `
      SELECT
        role,
        content,
        created_at as "createdAt"
      FROM conversation_turns
      WHERE user_id = $1
      ORDER BY created_at DESC, seq DESC
      LIMIT $2
      `,
      [userId, limit]
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
   *
   * SANCTUARY (S1, boundary-enforced): posture REQUIRED; sanctuary or
   * missing/forged posture refuses the write (fail closed, metadata-only log).
   */
  async addTurn(posture: TurnPosture, turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<string | null> {
    if (!contentWritable(posture, 'TurnsStore.addTurn', turn.sessionId)) {
      return null;
    }
    // Note: meta and parent_turn_id are not in the production schema — omitted
    const result = await query<{ id: string }>(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        turn.userId,
        turn.sessionId ?? null,
        turn.role,
        turn.content,
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
  async addTranslation(posture: TurnPosture, opts: {
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

    return this.addTurn(posture, {
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
   * SANCTUARY (S1, boundary-enforced): `posture` is REQUIRED and must be a
   * TurnPosture resolved at the serving boundary. Sanctuary posture — or a
   * missing/forged posture (fail closed) — refuses the write here at the
   * store, regardless of caller behavior. The refusal log carries metadata
   * only. See lib/sanctuary/turnPosture.ts and incident SANC-20260614-01.
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
    posture: TurnPosture,
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string,
    exchangeId?: string
  ): Promise<void> {
    if (!contentWritable(posture, 'TurnsStore.addExchange', sessionId)) {
      return;
    }
    if (!exchangeId) {
      console.warn('[TurnsStore] addExchange called without exchangeId — turns will not be idempotent');
    }
    const eid = exchangeId ?? null;
    // User turn first (seq=0) — use clock_timestamp() so each INSERT gets its
    // own wall-clock value even inside the same transaction.
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at)
       VALUES ($1, $2, 'user', $3, $4, 0, clock_timestamp())
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, userMessage, eid]
    );
    // Assistant turn second (seq=1) — clock_timestamp() will be strictly later
    await query(
      `INSERT INTO conversation_turns (user_id, session_id, role, content, exchange_id, seq, created_at)
       VALUES ($1, $2, 'assistant', $3, $4, 1, clock_timestamp())
       ON CONFLICT (exchange_id, seq) WHERE exchange_id IS NOT NULL DO NOTHING`,
      [userId, sessionId ?? null, assistantResponse, eid]
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
  async pruneOldTurns(userId: string, keepCount: number = 100): Promise<number> {
    const result = await query(
      `
      WITH turns_to_keep AS (
        SELECT id FROM conversation_turns
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      )
      DELETE FROM conversation_turns
      WHERE user_id = $1
        AND id NOT IN (SELECT id FROM turns_to_keep)
      `,
      [userId, keepCount]
    );

    return result.rowCount ?? 0;
  },
};
