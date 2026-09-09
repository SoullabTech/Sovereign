/**
 * REQUIRED consent state — the precondition sibling of `recordConsentState()`.
 *
 *   ⭐⭐ A precondition and an audit trace are not the same write.
 *
 * `recordConsentState()` is an AUDIT TRACE: fire-and-forget by constitution, so
 * it never blocks the serving path, and a missing record is truthfully visible
 * to auditors as an absence. ⛔ That posture is exactly wrong as a precondition —
 * it establishes that the INSERT was STARTED earlier, never that the ROW EXISTED
 * earlier (REQUEST-ORDER-01, F1).
 *
 * This module is the other act: AWAITED, VERIFIED, FAIL-CLOSED, and used only by
 * paths that require the consent row to exist before proceeding — today, the
 * Focus disclosure boundary.
 *
 * ⛔ `recordConsentState()` IS NOT CHANGED, and must not be. Four other callers
 * depend on it never blocking the serving path; widening it would be a change to
 * Sanctuary's own mechanics for paths that never asked for one.
 *
 * ⭐ Unlike a disclosure receipt, an EXACT existing consent row still satisfies
 * this precondition. It is not fresh authority over content — it is the immutable
 * posture already resolved for this request, and the S5 table is explicitly
 * "first write wins on retry".
 */

import { query } from '../db/postgres';
import { TurnPosture } from '../sanctuary/turnPosture';

export type ConsentPreconditionOutcome =
  /** Minted here, now. The precondition is satisfied. */
  | { readonly kind: 'ready'; readonly requestId: string }
  /** Already present and identical. Also satisfied — first write wins on retry. */
  | { readonly kind: 'existing_exact'; readonly requestId: string }
  /** Present, describing a DIFFERENT request. ⛔ Never satisfied. */
  | { readonly kind: 'identity_mismatch'; readonly differing: readonly string[] }
  /** Absent, unwritable, or the posture was missing/forged. ⛔ Fail closed. */
  | { readonly kind: 'unavailable'; readonly reason: string };

/** The single lawful test a caller performs before assembling any context. */
export const consentEstablished = (o: ConsentPreconditionOutcome): boolean =>
  o.kind === 'ready' || o.kind === 'existing_exact';

/**
 * Establish — not merely record — the consent state for a request.
 *
 * ⛔ Never throws through the conversation path: every failure is a returned
 * outcome, so a caller cannot accidentally take a crash for a refusal.
 */
export async function requireConsentState(opts: {
  /** ⭐ A NAMED value the caller holds and passes downstream. Never minted inside
   *  a call expression — an identifier that governs downstream authority must be
   *  available downstream (REQUEST-ORDER-01, F2). */
  requestId: string;
  posture: TurnPosture;
  memberId?: string | null;
  sessionId?: string | null;
}): Promise<ConsentPreconditionOutcome> {
  if (!opts.requestId) {
    return { kind: 'unavailable', reason: 'no request id' };
  }
  if (!(opts.posture instanceof TurnPosture)) {
    // The same forgery refusal `recordConsentState` performs — a plain object
    // shaped like a posture is not a posture.
    console.error('[PROVENANCE] required consent refused — posture missing or forged', {
      requestIdPrefix: opts.requestId.slice(0, 12),
    });
    return { kind: 'unavailable', reason: 'posture missing or forged' };
  }

  const expected = {
    member_id: opts.memberId ?? null,
    session_id: opts.sessionId ?? null,
    posture: opts.posture.sanctuary ? 'sanctuary' : 'normal',
    resolved_from: opts.posture.source,
  };

  try {
    const inserted = await query<{ request_id: string }>(
      `INSERT INTO runtime_consent_state (request_id, member_id, session_id, posture, resolved_from)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (request_id) DO NOTHING
       RETURNING request_id`,
      [opts.requestId, expected.member_id, expected.session_id, expected.posture, expected.resolved_from],
    );
    if (inserted.rows[0]?.request_id) return { kind: 'ready', requestId: opts.requestId };

    const existing = await query<Record<string, string | null>>(
      `SELECT member_id, session_id, posture, resolved_from
         FROM runtime_consent_state WHERE request_id = $1`,
      [opts.requestId],
    );
    const row = existing.rows[0];
    if (!row) {
      // Conflict with no row: the substrate is not answering coherently, and a
      // precondition may not be satisfied by a guess.
      return { kind: 'unavailable', reason: 'conflict without a row' };
    }

    const differing = (Object.keys(expected) as (keyof typeof expected)[])
      .filter(k => row[k] !== expected[k]);
    if (differing.length > 0) {
      console.error('[PROVENANCE] required consent refused — request id describes a DIFFERENT request', {
        requestIdPrefix: opts.requestId.slice(0, 12),
        differing, // field NAMES only, never their values
      });
      return { kind: 'identity_mismatch', differing };
    }
    return { kind: 'existing_exact', requestId: opts.requestId };
  } catch (err) {
    console.error('[PROVENANCE] required consent unavailable — failing closed', {
      requestIdPrefix: opts.requestId.slice(0, 12),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return { kind: 'unavailable', reason: 'substrate unavailable' };
  }
}
