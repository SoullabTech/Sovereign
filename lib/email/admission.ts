/**
 * ADMISSION — who may cause Soullab to send mail, and where it may go.
 * ====================================================================
 *
 * MAIL-03 closed two endpoints. This states the RULE those fixes were
 * instances of, so the next endpoint cannot reopen the same hole by being
 * written without the same care.
 *
 * The incident's shape, stripped of detail:
 *
 *     an unauthenticated caller chose a destination,
 *     and the system sent there
 *
 * Note what is NOT the defect. Unauthenticated sending is legitimate and
 * unavoidable: a sign-in code, a password reset and a passkey recovery all
 * happen BEFORE the person can prove who they are. Requiring a session for
 * those would lock out precisely the people they exist to let in.
 *
 * The defect is the pairing. So the rule is about the pairing:
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  AN UNAUTHENTICATED SEND MAY ONLY REACH AN ADDRESS THE SYSTEM     │
 *   │  ALREADY HOLDS — NEVER ONE THE CALLER SUPPLIED.                   │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * An anonymous caller may ask us to mail a member. They may not tell us where
 * that member's mail goes. Under that rule the endpoint is a doorbell rather
 * than a relay: an attacker can make it ring, but it always rings at an address
 * we chose, and metering bounds how often.
 *
 * TWO AXES, NEVER COLLAPSED
 * =========================
 *   authority   answers "on whose behalf is this being sent?"
 *   destination answers "where did this address come from?"
 *
 * Collapsing them is what produced the vulnerable route:
 * `send-verification` had a legitimate PURPOSE, and that legitimacy was
 * silently read as licence over the DESTINATION. Purpose never licenses
 * destination. They are checked separately, and here.
 *
 * WHAT THIS MODULE DOES NOT DO
 * ============================
 * It does not meter. `admit()` answers whether a send is PERMISSIBLE, never
 * whether there is capacity for it — that is MAIL-05 (`guards.ts`), and it is
 * still unwritten. Admission without metering stops a stranger redirecting mail;
 * it does not stop them exhausting a lane. Both are needed; neither substitutes.
 *
 * It also never reads the ledger. Admission is a policy question answered from
 * the request; the ledger observes and does not authorize.
 */

import { resolvePriority, type EmailPriority } from './purpose';

/**
 * On whose behalf a send happens.
 *
 * `anonymous` is a first-class, legitimate value — not a failure to
 * authenticate. Identity mail depends on it.
 */
export type EmailAuthority =
  /** No proven actor. Sign-in codes, resets, recovery. Destination is constrained. */
  | { kind: 'anonymous' }
  /** A session-verified member acting on their own account. */
  | { kind: 'member'; memberId: string }
  /** A session-verified actor causing mail to someone else (invites, notifications). */
  | { kind: 'actor'; actorId: string; role?: string }
  /** An elevated operator: admin secret, ops tooling. */
  | { kind: 'admin'; actorId?: string }
  /** No human in the loop: cron, worker, migration, script. */
  | { kind: 'system'; trigger: string };

/**
 * Where the recipient address came from. This is the axis the incident turned
 * on, and it is about PROVENANCE, not shape — a validated address supplied by a
 * stranger is still supplied by a stranger.
 */
export type DestinationOrigin =
  /** Read from a stored record we own (members.email). Never from the request. */
  | 'member-record'
  /** Read from another persisted record (a booking, an invitation row). */
  | 'stored-record'
  /** Chosen by an authenticated actor — inviting someone not yet a member. */
  | 'actor-supplied'
  /** A fixed operational address from configuration (alerts, founder inbox). */
  | 'configured'
  /**
   * The caller supplied the address AND the message exists solely to TEST
   * control of it. A sign-in code mailed to a typed address is the mechanism
   * by which that address is proven; there is no record to read from yet.
   *
   * Admissible anonymously ONLY for purposes in IDENTITY_CLAIM_PURPOSES, and
   * only under a property the type cannot check for you:
   *
   *     the message must confer NOTHING except by being received.
   *
   * A one-time code satisfies this — intercepting the request gains an attacker
   * nothing, because the value lands in the mailbox they had to already control.
   * A message that DISCLOSES a standing secret does not: `auth:passkey-recovery`
   * mails an existing passkey, so it must confirm the address against the record
   * first and is 'member-record', never this.
   *
   * The distinction from the 2026-09 defect is the direction of the claim. Here
   * an unknown person asserts an address as their own. There, a stranger
   * asserted a NEW address for an EXISTING member — redirecting an identity
   * rather than claiming one.
   */
  | 'identity-claim'
  /** Chosen by the caller with no proven authority. Never admissible anonymously. */
  | 'request-supplied';

