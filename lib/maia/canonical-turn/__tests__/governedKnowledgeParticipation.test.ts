/** @jest-environment node */

import { PRODUCER_REGISTRY } from '../producerRegistry';
import {
  LEGACY_META_KEY_TO_PRODUCER,
  candidatesFromLegacyAddenda,
} from '../shadow';

test('governed retrieval is a distinct route producer from source-well weighting', () => {
  expect(LEGACY_META_KEY_TO_PRODUCER.knowledgeGateAddendum).toBe('collective.knowledge_gate');
  expect(LEGACY_META_KEY_TO_PRODUCER.governedKnowledgeAddendum).toBe('retrieved.governed_knowledge');

  const spec = PRODUCER_REGISTRY['retrieved.governed_knowledge'];
  expect(spec.authoredBy).toBe('system');
  expect(spec.participationClass).toBe('retrieved');
  expect(spec.authority).toBe('situate');
  expect(spec.requires.notSanctuary).toBe(true);
  expect(spec.rooms).toEqual(['sovereign_chat']);
});

test('legacy addenda become separate candidates without collapsing their provenance', () => {
  const candidates = candidatesFromLegacyAddenda({
    knowledgeGateAddendum: 'weighting',
    governedKnowledgeAddendum: 'retrieved excerpts',
  });

  expect(candidates).toEqual([
    { producerId: 'collective.knowledge_gate', text: 'weighting' },
    { producerId: 'retrieved.governed_knowledge', text: 'retrieved excerpts' },
  ]);
});
