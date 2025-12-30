// backend: lib/sovereign/sessionManager.ts
import { query } from '@/lib/db';
import { randomUUID } from 'crypto';

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
  const id = sessionId ?? randomUUID();

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

export async function incrementTurnCount(sessionId: string): Promise<void> {
  await query(
    `UPDATE maia_sessions
     SET turn_count = turn_count + 1, updated_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
}

export async function addConversationExchange(
  sessionId: string,
  userMessage: string,
  maiaResponse: string,
  meta?: Record<string, unknown>
): Promise<void> {
  const exchange: ConversationExchange = {
    timestamp: new Date().toISOString(),
    userMessage,
    maiaResponse,
    meta
  };

  await query(
    `UPDATE maia_sessions
     SET conversation_history = COALESCE(conversation_history, '[]'::jsonb) || $2::jsonb,
         updated_at = NOW()
     WHERE id = $1`,
    [sessionId, JSON.stringify(exchange)]
  );
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
