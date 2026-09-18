/** @jest-environment node */

import {
  ELEMENTAL_ALCHEMY_SELECTION_GRANT,
  assertGovernedSelectionGrant,
  type GovernedSelectionGrant,
} from '../GovernedSelectionGrant';
import {
  ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
  ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
} from '../GovernedSelectionContract';

test('the recorded founder grant authorizes only the exact attested contract', () => {
  expect(ELEMENTAL_ALCHEMY_SELECTION_GRANT).toEqual(expect.objectContaining({
    status: 'GRANTED',
    contractId: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.contractId,
    contractSha256: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
    authorityClass: 'SELECTIVE',
    effectScope: 'current_turn_retrieved_evidence_membership',
    founderRulingRef: 'docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_R1_SELECTIVE_FOUNDER_RULING_2026-09-17.md',
  }));
  expect(assertGovernedSelectionGrant(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT)).toBe(ELEMENTAL_ALCHEMY_SELECTION_GRANT);
});

test('a pending record still refuses before SELECTIVE effect', () => {
  const pendingGrant: GovernedSelectionGrant = {
    ...ELEMENTAL_ALCHEMY_SELECTION_GRANT,
    status: 'PENDING_FOUNDER_GRANT',
    founderRulingRef: null,
  };
  expect(() => assertGovernedSelectionGrant(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT, pendingGrant)).toThrow(/grant absent or invalid/);
});

test('a granted record bound to a different contract digest is refused', () => {
  const wrongGrant: GovernedSelectionGrant = {
    ...ELEMENTAL_ALCHEMY_SELECTION_GRANT,
    status: 'GRANTED',
    founderRulingRef: 'docs/programme/SIMULATED_ONLY.md',
    contractSha256: '0'.repeat(64),
  };
  expect(() => assertGovernedSelectionGrant(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT, wrongGrant)).toThrow(/grant absent or invalid/);
});
