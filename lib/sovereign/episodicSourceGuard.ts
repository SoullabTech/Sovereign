/**
 * Episodic Source Guard — Sanctuary boundary for the member-marked write path.
 *
 * DOCTRINE (absolute boundary, CLAUDE.md Sanctuary invariants):
 *   "Nothing from a Sanctuary session can be saved, extracted, inferred, or
 *    converted into long-term memory, under any circumstances."
 *
 * TURN-PRIMARY PROVENANCE (load-bearing — decided from a lifecycle receipt).
 *   A marked moment IS a turn. The guard's authority is therefore the TURN:
 *     - Ownership is proven by conversation_turns.user_id (NOT NULL, reliably the
 *       member).
 *     - Sanctuary status is read from the turn's session (mode / privacy_mode)
 *       via join.
 *   maia_sessions.member_id is NEVER used as ownership proof: the live flow
 *   creates sessions id-only (ensureSession), leaving member_id NULL on ~68% of
 *   real continuity sessions. A strict session-ownership match falsely refused
 *   the majority of legitimate moments. sourceSessionId is corroborating metadata
 *   only — stored by the route, never consulted here.
 *
 * FAIL CLOSED. Sanctuary finalize DELETES a sanctuary session's
 * conversation_turns (sessionFinalizer.ts), so a pointer to a sanctuary moment
 * may legitimately not resolve. "Cannot positively confirm this turn is owned and
 * outside Sanctuary" is therefore a refusal, never permission.
 *
 *   missing sourceTurnId                                   -> 400
 *   turn's session is Sanctuary                            -> 403
 *   turn missing / unowned / session unresolvable / error  -> 403 (fail closed)
 *   turn owned + session resolves non-sanctuary            -> ok
 */

import { query } from '@/lib/db/postgres';

export type EpisodicSourceVerdict =
  | { ok: true }
  | {
      ok: false;
      status: 400 | 403;
      reason: 'missing_turn' | 'sanctuary' | 'unverifiable';
      error: string;
    };

const ERR_MISSING_TURN =
  'A sourceTurnId is required: a marked moment is a turn. sourceSessionId is corroborating metadata, not authority.';
const ERR_SANCTUARY = 'Sanctuary moments cannot be persisted to episodic memory.';
const ERR_UNVERIFIABLE =
  'Cannot verify this turn is owned by the member and originated outside Sanctuary; refusing to persist.';

function sessionIsSanctuary(mode: unknown, privacyMode: unknown): boolean {
  return mode === 'sanctuary' || privacyMode === 'sanctuary';
}

/**
 * Decide whether a member-marked episodic write may proceed. Turn-primary:
 * sourceTurnId is required and is the sole authority for ownership + Sanctuary.
 */
export async function guardEpisodicSource(input: {
  memberId: string;
  sourceTurnId: string | null;
}): Promise<EpisodicSourceVerdict> {
  const { memberId, sourceTurnId } = input;

  // Rule 1: the turn pointer is required. A marked moment IS a turn.
  if (!sourceTurnId) {
    return { ok: false, status: 400, reason: 'missing_turn', error: ERR_MISSING_TURN };
  }

  try {
    // Rules 2 & 4: resolve the turn; read its session's mode/privacy via join.
    const r = await query<{
      user_id: string;
      s_mode: string | null;
      s_privacy: string | null;
    }>(
      `SELECT t.user_id,
              s.mode         AS s_mode,
              s.privacy_mode AS s_privacy
         FROM conversation_turns t
         LEFT JOIN maia_sessions s ON s.id = t.session_id
        WHERE t.id = $1`,
      [sourceTurnId],
    );

    // Rule 6: missing/unresolvable turn -> refuse (may be a purged Sanctuary turn).
    if (r.rows.length === 0) {
      return { ok: false, status: 403, reason: 'unverifiable', error: ERR_UNVERIFIABLE };
    }
    const row = r.rows[0];

    // Rules 3 & 7: ownership is proven by the TURN (conversation_turns.user_id),
    // never by maia_sessions.member_id.
    if (row.user_id !== memberId) {
      return { ok: false, status: 403, reason: 'unverifiable', error: ERR_UNVERIFIABLE };
    }

    // The session must resolve so we can confirm it is not Sanctuary (fail closed).
    if (row.s_mode == null && row.s_privacy == null) {
      return { ok: false, status: 403, reason: 'unverifiable', error: ERR_UNVERIFIABLE };
    }

    // Rule 5: refuse if the turn's session is Sanctuary.
    if (sessionIsSanctuary(row.s_mode, row.s_privacy)) {
      return { ok: false, status: 403, reason: 'sanctuary', error: ERR_SANCTUARY };
    }

    return { ok: true };
  } catch {
    // Malformed uuid / db error -> fail closed.
    return { ok: false, status: 403, reason: 'unverifiable', error: ERR_UNVERIFIABLE };
  }
}
