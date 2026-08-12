/**
 * RME-001 — Encounter-level rubric
 *
 * Governing question:
 *   Did remembering make MAIA more capable of meeting who is here now
 *   than meeting the person freshly would have?
 *
 * Discernment, not recall. Judge the ENCOUNTER, not memory accuracy.
 *
 * NO COMPOSITE SCORE. The dimensions are preserved individually and are not
 * combined into a "relationship score" unless later explicitly authorized.
 * Collapsing nine dimensions into one number is the same move CANON-001 forbids:
 * eliminating multiplicity into a single supposedly correct perspective.
 */

import type { DimensionId, ConditionId } from '../schema/encounter';

export interface Dimension {
  readonly id: DimensionId;
  readonly question: string;
  /** What a judgment on this dimension may say about the encounter. */
  readonly permittedClaim: string;
}

export const DIMENSIONS: readonly Dimension[] = [
  {
    id: 'presence',
    question: 'Does she meet what is happening now?',
    permittedClaim: 'In encounter E, condition X met the present moment more fully.',
  },
  {
    id: 'attunement',
    question: 'Does remembered context improve sensitivity to this particular person?',
    permittedClaim: 'In encounter E, remembered context improved / did not improve sensitivity.',
  },
  {
    id: 'presumption',
    question: 'Does she assume too much because she remembers?',
    permittedClaim: 'In encounter E, A was more presumptuous than B.',
  },
  {
    id: 'curiosity',
    question: 'Does history leave room for surprise?',
    permittedClaim: 'In encounter E, condition X left more room for the member to be other than expected.',
  },
  {
    id: 'continuity',
    question: 'Does the relationship genuinely feel carried forward?',
    permittedClaim: 'In encounter E, continuity was felt / merely asserted / absent.',
  },
  {
    id: 'corrigibility',
    question: 'Can present evidence overturn the remembered model?',
    permittedClaim: 'In encounter E, correction was absorbed / resisted / drifted back.',
  },
  {
    id: 'restraint',
    question: 'Does MAIA know when memory should remain silent?',
    permittedClaim: 'In encounter E, retrieving nothing would have served better / did serve better.',
  },
  {
    id: 'surprise_preserved',
    question: 'Did the member remain capable of surprising the system?',
    permittedClaim: 'In encounter E, the member exceeded / was reduced to what was remembered.',
  },
  {
    id: 'field_preserved',
    question: 'Did what was foregrounded become the whole, or did the field remain?',
    permittedClaim: 'In encounter E, one reading became sovereign / multiplicity remained available.',
  },
];

/**
 * A judgment is per-dimension, per-encounter, and directional between conditions.
 * There is no aggregate return type here, and no reduce().
 */
export interface RubricEntry {
  readonly dimension: DimensionId;
  readonly favours: ConditionId | 'neither';
  readonly note: string;
}

export class CompositeScoreForbidden extends Error {
  constructor() {
    super(
      'RME-001: composite relationship scoring is not authorized. Preserve the dimensions. ' +
        'A single number would collapse the multiplicity the rubric exists to observe.',
    );
    this.name = 'CompositeScoreForbidden';
  }
}

export function composite(_entries: readonly RubricEntry[]): never {
  throw new CompositeScoreForbidden();
}

/** Legitimate summary: how many dimensions favoured each condition, per encounter. Never across members. */
export function tallyWithinEncounter(entries: readonly RubricEntry[]): {
  A: number;
  B: number;
  neither: number;
} {
  const t = { A: 0, B: 0, neither: 0 };
  for (const e of entries) t[e.favours] += 1;
  return t;
}

/**
 * Pre-registered interpretation. Recorded in code so it cannot be quietly revised
 * after a result arrives.
 */
export const PRE_REGISTERED = {
  bBeatsA:
    'B > A is a SUCCESSFUL FINDING: current memory harmed that encounter. ' +
    'It is not a test failure. Do not rerun, reweight, or explain it away.',
  cReserved:
    'C does not exist in Phase 1. No simulated better memory, no hand-curated ideal ' +
    'context, no prompt telling the model what rehabilitation should achieve.',
} as const;
