/**
 * DISCLOSURE FACT ADMISSION — D2 epistemic admission boundary.
 *
 * D2 answers one question only: do we possess sufficiently established facts
 * to ask the already-governed D1 disclosure evaluator?
 *
 * UNKNOWN is neither false nor true. Missing evidence cannot authorize silence
 * and cannot manufacture a disclosure obligation.
 */

import type { ServingIdentity } from './servingIdentity';
import type { MemberDisclosureDecisionInput } from './memberDisclosureDecision';

export type ClassifiedBoolean =
  | { status: 'known'; value: boolean }
  | { status: 'unknown' };

export type DisclosureFactName =
  | 'explicitIdentityInquiry'
  | 'explicitIdentityMismatch'
  | 'materialCapabilityEffect'
  | 'capabilityContractSatisfied';

export interface DisclosureFactPacket {
  /** Canonical upstream serving class. D2 preserves it and never reclassifies it. */
  divergence: ServingIdentity['divergence'];

  /** Already-classified facts. D2 admits them; it does not discover them. */
  explicitIdentityInquiry: ClassifiedBoolean;
  explicitIdentityMismatch: ClassifiedBoolean;
  materialCapabilityEffect: ClassifiedBoolean;
  capabilityContractSatisfied: ClassifiedBoolean;
}

export type DisclosureFactAdmission =
  | {
      status: 'admitted';
      input: MemberDisclosureDecisionInput;
    }
  | {
      status: 'insufficient_facts';
      missing: DisclosureFactName[];
    };

const REQUIRED_FACTS: readonly DisclosureFactName[] = [
  'explicitIdentityInquiry',
  'explicitIdentityMismatch',
  'materialCapabilityEffect',
  'capabilityContractSatisfied',
];

function isKnown(
  fact: ClassifiedBoolean
): fact is Extract<ClassifiedBoolean, { status: 'known' }> {
  return fact.status === 'known';
}

/**
 * Admit a complete fact packet to D1, or refuse admission with an exact missing
 * fact list. No defaulting. No materiality inference. No disclosure decision.
 */
export function admitDisclosureFacts(
  packet: DisclosureFactPacket
): DisclosureFactAdmission {
  const inquiry = packet.explicitIdentityInquiry;
  const mismatch = packet.explicitIdentityMismatch;
  const materiality = packet.materialCapabilityEffect;
  const capabilityContract = packet.capabilityContractSatisfied;

  const missing = REQUIRED_FACTS.filter((name) => !isKnown(packet[name]));

  if (
    !isKnown(inquiry) ||
    !isKnown(mismatch) ||
    !isKnown(materiality) ||
    !isKnown(capabilityContract)
  ) {
    return { status: 'insufficient_facts', missing };
  }

  return {
    status: 'admitted',
    input: {
      divergence: packet.divergence,
      explicitIdentityInquiry: inquiry.value,
      explicitIdentityMismatch: mismatch.value,
      materialCapabilityEffect: materiality.value,
      capabilityContractSatisfied: capabilityContract.value,
    },
  };
}
