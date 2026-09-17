import type { ResolvedClaimStanding } from './claim-standing';
import { classifyRecoveryRefusal } from './recovery-taxonomy';
import {
  parseStandingPlan,
  renderStandingEnvelope,
  StandingEnvelopeRefused,
  type RenderedStandingEnvelope,
  type StandingEvidence,
  type StandingPlan,
} from './standing-envelope';

export interface StructuralRecoveryTrace {
  readonly reason: 'superseded_without_current';
  readonly insertedCurrentEvidenceIds: readonly string[];
  readonly originalGroundEvidenceIds: readonly string[];
  readonly recoveredGroundEvidenceIds: readonly string[];
  readonly synthesisUnchanged: true;
  readonly questionUnchanged: true;
  readonly regenerationCount: 0;
}

export type StructuralRecoveryResult =
  | {
      readonly status: 'rendered';
      readonly plan: StandingPlan;
      readonly rendered: RenderedStandingEnvelope;
      readonly recovery: null;
    }
  | {
      readonly status: 'recovered';
      readonly plan: StandingPlan;
      readonly rendered: RenderedStandingEnvelope;
      readonly recovery: StructuralRecoveryTrace;
    };

function staleClaimKeysForEvidence(
  evidenceId: string,
  byId: ReadonlyMap<string, StandingEvidence>,
  standing: ResolvedClaimStanding,
  seen = new Set<string>(),
): Set<string> {
  if (seen.has(evidenceId)) throw new StandingEnvelopeRefused('cyclic_evidence_lineage', evidenceId);
  seen.add(evidenceId);

  const evidence = byId.get(evidenceId);
  if (!evidence) throw new StandingEnvelopeRefused('unknown_evidence', evidenceId);

  const claimKeys = new Set<string>();
  const own = standing.byEvidenceId.get(evidenceId);
  if (own?.status === 'superseded') claimKeys.add(own.claimKey);

  for (const parentId of evidence.derivedFromEvidenceIds ?? []) {
    for (const claimKey of staleClaimKeysForEvidence(parentId, byId, standing, new Set(seen))) {
      claimKeys.add(claimKey);
    }
  }
  return claimKeys;
}

/**
 * One-shot structural recovery for a narrow composition defect:
 * a plan already references the authoritative current head in synthesis support,
 * but fails to make that head visible in ground while also foregrounding stale lineage.
 *
 * Recovery NEVER re-prompts or regenerates. It may only lift an already-referenced,
 * substrate-authoritative current evidence id into ground. Synthesis and question are immutable.
 */
export function renderWithStructuralRecovery(
  evidence: readonly StandingEvidence[],
  rawPlan: unknown,
  standing: ResolvedClaimStanding,
): StructuralRecoveryResult {
  const parsed = parseStandingPlan(rawPlan);

  try {
    return {
      status: 'rendered',
      plan: parsed,
      rendered: renderStandingEnvelope(evidence, parsed, standing),
      recovery: null,
    };
  } catch (error) {
    if (!(error instanceof StandingEnvelopeRefused)) throw error;
    const taxon = classifyRecoveryRefusal(error.code);
    if (taxon.disposition !== 'RECOVERABLE_COMPOSITION' || taxon.domain !== 'model_plan') {
      throw error;
    }
    // ACT 3 currently admits exactly one recoverable composition class. Keep this explicit so
    // taxonomy expansion cannot silently change the recovery trace contract.
    if (error.code !== 'superseded_without_current') throw error;
  }

  const byId = new Map(evidence.map((item) => [item.id, item] as const));
  const originalGroundIds = parsed.ground.map((item) => item.evidenceId);
  const groundIds = new Set(originalGroundIds);
  const supportIds = new Set(parsed.synthesis.flatMap((item) => item.supportEvidenceIds ?? []));
  const referencedIds = new Set([...groundIds, ...supportIds]);

  const staleClaimKeys = new Set<string>();
  for (const evidenceId of referencedIds) {
    for (const claimKey of staleClaimKeysForEvidence(evidenceId, byId, standing)) {
      staleClaimKeys.add(claimKey);
    }
  }

  const missingCurrentIds: string[] = [];
  for (const claimKey of [...staleClaimKeys].sort()) {
    const currentId = standing.currentByClaimKey.get(claimKey);
    if (!currentId) throw new StandingEnvelopeRefused('recovery_missing_current_head', claimKey);
    if (groundIds.has(currentId)) continue;

    // This is the constitutional boundary between composition repair and hidden cognition.
    // The substrate may surface a current head the model ALREADY used as support. It may not
    // introduce authoritative evidence the model failed to incorporate at all.
    if (!supportIds.has(currentId)) {
      throw new StandingEnvelopeRefused('recovery_current_not_referenced', currentId);
    }
    missingCurrentIds.push(currentId);
  }

  if (missingCurrentIds.length === 0) {
    throw new StandingEnvelopeRefused('recovery_not_applicable');
  }
  if (originalGroundIds.length + missingCurrentIds.length > 3) {
    throw new StandingEnvelopeRefused('recovery_ground_capacity');
  }

  const recovered: StandingPlan = {
    ground: [
      ...missingCurrentIds.map((evidenceId) => ({ evidenceId })),
      ...parsed.ground,
    ],
    synthesis: parsed.synthesis,
    question: parsed.question,
  };

  const originalSynthesis = JSON.stringify(parsed.synthesis);
  const originalQuestion = JSON.stringify(parsed.question);
  if (JSON.stringify(recovered.synthesis) !== originalSynthesis) {
    throw new StandingEnvelopeRefused('recovery_mutated_synthesis');
  }
  if (JSON.stringify(recovered.question) !== originalQuestion) {
    throw new StandingEnvelopeRefused('recovery_mutated_question');
  }

  const rendered = renderStandingEnvelope(evidence, recovered, standing);
  return {
    status: 'recovered',
    plan: recovered,
    rendered,
    recovery: {
      reason: 'superseded_without_current',
      insertedCurrentEvidenceIds: missingCurrentIds,
      originalGroundEvidenceIds: originalGroundIds,
      recoveredGroundEvidenceIds: recovered.ground.map((item) => item.evidenceId),
      synthesisUnchanged: true,
      questionUnchanged: true,
      regenerationCount: 0,
    },
  };
}
