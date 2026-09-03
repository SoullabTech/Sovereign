/**
 * BUILD-07A — DEVELOPMENTAL EVIDENCE · binding references to evidence.
 *
 * THE LANE'S SENTENCE, MADE STRUCTURAL:
 *
 *     No developmental observation exists without recoverable evidence.
 *
 * `evidenceRefs: string[]` does not establish that — an empty array satisfies
 * it. Neither does `NonEmptyArray<EvidenceRef>` alone: a non-empty list of
 * references that point at sections the reading never read is a non-empty
 * list of nothing. What establishes it is a value that CANNOT BE CONSTRUCTED
 * except by proving every reference against a specific evidence object:
 *
 *   - the ref is well-formed
 *   - it names sections / units the frozen state holds
 *   - coverage backs it at the depth it requires (INV-8)
 *   - a passage range lies inside its section as read
 *   - a run is exactly a contiguous run of the frozen topology
 *   - a structural ref is refused where no structure was supplied (INV-16a)
 *
 * `BoundEvidence` is a class with a private member and no exported
 * constructor. An object literal cannot satisfy it and no other module can
 * `new` it. A BUILD-07C observation that requires `evidence: BoundEvidence`
 * therefore cannot be serialized, deserialized, or built without having gone
 * through this proof — which is what "structurally dependent" means.
 *
 * ⛔ THIS MODULE DEFINES NO OBSERVATION. Lens, phenomenon, observation text,
 * interpretation and questions are BUILD-07B/07C. This is the relation an
 * observation will be required to carry.
 */

import {
  isEvidenceRef,
  isStructural,
  type EvidenceRef,
  type NonEmptyArray,
} from './evidenceRef';
import type { DevelopmentalEvidence } from './readState';

class Bound {
  /* Nominal, on purpose. A private member makes this type unforgeable by a
     structurally identical literal, and the class is not exported, so the
     only constructor reachable from outside this module is `bindEvidence`. */
  private readonly minted = true as const;
  constructor(
    readonly refs: NonEmptyArray<EvidenceRef>,
    /** The reading these refs were proven against. Recovery must use the same one. */
    readonly inputFingerprint: string,
  ) {}
  /** For a serializer. Serializing loses the proof; re-binding restores it. */
  toJSON(): { refs: NonEmptyArray<EvidenceRef>; inputFingerprint: string } {
    return { refs: this.refs, inputFingerprint: this.inputFingerprint };
  }
}

export type BoundEvidence = Bound;

export type BindRefusal =
  /** Nothing was offered. An observation with no evidence is not an observation. */
  | 'no_evidence'
  | 'malformed_ref'
  /** The ref names a section the frozen state does not hold. */
  | 'unknown_section'
  /** Prose-derived evidence on a section read at position depth only. */
  | 'body_not_read'
  | 'range_outside_section'
  /** A section-run must be exactly a contiguous run of the topology as read. */
  | 'run_not_as_read'
  /** Structural evidence where no authoritative structure was supplied. Absent, not degraded. */
  | 'structure_not_supplied'
  /** The ref names a unit the frozen structure does not hold — a proposal id, a reviewed key, or a later unit. */
  | 'unknown_structure_unit';

export type BindResult =
  | { ok: true; value: BoundEvidence }
  | { ok: false; refusal: BindRefusal; detail: string; index: number | null };

const refuse = (refusal: BindRefusal, detail: string, index: number | null = null): BindResult =>
  ({ ok: false, refusal, detail, index });

/**
 * Prove every reference against the evidence, or say which one fails and why.
 *
 * Refusal precedence is fixed: shape, then identity, then depth, then range.
 * A ref that is both malformed and unknown is malformed; a ref that names an
 * unread section is `body_not_read` only if the section exists.
 */
