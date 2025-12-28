/**
 * Turns Store
 *
 * Stores and retrieves conversation turns for session recall.
 * This provides the "what did we just talk about" continuity.
 */

import { query } from '../../db/postgres';

export interface ConversationTurn {
  id?: string;
  userId: string;
  sessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
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
  async addTurn(turn: Omit<ConversationTurn, 'id' | 'createdAt'>): Promise<void> {
    await query(
      `
      INSERT INTO conversation_turns (user_id, session_id, role, content)
      VALUES ($1, $2, $3, $4)
      `,
      [turn.userId, turn.sessionId ?? null, turn.role, turn.content]
    );
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
