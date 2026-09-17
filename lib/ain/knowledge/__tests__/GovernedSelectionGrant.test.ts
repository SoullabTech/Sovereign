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

test('candidate remains runtime-dormant while founder grant is pending', () => {
  expect(ELEMENTAL_ALCHEMY_SELECTION_GRANT).toEqual(expect.objectContaining({
    status: 'PENDING_FOUNDER_GRANT',
    contractId: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.contractId,
    contractSha256: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
    authorityClass: 'SELECTIVE',
    effectScope: 'current_turn_retrieved_evidence_membership',
    founderRulingRef: null,
  }));
  expect(() => assertGovernedSelectionGrant(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT)).toThrow(/grant absent or invalid/);
});

test('an exact simulated founder grant can authorize only the exact attested contract', () => {
  const simulatedGrant: GovernedSelectionGrant = {
    ...ELEMENTAL_ALCHEMY_SELECTION_GRANT,
    status: 'GRANTED',
    founderRulingRef: 'docs/programme/SIMULATED_ONLY.md',
  };
  expect(assertGovernedSelectionGrant(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT, simulatedGrant)).toBe(simulatedGrant);
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
