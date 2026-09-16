import type { ResolvedClaimStanding } from './claim-standing';
import { renderStandingEnvelope, type RenderedStandingEnvelope, type StandingEvidence } from './standing-envelope';
import { deriveSupportGround } from './support-derived-ground';

export interface InterpretivePlan {
  readonly synthesis: readonly {
    readonly text: string;
    readonly basisEvidenceIds: readonly string[];
  }[];
  readonly question?: string | null;
}

export interface InterpretiveRenderedEnvelope {
  readonly text: string;
  readonly trace: {
    readonly grounded: RenderedStandingEnvelope['trace']['grounded'];
    readonly synthesis: readonly {
      readonly basisEvidenceIds: readonly string[];
      readonly standing: 'maia_provisional';
      readonly basisSemantics: 'lineage_not_entailment';
    }[];
  };
  readonly digest: string;
}

/**
 * MAIA-authored synthesis may be traceable to evidence without claiming that the evidence
 * entails the synthesis. Evidence ids establish lineage/basis only; standing remains provisional.
 */
export function renderInterpretiveBasisEnvelope(
  evidence: readonly StandingEvidence[],
  rawPlan: InterpretivePlan,
  claimKey: string,
  standing: ResolvedClaimStanding,
): InterpretiveRenderedEnvelope {
  const standingPlan = deriveSupportGround({
    synthesis: rawPlan.synthesis.map((item) => ({ text: item.text, supportEvidenceIds: item.basisEvidenceIds })),
    question: rawPlan.question ?? null,
  }, claimKey, standing);
  const rendered = renderStandingEnvelope(evidence, standingPlan, standing);
  return {
    text: rendered.text,
    trace: {
      grounded: rendered.trace.grounded,
      synthesis: rawPlan.synthesis.map((item) => ({
        basisEvidenceIds: [...item.basisEvidenceIds],
        standing: 'maia_provisional' as const,
        basisSemantics: 'lineage_not_entailment' as const,
      })),
    },
    digest: rendered.digest,
  };
}
