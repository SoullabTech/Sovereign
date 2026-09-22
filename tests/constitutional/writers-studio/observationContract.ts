/**
 * `WRITERS-STUDIO-OBSERVATION-IDENTITY-01` — the canonical observation contract.
 *
 * ⭐ Founder ruling 2026-09-21. This types the OBSERVABLE contract between a
 * completed reading and facet presentation. ⛔ It types no storage: no table,
 * no column, no migration. Implementation names are explicitly NOT governed by
 * the act — this is the law at the boundary, not the machine behind it (the
 * S3 B-i discipline, carried forward).
 *
 * ⭐⭐ THE ARCHITECTURE THE RULING ESTABLISHES
 *
 *      READING  →  CANONICAL OBSERVATIONS  →  { GUIDED | LEARNING | DIRECT }
 *
 *   ⛔ NOT three readers producing three claim sets that happen to look alike.
 *
 * ⭐ TWO THINGS ARE CARRIED DELIBERATELY SO THE WRONG ARCHITECTURE IS
 * BUILDABLE, AND THEREFORE KILLABLE (the S3 `authoredText` lesson):
 *
 *   `claim`            inert here. A conforming renderer never keys identity on
 *                      it. Without it, D1 (text-derived identity) cannot be
 *                      built, so the law "identity is never derived from
 *                      rendered text" would be unfalsifiable.
 *   `FacetContext.reader`
 *                      a renderer that COULD re-read. Without it, D3 and D4
 *                      cannot be built, so §V's "a facet renderer must not
 *                      possess authority to invoke a fresh developmental
 *                      reading" would be a sentence no test could break.
 */

import { createHash } from 'crypto';

/* ── vocabulary borrowed, never redeclared ──────────────────────────────── */

export type DevelopmentalLens =
  | 'structure' | 'development' | 'continuity' | 'arc' | 'voice' | 'coherence' | 'reader';

export type NonConclusion =
  | 'outside-coverage' | 'across-unread-span' | 'whole-work-pattern'
  | 'authored-structure-relation' | 'chronology' | 'author-intent'
  | 'reader-effect' | 'editorial-consequence';

export type NonEmpty<T> = readonly [T, ...T[]];

/* ── identity ────────────────────────────────────────────────────────────── */

/**
 * §II — opaque. ⛔ Independent of presentation · ⛔ independent of facet ·
 * ⛔ never derived from rendered text · ⭐ stable while the observation is
 * rendered, discussed, proposed against or revisited · ⭐ shared by every facet
 * expression of that observation.
 *
 * ⭐ It means THIS ADMITTED OBSERVATION FROM THIS READING. ⛔ It does not mean
 * every semantically similar observation MAIA may ever make, and this act does
 * not attempt cross-reading reconciliation.
 */
export type ObservationId = string & { readonly __brand: 'ObservationId' };
export type ReadingId = string & { readonly __brand: 'ReadingId' };
export type BasisFingerprint = string & { readonly __brand: 'BasisFingerprint' };

/**
 * ⭐ Minted AT ADMISSION, so identity originates in an event rather than in
 * content. ⚠️ The consequence, recorded because implementation will meet it:
 * admission must be the single point at which an observation comes into
 * existence. Two admission paths = two identities for one observation, and
 * nothing downstream could tell.
 */
export type IdentityMinter = () => ObservationId;

/* ── evidence and position ───────────────────────────────────────────────── */

/**
 * A frozen evidence reference, at the depth the ordering law needs.
 * `codePointStart` is null for refs that carry only position depth (a whole
 * section); present for refs that carry a range.
 */
export interface FrozenRef {
  readonly sectionId: string;
  readonly sectionPosition: number;
  readonly revisionNumber: number;
  readonly digest: string;
  readonly codePointStart: number | null;
}

/**
 * ⚠️⚠️ §VI IMPLICATION THE RULING LEAVES OPEN, ANSWERED HERE AND WITNESSED.
 *
 * An observation carries MULTIPLE refs, so it has no single manuscript
 * position until one is defined. ⛔ Left undefined, an implementation picks one
 * by accident and "manuscript order" quietly means whatever the first ref
 * happened to be.
 *
 * ⭐ DEFINED: the position of an observation is the EARLIEST position across
 * its refs, ordered by (sectionPosition, codePointStart ?? 0). Evidence already
 * carries code-point ranges, so order resolves BELOW section granularity —
 * which makes genuine ties rare rather than routine.
 */
export interface ManuscriptPosition {
  readonly sectionPosition: number;
  readonly codePointStart: number;
}

