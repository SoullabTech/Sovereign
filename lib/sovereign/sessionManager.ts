// backend: lib/sovereign/sessionManager.ts
import { query } from '@/lib/db';
import type { DisplacedExchange } from '@/lib/maia/continuity/sessionRecovery';
import { randomUUID } from 'crypto';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
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
      await TurnsStore.addExchange(posture, userId, sessionId, userMessage, maiaResponse, exchangeId);
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
  return (await getSessionContinuityWindow(sessionId, limit)).exchanges;
}

/**
 * AIN-CONTEXT-01 · A6 — the windowed history AND the durable total, from ONE read.
 *
 * The SQL below has never carried a LIMIT: it already returns every turn in the
 * session and the window is applied in memory afterwards. So counting what was
 * paired costs nothing and reads NO additional rows.
 *
 * ⛔ R5: THIS WIDENS NOTHING. `exchanges` is byte-identical to what
 * getConversationHistory returned before A6 — same query, same pairing, same slice.
 * The only new thing is that the total which the pairing already computed is now
 * returned instead of discarded.
 *
 * ⭐ R2: `durableCompletedExchanges` and the caller's represented count come from the
 * SAME pairing over the SAME rows, so both are in completed exchanges and their
 * difference needs no unit conversion. `maia_sessions.turn_count` counts served
 * REQUESTS and is deliberately not used here.
 */
export interface SessionContinuityWindow {
  /** The windowed history — exactly what getConversationHistory has always returned. */
  exchanges: ConversationExchange[];
  /** Completed exchanges durably recorded for this session, as the pairing sees them. */
  durableCompletedExchanges: number;
  /**
   * L1 · every paired exchange of this session, each carrying durable identity and
   * its position. The caller subtracts whatever its own final aperture carries to
   * obtain the DISPLACED set — aperture size is a tier concern and is deliberately
   * not decided here.
   */
  allExchanges: DisplacedExchange[];
}

export async function getSessionContinuityWindow(
  sessionId: string,
  limit = 10
): Promise<SessionContinuityWindow> {
  // Query conversation_turns for this session's messages
  // `exchange_id` is an EXISTING column (20260301000001) — selecting it is a read,
  // not a migration. It is nullable on rows written before that migration, so the
  // positional fallback below keeps identity durable either way.
  const result = await query<{
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    exchange_id: string | null;
  }>(
    `SELECT role, content, created_at, exchange_id
     FROM conversation_turns
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [sessionId]
  );

  const turns = result.rows ?? [];

  if (turns.length === 0) {
    return { exchanges: [], durableCompletedExchanges: 0, allExchanges: [] };
  }

  const allExchanges = pairTurnsWithIdentity(turns);
  const all = allExchanges.map(toConversationExchange);
  return {
    exchanges: all.slice(-limit),
    durableCompletedExchanges: all.length,
    allExchanges,
  };
}

/**
 * L1 · the same pairing as `pairTurnsToExchanges`, carrying durable identity.
 *
 * ⛔ The pairing RULE is unchanged — same `i += 2` stride, same user→assistant
 * requirement — because A6's depth is derived from it and a different rule here
 * would silently change what `depth` means.
 */
function pairTurnsWithIdentity(
  turns: Array<{
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
    exchange_id?: string | null;
  }>
): DisplacedExchange[] {
  const exchanges: DisplacedExchange[] = [];

  for (let i = 0; i < turns.length - 1; i += 2) {
    const userTurn = turns[i];
    const assistantTurn = turns[i + 1];

    if (userTurn?.role === 'user' && assistantTurn?.role === 'assistant') {
      const index = exchanges.length;
      exchanges.push({
        exchangeKey: userTurn.exchange_id ?? `idx:${index}`,
        index,
        timestamp: userTurn.created_at,
        userMessage: userTurn.content,
        maiaResponse: assistantTurn.content,
      });
    }
  }

  return exchanges;
}

function toConversationExchange(e: DisplacedExchange): ConversationExchange {
  return {
    timestamp: e.timestamp,
    userMessage: e.userMessage,
    maiaResponse: e.maiaResponse,
  };
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
  // Return the most recent exchanges, up to the limit
  return pairTurnsToExchanges(turns).slice(-limit);
}

/**
 * Pair raw turns into exchanges WITHOUT windowing.
 *
 * Extracted verbatim from transformTurnsToExchanges for AIN-CONTEXT-01 · A6, so the
 * total and the window are produced by one operation and are therefore in the same
 * unit (R2). ⛔ The pairing logic is unchanged — including its fixed i += 2 stride and
 * its user→assistant role test, whose interaction with an unpaired turn is a finding
 * routed out by ACT 1 §3.2 and NOT repaired here.
 */
function pairTurnsToExchanges(
  turns: Array<{ role: 'user' | 'assistant'; content: string; created_at: string }>
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

  return exchanges;
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
