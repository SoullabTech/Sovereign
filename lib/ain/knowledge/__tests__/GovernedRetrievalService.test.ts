/** @jest-environment node */

jest.mock('../RetrievalService', () => ({
  retrieveKnowledge: jest.fn(),
}));
jest.mock('@/lib/memory/embeddings', () => ({
  generateLocalEmbedding: jest.fn(),
}));
jest.mock('@/lib/library/globalRetrievalAuthority', () => ({
  getGlobalLibraryAuthorityKeys: jest.fn(),
}));
jest.mock('../GovernedCorpusAttestation', () => ({
  assertGovernedCorpusAttestation: jest.fn(),
}));
jest.mock('../GovernedEmbeddingModelAttestation', () => ({
  assertGovernedEmbeddingModelAttestation: jest.fn(),
}));
jest.mock('../GovernedSelectionGrant', () => ({
  assertGovernedSelectionGrant: jest.fn(),
}));

import { generateLocalEmbedding } from '@/lib/memory/embeddings';
import { getGlobalLibraryAuthorityKeys } from '@/lib/library/globalRetrievalAuthority';
import { retrieveKnowledge, type RetrievalResult } from '../RetrievalService';
import { assertGovernedCorpusAttestation } from '../GovernedCorpusAttestation';
import { assertGovernedEmbeddingModelAttestation } from '../GovernedEmbeddingModelAttestation';
import { assertGovernedSelectionGrant } from '../GovernedSelectionGrant';
import {
  formatGovernedKnowledgeAddendum,
  resetGovernedApplicabilityCacheForTests,
  retrieveGovernedKnowledge,
} from '../GovernedRetrievalService';
import {
  ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
  GOVERNED_KNOWLEDGE_VECTOR_CONTRACT,
} from '@/lib/corpus/governedKnowledgeRegistry';
import { ELEMENTAL_ALCHEMY_SELECTION_CONTRACT } from '../GovernedSelectionContract';

const mockedRetrieve = retrieveKnowledge as jest.MockedFunction<typeof retrieveKnowledge>;
const mockedEmbedding = generateLocalEmbedding as jest.MockedFunction<typeof generateLocalEmbedding>;
const mockedAuthority = getGlobalLibraryAuthorityKeys as jest.MockedFunction<typeof getGlobalLibraryAuthorityKeys>;
const mockedAttestation = assertGovernedCorpusAttestation as jest.MockedFunction<typeof assertGovernedCorpusAttestation>;
const mockedModelAttestation = assertGovernedEmbeddingModelAttestation as jest.MockedFunction<typeof assertGovernedEmbeddingModelAttestation>;
const mockedGrant = assertGovernedSelectionGrant as jest.MockedFunction<typeof assertGovernedSelectionGrant>;

const basis = (index: number): number[] => {
  const vector = Array(GOVERNED_KNOWLEDGE_VECTOR_CONTRACT.dimensions).fill(0);
  vector[index] = 1;
  return vector;
};
const mixed = (...entries: Array<[number, number]>): number[] => {
  const vector = Array(GOVERNED_KNOWLEDGE_VECTOR_CONTRACT.dimensions).fill(0);
  for (const [index, value] of entries) vector[index] = value;
  return vector;
};
const POSITIVE = basis(0);
const CONFUSABLE = basis(1);
const WEAK = basis(2);
const AMBIGUOUS = mixed([0, 1], [1, 1]);

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

function embeddingForText(text: string): number[] {
  const contract = ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.applicability;
  if (contract.positiveScope.includes(text)) return POSITIVE;
  if (contract.confusableScope.includes(text)) return CONFUSABLE;
  if (['positive query', 'How do the elements shape awareness?', 'alchemy'].includes(text)) return POSITIVE;
  if (text === 'confusable query') return CONFUSABLE;
  if (text === 'ambiguous query') return AMBIGUOUS;
  return WEAK;
}

beforeEach(() => {
  mockedRetrieve.mockReset();
  mockedEmbedding.mockReset();
  mockedAuthority.mockReset();
  mockedAttestation.mockReset();
  mockedModelAttestation.mockReset();
  mockedGrant.mockReset();
  resetGovernedApplicabilityCacheForTests();
  mockedEmbedding.mockImplementation(async (text) => embeddingForText(text));
  mockedAuthority.mockReturnValue([{
    filePath: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourcePath,
    checksum: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceSha256,
  }]);
  mockedGrant.mockImplementation((contract) => ({
    status: 'GRANTED',
    subjectId: contract.subjectId,
    contractId: contract.contractId,
    contractSha256: 'simulated-by-test',
    authorityClass: 'SELECTIVE',
    effectScope: 'current_turn_retrieved_evidence_membership',
    founderRulingRef: 'SIMULATED_TEST_GRANT',
  }));
  mockedModelAttestation.mockResolvedValue({
    name: 'nomic-embed-text:latest',
    digest: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.vectorModelDigest,
  });
  mockedAttestation.mockResolvedValue({
    rowCount: 1238,
    sourceCount: 1,
    embeddedCount: 1238,
    minIndex: 0,
    maxIndex: 1237,
    vectorDimensions: 768,
    chunkSetSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.chunkSetSha256,
    embeddingSetSha256: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.embeddingSetSha256,
  });
});

