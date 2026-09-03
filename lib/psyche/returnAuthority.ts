/**
 * Return authority — MIPA Phase 0, P6 (Doorway Consent Integrity).
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P6
 *
 * ── THE CONSTITUTIONAL DEFECT THIS CLOSES ───────────────────────────────────
 *
 * `contextual_doorway` is a permission about FUTURE RESURFACING. The practitioner
 * bridge was collapsing three different authorities into one:
 *
 *     facilitator authored something
 *               ↓
 *     system stores it
 *               ↓
 *     return_preference = contextual_doorway
 *
 * A facilitator may have authority to author an attributed observation. That is
 * not authority to decide when MAIA may bring it back into the member's life.
 *
 * ── THE THREE INDEPENDENT PROPERTIES ────────────────────────────────────────
 *
 *     CONTENT AUTHORSHIP     Who said or wrote this?
 *              ≠
 *     EPISTEMIC AUTHORITY    What kind of claim is it?
 *              ≠
 *     RETURN AUTHORITY       Who authorized MAIA to resurface it?
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 *   A `contextual_doorway` return policy requires certifiable member-conferred
 *   return authority.
 *
 * Not practitioner intent. Not system inference. Not "this seems useful". Not
 * participation in the original session. Not absence of an objection. Not a
 * permissive column default.
 *
 * ── HOW IT IS ENFORCED, RATHER THAN CHECKED AFTERWARDS ──────────────────────
 *
 * `AuthorizedReturnPreference` carries a brand symbol that this module does not
 * export. No other module can write that key, so no other module can construct
 * the value — a caller cannot produce a contextual doorway by writing the
 * string, and a scan for naughty strings is not what stands between a
 * non-member actor and member consent. There are exactly two constructors, and
 * the permissive one refuses unless the acting principal IS the subject.
 *
 * A deliberate `as unknown as` cast can still forge one. That escape hatch is
 * detected by the certification suite rather than claimed to be impossible —
 * Grade B for that arm, stated rather than glossed.
 *
 * ── ANTI-LAUNDERING, IN BOTH DIRECTIONS ─────────────────────────────────────
 *
 * A future member authorization to resurface practitioner-authored material
 * does NOT change its authorship:
 *
 *     authored_by = practitioner       may coexist with
 *     return_authorized_by = member
 *
 * Return authority is never inferred from authorship, and authorship is never
 * rewritten from return authority. Practitioner material stays attributed; it
 * is not discarded to solve a consent problem.
 *
 * ── WHAT THIS MODULE DOES NOT DO ────────────────────────────────────────────
 *
 * It does not create the member-facing doorway-consent gesture. That gesture
 * does not exist for practitioner material and is not invented here. Until the
 * member has a way to say "you may bring this back", nobody else says it for
 * them, and the safe disposition is the one the schema already documents:
 *
 *     member_pulled: only when member asks directly (most restrictive)
 *
 * — `database/migrations/20260521000001_member_memory_atoms.sql`. That is the
 * truthful representation of "stored, attributed, no contextual return
 * authorized", so no misleading enum value has to be forced.
 */

import type { ReturnPreference } from './types';

/**
 * Not exported. A module that cannot name this key cannot build a value of the
 * branded type, which is what makes the permission unconstructable rather than
 * merely discouraged.
 */
declare const RETURN_AUTHORITY_BRAND: unique symbol;

export interface AuthorizedReturnPreference {
  readonly [RETURN_AUTHORITY_BRAND]: true;
  readonly preference: ReturnPreference;
  /** `member` only where the acting principal IS the subject of the material. */
  readonly authorizedBy: 'member' | 'none';
  /** Why this authority exists, in a form a reviewer can check. */
  readonly evidence: string;
}

/** What a member act must present before it can confer return authority. */
export interface MemberAuthorizationEvidence {
  /** The authenticated principal performing the act. */
  actingMemberId: string;
  /** The member the material is about. */
  subjectMemberId: string;
  /** The named gesture, from the discrete gesture vocabulary. */
  gesture: 'keep' | 'set_return_preference';
}

export class ReturnAuthorityError extends Error {}

/**
 * Return authority conferred by the member, for their own material.
 *
 * Throws when the acting principal is not the subject. A practitioner holding a
 * valid session, a system process running as a service, and an admin acting on
 * someone's behalf all fail here — which is the point. The check is on identity,
 * not on role, because a role list is a thing that grows.
 */
export function memberConferredReturn(
  preference: ReturnPreference,
  evidence: MemberAuthorizationEvidence,
): AuthorizedReturnPreference {
  if (!evidence.actingMemberId || !evidence.subjectMemberId) {
    throw new ReturnAuthorityError(
      'member-conferred return authority requires both an acting and a subject member',
    );
  }
  if (evidence.actingMemberId !== evidence.subjectMemberId) {
    throw new ReturnAuthorityError(
      'return authority may only be conferred by the member the material is about',
    );
  }
  return {
    preference,
    authorizedBy: 'member',
    evidence: `${evidence.gesture} by subject member`,
  } as AuthorizedReturnPreference;
}

/**
 * No contextual return authorized.
 *
 * The disposition for material a non-member actor authored or stored. It is not
 * a denial of the material — the atom is written, attributed, and the member can
 * see it. It withholds only the permission nobody was entitled to grant.
 */
export function noContextualReturn(reason: string): AuthorizedReturnPreference {
  if (!reason || reason.length < 10) {
    throw new ReturnAuthorityError('a withheld return authority must state its reason');
  }
  return {
    preference: 'member_pulled',
    authorizedBy: 'none',
    evidence: reason,
  } as AuthorizedReturnPreference;
}

/**
 * The value a writer may bind into SQL.
 *
 * The only way out of the branded type. A writer that wants a return preference
 * has to hold an authorization to get one.
 */
export function returnPreferenceValue(authorized: AuthorizedReturnPreference): ReturnPreference {
  return authorized.preference;
}

/** True where the authorization actually permits contextual resurfacing. */
export function permitsContextualReturn(a: AuthorizedReturnPreference): boolean {
  return a.authorizedBy === 'member' && a.preference !== 'member_pulled';
}
