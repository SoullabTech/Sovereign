import { createHash } from 'node:crypto';
import { StandingEnvelopeRefused, renderStandingEnvelope, type StandingEvidence } from './standing-envelope';
import type { InterpretivePlan } from './interpretive-basis-envelope';

export interface CurrentTurnBasisRenderedEnvelope {
  readonly text: string;
  readonly trace: {
    readonly currentTurn: {
      readonly evidenceId: string;
      readonly authoredBy: 'member';
      readonly participationClass: 'authored';
      readonly authority: StandingEvidence['authority'];
      readonly presentation: 'implicit_current_turn';
    };
    readonly synthesis: readonly {
      readonly basisEvidenceIds: readonly string[];
      readonly standing: 'maia_provisional';
      readonly basisSemantics: 'lineage_not_entailment';
    }[];
  };
  readonly digest: string;
}

/**
 * General current-turn binding for additive conversation where no claim was corrected/superseded.
 * The current member-authored turn is substrate-known from turn construction. It governs the
 * composition trace but is not echoed back as a quotation by default: the person just said it.
 * Historical basis remains reversible in the synthesis trace without transcript replay.
 */
export function renderCurrentTurnBasisEnvelope(
  evidence: readonly StandingEvidence[],
  rawPlan: InterpretivePlan,
  currentEvidenceId: string,
): CurrentTurnBasisRenderedEnvelope {
  const byId = new Map(evidence.map((item) => [item.id, item] as const));
  const current = byId.get(currentEvidenceId);
  if (!current) throw new StandingEnvelopeRefused('unknown_evidence', currentEvidenceId);
  if (current.authoredBy !== 'member' || current.participationClass !== 'authored') {
    throw new StandingEnvelopeRefused('current_turn_requires_member_evidence', currentEvidenceId);
  }

  for (const synthesis of rawPlan.synthesis) {
    if (!synthesis.basisEvidenceIds?.length) {
      throw new StandingEnvelopeRefused('synthesis_requires_basis', 'basisEvidenceIds');
    }
    for (const evidenceId of synthesis.basisEvidenceIds) {
      if (!byId.has(evidenceId)) throw new StandingEnvelopeRefused('unknown_evidence', evidenceId);
    }
  }

  // Current standing is already present in the live turn. Do not mechanically echo it.
  const rendered = renderStandingEnvelope(evidence, {
    ground: [],
    synthesis: rawPlan.synthesis.map((item) => ({ text: item.text, supportEvidenceIds: item.basisEvidenceIds })),
    question: rawPlan.question ?? null,
  });

  const text = rendered.text;
  return {
    text,
    trace: {
      currentTurn: {
        evidenceId: currentEvidenceId,
        authoredBy: 'member',
        participationClass: 'authored',
        authority: current.authority,
        presentation: 'implicit_current_turn',
      },
      synthesis: rawPlan.synthesis.map((item) => ({
        basisEvidenceIds: [...item.basisEvidenceIds],
        standing: 'maia_provisional' as const,
        basisSemantics: 'lineage_not_entailment' as const,
      })),
    },
    digest: createHash('sha256').update(text).digest('hex'),
  };
}
