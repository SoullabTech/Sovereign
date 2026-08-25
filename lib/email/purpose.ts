/**
 * EMAIL PURPOSE + PRIORITY — the classification every outbound message carries.
 * ===========================================================================
 *
 * Why this exists:
 *   Before this module `purpose` was a free-form string used only as a log
 *   label. That is enough to read one line after the fact; it is NOT enough to
 *   answer the operational question that actually matters: *can a runaway
 *   reminder loop consume the capacity that member sign-in codes depend on?*
 *
 *   Answering that requires purposes to be enumerable and to carry a lane. A
 *   lane is not throughput and it is not a separate provider account — it is
 *   the classification that makes protecting P0 possible. Physical separation
 *   (per-lane budgets, per-lane providers, reserved capacity) is built ON this;
 *   it cannot be built without it.
 *
 * What this module does NOT claim:
 *   Declaring a lane does not meter it. `resolvePriority` tells you what a send
 *   IS; it does not throttle it. Guards that act on the lane live in
 *   lib/email/guards.ts and are named there.
 */

/**
 * Delivery lanes, most protected first.
 *
 * P0  identity — a member cannot sign in without it. Never shares an
 *     exhaustible budget with anything below it.
 * P1  access — invitations and service notices that gate participation.
 * P2  transactional — notifications, reminders, reports, workflow mail.
 * P3  bulk — broadcast and campaign-like traffic. First to be shed.
 */
export type EmailPriority = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * The canonical purpose vocabulary.
 *
 * Purposes are `family:specific`. The family prefix is load-bearing: an
 * unregistered purpose inherits its family's lane (see resolvePriority), so a
 * new `reminder:*` sender lands in P2 rather than nowhere.
 *
 * This list is derived from the senders that exist in the repository, not
 * invented. Adding a sender means adding its purpose here.
 */
export const EMAIL_PURPOSE_LANES = {
  // ---- P0 · identity -------------------------------------------------------
  'auth:email-code': 'P0',
  'auth:magic-link': 'P0',
  'auth:verification': 'P0',
  'auth:password-reset': 'P0',
  'auth:passkey-recovery': 'P0',
  'security:notice': 'P0',

  // ---- P1 · access ---------------------------------------------------------
  'invite:beta': 'P1',
  'invite:beta-passcode': 'P1',
  'invite:team': 'P1',
  'invite:practice-field': 'P1',
  'invite:steward': 'P1',
  'invite:gift': 'P1',
  'invite:bead': 'P1',
  'system:alert': 'P1',
  'security:alert': 'P1',

  // ---- P2 · transactional --------------------------------------------------
  'notify:mention': 'P2',
  'notify:dm': 'P2',
  'notify:channel': 'P2',
  'notify:partner': 'P2',
  'notify:safety': 'P2',
  'notify:field-message': 'P2',
  'reminder:session': 'P2',
  'reminder:focus': 'P2',
  'portal:booking-confirmation': 'P2',
  'portal:booking-notification': 'P2',
  'portal:booking-cancellation': 'P2',
  'portal:booking-cancellation-practitioner': 'P2',
  'portal:booking-reschedule': 'P2',
  'portal:booking-reschedule-practitioner': 'P2',
  'portal:inquiry-notification': 'P2',
  'portal:portal-claim-invite': 'P2',
  'feedback:submission': 'P2',
  'build:alert': 'P2',
  'practitioner:scheduled-send': 'P2',
  'practitioner:session-followup': 'P2',

  // ---- P3 · bulk -----------------------------------------------------------
  'broadcast:update': 'P3',
  'broadcast:announcement': 'P3',
} as const satisfies Record<string, EmailPriority>;

export type EmailPurpose = keyof typeof EMAIL_PURPOSE_LANES;

/** Family-level fallback for purposes not registered individually. */
const FAMILY_LANES: Record<string, EmailPriority> = {
  auth: 'P0',
  security: 'P0',
  invite: 'P1',
  system: 'P1',
  notify: 'P2',
  reminder: 'P2',
  portal: 'P2',
  feedback: 'P2',
  build: 'P2',
  practitioner: 'P2',
  broadcast: 'P3',
};

/**
 * The lane an unrecognised purpose lands in.
 *
 * DELIBERATELY P2, and deliberately not P0. An unknown purpose must never be
 * able to promote itself into the protected identity lane simply by being
 * unregistered — that would make the P0 guarantee a formality. P3 would be the
 * opposite error: silently shedding mail nobody classified. P2 is the honest
 * answer: normal transactional, metered like everything else.
 */
export const DEFAULT_PRIORITY: EmailPriority = 'P2';

/**
 * Resolve the lane for a purpose.
 *
 * Exact registration wins; then the family prefix; then DEFAULT_PRIORITY.
 * Never throws — an unclassifiable purpose is a metering question, not a
 * reason to drop a member's mail on the floor.
 */
export function resolvePriority(purpose: string): EmailPriority {
  const exact = (EMAIL_PURPOSE_LANES as Record<string, EmailPriority>)[purpose];
  if (exact) return exact;

  const family = purpose.includes(':') ? purpose.slice(0, purpose.indexOf(':')) : purpose;
  const byFamily = FAMILY_LANES[family];
  if (byFamily) return byFamily;

  return DEFAULT_PRIORITY;
}

/** True when the purpose is registered by name (not merely family-matched). */
export function isRegisteredPurpose(purpose: string): purpose is EmailPurpose {
  return Object.prototype.hasOwnProperty.call(EMAIL_PURPOSE_LANES, purpose);
}

/** Every purpose registered in a given lane. Used by operational read models. */
export function purposesInLane(priority: EmailPriority): EmailPurpose[] {
  return (Object.keys(EMAIL_PURPOSE_LANES) as EmailPurpose[]).filter(
    (p) => EMAIL_PURPOSE_LANES[p] === priority
  );
}
