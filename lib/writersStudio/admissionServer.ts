/**
 * One server-side Writer admission decision.
 *
 * The decision reuses the existing private beta roster and founder witness
 * authority. It does not inspect a query flag, browser state, general member
 * tier, or payment claim.
 *
 * Free admission (step B, founder ruling 2026-11-02 "ADMIT FREE NOW"; ./freeAdmission.ts): when the door is open AND
 * the Free/Pro boundaries are on, a signed-in member who is not in the pilot is admitted on the Free plan. With it
 * closed (the default), this decision is exactly as before.
 */
import { writerStudioPlanForMember } from './planAccessServer';
import { freeAdmissionOpen } from './freeAdmission';

export async function writerStudioAdmissionForMember(memberId: string) {
  const plan = await writerStudioPlanForMember(memberId);
  if (plan.pilotEligible) return { allowed: true, plan } as const;
  if (freeAdmissionOpen()) return { allowed: true, plan } as const; // plan.plan === 'free'
  return { allowed: false, code: 'WRITER_STUDIO_INVITATION_REQUIRED', plan } as const;
}

/** Re-exported for callers that already import admission from here. */
export { admittedToStudio } from './betaAccessServer';
