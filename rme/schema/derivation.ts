/**
 * RME-001 — Falsification question 2: implicit member profiles through aggregation
 *
 * Honest finding, recorded rather than engineered around:
 *
 *   Encounters carry a cohortRef. Encounters can therefore be GROUPED by member.
 *   Grouping plus judgments is, arithmetically, a member profile.
 *
 * Removing the join is not available to us: ten LONGITUDINAL relationships are the
 * point of the programme. "How did MAIA learn Catherine differently from Andrea?"
 * and "did a correction change how she attended months later?" both require joining
 * a member's encounters across time.
 *
 * So the control cannot be "prevent joining". It must be:
 *
 *   Joining is permitted for READING. Deriving a per-member trait or scalar is refused.
 *
 * The distinction is between a SEQUENCE the evaluator reads and a VALUE the system
 * carries. A sequence of encounter judgments stays encounter-shaped. A mean, count,
 * rank, tendency or label collapses them into a property of the person — which is
 * `cognitiveAltitude` rebuilt out of evaluation metadata.
 */

import type { CohortRef, EncounterJudgment, EncounterRecord } from './encounter';

export class MemberTraitDerivationForbidden extends Error {
  constructor(readonly attempted: string) {
    super(
      `RME-001: refused to derive "${attempted}" — a per-member value. ` +
        'Judgments describe an encounter, never the person. ' +
        'A rolling per-member score recreates cognitiveAltitude in evaluation costume.',
    );
    this.name = 'MemberTraitDerivationForbidden';
  }
}

/**
 * The permitted longitudinal object: an ordered sequence, not a summary.
 * Note there is no numeric field, no label field, and no place to add one without
 * changing this type — which is a reviewable act.
 */
export interface LongitudinalSequence {
  readonly cohortRef: CohortRef;
  /** Encounter-shaped, temporally ordered, individually readable. */
  readonly encounters: readonly {
    readonly encounterId: string;
    readonly occurredAt: string;
    readonly epochId: string;
    readonly situation: string;
  }[];
}

export function longitudinalSequence(records: readonly EncounterRecord[]): LongitudinalSequence {
  if (records.length === 0) throw new Error('RME-001: empty sequence');
  const ref = records[0].cohortRef;
  if (records.some((r) => r.cohortRef !== ref)) {
    throw new Error('RME-001: a longitudinal sequence spans exactly one cohort ref');
  }
  return {
    cohortRef: ref,
    encounters: records
      .slice()
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
      .map((r) => ({
        encounterId: r.encounterId,
        occurredAt: r.occurredAt,
        epochId: r.epoch.id,
        situation: r.situation,
      })),
  };
}

/**
 * Every shape of per-member derivation we can name. Each refuses. They exist as
 * callable functions so the falsification suite can attack them by name rather
 * than assert that nobody wrote one.
 */
export const FORBIDDEN_DERIVATIONS = {
  meanScore: (_c: CohortRef, _j: readonly EncounterJudgment[]): never => {
    throw new MemberTraitDerivationForbidden('member.mean_dimension_score');
  },
  favourRatio: (_c: CohortRef, _j: readonly EncounterJudgment[]): never => {
    throw new MemberTraitDerivationForbidden('member.a_vs_b_favour_ratio');
  },
  tendencyLabel: (_c: CohortRef, _j: readonly EncounterJudgment[]): never => {
    throw new MemberTraitDerivationForbidden('member.tendency_label');
  },
  memoryBenefitRank: (_c: CohortRef, _j: readonly EncounterJudgment[]): never => {
    throw new MemberTraitDerivationForbidden('member.memory_benefit_rank');
  },
  needsLessMemory: (_c: CohortRef, _j: readonly EncounterJudgment[]): never => {
    throw new MemberTraitDerivationForbidden('member.needs_less_memory');
  },
} as const;

/**
 * Falsification question 5: can a judgment be mistaken for a fact about the member?
 *
 * Every judgment is rendered with its encounter scope attached, so a quotation
 * lifted out of context still carries "in encounter E". A claim that reads as a
 * statement about the person is refused at render time.
 */
const PERSON_CLAIM_PATTERNS = [
  /\bthis member (is|needs|tends|always|never)\b/i,
  /\bthey (always|never|tend to)\b/i,
  /\b(generally|typically|usually) (prefers|needs|responds)\b/i,
];

export class JudgmentReadsAsMemberFact extends Error {
  constructor(note: string) {
    super(
      `RME-001: judgment reads as a claim about the person, not the encounter: "${note}". ` +
        'Permitted: "In encounter E, A was more presumptuous than B."',
    );
    this.name = 'JudgmentReadsAsMemberFact';
  }
}

export function renderJudgment(j: EncounterJudgment): string {
  for (const p of PERSON_CLAIM_PATTERNS) {
    if (p.test(j.note)) throw new JudgmentReadsAsMemberFact(j.note);
  }
  return `In encounter ${j.encounterId}, on ${j.dimension}: favours ${j.favours}. ${j.note}`;
}
