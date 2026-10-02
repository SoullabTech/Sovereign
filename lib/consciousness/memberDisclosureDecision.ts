/**
 * MEMBER DISCLOSURE DECISION — D1 pure evaluator.
 *
 * Applies the already-ratified disclosure obligation to already-classified
 * facts. It does not classify serving identity, infer member state, inspect raw
 * member content, compose language, render UI, or perform any side effect.
 *
 * Truth arrives classified. D1 decides only whether disclosure is required.
 */

import type { ServingIdentity } from './servingIdentity';

export type DisclosureBasis =
  | 'none'
  | 'explicit_identity_inquiry'
  | 'explicit_identity_mismatch'
  | 'material_capability_effect';

export interface MemberDisclosureDecisionInput {
  /** Canonical upstream class. Telemetry alone never creates an obligation. */
  divergence: ServingIdentity['divergence'];

  /** Upstream fact: the member explicitly asked what identity/capability served. */
  explicitIdentityInquiry: boolean;

  /** Upstream fact: an explicitly selected/promised serving identity was not fulfilled. */
  explicitIdentityMismatch: boolean;

  /** Upstream fact: a capability change is material to what the member can rely on. */
  materialCapabilityEffect: boolean;

  /** Upstream fact: the member-facing capability contract remains satisfied. */
  capabilityContractSatisfied: boolean;
}

export interface MemberDisclosureDecision {
  required: boolean;
  basis: DisclosureBasis;
}

/**
 * Deterministic disclosure-obligation evaluator.
 *
 * Precedence is evidentiary, not rhetorical:
 *   explicit inquiry -> explicit commitment mismatch -> material capability effect.
 *
 * `divergence` is intentionally not itself a trigger. A real substitution can
 * remain non-disclosable when the member-facing contract is fully satisfied and
 * no identity inquiry/commitment requires correction.
 */
export function decideMemberDisclosure(
  input: MemberDisclosureDecisionInput
): MemberDisclosureDecision {
  if (input.explicitIdentityInquiry) {
    return { required: true, basis: 'explicit_identity_inquiry' };
  }

  if (input.explicitIdentityMismatch) {
    return { required: true, basis: 'explicit_identity_mismatch' };
  }

  if (input.materialCapabilityEffect || !input.capabilityContractSatisfied) {
    return { required: true, basis: 'material_capability_effect' };
  }

  return { required: false, basis: 'none' };
}
