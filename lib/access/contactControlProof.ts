/**
 * CONTACT CONTROL PROOF — MEMBER-ACCESS-01 · Stage 7A · P-1
 * ========================================================
 *
 * Records a fact Soullab already proves many times a day and has never written
 * down: **this member proved control of this contact, at this time, by this
 * mechanism.**
 *
 * THE LOAD-BEARING RULE, inherited verbatim from the delivery ledger one layer
 * down:
 *
 *     This module OBSERVES authentication; it does not AUTHORIZE it.
 *
 * It is never consulted before an auth decision, never returns a value any auth
 * path branches on, and can never fail a sign-in. If a write throws, the member
 * still gets in and the loss is counted out of band.
 *
 * WHY BEST-EFFORT, STATED AS A COST.
 *   A blocking write would turn an observability feature into an authentication
 *   outage: nobody could sign in because we could not record that they were
 *   signing in. So this UNDER-REPORTS, and it under-reports hardest when the
 *   database is unhappy. Any count drawn from this table must carry
 *   `proofWriteFailuresTotal()` alongside it. "412 proofs observed · 3 writes
 *   lost" is honest; "412 proofs" is not.
 *
 * WHAT CALLERS MUST GUARANTEE.
 *   Call this ONLY after control is actually proven — after the atomic claim that
 *   burns a one-time code, after a magic link is redeemed, after a verification
 *   token completes. An abandoned or failed ceremony must write NOTHING. This
 *   module cannot check that for you; it is the caller's obligation and it is
 *   asserted by the Stage 7A falsifiers.
 */

import { query } from '@/lib/db/postgres';
import { fingerprintRecipient } from '@/lib/email/ledger/fingerprint';
import { memberRef } from '@/lib/privacy/memberRef';

/**
 * How control was proven. Not free text: an unconstrained mechanism column would
 * repeat `members.email_verified`'s error, where one route's meaning silently
 * became the name of a universal fact.
 */
export type ProofMechanism =
  | 'email_code'
  | 'magic_link'
  | 'email_verification_token';

/**
 * Bumped when the MEANING of a mechanism changes — not when its code is edited.
 * A reader in six months needs to know which ceremony produced a row, and a
 * version that tracked refactors would tell them nothing.
 */
export const PROOF_MECHANISM_VERSION = '1';

export interface RecordProofInput {
  memberId: string;
  /** The address whose control was proven. Fingerprinted here; never stored raw. */
  contact: string;
  mechanism: ProofMechanism;
  /** Route or surface that observed it, for provenance. */
  observedBy?: string;
}

let writeFailures = 0;
/** Out-of-band drop counter. Every volume figure from this table must carry it. */
export function proofWriteFailuresTotal(): number {
  return writeFailures;
}
/** Test seam only. */
export function resetProofWriteFailures(): void {
  writeFailures = 0;
}

/**
 * Record one proof-of-control event. Never throws. Never blocks a decision.
 *
 * Returns nothing deliberately: a return value invites a caller to branch on it,
 * and the first branch would make this module part of the auth path.
 */
export async function recordContactControlProof(
  input: RecordProofInput
): Promise<void> {
  try {
    if (!input.memberId || !input.contact) return;

    // Null when no key is configured — the helper refuses to write a reversible
    // unsalted digest, which is correct. The proof is still recorded: it is a fact
    // about the member either way, and discarding it to protect an attribution we
    // cannot compute would throw away the evidence this exists to collect.
    const fp = fingerprintRecipient(input.contact);

    await query(
      `INSERT INTO contact_control_proofs
         (member_id, contact_kind, contact_fingerprint, contact_fingerprint_key_version,
          mechanism, mechanism_version, observed_by)
       VALUES ($1, 'email', $2, $3, $4, $5, $6)`,
      [
        input.memberId,
        fp?.fingerprint ?? null,
        fp?.keyVersion ?? null,
        input.mechanism,
        PROOF_MECHANISM_VERSION,
        input.observedBy ?? null,
      ]
    );
  } catch (err) {
    writeFailures += 1;
    // memberRef, never the raw id, and never the address.
    console.warn(
      `[MEMBER-ACCESS/P-1] proof write failed { member: ${memberRef(input.memberId)}, mechanism: ${input.mechanism} }`,
      err instanceof Error ? err.message : err
    );
  }
}
