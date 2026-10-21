/**
 * Client Representation Guards — the three-stage enforcement decisions for client-keyed
 * memory (case_memories), as pure, testable functions. The route layer owns the thin I/O;
 * these own the decisions, so the constitution is exhaustively testable without a DB.
 *
 * Steward ruling (Kelly, 2026-06-25): `crossing_allowed=FALSE` is the ratified default for
 * all MAIA-inferred client representations — held (countable, not surfaced) until allowed.
 *
 * Mirrors the member side: recall opt-out (in-bound), Sanctuary (out-bound), and now the
 * client-representation gate. `consent_based` cannot be satisfied by a flag alone.
 *
 * Spec: docs/specs/CLIENT_REPRESENTATION_GOVERNANCE_PATCH_2026-06-25.md
 */

export type PrivacyMode = 'private' | 'transparent' | 'consent_based';
export type Authorship = 'practitioner_authored' | 'maia_inferred' | 'maia_suggested';

/**
 * First-class authorship from the legacy source FKs (used by backfill + new writes).
 * Conservative: anything not unambiguously a human note is treated as MAIA-originated
 * (so it falls under the crossing gate). Mirrors the SQL CASE in migration 20260625000002.
 */
export function deriveAuthorship(src: {
  sourceCandidateId?: string | null;
  reviewLensId?: string | null;
  sourceNoteId?: string | null;
}): Authorship {
  if (src.sourceCandidateId || src.reviewLensId) return 'maia_inferred';
  if (src.sourceNoteId) return 'practitioner_authored';
  return 'maia_inferred'; // unknown origin → treated as inferred (held)
}

/**
 * GENERATE / PERSIST gate — the per-case representation policy (Kelly, 2026-06-25):
 *   private       → NO MAIA-authored client representations (refuse). Without this,
 *                   'private' is a label with no force.
 *   consent_based → only with a captured client consent.
 *   transparent   → permitted (later persist/surface gates still apply).
 */
export function mayProduceRepresentation(
  privacyMode: PrivacyMode,
  consentCapturedAt: Date | string | null | undefined,
): boolean {
  if (privacyMode === 'private') return false;
  if (privacyMode === 'consent_based') return consentCapturedAt != null;
  return true; // transparent
}

/**
 * Refusal detail for a denied production (generate or persist), or null if permitted.
 * Distinguishes the two refusal reasons so routes return the right code/message.
 */
export function representationRefusal(
  privacyMode: PrivacyMode,
  consentCapturedAt: Date | string | null | undefined,
): { code: 'REPRESENTATION_NOT_PERMITTED' | 'CONSENT_REQUIRED'; message: string } | null {
  if (mayProduceRepresentation(privacyMode, consentCapturedAt)) return null;
  if (privacyMode === 'private') {
    return {
      code: 'REPRESENTATION_NOT_PERMITTED',
      message: 'This case is private; MAIA-authored client representations are not generated or stored.',
    };
  }
  return {
    code: 'CONSENT_REQUIRED',
    message: 'This case is consent_based and has no captured client consent; representations cannot be generated or stored.',
  };
}

/**
 * SURFACE gate. A representation may reach a practitioner/client-facing surface only if:
 *   1. the consent floor is met (consent_based ⇒ consent captured), AND
 *   2. it is the practitioner's OWN authored note, OR a MAIA representation whose
 *      crossing_allowed is TRUE. MAIA-originated representations are HELD by default.
 */
export function maySurfaceRepresentation(rep: {
  authorship: Authorship;
  crossingAllowed: boolean;
  privacyMode: PrivacyMode;
  consentCapturedAt: Date | string | null | undefined;
}): boolean {
  // 1. consent floor — applies regardless of authorship
  if (rep.privacyMode === 'consent_based' && rep.consentCapturedAt == null) return false;
  // 2. private ⇒ no MAIA-authored representation surfaces, EVEN IF crossing_allowed. This
  //    closes the mode-transition edge: a case flipped to private withholds pre-existing
  //    maia_* rows regardless of any prior steward crossing grant. (Kelly, 2026-06-25.)
  if (rep.privacyMode === 'private' && rep.authorship !== 'practitioner_authored') return false;
  // 3. MAIA-originated representations are held unless explicitly crossing-allowed
  if (rep.authorship !== 'practitioner_authored' && !rep.crossingAllowed) return false;
  return true;
}

/** Consent snapshot to stamp on a representation at write time (durable, not a live lookup). */
export function consentSnapshot(
  privacyMode: PrivacyMode,
  consentCapturedAt: Date | string | null | undefined,
): { consent_basis: PrivacyMode; consent_at_write: string | null } {
  const at =
    consentCapturedAt == null
      ? null
      : consentCapturedAt instanceof Date
        ? consentCapturedAt.toISOString()
        : String(consentCapturedAt);
  return { consent_basis: privacyMode, consent_at_write: at };
}
