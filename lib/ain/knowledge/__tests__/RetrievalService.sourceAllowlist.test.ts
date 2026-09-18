/** @jest-environment node */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/memory/embeddings', () => ({ generateLocalEmbedding: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { generateLocalEmbedding } from '@/lib/memory/embeddings';
import { retrieveKnowledge } from '../RetrievalService';

const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedEmbedding = generateLocalEmbedding as jest.MockedFunction<typeof generateLocalEmbedding>;

beforeEach(() => {
  mockedQuery.mockReset();
  mockedEmbedding.mockReset();
  mockedEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
  mockedQuery.mockResolvedValue({ rows: [] } as any);
});

test('sourceFiles becomes a parameterized source_file boundary before similarity filtering', async () => {
  await retrieveKnowledge('query', {
    sourceFiles: ['allowed.md'],
    minSimilarity: 0.55,
    limit: 3,
  });

  expect(mockedQuery).toHaveBeenCalledTimes(1);
  const [sql, params] = mockedQuery.mock.calls[0] as [string, unknown[]];
  expect(sql).toContain('source_file = ANY($2)');
  expect(sql).toContain('>= $3');
  expect(sql).toContain('LIMIT $4');
  expect(params[1]).toEqual(['allowed.md']);
  expect(params[2]).toBe(0.55);
  expect(params[3]).toBe(3);
});


test('an explicit empty sourceFiles allowlist fails closed before embedding or database access', async () => {
  const results = await retrieveKnowledge('query', { sourceFiles: [] });

  expect(results).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedQuery).not.toHaveBeenCalled();
});


test('a precomputed query embedding is reused without invoking the embedding generator', async () => {
  const precomputed = [0.3, 0.2, 0.1];
  await retrieveKnowledge('query', {
    sourceFiles: ['allowed.md'],
    queryEmbedding: precomputed,
    minSimilarity: 0.55,
    limit: 3,
  });

  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedQuery).toHaveBeenCalledTimes(1);
  const [, params] = mockedQuery.mock.calls[0] as [string, unknown[]];
  expect(params[0]).toBe('[0.3,0.2,0.1]');
});

test.each([
  [[]],
  [[0, 0, 0]],
  [[Number.NaN, 0.1, 0.2]],
])('an invalid precomputed embedding %p fails closed before database access', async (queryEmbedding) => {
  const results = await retrieveKnowledge('query', {
    sourceFiles: ['allowed.md'],
    queryEmbedding,
  });

  expect(results).toEqual([]);
  expect(mockedEmbedding).not.toHaveBeenCalled();
  expect(mockedQuery).not.toHaveBeenCalled();
});
