/**
 * @jest-environment node
 */
import * as fs from 'fs';
import * as path from 'path';

import {
  EA_INGEST_CONTRACT,
  chunkSetDigest,
  verifyDatabaseRowsAgainstChunks,
  witnessEaBuild,
  type DatabaseChunkRow,
} from '../eaIngestContract';
import type { KnowledgeChunk } from '../../ain/knowledge/ChunkingService';

const sampleChunk = (overrides: Partial<KnowledgeChunk> = {}): KnowledgeChunk => ({
  sourceFile: EA_INGEST_CONTRACT.sourceFile,
  sourceTitle: 'Elemental Alchemy',
  chunkIndex: 0,
  chunkText: 'Fire is the first movement.',
  chunkTokens: 7,
  categories: ['alchemy'],
  domain: 'jungian',
  ...overrides,
});

const rowFor = (chunk: KnowledgeChunk): DatabaseChunkRow => ({
  source_file: chunk.sourceFile,
  source_title: chunk.sourceTitle,
  chunk_index: chunk.chunkIndex,
  chunk_text: chunk.chunkText,
  chunk_tokens: chunk.chunkTokens,
  categories: chunk.categories,
  domain: chunk.domain,
});

describe('CORPUS-INGEST-EA-01 contract', () => {
  test('the canonical repository still produces the frozen EA build', async () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const witness = await witnessEaBuild(repoRoot);

    expect(witness.candidateCount).toBe(EA_INGEST_CONTRACT.candidateCount);
    expect(witness.verdict.admitted).toEqual([EA_INGEST_CONTRACT.sourcePath]);
    expect(witness.verdict.excluded).toHaveLength(EA_INGEST_CONTRACT.excludedCount);
    expect(witness.verdict.refused).toHaveLength(EA_INGEST_CONTRACT.refusedCount);
    expect(witness.sourceSha256).toBe(EA_INGEST_CONTRACT.sourceSha256);
    expect(witness.chunks).toHaveLength(EA_INGEST_CONTRACT.chunkCount);
    expect(witness.chunkSetSha256).toBe(EA_INGEST_CONTRACT.chunkSetSha256);
  });

  test('the chunk-set digest changes when chunk text changes', () => {
    const a = sampleChunk();
    const b = sampleChunk({ chunkText: 'Fire is a different movement.' });
    expect(chunkSetDigest([a])).not.toBe(chunkSetDigest([b]));
  });

  test('database rows must match the expected chunk content and metadata exactly', () => {
    const chunks = [
      sampleChunk(),
      sampleChunk({
        chunkIndex: 1,
        chunkText: 'Water carries meaning.',
        chunkTokens: 5,
        categories: ['alchemy', 'consciousness'],
        domain: 'consciousness',
      }),
    ];
    const rows = chunks.map(rowFor);

    expect(verifyDatabaseRowsAgainstChunks(rows, chunks)).toBe(chunkSetDigest(chunks));

    const altered = rows.map((row) => ({ ...row }));
    altered[1].chunk_text = 'Water was altered after chunking.';
    expect(() => verifyDatabaseRowsAgainstChunks(altered, chunks)).toThrow(/chunk text mismatch/);
  });
});

describe('CORPUS-INGEST-EA-01 executable boundary', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const script = fs.readFileSync(
    path.join(repoRoot, 'scripts/ingest-elemental-alchemy-governed.ts'),
    'utf8',
  );

  test('write mode requires two independent explicit authorizations', () => {
    expect(script).toContain("const EXECUTE_ARG = '--execute=CORPUS-INGEST-EA-01'");
    expect(script).toContain("const AUTH_ENV = 'CORPUS_INGEST_EA_01_AUTHORIZED'");
    expect(script.indexOf('if (!execute)')).toBeLessThan(script.indexOf('new pg.Pool'));
    expect(script.indexOf("process.env[AUTH_ENV] !== 'YES'")).toBeLessThan(script.indexOf('new pg.Pool'));
  });

  test('embeddings are prepared before the database transaction is opened', () => {
    expect(script.indexOf('embedWithOllama')).toBeLessThan(script.indexOf('new pg.Pool'));
    expect(script.indexOf('const recheck = await witnessEaBuild')).toBeLessThan(script.indexOf('new pg.Pool'));
  });

  test('write mode delegates the full mutation to the governed transaction seam', () => {
    expect(script).toContain('commitPreparedEaChunks(client, prepared, witness.chunks)');
    expect(script).not.toContain('TRUNCATE ain_knowledge_chunks');
  });
});
