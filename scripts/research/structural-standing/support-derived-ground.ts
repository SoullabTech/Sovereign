import type { ResolvedClaimStanding } from './claim-standing';
import { StandingEnvelopeRefused, type StandingPlan } from './standing-envelope';

export interface SupportDerivedPlan {
  readonly synthesis: StandingPlan['synthesis'];
  readonly question?: string | null;
}

/**
 * Visible grounding is substrate-derived from present standing plus evidence the model actually
 * cites as synthesis support. The model has no separate authority over evidence presentation.
 */
export function deriveSupportGround(
  rawPlan: SupportDerivedPlan,
  claimKey: string,
  standing: ResolvedClaimStanding,
): StandingPlan {
  const currentId = standing.currentByClaimKey.get(claimKey);
  if (!currentId) throw new StandingEnvelopeRefused('recovery_missing_current_head', claimKey);

  const supportIds: string[] = [];
  const seen = new Set<string>([currentId]);
  for (const synthesis of rawPlan.synthesis) {
    for (const evidenceId of synthesis.supportEvidenceIds ?? []) {
      if (seen.has(evidenceId)) continue;
      seen.add(evidenceId);
      supportIds.push(evidenceId);
    }
  }
  return {
    ground: [{ evidenceId: currentId }, ...supportIds.map((evidenceId) => ({ evidenceId }))],
    synthesis: rawPlan.synthesis,
    question: rawPlan.question ?? null,
  };
}
