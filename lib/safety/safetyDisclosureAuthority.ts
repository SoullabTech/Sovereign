/**
 * SAFETY-DISCLOSURE-01 — pure MEMBER-INITIATED disclosure-authority resolver.
 *
 * This module governs only future member-controlled disclosure/off-ramp acts.
 * It does NOT model, supersede, disable, or authorize the separately canonical
 * #1671 human-safety delivery membrane.
 *
 * This module does not detect crisis, inspect member content, look up recipients,
 * persist state, send notifications, or perform a disclosure.
 *
 * Law inside this seam: concern never manufactures a NEW member-controlled
 * disclosure authority. A present, explicit member act is required.
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

export type MemberInitiatedSafetyDisclosureAct = {
  explicit: true;
  presentTurn: true;
  recipient: SafetyDisclosureRecipient;
  scope: SafetyDisclosureScope;
};

export type MemberInitiatedSafetyDisclosureInput = {
  memberAct?: MemberInitiatedSafetyDisclosureAct | null;
  reviewBasis?: SafetyDisclosureReviewBasis | null;
};

export type MemberInitiatedSafetyDisclosureAuthority =
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
export function resolveMemberInitiatedSafetyDisclosureAuthority(
  input: MemberInitiatedSafetyDisclosureInput,
): MemberInitiatedSafetyDisclosureAuthority {
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
