/**
 * S3 · M3 — the minimal claimant.
 *
 * Authority: S3-B-IV_DESIGN_2026-09-13.md (V2 taken) · migration
 * 20260913000001. The frozen Class-B law @ 2255b60d governs; ⛔ nothing here may
 * be read as amending it.
 *
 * ⭐⭐ THE ATOMICITY IS THE INSERT. There is no preceding SELECT, no row lock,
 * and no reliance on `transaction()` — which is a plain BEGIN at READ COMMITTED
 * with no lock, and is exactly what defeated the Circles candidate `093379e8d`.
 * The winner is decided by the UNIQUE constraint on `act_id`.
 *
 * ⛔ THIS MODULE IS NOT WIRED TO ANY ROUTE, and must not be until W-A and W-B
 * have passed. Proving persistence and wiring the surface at the same time makes
 * a failure ambiguous again.
 *
 * ⛔ IT AUTHORIZES NOTHING BY ITSELF. Winning the claim is a precondition of
 * crossing, never the crossing's authority: the caller must still re-derive the
 * requirement and the section set, receive the member's present gesture,
 * establish the disclosure boundary and mint `may_cross`.
 */

import { query } from '@/lib/db/postgres';

/** Opaque. ⛔ Carries no meaning a client could read or forge. */
export type ActRef = string;

/** Where an act sits. ⭐ Coordinates, never authority. */
export interface ActCoordinates {
  readonly memberId: string;
  readonly manuscriptId: string;
  readonly threadId: string;
  readonly readingId: string;
  readonly observationKey: string;
}

/**
 * Derived state. ⛔ There is no status column; these are read off positive facts.
 *
 * ⭐ `completed` carries `outcomeHeld: false` when the completion identity no
 * longer resolves. That is **COMPLETED, OUTCOME NO LONGER HELD** — never
 * "interrupted", and never "pending". Deletion of an outcome removes the held
 * result; it can never resurrect the act.
 */
export type ActState =
  | { readonly kind: 'pending' }
  | { readonly kind: 'interrupted'; readonly claimedAt: Date }
  | {
      readonly kind: 'completed';
      readonly claimedAt: Date;
      readonly completedAt: Date;
      readonly completionRef: string;
    }
  | { readonly kind: 'unknown_act' };

export type ClaimOutcome =
  /** ⭐ The ONLY outcome under which the caller may proceed toward a crossing. */
  | { readonly kind: 'claimed'; readonly act: ActCoordinates }
  /** Someone else won, or this is a replay. The existing fact, never fresh authority. */
  | { readonly kind: 'already'; readonly state: ActState }
  /** No such act for this member, or the opportunity to claim it has passed. */
  | { readonly kind: 'unclaimable'; readonly reason: 'unknown_act' | 'expired' };

/** ACT 2 — mint the identity of one paused Ask's authorization act. */
export async function mintAct(
  c: ActCoordinates, ttlMinutes: number,
): Promise<ActRef> {
  const r = await query<{ id: string }>(
    `INSERT INTO ask_authorization_acts
       (member_id, manuscript_id, thread_id, reading_id, observation_key, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + ($6 || ' minutes')::interval)
     RETURNING id`,
    [c.memberId, c.manuscriptId, c.threadId, c.readingId, c.observationKey,
     String(ttlMinutes)],
  );
  return r.rows[0]!.id;
}

/**
 * ACT 3 step 5a — claim the act, atomically, exactly once.
 *
 * ⭐ The INSERT is the claim. `ON CONFLICT DO NOTHING` means a second concurrent
 * claimant inserts nothing and receives no rows, so it cannot proceed. The
 * member binding and the expiry live in the SELECT's predicate, so an act
 * belonging to someone else, or one whose opportunity has passed, never produces
 * a row to conflict over.
 *
 * `requestRef` is recorded for correlation only. ⛔ It is never read back as
 * identity: request-keyed identity defeats concurrency, replay, recovery and
 * prose-mutated replay at once.
 */
export async function claimAct(
  ref: ActRef, memberId: string, requestRef: string | null,
): Promise<ClaimOutcome> {
  const claimed = await query<{
    member_id: string; manuscript_id: string; thread_id: string;
    reading_id: string; observation_key: string;
  }>(
    `WITH won AS (
       INSERT INTO ask_authorization_consumptions (act_id, claim_request_ref)
       SELECT a.id, $3
         FROM ask_authorization_acts a
        WHERE a.id = $1 AND a.member_id = $2 AND a.expires_at > NOW()
       ON CONFLICT (act_id) DO NOTHING
       RETURNING act_id
     )
     SELECT a.member_id, a.manuscript_id, a.thread_id, a.reading_id, a.observation_key
       FROM won JOIN ask_authorization_acts a ON a.id = won.act_id`,
    [ref, memberId, requestRef],
  );

  const row = claimed.rows[0];
  if (row) {
    return {
      kind: 'claimed',
      act: {
        memberId: row.member_id, manuscriptId: row.manuscript_id,
        threadId: row.thread_id, readingId: row.reading_id,
        observationKey: row.observation_key,
      },
    };
  }

  // Nothing claimed. Distinguish WHY from the rows' own state — the three
  // refusals warrant different responses and must not look alike.
  const state = await readAct(ref, memberId);
  if (state.kind === 'unknown_act') return { kind: 'unclaimable', reason: 'unknown_act' };
  if (state.kind === 'pending') return { kind: 'unclaimable', reason: 'expired' };
  return { kind: 'already', state };
}

/**
 * Record the completion of a claimed act.
 *
 * ⭐ `completionRef` identifies the completed EXECUTION. ⛔ Never answer text,
 * never a digest of it: two runs of cognition can produce different words from
 * the same authority, so textual equivalence is neither necessary nor
 * sufficient. Re-recording the same completion is a no-op at the trigger;
 * recording a different one is refused, because a second completion would be a
 * second crossing.
 */
export async function recordCompletion(
  ref: ActRef, completionRef: string,
): Promise<void> {
  await query(
    `UPDATE ask_authorization_consumptions
        SET completed_at = NOW(), completion_ref = $2
      WHERE act_id = $1 AND completed_at IS NULL`,
    [ref, completionRef],
  );
}

/**
 * Read the act's derived state.
 *
 * ⚠️ `outcomeHeld` is deliberately NOT resolved here: whether the referenced
 * turn still exists is the caller's question, and answering it in this module
 * would invite the resolution to be mistaken for the completion fact. The
 * completion fact is `completedAt`, and it does not depend on the referent.
 */
export async function readAct(ref: ActRef, memberId: string): Promise<ActState> {
  const r = await query<{
    claimed_at: Date | null; completed_at: Date | null; completion_ref: string | null;
  }>(
    `SELECT c.claimed_at, c.completed_at, c.completion_ref
       FROM ask_authorization_acts a
       LEFT JOIN ask_authorization_consumptions c ON c.act_id = a.id
      WHERE a.id = $1 AND a.member_id = $2`,
    [ref, memberId],
  );

  const row = r.rows[0];
  if (!row) return { kind: 'unknown_act' };
  if (!row.claimed_at) return { kind: 'pending' };
  if (!row.completed_at || !row.completion_ref) {
    return { kind: 'interrupted', claimedAt: row.claimed_at };
  }
  return {
    kind: 'completed',
    claimedAt: row.claimed_at,
    completedAt: row.completed_at,
    completionRef: row.completion_ref,
  };
}
