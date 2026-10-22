/**
 * WS-TIERS-R7 — one authoritative small-pilot read policy.
 *
 * The old source treated an active member-linked ops_contacts beta_tester
 * as sufficient access. CRM labels identify possible candidates, NOT
 * founder approval, member-owned acceptance, or R20 restoration safety.
 *
 * Both beta-access UI and explicit beta feedback now consume the SAME
 * session-scoped, founder-granted, independent-R20-verified plan resolver.
 * No frontend flag, contact label, general membership tier or stale
 * restored grant can mint admission.
 */
import { writerStudioPlanForMember } from './planAccessServer';

export type WritersStudioBetaAccess =
  | { eligible: true; basis: 'founder_approved_beta' | 'founder_witness' }
  | { eligible: false; basis: 'not_in_pilot' };

export async function writersStudioBetaAccess(memberId: string): Promise<WritersStudioBetaAccess> {
  const decision = await writerStudioPlanForMember(memberId);
  if (decision.pilotEligible === true
    && decision.plan === 'pro'
    && decision.complimentary === true
    && decision.paymentEnabled === false
    && (decision.basis === 'founder_approved_beta' || decision.basis === 'founder_witness')) {
    return { eligible: true, basis: decision.basis };
  }
  return { eligible: false, basis: 'not_in_pilot' };
}
