/**
 * Participation Gate — may this object enter canonical live composition?
 *
 * Authority:
 *   docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3
 *   docs/architecture/MAIA_INTELLIGENCE_PARTICIPATION_ARCHITECTURE_v0.1.md §2, §4.3
 *   docs/architecture/REFUSAL_REGISTRY.md — "Two-field provenance (the generalizing fix)"
 *
 * ── THE INVARIANT ───────────────────────────────────────────────────────────
 *
 *   Uncertified or insufficiently authorized inferred material cannot enter
 *   canonical live composition.
 *
 * ── WHAT THIS IS NOT ────────────────────────────────────────────────────────
 *
 * It is NOT a provenance-labelling repair. Attaching `authored_by: maia` to an
 * inference and leaving it in the prompt would improve provenance while still
 * violating participation: under the ratified authority lattice, unendorsed
 * MAIA inference has no entitlement to participate merely because its
 * authorship is now accurately named.
 *
 * The gate therefore EXCLUDES. Admission is the exception that must be earned.
 *
 * ── WHY THERE IS NO AGE, RECENCY, OR FREQUENCY INPUT ────────────────────────
 *
 * `ParticipationInput` deliberately carries no `formed_at`, no `recall_count`,
 * no `surfaced_count`, no `last_recalled_at`. This is not an omission — it is
 * the enforcement of P3 acceptance criterion 3:
 *
 *   MAIA-authored inference cannot acquire autobiographical authority by
 *   having existed for a long time or having appeared in prompts repeatedly.
 *
 * A field the adjudicator cannot see is a rule it cannot be tuned to break.
 * Adding one is a visible diff that fails certification.
 *
 * ── PROVENANCE IS NEVER GUESSED ─────────────────────────────────────────────
 *
 * `provenance: null` means UNCERTIFIED, and uncertified means excluded. It does
 * NOT mean "probably MAIA" — inferring authorship from the probable writer, the
 * table name, the content, or present-day architecture is exactly the
 * manufacture the backfill policy forbids:
 *
 *   Unknown provenance is an epistemic limitation.
 *   Guessed provenance is false provenance. The latter is worse.
 */

// ── Two-field provenance (adopted from the Refusal Registry's generalizing fix)

/** Who produced the object. Never inferred; only read from write-path evidence. */
export type AuthoredBy = 'member' | 'maia' | 'practitioner';

/** Which constitutional layer the object belongs to. Orthogonal to authorship. */
export type AuthorityClass =
  | 'testimony'      // the member's own words
  | 'member_act'     // a deliberate member gesture (Keep, Mark)
  | 'observation'    // witnessed by a practitioner, attributed
  | 'inference'      // machine construction about the member
  | 'routing_state'; // system-derived operational state, not a claim about the member

export interface CertifiedProvenance {
  authoredBy: AuthoredBy;
  authorityClass: AuthorityClass;
}

/**
 * A provenance claim, or `null` when the write path left no evidence from which
 * one could be established. Null is a first-class value here, not a defect to
 * paper over.
 */
export type ProvenanceClaim = CertifiedProvenance | null;

/**
 * Whether a member has conferred participation authority on a MAIA-authored
 * interpretation.
 *
 * `endorsed` is currently UNREACHABLE: the endorse gesture does not exist in
 * the product (Phase 0 §3.4, §10.1). The branch is implemented so the rule is
 * expressible and testable now, and so that when the gesture ships it attaches
 * to an already-certified gate rather than requiring one to be invented then.
 *
 * Endorsement is an ADDITIVE EDGE on an immutable class: it changes permission
 * and framing, never `authoredBy`. An endorsed inference is a member-endorsed
 * interpretation, never a member statement.
 */
export type EndorsementState = 'none' | 'endorsed';

export interface ParticipationInput {
  provenance: ProvenanceClaim;
  endorsement: EndorsementState;
}