export function bindEvidence(
  refs: readonly unknown[],
  evidence: DevelopmentalEvidence,
): BindResult {
  if (refs.length === 0) {
    return refuse('no_evidence', 'an observation must rest on at least one evidence reference');
  }
  const { readState, coverage } = evidence;
  const topology = readState.sectionTopology;

  const proven: EvidenceRef[] = [];
  for (const [i, raw] of refs.entries()) {
    if (!isEvidenceRef(raw)) {
      return refuse('malformed_ref', `refs[${i}] is not a well-formed EvidenceRef`, i);
    }
    const ref = raw;

    if (isStructural(ref)) {
      const ctx = readState.structureContext;
      if (!ctx) {
        return refuse('structure_not_supplied',
          `refs[${i}] is structural, but no authoritative structure was supplied to this reading`, i);
      }
      const wanted = ref.kind === 'structure-unit' ? [ref.unitId]
        : ref.kind === 'structure-units' ? ref.unitIds : [];
      for (const id of wanted) {
        if (!ctx.units.some((u) => u.id === id)) {
          return refuse('unknown_structure_unit',
            `refs[${i}] names unit ${id}, which is not in the frozen authored structure`, i);
        }
      }
      proven.push(ref);
      continue;
    }

    if (ref.kind === 'section-run') {
      for (const id of ref.sectionIds) {
        if (!(id in readState.sections)) {
          return refuse('unknown_section', `refs[${i}] names section ${id}, which this reading does not hold`, i);
        }
      }
      const from = topology.indexOf(ref.sectionIds[0]);
      const asRead = topology.slice(from, from + ref.sectionIds.length);
      const exact = asRead.length === ref.sectionIds.length
        && asRead.every((id, k) => id === ref.sectionIds[k]);
      if (!exact) {
        return refuse('run_not_as_read',
          `refs[${i}] is not a contiguous run of the topology as read`, i);
      }
      proven.push(ref);
      continue;
    }

    /* section · passage */
    const state = readState.sections[ref.sectionId];
    if (!state) {
      return refuse('unknown_section', `refs[${i}] names section ${ref.sectionId}, which this reading does not hold`, i);
    }
    if (coverage.sections[ref.sectionId] !== 'body') {
      return refuse('body_not_read',
        `refs[${i}] is prose-derived, but section ${ref.sectionId} was read at position depth only`, i);
    }
    if (ref.kind === 'passage') {
      const length = state.range.end - state.range.start;
      if (ref.range.end > length) {
        return refuse('range_outside_section',
          `refs[${i}] names ${ref.range.start}–${ref.range.end} in a section that is ${length} code points as read`, i);
      }
    }
    proven.push(ref);
  }

  return { ok: true, value: new Bound(proven as unknown as NonEmptyArray<EvidenceRef>, readState.inputFingerprint) };
}

/**
 * The sections an observation spans but did not read at body depth (INV-9).
 *
 * Derived, never stored: storing it would let it disagree with the coverage it
 * summarises. The span is the topology between the earliest and latest section
 * any textual ref names; structural refs contribute their units' placements.
 * Every section in that span at less than body depth is unread.
 */
export function unreadSpan(
  bound: BoundEvidence,
  evidence: DevelopmentalEvidence,
): readonly string[] {
  const { readState, coverage } = evidence;
  const topology = readState.sectionTopology;
  const positionOf = new Map(topology.map((id, i) => [id, i]));
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  const touch = (id: string) => {
    const p = positionOf.get(id);
    if (p === undefined) return;
    if (p < lo) lo = p;
    if (p > hi) hi = p;
  };
  for (const ref of bound.refs) {
    switch (ref.kind) {
      case 'section':
      case 'passage':
        touch(ref.sectionId);
        break;
      case 'section-run':
        ref.sectionIds.forEach(touch);
        break;
      case 'structure-unit':
      case 'structure-units': {
        const ids = ref.kind === 'structure-unit' ? [ref.unitId] : ref.unitIds;
        for (const id of ids) {
          readState.structureContext?.units.find((u) => u.id === id)?.sectionIds.forEach(touch);
        }
        break;
      }
      case 'structure-topology':
        readState.structureContext?.units.forEach((u) => u.sectionIds.forEach(touch));
        break;
    }
  }
  if (lo > hi) return [];
  return topology.slice(lo, hi + 1).filter((id) => coverage.sections[id] !== 'body');
}
