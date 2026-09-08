/**
 * WS2-ENCOUNTER-01 · E2 — the Encounter act's types.
 *
 * Founder rulings 2026-09-08: E1 ratified with amendments A1–A5, E2 ratified with
 * amendments and narrowly authorized for implementation.
 *
 *   PT-1 · Encounter precedes intervention.
 *   An Encounter observation helps the writer recognize the Work without telling
 *   the writer what ought to happen to it.
 *
 * ── THE AUTHORSHIP SPLIT IS A TYPE, NOT A PROMPT (A5) ─────────────────────
 *
 * Six acts of attention; only FIVE may yield MAIA-authored observations.
 * RECOLLECTION is the writer's, and it is not a member of `EncounterFamily` —
 * it is not available to be selected. There is deliberately no common
 * `EncounterObservation` supertype: a shared PRESENTATION union is fine, a
 * shared semantic record that lets one masquerade as the other is not.
 */

/** The five families MAIA may notice under. RECOLLECTION is absent by design. */
export const ENCOUNTER_FAMILIES = [
  'preoccupation',
  'movement',
  'recurrence',
  'heat',
  'openness',
] as const;

export type EncounterFamily = (typeof ENCOUNTER_FAMILIES)[number];

export function isEncounterFamily(v: unknown): v is EncounterFamily {
  return typeof v === 'string' && (ENCOUNTER_FAMILIES as readonly string[]).includes(v);
}

/**
 * The exact state of the Work an Encounter happened to (E2 §1B).
 *
 * The DIGEST is the authority. A revision counter is useful provenance but is not
 * on its own a claim that the text is unchanged — two drafts can share a number
 * across a restore, and a counter cannot notice that.
 */
export interface EncounterSnapshot {
  readonly draftId: string;
  readonly manuscriptId: string;
  readonly revisionNumber: number;
  readonly wholeDraftDigest: string;
  /** Code-point length. The unit is code points everywhere, never UTF-16 units. */
  readonly length: number;
}

/**
 * Where an observation came from. Distributed anchors are lawful (A4): an anchor
 * may be one passage, several, a span, or an evidence set across the Work.
 *
 * `spanDigest` is what keeps an anchor honest after the draft moves: a stale
 * anchor identifies itself rather than quietly relocating onto new prose.
 */
export interface Anchor {
  readonly startCodePoint: number;
  readonly endCodePoint: number;
  readonly spanDigest: string;
}

/**
 * The perceptual field an observation actually arose from — server-owned.
 *
 * Founder ruling 2026-09-08, on the second live witness (F-2):
 *
 *   A cognition may not assert more than the evidence field it was actually
 *   permitted to perceive.
 *
 * Two notices in that witness claimed non-return across the whole Work —
 * *"she is not mentioned again in what follows"* — from a call shown 12,000 of
 * 386,031 code points. Encounter has no synthesis pass by ratified law, so
 * whole-Work non-return is something the act **structurally cannot establish**.
 *
 * The defect was not the wording. It was that the record could not tell:
 * `MaiaNotice` carried family, text and anchors, and the window that produced
 * the assertion disappeared at the moment the candidate was promoted.
 *
 *   Window was transport on the way in and vanished as authority on the way out.
 *
 * So scope is a REQUIRED field on both the candidate and the notice. Not
 * optional, not defaulted, not inferred: a notice that cannot say what it was
 * shown cannot be constructed. The model never supplies it — it is derived from
 * the exact `ReadWindow` the inference call was made from, in the same place the
 * anchors are bound, so the two cannot disagree.
 */
export interface EncounterScope {
  /** The only kind that exists. A wider one would need its own constitution. */
  readonly kind: 'visible_window';
  /** Inclusive code-point start of what the call was shown. */
  readonly startCodePoint: number;
  /** Exclusive code-point end of what the call was shown. */
  readonly endCodePoint: number;
}

/** MAIA-authored. Always anchored — an unanchored notice is an impression. */
export interface MaiaNotice {
  readonly authoredBy: 'maia';
  readonly family: EncounterFamily;
  readonly text: string;
  readonly anchors: readonly Anchor[];
  /** What this observation was permitted to perceive. Never widened. */
  readonly scope: EncounterScope;
}

/**
 * The writer's own return, held as theirs.
 *
 * No family, no anchor — it was never MAIA's to anchor — and `authoredBy` cannot
 * be 'maia'. Attribution survives paraphrase, rendering, persistence, retrieval
 * and any later reintroduction.
 */
export interface WriterRecollection {
  readonly authoredBy: 'writer';
  readonly writerText: string;
  readonly saidAt: string;
}

/** Presentation union only. Nothing normalizes these into one record. */
export type EncounterItem = MaiaNotice | WriterRecollection;

export type EncounterResult =
  /** `notices: []` is a complete success. Silence carries no message (E1 §3.1). */
  | {
      readonly ok: true;
      readonly snapshot: EncounterSnapshot;
      readonly notices: readonly MaiaNotice[];
      readonly recollections: readonly WriterRecollection[];
    }
  | {
      readonly ok: false;
      /**
       * `not_readable`  no Working Draft — and Source is NOT read in its place
       *                 (E2 §1: a fallback would change the object being
       *                 encountered without telling the writer).
       * `not_traversable` the Work could not be read mechanically whole, so it
       *                 is refused rather than sampled invisibly (§1A).
       * `cognition_unavailable` the perceiving act did not COMPLETE — provider
       *                 unavailable, inference forbidden by the deployment's
       *                 sovereignty policy, timeout, malformed structured
       *                 response, or a Work window left unprocessed. C7: this is
       *                 categorically NOT `notices: []`. Infrastructure silence
       *                 is not contemplative silence, and must never be shown to
       *                 the writer as MAIA having quietly found nothing.
       */
      readonly refusal: 'not_found' | 'not_readable' | 'not_traversable' | 'cognition_unavailable';
    };

/** A generator's proposal. It is NOT a MaiaNotice until it survives screening. */
export interface CandidateNotice {
  readonly family: string;
  readonly text: string;
  readonly anchors: readonly Anchor[];
  /** Server-derived, never proposed. Carried through the screen unchanged. */
  readonly scope: EncounterScope;
}
