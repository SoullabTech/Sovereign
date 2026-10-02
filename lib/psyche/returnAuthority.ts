/**
 * Return authority — MIPA Phase 0, P6 (Doorway Consent Integrity).
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P6
 *
 * `contextual_doorway` is permission about FUTURE RESURFACING. Content authorship,
 * epistemic authority and return authority are independent properties.
 */

import type { ReturnPreference } from './types';

declare const RETURN_AUTHORITY_BRAND: unique symbol;

export interface AuthorizedReturnPreference {
  readonly [RETURN_AUTHORITY_BRAND]: true;
  readonly preference: ReturnPreference;
  readonly authorizedBy: 'member' | 'none';
  readonly evidence: string;
}

export interface MemberAuthorizationEvidence {
  actingMemberId: string;
  subjectMemberId: string;
  gesture: 'keep' | 'set_return_preference';
}

export class ReturnAuthorityError extends Error {}

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

export function returnPreferenceValue(authorized: AuthorizedReturnPreference): ReturnPreference {
  return authorized.preference;
}

export function permitsContextualReturn(a: AuthorizedReturnPreference): boolean {
  return a.authorizedBy === 'member' && a.preference !== 'member_pulled';
}
