/**
 * HOUSE-ENTRANCE-01 — which door a member is shown for the two central offerings.
 *
 * Founder routing decision (2026-10-30, PR #2002): two first-class Home cards.
 *  - Pro Studio opens the full professional workspace ONLY for a verified Pro
 *    Studio paid entitlement; every other signed-in member gets a limited
 *    learn-and-try entry with NO forced practitioner enrollment.
 *  - Personal Portal/Ganesha is an independent personal space for every
 *    signed-in member; it never depends on Pro Studio or practitioner status.
 *  - A signed-out visitor sees an honest intro/sign-in door.
 *
 * This module decides the KIND of entrance. It deliberately returns no href:
 * the learn-and-try page, the Personal Portal entry and the paid entitlement
 * source are not built yet, and inventing destinations here would be a false
 * "available now" claim. Consumers map a kind to a route only once it exists.
 *
 * ⛔ NOT AUTHORIZATION. A practitioner row, studioMode, or any subscription
 * claim is NOT proof of a paid entitlement. Those facts are accepted in the
 * input type so the tests can show they have no effect; `proStudioEntitlement`
 * must come from a verified entitlement source, which does not exist yet — so
 * production callers must pass 'absent' until it does.
 */

export type ProStudioEntrance = 'signed_out_intro' | 'limited_try' | 'full_workspace';
export type PersonalPortalEntrance = 'signed_out_intro' | 'personal_space';

export interface EntranceFacts {
  signedIn: boolean;
  /** 'verified' ONLY from a verified entitlement source. Never inferred. */
  proStudioEntitlement: 'verified' | 'absent';
  /** Accepted so tests can prove it confers nothing. */
  hasPractitionerRow?: boolean;
  studioMode?: 'personal' | 'practice' | null;
}

export function resolveProStudioEntrance(facts: EntranceFacts): ProStudioEntrance {
  if (!facts.signedIn) return 'signed_out_intro';
  return facts.proStudioEntitlement === 'verified' ? 'full_workspace' : 'limited_try';
}

export function resolvePersonalPortalEntrance(facts: EntranceFacts): PersonalPortalEntrance {
  return facts.signedIn ? 'personal_space' : 'signed_out_intro';
}
