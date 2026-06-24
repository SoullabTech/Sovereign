/**
 * Surface the real conversation_turns ids for the most recent exchange in a
 * session — the enabling read for the member-facing episodic mark gesture
 * (turn-primary provenance).
 *
 * WHY THIS EXISTS
 *   The episodic-mark guard's authority is conversation_turns.id (a uuid). The
 *   client never otherwise sees it: TurnsStore.addExchange returns void and the
 *   numeric metadata.turnId belongs to maia_turns (analytics), not
 *   conversation_turns. This helper hands the client the *real* turn id so a
 *   member can say "remember this" about a specific turn.
 *
 * SCOPE (load-bearing)
 *   This is ENABLEMENT, not authorization. It only tells the client which turn
 *   ids exist for the current exchange. The episodic-mark route
 *   (POST /api/sovereign/episodes/mark) independently re-verifies ownership and
 *   Sanctuary status at mark time, so surfacing an id grants nothing on its own.
 *
 *   Recency-scoped: returns the newest user turn (seq 0) and assistant turn
 *   (seq 1) for the session. A member's conversation is sequential, so the two
 *   newest rows are this exchange. (A pathological concurrent same-session write
 *   could mis-pair, but the guard still verifies whatever id is ultimately
 *   marked, so the worst case is a UX mismatch, never a Sanctuary or ownership
 *   breach.)
 */

import { query } from '@/lib/db/postgres';

export interface ExchangeTurnIds {
  /** conversation_turns.id of the member's turn in this exchange (seq 0). */
  userTurnId: string | null;
  /** conversation_turns.id of MAIA's turn in this exchange (seq 1). */
  assistantTurnId: string | null;
}

export async function surfaceExchangeTurns(
  sessionId: string | null | undefined,
): Promise<ExchangeTurnIds | null> {
  if (!sessionId) return null;
  try {
    const r = await query<{ id: string; role: string }>(
      `SELECT id, role FROM conversation_turns
        WHERE session_id = $1
        ORDER BY created_at DESC, seq DESC
        LIMIT 2`,
      [sessionId],
    );
    let userTurnId: string | null = null;
    let assistantTurnId: string | null = null;
    for (const row of r.rows) {
      if (row.role === 'user' && !userTurnId) userTurnId = row.id;
      else if (row.role === 'assistant' && !assistantTurnId) assistantTurnId = row.id;
    }
    if (!userTurnId && !assistantTurnId) return null;
    return { userTurnId, assistantTurnId };
  } catch (err) {
    // Non-blocking: the conversation must never break because mark-enablement
    // failed. The member simply won't see a mark affordance for this turn.
    console.warn(
      '[surfaceExchangeTurns] failed (non-blocking):',
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