test('consumes J6 authority, attests J7 corpus, then uses the fixed SELECTIVE contract', async () => {
  mockedRetrieve.mockResolvedValue([chunk()]);

  const hits = await retrieveGovernedKnowledge('How do the elements shape awareness?');

  expect(hits).toHaveLength(1);
  expect(mockedAuthority).toHaveBeenCalledTimes(1);
  expect(mockedGrant).toHaveBeenCalledWith(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT);
  expect(mockedModelAttestation).toHaveBeenCalledWith(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT);
  expect(mockedAttestation).toHaveBeenCalledWith(
    ELEMENTAL_ALCHEMY_GOVERNED_SOURCE,
    ELEMENTAL_ALCHEMY_SELECTION_CONTRACT,
  );
  expect(mockedRetrieve).toHaveBeenCalledTimes(1);
  const [, options] = mockedRetrieve.mock.calls[0];
  expect(options).toEqual(expect.objectContaining({
    sourceFiles: [ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceFile],
    queryEmbedding: POSITIVE,
    limit: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.chunkSelection.maxChunks,
    minSimilarity: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.chunkSelection.minChunkSimilarity,
    sessionMode: 'governed',
  }));
  expect(options).not.toHaveProperty('userId');
  expect(options).not.toHaveProperty('domains');
  expect(options).not.toHaveProperty('categories');
  expect(mockedEmbedding).toHaveBeenCalledTimes(6); // query + 5 scope descriptors

  // Grant-effect sufficiency order is load-bearing: exact J7 corpus/vector
  // attestation must pass before the first member-query embedding can create
  // either a positive or negative current-turn selection effect.
  expect(mockedModelAttestation.mock.invocationCallOrder[0])
    .toBeLessThan(mockedAttestation.mock.invocationCallOrder[0]);
  expect(mockedAttestation.mock.invocationCallOrder[0])
    .toBeLessThan(mockedEmbedding.mock.invocationCallOrder[0]);
  expect(mockedEmbedding.mock.invocationCallOrder[0])
    .toBeLessThan(mockedRetrieve.mock.invocationCallOrder[0]);
});

test.each([
  ['no authority keys', []],
  ['wrong checksum', [{ filePath: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourcePath, checksum: '0'.repeat(64) }]],
  ['wrong path', [{ filePath: 'data/ain/source/other.md', checksum: ELEMENTAL_ALCHEMY_GOVERNED_SOURCE.sourceSha256 }]],
])('%s refuses before any representation is computed', async (_label, keys) => {
  mockedAuthority.mockReturnValue(keys);

  const hits = await retrieveGovernedKnowledge('positive query');

  expect(hits).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedModelAttestation).not.toHaveBeenCalled();
  expect(mockedAttestation).not.toHaveBeenCalled();
  expect(mockedRetrieve).not.toHaveBeenCalled();
});

test('missing founder SELECTIVE grant refuses before member-query embedding', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockedGrant.mockImplementation(() => {
    throw new Error('synthetic pending founder grant');
  });

  const hits = await retrieveGovernedKnowledge('positive query');

  expect(hits).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedAttestation).not.toHaveBeenCalled();
  expect(mockedRetrieve).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(
    '[AIN Governed] authority/applicability/attestation failed closed:',
    expect.any(Error),
  );
  warn.mockRestore();
});

test('embedding model substitution refuses before member-query embedding', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockedModelAttestation.mockRejectedValue(new Error('synthetic model substitution'));

  const hits = await retrieveGovernedKnowledge('positive query');

  expect(hits).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedAttestation).not.toHaveBeenCalled();
  expect(mockedRetrieve).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(
    '[AIN Governed] authority/applicability/attestation failed closed:',
    expect.any(Error),
  );
  warn.mockRestore();
});

test.each([
  ['confusable query'],
  ['ambiguous query'],
  ['weak unrelated query'],
])('inapplicable scope %s refuses only after corpus attestation and before chunk selection', async (queryText) => {
  const hits = await retrieveGovernedKnowledge(queryText);
  expect(hits).toEqual([]);
  expect(mockedAttestation).toHaveBeenCalledTimes(1);
  expect(mockedAttestation.mock.invocationCallOrder[0])
    .toBeLessThan(mockedEmbedding.mock.invocationCallOrder[0]);
  expect(mockedRetrieve).not.toHaveBeenCalled();
});

test('corpus attestation failure refuses before SELECTIVE chunk ranking', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockedAttestation.mockRejectedValue(new Error('synthetic corpus substitution'));

  const hits = await retrieveGovernedKnowledge('positive query');

  expect(hits).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedRetrieve).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(
    '[AIN Governed] authority/applicability/attestation failed closed:',
    expect.any(Error),
  );
  warn.mockRestore();
});

test('scope descriptor vectors are cached while each member query is embedded once', async () => {
  mockedRetrieve.mockResolvedValue([]);

  await retrieveGovernedKnowledge('positive query');
  await retrieveGovernedKnowledge('How do the elements shape awareness?');

  expect(mockedEmbedding).toHaveBeenCalledTimes(7); // 5 descriptors + 2 member queries
  expect(mockedAttestation).toHaveBeenCalledTimes(2);
  expect(mockedRetrieve).toHaveBeenCalledTimes(2);
});

test('applicability embedding failure fails closed and never queries corpus rows', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  mockedEmbedding.mockImplementation(async (text) => {
    if (ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.applicability.positiveScope.includes(text)) return [];
    return embeddingForText(text);
  });

  const hits = await retrieveGovernedKnowledge('positive query');

  expect(hits).toEqual([]);
  expect(mockedAttestation).toHaveBeenCalledTimes(1);
  expect(mockedAttestation.mock.invocationCallOrder[0])
    .toBeLessThan(mockedEmbedding.mock.invocationCallOrder[0]);
  expect(mockedRetrieve).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalledWith(
    '[AIN Governed] authority/applicability/attestation failed closed:',
    expect.any(Error),
  );
  warn.mockRestore();
});

test('a foreign row is refused even if the lower SELECTIVE query returns it', async () => {
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
