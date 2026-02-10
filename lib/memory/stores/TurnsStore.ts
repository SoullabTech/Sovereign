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
      ORDER BY created_at DESC
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
      ORDER BY created_at ASC
      `,
      [sessionId]
    );

    return result.rows ?? [];
  },

  /**
   * Store a new turn
   */
  async addTurn(turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<string | null> {
    const result = await query<{ id: string }>(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content, meta, parent_turn_id)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      RETURNING id
      `,
      [
        turn.userId,
        turn.sessionId ?? null,
        turn.role,
        turn.content,
        turn.meta ? JSON.stringify(turn.meta) : '{}',
        turn.parentTurnId ?? null,
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
   * Store a user message and assistant response pair
   */
  async addExchange(
    userId: string,
    sessionId: string | undefined,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    await query(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content)
      VALUES
        ($1, $2, 'user', $3),
        ($1, $2, 'assistant', $4)
      `,
      [userId, sessionId ?? null, userMessage, assistantResponse]
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
