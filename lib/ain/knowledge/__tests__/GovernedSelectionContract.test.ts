/** @jest-environment node */

import {
  ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
  ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256,
  assertGovernedSelectionContractAttested,
  governedSelectionContractDigest,
  selectionContractForSource,
  type GovernedSelectionContract,
} from '../GovernedSelectionContract';
import { ELEMENTAL_ALCHEMY_GOVERNED_SOURCE } from '@/lib/corpus/governedKnowledgeRegistry';

test('the exact SELECTIVE contract material matches its frozen digest', () => {
  expect(governedSelectionContractDigest()).toBe(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256);
  expect(assertGovernedSelectionContractAttested()).toBe(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT);
});

test('substituting an authority-bearing selection predicate turns the attestation red', () => {
  const altered: GovernedSelectionContract = {
    ...ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
    chunkSelection: {
      ...ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.chunkSelection,
      minChunkSimilarity: 0.54,
    },
  };
  expect(governedSelectionContractDigest(altered)).not.toBe(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT_SHA256);
  expect(() => assertGovernedSelectionContractAttested(altered)).toThrow(/SELECTIVE contract attestation failed/);
});

test('the contract grants only current-turn SELECTIVE result membership, never upstream standing', () => {
  expect(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.authorityClass).toBe('SELECTIVE');
  expect(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.effectScope).toBe('current_turn_retrieved_evidence_membership');
  expect(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.chunkSelection.useDomainCategoryFilters).toBe(false);
  expect(selectionContractForSource(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE)).toBe(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT);
});
