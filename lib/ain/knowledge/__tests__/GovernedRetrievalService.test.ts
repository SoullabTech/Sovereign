/** @jest-environment node */

jest.mock('../RetrievalService', () => ({
  retrieveKnowledge: jest.fn(),
}));

import { retrieveKnowledge, type RetrievalResult } from '../RetrievalService';
import {
  formatGovernedKnowledgeAddendum,
  retrieveGovernedKnowledge,
} from '../GovernedRetrievalService';
import {
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
  GOVERNED_KNOWLEDGE_SOURCE_FILES,
} from '@/lib/corpus/governedKnowledgeRegistry';

const mockedRetrieve = retrieveKnowledge as jest.MockedFunction<typeof retrieveKnowledge>;

const chunk = (overrides: Partial<RetrievalResult> = {}): RetrievalResult => ({
  chunkId: 'chunk-1',
  sourceTitle: 'Elemental Alchemy',
  sourceFile: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceFile,
  chunkText: 'The elements are modes of awareness and relationship.',
  domain: 'somatic',
  categories: ['somatic', 'alchemy', 'shamanic'],
  similarity: 0.72,
  ...overrides,
});

beforeEach(() => mockedRetrieve.mockReset());

test('canonical governed retrieval uses the exact source allowlist and performs no tracking write', async () => {
  mockedRetrieve.mockResolvedValue([chunk()]);

  const hits = await retrieveGovernedKnowledge('How do the elements shape awareness?', {
    limit: 3,
    minSimilarity: 0.55,
  });

  expect(hits).toHaveLength(1);
  expect(hits[0].source).toBe(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE);
  expect(mockedRetrieve).toHaveBeenCalledTimes(1);
  const [, options] = mockedRetrieve.mock.calls[0];
  expect(options).toEqual(expect.objectContaining({
    sourceFiles: [...GOVERNED_KNOWLEDGE_SOURCE_FILES],
    limit: 3,
    minSimilarity: 0.55,
    sessionMode: 'governed',
  }));
  expect(options).not.toHaveProperty('userId');
  expect(options).not.toHaveProperty('domains');
  expect(options).not.toHaveProperty('categories');
});

test('a row outside the governed registry is refused even if a lower layer returns it', async () => {
  mockedRetrieve.mockResolvedValue([
    chunk({ sourceFile: 'legacy-unclassified.md', chunkId: 'foreign' }),
    chunk(),
  ]);

  const hits = await retrieveGovernedKnowledge('alchemy');
  expect(hits).toHaveLength(1);
  expect(hits[0].chunk.sourceFile).toBe(ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceFile);
});

test('the prompt block preserves source authorship, revision and authority and is bounded', () => {
  const source = ELEMENTAL_ALCHEMY_GOVERNED_SOURCE;
  const rendered = formatGovernedKnowledgeAddendum([
    { source, chunk: chunk({ chunkText: 'A'.repeat(500) }) },
  ], 700);

  expect(rendered).not.toBeNull();
  expect(rendered).toContain('Elemental Alchemy — Kelly Nezat');
  expect(rendered).toContain(`revision sha256:${source.sourceSha256}`);
  expect(rendered).toContain('authority: rights_holder_authorized');
  expect(rendered).toContain('not member memory');
  expect(rendered!.length).toBeLessThanOrEqual(700);
});