export type ExclusionReason =
  | 'uncertified_provenance'
  | 'unendorsed_inference'
  | 'routing_state_not_composable'
  | 'derived_from_excluded';

export type ParticipationVerdict =
  | { admitted: true; provenance: CertifiedProvenance }
  | { admitted: false; reason: ExclusionReason };

/**
 * Decide whether an object may enter canonical live composition.
 *
 * Ordered so the strongest refusal is evaluated first and no later branch can
 * rescue an object the earlier ones rejected.
 */
export function adjudicateParticipation(
  input: ParticipationInput,
): ParticipationVerdict {
  const { provenance, endorsement } = input;

  // 1. Never guess. No evidence → no participation.
  if (provenance === null) {
    return { admitted: false, reason: 'uncertified_provenance' };
  }

  // 2. Routing state is operational, not a claim about the member. It may steer
  //    machinery; it may not become material in a conversation about someone's
  //    life. (Cf. the registry's standing `member_spiral_state` provenance gap.)
  if (provenance.authorityClass === 'routing_state') {
    return { admitted: false, reason: 'routing_state_not_composable' };
  }

  // 3. MAIA-authored inference participates only on member-conferred authority.
  //    Note what is NOT consulted here: age, significance, recall count, how
  //    often it has surfaced before. None of them is in scope, by type.
  if (provenance.authorityClass === 'inference' && endorsement !== 'endorsed') {
    return { admitted: false, reason: 'unendorsed_inference' };
  }

  return { admitted: true, provenance };
}

/**
 * THE DERIVATION RULE (founder-adopted, 2026-09-02).
 *
 *   A derived representation cannot acquire greater participation authority
 *   than the material required to produce it.
 *
 * Counts, summaries, elemental dominance, confidence scores, trends,
 * classifications, session essences and similar derivations over excluded
 * inference remain excluded. **Transformation does not launder provenance.**
 *
 * Without this rule a developer complies with the letter of P3 by never
 * composing `pattern.statement`, while composing:
 *
 *     "Your strongest recurring pattern is Water, with 87% confidence."
 *
 * — the same inference, laundered through derivation. This generalizes the
 * breakthrough-count result (P3b) rather than restating it per site.
 *
 * A derivation over ZERO inputs is not a derivation; it is an assertion, and it
 * is excluded. Silence is the honest form of having nothing certified.
 */
export function adjudicateDerivation(
  inputs: ParticipationVerdict[],
): ParticipationVerdict {
  if (inputs.length === 0) {
    return { admitted: false, reason: 'derived_from_excluded' };
  }
  const firstExcluded = inputs.find((v) => !v.admitted);
  if (firstExcluded && !firstExcluded.admitted) {
    // The least-certified input governs. Reported as derived_from_excluded so
    // the trace distinguishes "this material was excluded" from "this material
    // was computed FROM excluded material" — different repairs.
    return { admitted: false, reason: 'derived_from_excluded' };
  }
  // Every input admitted. The derivation inherits the LOWEST standing present:
  // a summary of member testimony is MAIA-authored, never member testimony.
  const admitted = inputs.filter(
    (v): v is Extract<ParticipationVerdict, { admitted: true }> => v.admitted,
  );
  const anyInference = admitted.some((v) => v.provenance.authorityClass === 'inference');
  return {
    admitted: true,
    provenance: anyInference
      ? { authoredBy: 'maia', authorityClass: 'inference' }
      : admitted[0].provenance,
  };
}

/** Human-readable exclusion reasons for observability. Never member-facing. */
export const EXCLUSION_REASON_TEXT: Record<ExclusionReason, string> = {
  uncertified_provenance:
    'write path left no evidence of authorship or authority class; excluded rather than guessed',
  unendorsed_inference:
    'MAIA-authored inference without a member endorsement relation; no participation authority',
  routing_state_not_composable:
    'system-derived routing state; steers machinery, never composes as a claim about the member',
  derived_from_excluded:
    'computed from material that does not participate; transformation does not launder provenance',
};
