/**
 * SAFETY-DISCLOSURE-01 — pure disclosure-authority resolver.
 *
 * This module does not detect crisis, inspect member content, look up recipients,
 * persist state, send notifications, or perform a disclosure.
 *
 * Law: concern never manufactures authority. The only currently executable basis
 * is a present, explicit member act naming a disclosure target and scope.
 * Candidate exceptions remain REVIEW_REQUIRED until separately ratified.
 */

export type SafetyDisclosureRecipient =
  | 'practitioner'
  | 'trusted_person'
  | 'crisis_service'
  | 'emergency_service';

export type SafetyDisclosureScope =
  | 'current_message'
  | 'selected_message'
  | 'member_authored_summary';

export type SafetyDisclosureReviewBasis =
  | 'imminent_danger_exception'
  | 'legal_compulsion'
  | 'minor_or_vulnerable_adult';

export type SafetyDisclosureMemberAct = {
  explicit: true;
  presentTurn: true;
  recipient: SafetyDisclosureRecipient;
  scope: SafetyDisclosureScope;
};

export type SafetyDisclosureAuthorityInput = {
  memberAct?: SafetyDisclosureMemberAct | null;
  reviewBasis?: SafetyDisclosureReviewBasis | null;
};

export type SafetyDisclosureAuthority =
  | {
      kind: 'may_cross';
      basis: 'member_act';
      recipient: SafetyDisclosureRecipient;
      scope: SafetyDisclosureScope;
      requiresDisclosureBoundary: true;
    }
  | {
      kind: 'review_required';
      basis: SafetyDisclosureReviewBasis;
      mayCross: false;
    }
  | {
      kind: 'none';
      basis: 'none';
      mayCross: false;
    };

/**
 * Resolve authority only. A may_cross result is still not the crossing:
 * callers must establish the repository's disclosure boundary / accountability
 * receipt before any content moves.
 */
export function resolveSafetyDisclosureAuthority(
  input: SafetyDisclosureAuthorityInput,
): SafetyDisclosureAuthority {
  if (input.memberAct?.explicit === true && input.memberAct.presentTurn === true) {
    return {
      kind: 'may_cross',
      basis: 'member_act',
      recipient: input.memberAct.recipient,
      scope: input.memberAct.scope,
      requiresDisclosureBoundary: true,
    };
  }

  if (input.reviewBasis) {
    return {
      kind: 'review_required',
      basis: input.reviewBasis,
      mayCross: false,
    };
  }

  return {
    kind: 'none',
    basis: 'none',
    mayCross: false,
  };
}
