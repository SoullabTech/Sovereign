/**
 * BCS-01A · Step 3 — may this candidate recurrence observation truthfully assert
 * recurrence over this stated coverage?
 *
 * DETERMINISTIC. NO PROSE. NO MODEL. The validity law is supplied entirely by the
 * ratified phenomenon definition in `lib/manuscript/developmentalReading/contract.ts`:
 *
 *   recurrence IS     an element or repeated gesture appearing at two or more
 *                     SEPARATED points in what was read, the repetition itself
 *                     being what the claim says is happening
 *   recurrence IS NOT a property holding uniformly across every unit read (that is
 *                     regularity); a whole-Work pattern asserted from partial coverage
 *
 * ⛔ THE CLASSIFIER IS NOT THIS GATE, AND IS NOT TOUCHED. `classify.ts` sees claim
 * text, lens and non-conclusions — never prose, coverage, or commissioned scope.
 * That is a sovereignty boundary, not a deficiency: classification must not reach
 * back into the Work and quietly become a second reader. Validity is established
 * HERE, before classification, and classification never cures invalid coverage.
 *
 * ⛔ COVERAGE IS NOT SCHEDULER BOOKKEEPING. This function accepts no partition,
 * job, checkpoint or progress input — there is no type through which "processed"
 * could be mistaken for "read". Only `DevelopmentalCoverage` enters, and only
 * BODY-depth sections count: knowing a section's position is not reading the thing
 * that supposedly recurred.
 */

import type { DevelopmentalCoverage } from '../manuscript/development/readState';

/**
 * How far the observation says its proposition reaches. Two extents only — this
 * proving workload does not invent a general claim-scope ontology.
 *
 *   coverage             recurrence exists within exactly the material actually read
 *   commissioned_scope   recurrence characterizes the commissioned sweep scope
 *
 * Coverage says what was read. Extent says how far the claim reaches. Neither is
 * inferred from the other.
 */
export type ClaimExtent = 'coverage' | 'commissioned_scope';

/** One evidence location supporting the claimed repetition. */
export interface OccurrenceLocation {
  readonly sectionId: string;
}

export interface RecurrenceCandidate {
  /** Sections the commission authorized the sweep to read. */
  readonly commissionedScope: readonly string[];
  /** What was ACTUALLY read, and at what depth. */
  readonly coverage: DevelopmentalCoverage;
  /** Where the repeated element or gesture was found. */
  readonly occurrences: readonly OccurrenceLocation[];
  readonly extent: ClaimExtent;
}

/** Propositions, not success vocabulary. Each names what is true of the candidate. */
export type RecurrenceVerdict =
  | 'ADMISSIBLE'
  | 'PARTIAL_COVERAGE'
  | 'REGULARITY'
  | 'INSUFFICIENT_SEPARATION'
  | 'EVIDENCE_OUTSIDE_COVERAGE';

export interface RecurrenceAdmission {
  readonly verdict: RecurrenceVerdict;
  /** Sections actually read at body depth — the only material a claim may rest on. */
  readonly bodyRead: readonly string[];
}

const bodyReadSections = (coverage: DevelopmentalCoverage): string[] =>
  Object.entries(coverage.sections)
    .filter(([, depth]) => depth === 'body')
    .map(([id]) => id)
    .sort();

/**
 * Order matters and is part of the law.
 *
 * 1  EVIDENCE_OUTSIDE_COVERAGE  before anything else: an occurrence that was never
 *    read is not evidence. Permission to read is not evidence that it was read.
 * 2  PARTIAL_COVERAGE           a claim reaching past what was read is refused for
 *    THAT reason, not for a downstream one.
 * 3  INSUFFICIENT_SEPARATION    "two refs in an array" is not "two separated points".
 * 4  REGULARITY                 uniform across every unit read is not recurrence,
 *    even with complete coverage and separated occurrences.
 */
export function admitRecurrence(candidate: RecurrenceCandidate): RecurrenceAdmission {
  const bodyRead = bodyReadSections(candidate.coverage);
  const readSet = new Set(bodyRead);

  // 1 — every occurrence must lie inside material actually read at body depth.
  for (const occ of candidate.occurrences) {
    if (!readSet.has(occ.sectionId)) {
      return { verdict: 'EVIDENCE_OUTSIDE_COVERAGE', bodyRead };
    }
  }

  // 2 — a commissioned-scope claim requires the commissioned scope to have been read.
  if (candidate.extent === 'commissioned_scope') {
    const unread = candidate.commissionedScope.filter((s) => !readSet.has(s));
    if (unread.length > 0) return { verdict: 'PARTIAL_COVERAGE', bodyRead };
  }

  // 3 — separation is measured in DISTINCT covered units. Deliberately narrower than
  // the natural-language definition: the evidence representation cannot yet establish
  // ordered separation WITHIN a section, so this does not manufacture it.
  const distinct = new Set(candidate.occurrences.map((o) => o.sectionId));
  if (distinct.size < 2) return { verdict: 'INSUFFICIENT_SEPARATION', bodyRead };

  // 4 — uniform across every unit read is regularity, not recurrence.
  const uniform = bodyRead.length > 0 && bodyRead.every((s) => distinct.has(s));
  if (uniform) return { verdict: 'REGULARITY', bodyRead };

  return { verdict: 'ADMISSIBLE', bodyRead };
}
