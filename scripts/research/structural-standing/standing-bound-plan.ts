import type { ResolvedClaimStanding } from './claim-standing';
import { StandingEnvelopeRefused, type StandingPlan } from './standing-envelope';

export interface StandingBoundPlan {
  readonly contextEvidenceIds: readonly string[];
  readonly synthesis: StandingPlan['synthesis'];
  readonly question?: string | null;
}

/**
 * Bind the substrate-owned current head for one claim into visible ground BEFORE rendering.
 * The model never chooses whether present member standing is included; it only chooses optional
 * contextual evidence plus its own synthesis/question. No prose is generated or rewritten here.
 */
export function bindCurrentStanding(
  rawPlan: StandingBoundPlan,
  claimKey: string,
  standing: ResolvedClaimStanding,
): StandingPlan {
  const currentId = standing.currentByClaimKey.get(claimKey);
  if (!currentId) throw new StandingEnvelopeRefused('recovery_missing_current_head', claimKey);

  const context = rawPlan.contextEvidenceIds.filter((id) => id !== currentId);
  return {
    ground: [{ evidenceId: currentId }, ...context.map((evidenceId) => ({ evidenceId }))],
    synthesis: rawPlan.synthesis,
    question: rawPlan.question ?? null,
  };
}
