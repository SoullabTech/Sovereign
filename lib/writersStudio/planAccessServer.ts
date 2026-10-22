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

export async function writerStudioPlanForMember(memberId: string) {
  return decideWriterStudioPlan(await readWriterPilotApproval(memberId));
}
