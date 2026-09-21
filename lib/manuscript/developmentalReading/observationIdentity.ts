/**
 * `WRITERS-STUDIO-OBSERVATION-IDENTITY-01 / I1` — identity, basis and position
 * for an admitted developmental observation.
 *
 * ⭐⭐ THE SEAM IS `freezeReading`, AND IT ALREADY EXISTED.
 *
 * I1 §1 requires EXACTLY ONE live mechanism by which a reader claim becomes a
 * canonical observation, and forbids a second. The census found that mechanism
 * already built: `freezeReading()` is the only place a `ReaderClaimDraft`
 * becomes a `DevelopmentalObservation`, and it has exactly one caller
 * (`commission.ts`). ⛔ So I1 does NOT introduce an admission point — a new one
 * would BE the second path the ruling forbids. It adds identity, basis and
 * position AT the seam that already admits.
 *
 * ⛔ NOTHING HERE MINTS OUTSIDE THE SEAM. `mintObservationId` has exactly one
 * call site in `lib/**`, and a guard asserts it.
 */

import { createHash, randomUUID } from 'crypto';
import type { EvidenceRef, NonEmptyArray } from '../development/evidenceRef';
import type { DevelopmentalLens, DevelopmentalNonConclusion } from '../developmentalReader/contract';

/* ── identity (§3) ───────────────────────────────────────────────────────── */

/**
 * ⭐ Opaque · minted at admission · ⛔ never derived from the claim text, from
 * rendered facet text, or from the basis fingerprint · stable for the lifetime
 * of the admitted observation (readings are never corrected in place, INV-4).
 *
 * ⭐ It means THIS ADMITTED OBSERVATION FROM THIS READING. A later independent
 * reading mints a different identity even where the content looks similar;
 * ⛔ no cross-reading reconciliation is authorized.
 */
export type ObservationId = string & { readonly __brand: 'ObservationId' };

export type MintObservationId = () => ObservationId;

/**
 * ⭐ The ONLY minter. Random, so identity carries no content and no ordinal.
 *
 * ⚠️ Deliberately NOT derived from `(readingId, position)`: that would encode
 * admission order into the identity, and §3 asks for opacity. The reading's own
 * `key` (`o1`, `o2` …) remains the reading-internal ADDRESS — see the contract
 * note on why the two are different things and must stay so.
 */
export const mintObservationId: MintObservationId = () => `dobs_${randomUUID()}` as ObservationId;

/* ── basis fingerprint (§4) ──────────────────────────────────────────────── */

/**
 * ⭐ An INTEGRITY WITNESS: *this observation is still grounded in the same
 * basis.* ⛔ NEVER identity · ⛔ never deduplication · ⛔ never semantic sameness
 * · ⛔ never ranking.
 *
 * ⭐ Two observations may lawfully share one fingerprint — that is the §III
 * falsifier, and a design in which the fingerprint IS the identity collapses
 * them (defeat candidate D2).
 */
export type BasisFingerprint = string & { readonly __brand: 'BasisFingerprint' };

export function computeBasisFingerprint(input: {
  readonly lens: DevelopmentalLens;
  readonly evidenceRefs: NonEmptyArray<EvidenceRef>;
  readonly doesNotEstablish: NonEmptyArray<DevelopmentalNonConclusion>;
  /** The revision this reading froze — basis drift includes the Work moving. */
  readonly revisionDigest: string;
}): BasisFingerprint {
  const refs = input.evidenceRefs
    .map((r) => JSON.stringify(r, Object.keys(r).sort()))
    .sort();
  const canonical = JSON.stringify({
    lens: input.lens,
    revisionDigest: input.revisionDigest,
    refs,
    doesNotEstablish: [...input.doesNotEstablish].sort(),
  });
  /* ⛔ `observation` (the claim text) is absent BY CONSTRUCTION — the basis is
     what the noticing rests on, never what it says. */
  return createHash('sha256').update(canonical).digest('hex') as BasisFingerprint;
}

/* ── manuscript position (§5) ────────────────────────────────────────────── */

export interface ManuscriptPosition {
  readonly sectionPosition: number;
  readonly codePointStart: number;
}

/**
 * ⚠️ NOT EVERY OBSERVATION HAS A POSITION, and the ruling's formula is silent
 * on it. Three of the six evidence-ref kinds — `structure-unit`,
 * `structure-units`, `structure-topology` — name authored divisions and carry
 * NO section at all. An observation citing only those is about the Work's
 * topology, not about a place in its prose.
 *
 * ⭐ So position is NULLABLE, and a null sorts AFTER every positioned
 * observation, ⛔ never before and ⛔ never interleaved. Among themselves such
 * observations hold admission order. That keeps the order total and
 * non-evaluative without inventing a position the evidence does not carry.
 */
export function resolveManuscriptPosition(
  refs: NonEmptyArray<EvidenceRef>,
  sectionTopology: readonly string[],
): ManuscriptPosition | null {
  let best: ManuscriptPosition | null = null;
  const consider = (sectionId: string, codePointStart: number) => {
    const sectionPosition = sectionTopology.indexOf(sectionId);
    /* ⛔ A section the topology does not name contributes NO position. It is not
       coerced to 0, which would place it first in the Work. */
    if (sectionPosition < 0) return;
    const p = { sectionPosition, codePointStart };
    if (best === null
      || p.sectionPosition < best.sectionPosition
      || (p.sectionPosition === best.sectionPosition && p.codePointStart < best.codePointStart)) {
      best = p;
    }
  };

  for (const ref of refs) {
    switch (ref.kind) {
      case 'section': consider(ref.sectionId, 0); break;
      case 'passage': consider(ref.sectionId, ref.range.start); break;
      case 'section-run': for (const id of ref.sectionIds) consider(id, 0); break;
      /* ⛔ Structural refs carry no place in the prose. No position, by design. */
      case 'structure-unit': case 'structure-units': case 'structure-topology': break;
    }
  }
  return best;
}

/* ── the lawful total order (§5) ─────────────────────────────────────────── */

export interface Ordered {
  readonly position: ManuscriptPosition | null;
  readonly admissionIndex: number;
}

/**
 * ⭐ Manuscript order, then `admissionIndex`. ⛔ NO evaluative tie-break may
 * enter this seam — not severity, confidence, actionability, editorial
 * consequence, presumed importance, or ease of revision.
 *
 * ⭐ `admissionIndex` is non-evaluative by construction: it records WHEN an
 * observation entered the record, never how much it matters.
 */
export function compareAdmitted(a: Ordered, b: Ordered): number {
  if (a.position === null && b.position === null) return a.admissionIndex - b.admissionIndex;
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  if (a.position.sectionPosition !== b.position.sectionPosition) {
    return a.position.sectionPosition - b.position.sectionPosition;
  }
  if (a.position.codePointStart !== b.position.codePointStart) {
    return a.position.codePointStart - b.position.codePointStart;
  }
  return a.admissionIndex - b.admissionIndex;
}
