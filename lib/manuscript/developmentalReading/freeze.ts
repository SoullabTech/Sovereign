/**
 * BUILD-07C — DEVELOPMENTAL READING · the freeze, pure.
 *
 * From an ACCEPTED reader result to the reading the store will mint. No
 * database, no model, no clock: everything that could be wrong is decided here
 * with a typed refusal, so the contract is proven in unit tests and a defect is
 * a red test rather than a frozen row a member later relies on.
 *
 * WHAT THE FREEZE DOES
 *   · refuses a refused reader result — a refusal is never a reading (§10)
 *   · re-binds every claim's refs against the request's evidence (INV-5, INV-8)
 *     and refuses the whole freeze on one unbindable ref — never a subset
 *   · proves the reader's claims were made against THIS evidence
 *     (inputFingerprint equality between the bound proof and the request)
 *   · takes the claim text VERBATIM as the observation (founder ruling: no
 *     rewriting) and the claim's non-conclusions with it
 *   · copies the commissioned lens onto every observation (INV-10); takes the
 *     phenomenon from the classifier, one per claim, from the closed v1 family
 *   · derives structureDependency from the refs (INV-16): any structural ref
 *     → authored-structure, which bindEvidence admits only where frozen
 *     authored structure was supplied (INV-16a)
 *   · keys observations `o1 … oN` by position — stable for the life of the
 *     reading because the reading is immutable (INV-2, INV-4)
 *   · a `none` result freezes as a complete `none` reading with full readState,
 *     coverage and provenance (INV-23, INV-24)
 *
 * WHAT IT DOES NOT DO
 *   · mint an id or stamp frozenAt — the store's (INV-1, INV-25)
 *   · write interpretation, questions, possibilities, uncertainty — absent by
 *     construction in v1
 *   · touch the Work
 */

import { bindEvidence } from '../development/bind';
import { isStructural, type EvidenceRef, type NonEmptyArray } from '../development/evidenceRef';
import type { DevelopmentalReaderRequest, DevelopmentalReaderResult } from '../developmentalReader/contract';
import type { ReaderIdentity } from '../structure/readerProvenance';
import {
  isPhenomenon,
  observationKey,
  type ClassifierIdentity,
  type DevelopmentalObservation,
  type DevelopmentalPhenomenon,
  type ReadingToFreeze,
  type StructureDependency,
} from './contract';

export interface FreezeInput {
  manuscriptId: string;
  request: DevelopmentalReaderRequest;
  result: DevelopmentalReaderResult;
  /** One per claim, in claim order. Empty for a `none` result. */
  phenomena: readonly DevelopmentalPhenomenon[];
  reader: ReaderIdentity;
  /** Required iff the result has claims. */
  classifier: ClassifierIdentity | null;
}

export type FreezeRefusal =
  /** The reader refused; there is nothing to freeze. */
  | 'reader_refused'
  /** Phenomena do not line up one-to-one with claims. */
  | 'classification_count_mismatch'
  | 'unknown_phenomenon'
  /** A `none` result was offered a classifier, or claims were offered none. */
  | 'classifier_presence_mismatch'
  /** A claim's refs do not bind against the request's evidence. Whole freeze refused. */
  | 'claim_unbindable'
  /** The bound proof names a different evidence object than the request. */
  | 'fingerprint_mismatch'
  | 'empty_observation';

export type FreezeOutcome =
  | { ok: true; value: ReadingToFreeze }
  | { ok: false; refusal: FreezeRefusal; detail: string; index: number | null };

const refuse = (refusal: FreezeRefusal, detail: string, index: number | null = null): FreezeOutcome =>
  ({ ok: false, refusal, detail, index });

export function structureDependencyOf(refs: readonly EvidenceRef[]): StructureDependency {
  return refs.some(isStructural) ? { kind: 'authored-structure' } : { kind: 'independent' };
}

export function freezeReading(input: FreezeInput): FreezeOutcome {
  const { request, result, phenomena, reader, classifier, manuscriptId } = input;
  const { evidence } = request;
  const scope = {
    commissionedLens: request.commissionedLens,
    bodyScope: Object.entries(evidence.coverage.sections)
      .filter(([, d]) => d === 'body').map(([id]) => id)
      .sort((a, b) => evidence.readState.sectionTopology.indexOf(a) - evidence.readState.sectionTopology.indexOf(b)),
    withStructure: evidence.readState.structureContext !== undefined,
  };

  if (result.outcome === 'refused') {
    return refuse('reader_refused', `${result.refusal}: ${result.detail}`);
  }

  if (result.outcome === 'none') {
    if (phenomena.length !== 0) return refuse('classification_count_mismatch', 'a none result has no claims to classify');
    if (classifier !== null) return refuse('classifier_presence_mismatch', 'a none result was offered a classifier');
    return { ok: true, value: {
      manuscriptId, scope,
      readState: evidence.readState, coverage: evidence.coverage,
      provenance: { reader, classifier: null },
      outcome: 'none', observations: [],
    } };
  }

  if (classifier === null) return refuse('classifier_presence_mismatch', 'claims were offered no classifier identity');
  if (phenomena.length !== result.claims.length) {
    return refuse('classification_count_mismatch',
      `${result.claims.length} claim(s), ${phenomena.length} classification(s)`);
  }

  const observations: DevelopmentalObservation[] = [];
  for (const [i, claim] of result.claims.entries()) {
    const phenomenon = phenomena[i];
    if (!isPhenomenon(phenomenon)) {
      return refuse('unknown_phenomenon', `claims[${i}] classified as ${JSON.stringify(phenomenon)}`, i);
    }
    if (typeof claim.text !== 'string' || claim.text.trim() === '') {
      return refuse('empty_observation', `claims[${i}] has no text`, i);
    }
    /* Re-bound HERE, against the evidence this reading freezes — the reader's
       proof is not trusted across the seam, it is repeated. */
    const bound = bindEvidence(claim.refs, evidence);
    if (!bound.ok) {
      return refuse('claim_unbindable', `claims[${i}] ${bound.refusal}: ${bound.detail}`, i);
    }
    if (bound.value.inputFingerprint !== evidence.readState.inputFingerprint) {
      return refuse('fingerprint_mismatch',
        `claims[${i}] binds to ${bound.value.inputFingerprint}, not this reading's ${evidence.readState.inputFingerprint}`, i);
    }
    observations.push({
      key: observationKey(i),
      lens: request.commissionedLens,
      phenomenon,
      evidenceRefs: bound.value.refs,
      observation: claim.text,
      doesNotEstablish: claim.doesNotEstablish,
      structureDependency: structureDependencyOf(bound.value.refs),
    });
  }

  return { ok: true, value: {
    manuscriptId, scope,
    readState: evidence.readState, coverage: evidence.coverage,
    provenance: { reader, classifier },
    outcome: 'reading',
    observations: observations as unknown as NonEmptyArray<DevelopmentalObservation>,
  } };
}
