/**
 * One server-side Writer admission decision.
 *
 * The decision reuses the existing private beta roster and founder witness
 * authority, plus the Free standing a writer keeps when their dated beta grant
 * ends (design #2263). It reads `admitted`, never the plan: Free is inside.
 * It does not inspect a query flag, browser state, general member tier, or
 * payment claim.
 */
import { writerStudioPlanForMember } from './planAccessServer';

export async function writerStudioAdmissionForMember(memberId: string) {
  const plan = await writerStudioPlanForMember(memberId);
  return plan.admitted
    ? ({ allowed: true, plan } as const)
    : ({ allowed: false, code: 'WRITER_STUDIO_INVITATION_REQUIRED', plan } as const);
}
