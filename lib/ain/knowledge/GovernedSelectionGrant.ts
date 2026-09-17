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
 * Candidate is deliberately dormant until an explicit founder act grants the
 * exact SELECTIVE contract. A merge/deploy mistake before that act therefore
 * cannot silently create retrieval-selection authority.
 *
 * After the founder grant, a bounded documentary/code follow-up may change only
 * status + founderRulingRef while preserving the exact contract id/digest/scope.
 */
export const ELEMENTAL_ALCHEMY_SELECTION_GRANT: GovernedSelectionGrant = Object.freeze({
  status: 'PENDING_FOUNDER_GRANT',
  subjectId: 'elemental-alchemy',
  contractId: 'J8-R1-EA-SELECTIVE-v1',
  contractSha256: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
  authorityClass: 'SELECTIVE',
  effectScope: 'current_turn_retrieved_evidence_membership',
  founderRulingRef: null,
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
