/**
 * @jest-environment node
 */
import type { QueryResultRow } from 'pg';
import * as path from 'path';

import type { KnowledgeChunk } from '../../ain/knowledge/ChunkingService';
import {
  EA_INGEST_CONTRACT,
  witnessEaBuild,
  type DatabaseChunkRow,
} from '../eaIngestContract';
import {
  commitPreparedEaChunks,
  type EaTransactionClient,
  type PreparedEaChunk,
} from '../eaIngestTransaction';

const rowFor = (chunk: KnowledgeChunk): DatabaseChunkRow => ({
  source_file: chunk.sourceFile,
  source_title: chunk.sourceTitle,
  chunk_index: chunk.chunkIndex,
  chunk_text: chunk.chunkText,
  chunk_tokens: chunk.chunkTokens,
  categories: chunk.categories,
  domain: chunk.domain,
});

type QueryHandler = (sql: string, params?: unknown[]) => Promise<QueryResultRow[]>;

class FakeClient implements EaTransactionClient {
  readonly calls: Array<{ sql: string; params?: unknown[] }> = [];

  constructor(private readonly handler: QueryHandler) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }> {
    this.calls.push({ sql, params });
    const rows = await this.handler(sql, params);
    return { rows: rows as T[] };
  }
}

describe('CORPUS-INGEST-EA-01 transactional behavior', () => {
  let chunks: KnowledgeChunk[];
  let prepared: PreparedEaChunk[];
  let stagedRows: DatabaseChunkRow[];

  beforeAll(async () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const witness = await witnessEaBuild(repoRoot);
    chunks = witness.chunks;
    prepared = chunks.map((chunk) => ({ chunk, embedding: [0.125] }));
    stagedRows = chunks.map(rowFor);
  });

  test('success commits only after the exact staged corpus verifies', async () => {
    let insertCount = 0;
    const client = new FakeClient(async (sql) => {
      if (sql === 'BEGIN' || sql.startsWith('LOCK TABLE') || sql === 'COMMIT') return [];
      if (sql.includes('INSERT INTO ain_knowledge_chunks')) {
        insertCount += 1;
        return [];
      }
      if (sql.includes('count(embedding)::int AS embedded')) {
        return [{ rows: EA_INGEST_CONTRACT.chunkCount, sources: 1, embedded: EA_INGEST_CONTRACT.chunkCount }];
      }
      if (sql.includes('SELECT source_file, source_title, chunk_index')) return stagedRows;
      if (sql.includes('count(DISTINCT source_file)::int AS sources')) return [{ rows: 0, sources: 0 }];
      throw new Error(`unexpected SQL in fake client: ${sql}`);
    });

    const result = await commitPreparedEaChunks(client, prepared, chunks);

    expect(result).toEqual({
      rows: EA_INGEST_CONTRACT.chunkCount,
      sources: 1,
      embedded: EA_INGEST_CONTRACT.chunkCount,
      chunkSetSha256: EA_INGEST_CONTRACT.chunkSetSha256,
    });
    expect(insertCount).toBe(EA_INGEST_CONTRACT.chunkCount);
    expect(client.calls[0].sql).toBe('BEGIN');
    expect(client.calls[1].sql).toBe('LOCK TABLE ain_knowledge_chunks IN EXCLUSIVE MODE');
    expect(client.calls.at(-1)?.sql).toBe('COMMIT');
    expect(client.calls.some((call) => call.sql.includes('TRUNCATE'))).toBe(false);
    expect(client.calls.some((call) => call.sql === 'ROLLBACK')).toBe(false);
  });

  test('pre-state drift rolls back before the first insert and never commits', async () => {
    const client = new FakeClient(async (sql) => {
      if (sql === 'BEGIN' || sql.startsWith('LOCK TABLE') || sql === 'ROLLBACK') return [];
      if (sql.includes('count(DISTINCT source_file)::int AS sources')) return [{ rows: 1, sources: 1 }];
      throw new Error(`unexpected SQL after pre-state refusal: ${sql}`);
    });

    await expect(commitPreparedEaChunks(client, prepared, chunks)).rejects.toThrow(/pre-state changed/);

    expect(client.calls.some((call) => call.sql.includes('INSERT INTO'))).toBe(false);
    expect(client.calls.some((call) => call.sql === 'ROLLBACK')).toBe(true);
    expect(client.calls.some((call) => call.sql === 'COMMIT')).toBe(false);
  });

  test('an insert failure rolls back on the same client and never commits', async () => {
    const client = new FakeClient(async (sql) => {
      if (sql === 'BEGIN' || sql.startsWith('LOCK TABLE') || sql === 'ROLLBACK') return [];
      if (sql.includes('count(DISTINCT source_file)::int AS sources')) return [{ rows: 0, sources: 0 }];
      if (sql.includes('INSERT INTO ain_knowledge_chunks')) throw new Error('synthetic insert failure');
      throw new Error(`unexpected SQL after insert failure: ${sql}`);
    });

    await expect(commitPreparedEaChunks(client, prepared, chunks)).rejects.toThrow(/synthetic insert failure/);

    expect(client.calls.some((call) => call.sql === 'ROLLBACK')).toBe(true);
    expect(client.calls.some((call) => call.sql === 'COMMIT')).toBe(false);
  });

  test('staged row drift rolls back the entire staged corpus and never commits', async () => {
    const altered = stagedRows.map((row) => ({ ...row }));
    altered[37].chunk_text = `${altered[37].chunk_text}\nALTERED`;

    const client = new FakeClient(async (sql) => {
      if (sql === 'BEGIN' || sql.startsWith('LOCK TABLE') || sql === 'ROLLBACK') return [];
      if (sql.includes('INSERT INTO ain_knowledge_chunks')) return [];
      if (sql.includes('SELECT source_file, source_title, chunk_index')) return altered;
      if (sql.includes('count(DISTINCT source_file)::int AS sources')) return [{ rows: 0, sources: 0 }];
      throw new Error(`unexpected SQL after staged mismatch: ${sql}`);
    });

    await expect(commitPreparedEaChunks(client, prepared, chunks)).rejects.toThrow(/chunk text mismatch/);

    expect(client.calls.filter((call) => call.sql.includes('INSERT INTO'))).toHaveLength(EA_INGEST_CONTRACT.chunkCount);
    expect(client.calls.some((call) => call.sql === 'ROLLBACK')).toBe(true);
    expect(client.calls.some((call) => call.sql === 'COMMIT')).toBe(false);
  });

  test('rollback failure becomes an explicit unknown write outcome and never commits', async () => {
    const client = new FakeClient(async (sql) => {
      if (sql === 'BEGIN' || sql.startsWith('LOCK TABLE')) return [];
      if (sql.includes('count(DISTINCT source_file)::int AS sources')) return [{ rows: 1, sources: 1 }];
      if (sql === 'ROLLBACK') throw new Error('synthetic rollback failure');
      throw new Error(`unexpected SQL after rollback failure: ${sql}`);
    });

    await expect(commitPreparedEaChunks(client, prepared, chunks)).rejects.toThrow(/UNKNOWN WRITE OUTCOME/);
    expect(client.calls.some((call) => call.sql === 'ROLLBACK')).toBe(true);
    expect(client.calls.some((call) => call.sql === 'COMMIT')).toBe(false);
  });

  test('prepared-set drift refuses before BEGIN', async () => {
    const client = new FakeClient(async () => {
      throw new Error('database should not be touched');
    });

    await expect(commitPreparedEaChunks(client, prepared.slice(0, -1), chunks)).rejects.toThrow(/prepared embedding count/);
    expect(client.calls).toEqual([]);
  });
});