export function positionOf(refs: NonEmpty<FrozenRef>): ManuscriptPosition {
  let best: ManuscriptPosition = {
    sectionPosition: refs[0].sectionPosition,
    codePointStart: refs[0].codePointStart ?? 0,
  };
  for (const r of refs) {
    const p = { sectionPosition: r.sectionPosition, codePointStart: r.codePointStart ?? 0 };
    if (p.sectionPosition < best.sectionPosition
      || (p.sectionPosition === best.sectionPosition && p.codePointStart < best.codePointStart)) {
      best = p;
    }
  }
  return best;
}

/* ── the canonical observation ───────────────────────────────────────────── */

export interface CanonicalObservation {
  readonly observationId: ObservationId;
  readonly readingId: ReadingId;
  readonly lens: DevelopmentalLens;
  readonly refs: NonEmpty<FrozenRef>;
  readonly doesNotEstablish: NonEmpty<NonConclusion>;
  /** §IV — the reader's admitted claim. ⛔ NEVER an input to identity. */
  readonly claim: string;
  readonly position: ManuscriptPosition;
  readonly basisFingerprint: BasisFingerprint;
  /**
   * ⭐ §VI tie-break, DEFINED AND WITNESSED as the ruling requires. The order in
   * which the reading admitted this observation. ⛔ Non-evaluative by
   * construction: it records WHEN a thing entered the record, never how much it
   * matters. ⛔ Consulted only when two observations share an identical
   * position.
   */
  readonly admissionIndex: number;
}

/* ── §III basis fingerprint ──────────────────────────────────────────────── */

/**
 * ⭐ Deterministic over the IMMUTABLE BASIS. ⛔ `claim` is absent by
 * construction — an integrity witness over what the observation rests on, never
 * over what it says.
 *
 * ⭐ It is NOT the identity: §III's required falsifier demands that two
 * genuinely distinct observations over one basis receive DIFFERENT ids while
 * being permitted IDENTICAL fingerprints. A design in which the fingerprint
 * IS the identity collapses them — that is D2.
 */
export function computeBasisFingerprint(input: {
  readonly lens: DevelopmentalLens;
  readonly refs: NonEmpty<FrozenRef>;
  readonly doesNotEstablish: NonEmpty<NonConclusion>;
}): BasisFingerprint {
  const refs = [...input.refs]
    .map((r) => [r.sectionId, r.sectionPosition, r.revisionNumber, r.digest, r.codePointStart] as const)
    .sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1);
  const canonical = JSON.stringify({
    lens: input.lens,
    refs,
    doesNotEstablish: [...input.doesNotEstablish].sort(),
  });
  return createHash('sha256').update(canonical).digest('hex') as BasisFingerprint;
}

/* ── admission ───────────────────────────────────────────────────────────── */

export interface ReaderClaimDraft {
  readonly lens: DevelopmentalLens;
  readonly refs: NonEmpty<FrozenRef>;
  readonly doesNotEstablish: NonEmpty<NonConclusion>;
  readonly claim: string;
}

/** §VI — the lawful total order. Position first, admission order only on a tie. */
export function manuscriptOrder(
  a: CanonicalObservation, b: CanonicalObservation,
): number {
  if (a.position.sectionPosition !== b.position.sectionPosition) {
    return a.position.sectionPosition - b.position.sectionPosition;
  }
  if (a.position.codePointStart !== b.position.codePointStart) {
    return a.position.codePointStart - b.position.codePointStart;
  }
  return a.admissionIndex - b.admissionIndex;
}

/* ── facet presentation ──────────────────────────────────────────────────── */

export type Facet = 'guided' | 'learning' | 'direct';
export const FACETS: readonly Facet[] = ['guided', 'learning', 'direct'];

export interface FacetExpression {
  readonly observationId: ObservationId;
  /** ⭐ Facet-specific. ⛔ Prose equality is NOT a conformance requirement (§VII). */
  readonly rendered: string;
  readonly teaching: string | null;
  readonly machinery: Readonly<Record<string, unknown>> | null;
  /**
   * ⭐ The manuscript prose MAIA is authorized to author for this observation.
   * ⛔ A facet may never change it (FACETS-01 §9.3 / L6b).
   */
  readonly maiaAuthoredProposals: readonly string[];
  readonly revisionAuthority: 'member-authorizes';
}

export interface FacetPresentation {
  /** ⭐ Everything the member can reach in this facet, however paged. */
  readonly reachable: readonly FacetExpression[];
  /** What this facet opens by default. ⭐ Must be a prefix of `reachable`. */
  readonly initiallyExpanded: readonly FacetExpression[];
}

/**
 * ⭐ Carries a reader ON PURPOSE. A conforming renderer never calls it; the
 * suite counts calls. Without this handle §V is unfalsifiable.
 */
export interface FacetContext {
  readonly reader: () => readonly ReaderClaimDraft[];
}

export type FacetRenderer = (
  facet: Facet,
  observations: readonly CanonicalObservation[],
  ctx: FacetContext,
) => FacetPresentation;
