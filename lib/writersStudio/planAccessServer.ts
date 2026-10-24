/**
 * Server-side Writer's Studio plan projection.
 *
 * Reuses the existing small-pilot DB authority. It intentionally does not
 * interpret general Soullab payment, member tiers, member.tester, query flags
 * or local storage as a Writer's Studio Pro entitlement. A paid source of truth
 * requires its own separately reviewed contract before commercial launch.
 */
import { readWriterPilotApproval } from './pilotGrantServer';
import { decideWriterStudioPlan } from './planPolicy';
import { requireIndependentPilotR20Grant } from './pilotR20Authority';

export async function writerStudioPlanForMember(memberId: string) {
  const approval = await readWriterPilotApproval(memberId);
  if (approval.eligible && approval.basis === 'founder_approved_beta') {
    // The database candidate alone is insufficient after a restore.
    // No positive Pro projection until a separate R20 authority proves
    // this exact member + grant generation is still valid.
    await requireIndependentPilotR20Grant({
      memberId,
      grantId: approval.grantId,
    });
  }
  return decideWriterStudioPlan(approval);
}
