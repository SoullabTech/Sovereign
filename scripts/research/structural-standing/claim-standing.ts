import { StandingEnvelopeRefused, type StandingEvidence } from './standing-envelope';

/**
 * S4 — append-only present-standing acts.
 *
 * The evidence remains immutable. A ClaimStandingAct says only that THIS member-authored
 * evidence succeeded an earlier member-authored statement for one bounded claim key.
 * Current standing is derived from succession; no model field can mint or rewrite it.
 */
export interface ClaimStandingAct {
  readonly actId: string;
  readonly claimKey: string;
  readonly evidenceId: string;
  readonly supersedesEvidenceId: string | null;
}

export interface ResolvedEvidenceStanding {
  readonly evidenceId: string;
  readonly claimKey: string;
  readonly status: 'current' | 'superseded';
  readonly predecessorEvidenceId: string | null;
  readonly successorEvidenceId: string | null;
}

export interface ResolvedClaimStanding {
  readonly byEvidenceId: ReadonlyMap<string, ResolvedEvidenceStanding>;
  readonly currentByClaimKey: ReadonlyMap<string, string>;
  readonly acts: readonly ClaimStandingAct[];
}

const nonBlank = (value: string, where: string): void => {
  if (!value.trim()) throw new StandingEnvelopeRefused('invalid_claim_act', where);
};

export function resolveClaimStanding(
  evidence: readonly StandingEvidence[],
  acts: readonly ClaimStandingAct[],
): ResolvedClaimStanding {
  const evidenceById = new Map(evidence.map((e) => [e.id, e] as const));
  const seenActIds = new Set<string>();
  const seenEvidence = new Set<string>();
  const successor = new Map<string, string>();
  const predecessor = new Map<string, string | null>();
  const claimForEvidence = new Map<string, string>();

  for (const act of acts) {
    nonBlank(act.actId, 'actId');
    nonBlank(act.claimKey, 'claimKey');
    nonBlank(act.evidenceId, 'evidenceId');
    if (seenActIds.has(act.actId)) throw new StandingEnvelopeRefused('duplicate_claim_act', act.actId);
    seenActIds.add(act.actId);
    if (seenEvidence.has(act.evidenceId)) throw new StandingEnvelopeRefused('duplicate_claim_evidence', act.evidenceId);
    seenEvidence.add(act.evidenceId);

    const subject = evidenceById.get(act.evidenceId);
    if (!subject) throw new StandingEnvelopeRefused('unknown_evidence', act.evidenceId);
    if (subject.authoredBy !== 'member') {
      throw new StandingEnvelopeRefused('claim_standing_requires_member_evidence', act.evidenceId);
    }

    if (act.supersedesEvidenceId !== null) {
      const prior = evidenceById.get(act.supersedesEvidenceId);
      if (!prior) throw new StandingEnvelopeRefused('unknown_evidence', act.supersedesEvidenceId);
      if (prior.authoredBy !== 'member') {
        throw new StandingEnvelopeRefused('claim_standing_requires_member_evidence', act.supersedesEvidenceId);
      }
      const priorClaim = claimForEvidence.get(act.supersedesEvidenceId);
      if (priorClaim !== act.claimKey) {
        throw new StandingEnvelopeRefused('cross_claim_supersession', `${act.evidenceId}->${act.supersedesEvidenceId}`);
      }
      if (successor.has(act.supersedesEvidenceId)) {
        throw new StandingEnvelopeRefused('branched_claim_standing', act.supersedesEvidenceId);
      }
      successor.set(act.supersedesEvidenceId, act.evidenceId);
    } else {
      // One root per claim. A second root would create two simultaneous currents.
      if ([...claimForEvidence.values()].includes(act.claimKey)) {
        throw new StandingEnvelopeRefused('multiple_claim_roots', act.claimKey);
      }
    }

    predecessor.set(act.evidenceId, act.supersedesEvidenceId);
    claimForEvidence.set(act.evidenceId, act.claimKey);
  }

  const currentByClaimKey = new Map<string, string>();
  const byEvidenceId = new Map<string, ResolvedEvidenceStanding>();
  for (const act of acts) {
    const next = successor.get(act.evidenceId) ?? null;
    const status = next === null ? 'current' : 'superseded';
    if (status === 'current') {
      if (currentByClaimKey.has(act.claimKey)) {
        throw new StandingEnvelopeRefused('multiple_current_claims', act.claimKey);
      }
      currentByClaimKey.set(act.claimKey, act.evidenceId);
    }
    byEvidenceId.set(act.evidenceId, {
      evidenceId: act.evidenceId,
      claimKey: act.claimKey,
      status,
      predecessorEvidenceId: predecessor.get(act.evidenceId) ?? null,
      successorEvidenceId: next,
    });
  }

  return { byEvidenceId, currentByClaimKey, acts: [...acts] };
}
