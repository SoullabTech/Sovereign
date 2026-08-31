/**
 * PRACTITIONER INFERENCE CONTAINMENT
 *
 * Founder containment ruling, 2026-08-06. This is a CONTAINMENT layer, not an
 * authority model. It exists because live surfaces were found carrying
 * system-inferred claims about members to practitioners, and the authority
 * model that would govern them does not exist yet.
 *
 * The principle underneath all of it:
 *
 *   ⭐ Visibility, acknowledgment, confidence, recurrence, and professional role
 *     never create authorship or permission.
 *
 * And the crossing rule it enforces:
 *
 *   ⭐ Everything crossing from a person's sovereign field into a shared
 *     developmental commitment must be an explicit declaration by that person —
 *     never an observation, inference, score, pattern, telemetry event, or
 *     system-authored claim.
 *
 * ⛔ This module contains READ PATHS ONLY. It deletes no data and writes nothing.
 *    The substrate is preserved for investigation and for the eventual ruling.
 *
 * ⛔ Do not "resolve" a containment by softening a label, hiding a score while
 *    keeping the claim, or relabelling inferred material as observed. Absence is
 *    the honest state. Say so.
 *
 * Reference:
 *   docs/architecture/PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md
 *   __tests__/practitioner-authority-boundaries.test.ts
 */

/** Machine-readable marker returned to clients so UI can render honest absence. */
export interface ContainmentNotice {
  contained: true;
  /** Short reason, safe to render to a practitioner. */
  reason: string;
  /** The ruling that put this containment in place. */
  ruling: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 1. Pattern Ledger — practitioner-facing read path
 *
 * pattern_ledger is written by system inference (lib/patterns/PatternDetectionService.ts,
 * generatePatternIntelligence.ts). The practitioner read path additionally
 * surfaced status='emerging' rows — patterns the system detected but never
 * offered to the member, and which the member has therefore never accepted.
 * That places the practitioner UPSTREAM of the member's own recognition of a
 * pattern about themselves.
 *
 * Containment ruling: no pattern_ledger row may render on a practitioner-facing
 * client surface unless the member has explicitly declared that exact object
 * into the shared commitment. No such crossing mechanism exists today, so the
 * honest immediate state is ABSENCE.
 * ──────────────────────────────────────────────────────────────────────────── */

export const PATTERN_LEDGER_PRACTITIONER_READ_CONTAINED = true as const;

export const PATTERN_LEDGER_CONTAINMENT: ContainmentNotice = {
  contained: true,
  reason:
    'Patterns here are produced by system inference about the member. They are not shown ' +
    'to you because the member has not declared them into your shared work. Nothing has ' +
    'been deleted — this view is closed until a member-declared crossing exists.',
  ruling: 'Practitioner Inference Containment, 2026-08-06',
};

/* ────────────────────────────────────────────────────────────────────────────
 * 2. Field signals — practitioner consultation composition
 *
 * studio_field_signals.source ∈ ('client', 'practitioner', 'maia') with a numeric
 * intensity(0..1) and no consent gate. The whole table was flowing into
 * consultChangeCouncil / decision consultation via DecisionInputBundle.
 *
 * Interim invariant: a field signal may not enter practitioner consultation
 * unless it is practitioner-AUTHORED and practitioner-private.
 *
 *   - source='client'  → refused (member material crossing without declaration)
 *   - source='maia'    → refused (system-authored claim; acknowledgment ≠ authorship)
 *   - source='practitioner' → ALSO refused, for now.
 *
 * The last one is the subtle case and the reason this function returns empty
 * rather than filtering. `source` records a *category*, not a provenance: there
 * is no column establishing that a 'practitioner' row was authored BY the
 * practitioner rather than attributed TO them by the system. Existing rows are
 * therefore ambiguous, and the ruling is explicit that ambiguous rows must not
 * be reinterpreted as safe.
 *
 * When a provenance column exists (authored_by, authorship_gesture, or similar),
 * this function admits exactly: source='practitioner' AND provenance proves a
 * practitioner authorship act. Not before.
 * ──────────────────────────────────────────────────────────────────────────── */

export const FIELD_SIGNALS_CONSULT_CONTAINMENT: ContainmentNotice = {
  contained: true,
  reason:
    'Field signals are excluded from consultation. The store mixes member-, system-, and ' +
    'practitioner-sourced entries with no record of who authored each one, so none can be ' +
    'shown to be yours. Your own observations are unaffected.',
  ruling: 'Practitioner Inference Containment, 2026-08-06',
};

/** Minimal shape this filter needs; callers may pass richer rows. */
export interface FieldSignalLike {
  source?: string | null;
}

/**
 * Admit field signals into practitioner consultation composition.
 *
 * Returns [] unconditionally under the current containment — see above for why
 * `source='practitioner'` is not sufficient. Kept as a function (rather than
 * deleting the call sites) so that the admission rule has ONE home when the
 * authority model lands, and so the refusal is visible at every call site.
 */
export function admitFieldSignalsForConsult<T extends FieldSignalLike>(rows: T[]): T[] {
  void rows; // preserved deliberately: contained, not absent
  return [];
}

/**
 * True when a field-signal row could ever be admitted once provenance exists.
 * Used by tests to pin that 'client' and 'maia' are refused categorically —
 * i.e. that they remain refused even after a provenance column is added.
 */
export function isCategoricallyRefusedSource(source: string | null | undefined): boolean {
  return source === 'client' || source === 'maia';
}