/**
 * The only purposes that may be sent anonymously to a caller-supplied address.
 *
 * Closed and short by design. Every entry is a message that is useless unless
 * it arrives at the address the caller named. Adding one is a decision about
 * whether that property holds — not a way to get a caller past `admit()`.
 */
export const IDENTITY_CLAIM_PURPOSES = new Set<string>([
  'auth:email-code',   // one-time sign-in code
  'auth:magic-link',   // single-use sign-in link
]);

export interface AdmissionRequest {
  purpose: string;
  authority: EmailAuthority;
  destination: DestinationOrigin;
}

export type AdmissionResult =
  | { admitted: true; lane: EmailPriority }
  | { admitted: false; reason: AdmissionRefusal; detail: string };

export type AdmissionRefusal =
  | 'anonymous_caller_chose_destination'
  | 'unauthenticated_actor_supplied'
  | 'identity_claim_not_permitted_for_purpose'
  | 'system_supplied_by_request';

/**
 * Decide whether a send is permissible.
 *
 * Never throws and never consults storage: given the same request it returns
 * the same answer, so it is fully testable and cannot fail open under load.
 */
export function admit(req: AdmissionRequest): AdmissionResult {
  const lane = resolvePriority(req.purpose);
  const { authority, destination } = req;

  // THE RULE. An anonymous caller may cause a send; they may not aim it —
  // except to claim an address as their own, which is the one case where
  // aiming IS the mechanism.
  if (authority.kind === 'anonymous') {
    if (destination === 'identity-claim') {
      if (!IDENTITY_CLAIM_PURPOSES.has(req.purpose)) {
        return {
          admitted: false,
          reason: 'identity_claim_not_permitted_for_purpose',
          detail:
            `purpose="${req.purpose}" is not an identity claim. Only ` +
            `${[...IDENTITY_CLAIM_PURPOSES].join(', ')} may be sent anonymously to a ` +
            `caller-supplied address, because only they confer nothing except by ` +
            `being received. Confirm the address against the member record instead.`,
        };
      }
      return { admitted: true, lane };
    }
    if (destination === 'request-supplied') {
      return {
        admitted: false,
        reason: 'anonymous_caller_chose_destination',
        detail:
          `purpose="${req.purpose}" was requested anonymously with a caller-supplied ` +
          `destination. An unauthenticated send may only reach an address the system ` +
          `already holds. Read the address from the member record instead.`,
      };
    }
    if (destination === 'actor-supplied') {
      return {
        admitted: false,
        reason: 'unauthenticated_actor_supplied',
        detail:
          `purpose="${req.purpose}" claims an actor-supplied destination but carries no ` +
          `actor. Either resolve the authority from the session or read the address ` +
          `from a stored record.`,
      };
    }
    return { admitted: true, lane };
  }

  // A system trigger has no request to be influenced by, so a destination
  // attributed to a request is a contradiction — it means an inbound value
  // reached a path that is supposed to run unattended.
  if (authority.kind === 'system' && destination === 'request-supplied') {
    return {
      admitted: false,
      reason: 'system_supplied_by_request',
      detail:
        `purpose="${req.purpose}" runs as system trigger "${authority.trigger}" but its ` +
        `destination is request-supplied. An unattended sender has no caller whose ` +
        `address it should honour.`,
    };
  }

  // A proven actor MAY choose a destination — that is what an invitation is.
  // Bounding how many they may choose is metering, and belongs to MAIL-05.
  return { admitted: true, lane };
}

/** True when this authority is a proven one. */
export function isAuthenticated(a: EmailAuthority): boolean {
  return a.kind === 'member' || a.kind === 'actor' || a.kind === 'admin';
}

/**
 * A log-safe description. Deliberately carries no address and no raw member id —
 * `memberId` is a UUID and safe by entropy, but this is a log label, and the
 * sanctioned derivation for correlation is memberRef() at the call site.
 */
export function describeAuthority(a: EmailAuthority): string {
  switch (a.kind) {
    case 'anonymous': return 'anonymous';
    case 'member':    return 'member';
    case 'actor':     return a.role ? `actor:${a.role}` : 'actor';
    case 'admin':     return 'admin';
    case 'system':    return `system:${a.trigger}`;
  }
}
