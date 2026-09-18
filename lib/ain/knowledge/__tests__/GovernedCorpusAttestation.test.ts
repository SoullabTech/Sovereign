/** @jest-environment node */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { ELEMENTAL_ALCHEMY_GOVERNED_SOURCE } from '@/lib/corpus/governedKnowledgeRegistry';
import { ELEMENTAL_ALCHEMY_SELECTION_CONTRACT } from '../GovernedSelectionContract';
import { assertGovernedCorpusAttestation } from '../GovernedCorpusAttestation';

const mockedQuery = query as jest.MockedFunction<typeof query>;
const source = ELEMENTAL_ALCHEMY_GOVERNED_SOURCE;
const contract = ELEMENTAL_ALCHEMY_SELECTION_CONTRACT;

const goodRow = () => ({
  row_count: source.chunkCount,
  source_count: 1,
  embedded_count: source.chunkCount,
  min_index: 0,
  max_index: source.chunkCount - 1,
  min_dims: contract.vectorDimensions,
  max_dims: contract.vectorDimensions,
  chunk_set_sha256: source.chunkSetSha256,
  embedding_set_sha256: source.embeddingSetSha256,
});

beforeEach(() => {
  mockedQuery.mockReset();
  mockedQuery.mockResolvedValue({ rows: [goodRow()] } as any);
});

test('attests exact row text identity and embedding identity with a parameterized source boundary', async () => {
  const result = await assertGovernedCorpusAttestation(source, contract);
  expect(result.rowCount).toBe(1238);
  expect(result.chunkSetSha256).toBe(source.chunkSetSha256);
  expect(result.embeddingSetSha256).toBe(source.embeddingSetSha256);
  const [sql, params] = mockedQuery.mock.calls[0] as [string, unknown[]];
  expect(sql).toContain('WHERE source_file = $1');
  expect(sql).toContain("digest(chunk_text, 'sha256')");
  expect(sql).toContain("digest(embedding::text, 'sha256')");
  expect(sql).toContain('vector_dims(embedding)');
  expect(params).toEqual([source.sourceFile]);
});

test.each([
  ['row count', { row_count: 1237 }],
  ['source count', { source_count: 0 }],
  ['embedding count', { embedded_count: 1237 }],
  ['index range', { max_index: 1236 }],
  ['vector dimensions', { min_dims: 767 }],
  ['chunk digest', { chunk_set_sha256: '0'.repeat(64) }],
  ['embedding digest', { embedding_set_sha256: '0'.repeat(64) }],
])('%s substitution turns corpus attestation red', async (_label, override) => {
  mockedQuery.mockResolvedValue({ rows: [{ ...goodRow(), ...override }] } as any);
  await expect(assertGovernedCorpusAttestation(source, contract)).rejects.toThrow(/corpus attestation failed/);
});

test('a contract/source substitution is refused before the database query', async () => {
  const altered = { ...contract, sourceSha256: '0'.repeat(64) };
  await expect(assertGovernedCorpusAttestation(source, altered)).rejects.toThrow(/contract\/source mismatch/);
  expect(mockedQuery).not.toHaveBeenCalled();
});
