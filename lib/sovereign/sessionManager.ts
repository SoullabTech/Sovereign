// backend: lib/sovereign/sessionManager.ts
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { TurnGeneration } from '@/lib/provenance/turnGeneration';
import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';

export type ConversationExchange = {
  timestamp: string;
  userMessage: string;
  maiaResponse: string;
  meta?: Record<string, unknown>;
};

export type MaiaSession = {
  id: string;
  created_at: string;
  updated_at: string;
  turn_count: number;
  conversation_history?: ConversationExchange[];
};

export async function ensureSession(sessionId?: string): Promise<MaiaSession> {
  // Normalize: treat empty string as missing (generates new UUID)
  if (sessionId !== undefined && !sessionId.trim()) {
    console.warn('[Session] Normalized empty sessionId → new UUID', { source: 'ensureSession' });
  }
  const id = (sessionId && sessionId.trim()) || randomUUID();

  // Single upsert instead of SELECT + UPDATE/INSERT
  const result = await query<MaiaSession>(
    `
    INSERT INTO maia_sessions (id)
    VALUES ($1)
    ON CONFLICT (id) DO UPDATE
      SET updated_at = NOW()
    RETURNING id, created_at, updated_at, turn_count, conversation_history
    `,
    [id]
  );

  return result.rows[0];
}

export async function incrementTurnCount(sessionId: string): Promise<number> {
  const result = await query<{ turn_count: number }>(
    `UPDATE maia_sessions
     SET turn_count = turn_count + 1, updated_at = NOW()
     WHERE id = $1
     RETURNING turn_count`,
    [sessionId]
  );
  return result.rows[0]?.turn_count ?? 1;
}

export async function addConversationExchange(
  sessionId: string,
  userMessage: string,
  maiaResponse: string,
  meta?: Record<string, unknown>
): Promise<void> {
  // SANCTUARY (S1): resolve the per-turn posture from the request-derived meta
  // and guard BOTH content lanes this function writes — the session-level
  // conversation_history jsonb (the lane that escaped in SANC-20260614-01) and
  // conversation_turns. The posture governing this turn is the posture in
  // force when the turn occurred; the session's stored mode is not consulted.
  const posture = TurnPosture.resolve(meta);
  // The same meta that carries the posture signal carries the member's action
  // class. Absent (legacy client) resolves to `unknown-generation`.
  const generation = TurnGeneration.resolve(meta);
  if (!contentWritable(posture, 'sessionManager.addConversationExchange', sessionId)) {
    return;
  }

  const exchange: ConversationExchange = {
    timestamp: new Date().toISOString(),
    userMessage,
    maiaResponse,
    meta
  };

  // Update session-level history (legacy, for within-session continuity)
  await query(
    `UPDATE maia_sessions
     SET conversation_history = COALESCE(conversation_history, '[]'::jsonb) || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [sessionId, JSON.stringify(exchange)]
  );

  // CRITICAL: Also persist to conversation_turns for cross-session memory
  // This is what getConversationHistory() reads from
  const userId = (meta?.userId as string) || (meta?.memberId as string);
  if (userId) {
    try {
      // One exchange identity per member action. Callers that also write the
      // same exchange directly (maiaService, /api/voice/persist) pass their
      // request-scoped id through meta, so the store's
      // ON CONFLICT (exchange_id, seq) guard collapses the second write instead
      // of persisting the exchange twice. Without an id the guard is inert —
      // a partial index cannot fire on NULL — which is how one member action
      // became four rows on 2026-07-23.
      const exchangeId = typeof meta?.exchangeId === 'string' ? meta.exchangeId : undefined;
      await TurnsStore.addExchange(posture, generation, userId, sessionId, userMessage, maiaResponse, exchangeId);
    } catch (err) {
      // Non-blocking: don't break the conversation if turns storage fails
      console.warn('[SessionManager] Failed to persist turns:', err);
    }
  }
}

export async function getSessionWithHistory(sessionId: string): Promise<MaiaSession | null> {
  const result = await query<MaiaSession>(
    `SELECT id, created_at, updated_at, turn_count, conversation_history
     FROM maia_sessions
     WHERE id = $1`,
    [sessionId]
  );

  return result.rows[0] || null;
}

/**
 * Get conversation history from conversation_turns table.
 *
 * IMPORTANT: This reads from conversation_turns (where TurnsStore writes),
 * NOT from maia_sessions.conversation_history (which is not populated).
 *
 * Transforms individual turns back into paired ConversationExchange format.
 */
export async function getConversationHistory(sessionId: string, limit = 10): Promise<ConversationExchange[]> {
  // Query conversation_turns for this session's messages
  const result = await query<{ role: 'user' | 'assistant'; content: string; created_at: string }>(
    `SELECT role, content, created_at
     FROM conversation_turns
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  const turns = result.rows ?? [];

  if (turns.length === 0) {
    return [];
  }

  // Transform individual turns into paired ConversationExchange format
  return transformTurnsToExchanges(turns, limit);
}

/**
 * Get cross-session conversation history for a user.
 * This provides continuity across multiple sessions - MAIA remembers you.
 *
 * @param userId - The user/member ID
 * @param limit - Maximum number of exchanges to return (default 10)
 * @param excludeSessionId - Optionally exclude current session's turns
 */
export async function getUserConversationHistory(
  userId: string,
  limit = 10,
  excludeSessionId?: string
): Promise<ConversationExchange[]> {
  // Get user's recent turns across all sessions
  const turns = await TurnsStore.getRecentTurns(userId, limit * 2);

  if (turns.length === 0) {
    return [];
  }

  // Transform to exchanges
  return transformTurnsToExchanges(
    turns.map(t => ({ role: t.role, content: t.content, created_at: t.createdAt })),
    limit
  );
}

/**
 * Helper: Transform raw turns into paired ConversationExchange format
 */
function transformTurnsToExchanges(
  turns: Array<{ role: 'user' | 'assistant'; content: string; created_at: string }>,
  limit: number
): ConversationExchange[] {
  const exchanges: ConversationExchange[] = [];

  for (let i = 0; i < turns.length - 1; i += 2) {
    const userTurn = turns[i];
    const assistantTurn = turns[i + 1];

    // Only create exchange if we have a valid user→assistant pair
    if (userTurn?.role === 'user' && assistantTurn?.role === 'assistant') {
      exchanges.push({
        timestamp: userTurn.created_at,
        userMessage: userTurn.content,
        maiaResponse: assistantTurn.content
      });
    }
  }

  // Return the most recent exchanges, up to the limit
  return exchanges.slice(-limit);
}

// Initialize the session table (create if not exists)
export async function initializeSessionTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS maia_sessions (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      turn_count INTEGER NOT NULL DEFAULT 0,
      conversation_history JSONB DEFAULT '[]'::jsonb
    )
  `);

  // Add conversation_history column to existing tables if it doesn't exist
  await query(`
    ALTER TABLE maia_sessions
    ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb
  `);
}
