import {
  ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
  governedSelectionContractDigest,
  type GovernedSelectionContract,
} from './GovernedSelectionContract';

export type GovernedSelectionGrantStatus = 'PENDING_FOUNDER_GRANT' | 'GRANTED';

export interface GovernedSelectionGrant {
  readonly status: GovernedSelectionGrantStatus;
  readonly subjectId: string;
  readonly contractId: string;
  readonly contractSha256: string;
  readonly authorityClass: 'SELECTIVE';
  readonly effectScope: 'current_turn_retrieved_evidence_membership';
  readonly founderRulingRef: string | null;
}

/**
 * Founder grant recorded 2026-09-17 for the exact SELECTIVE contract below.
 * The grant remains valid only while contract id/digest/scope and all upstream
 * authority/attestation conditions remain exact. Merge/deploy are separate acts.
 */
export const ELEMENTAL_ALCHEMY_SELECTION_GRANT: GovernedSelectionGrant = Object.freeze({
  status: 'GRANTED',
  subjectId: 'elemental-alchemy',
  contractId: 'J8-R1-EA-SELECTIVE-v1',
  contractSha256: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
  authorityClass: 'SELECTIVE',
  effectScope: 'current_turn_retrieved_evidence_membership',
  founderRulingRef: 'docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_R1_SELECTIVE_FOUNDER_RULING_2026-09-17.md',
});

export function assertGovernedSelectionGrant(
  contract: GovernedSelectionContract,
  grant: GovernedSelectionGrant = ELEMENTAL_ALCHEMY_SELECTION_GRANT,
): GovernedSelectionGrant {
  const actualContractSha = governedSelectionContractDigest(contract);
  if (
    grant.status !== 'GRANTED' ||
    !grant.founderRulingRef ||
    grant.subjectId !== contract.subjectId ||
    grant.contractId !== contract.contractId ||
    grant.contractSha256 !== actualContractSha ||
    grant.authorityClass !== contract.authorityClass ||
    grant.effectScope !== contract.effectScope
  ) {
    throw new Error(
      `governed SELECTIVE grant absent or invalid for ${contract.contractId} ` +
      `(status=${grant.status}, contract=${actualContractSha})`,
    );
  }
  return grant;
}
