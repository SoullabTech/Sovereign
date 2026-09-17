import type { QueryResultRow } from 'pg';

import type { KnowledgeChunk } from '../ain/knowledge/ChunkingService';
import { toPgVectorLiteral } from '../db/pgvector';
import {
  EA_INGEST_CONTRACT,
  verifyDatabaseRowsAgainstChunks,
  type DatabaseChunkRow,
} from './eaIngestContract';

export interface PreparedEaChunk {
  chunk: KnowledgeChunk;
  embedding: number[];
}

export interface EaTransactionClient {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}

export interface EaCommitResult {
  rows: number;
  sources: number;
  embedded: number;
  chunkSetSha256: string;
}

/**
 * Owns the complete database mutation boundary for CORPUS-INGEST-EA-01.
 *
 * The caller must supply ONE acquired PostgreSQL client. This function begins
 * the transaction, takes the write-excluding lock, proves the expected empty
 * pre-state, stages every row, verifies the staged content against the frozen
 * chunk set, and commits only after every invariant passes. Any exception after
 * BEGIN triggers ROLLBACK on the same client.
 */
export async function commitPreparedEaChunks(
  client: EaTransactionClient,
  prepared: readonly PreparedEaChunk[],
  expectedChunks: readonly KnowledgeChunk[],
): Promise<EaCommitResult> {
  if (prepared.length !== expectedChunks.length) {
    throw new Error(
      `${EA_INGEST_CONTRACT.act} refused: prepared embedding count ${prepared.length} ` +
      `does not match expected chunk count ${expectedChunks.length}`,
    );
  }
  for (let i = 0; i < expectedChunks.length; i += 1) {
    if (prepared[i]?.chunk !== expectedChunks[i]) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: prepared chunk identity changed at index ${i}`,
      );
    }
  }

  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;

    // ACCESS SHARE (ordinary SELECT) remains compatible; competing writes wait.
    await client.query('LOCK TABLE ain_knowledge_chunks IN EXCLUSIVE MODE');

    const pre = await client.query<{ rows: number; sources: number }>(`
      SELECT count(*)::int AS rows,
             count(DISTINCT source_file)::int AS sources
      FROM ain_knowledge_chunks
    `);
    const preRows = pre.rows[0]?.rows ?? -1;
    const preSources = pre.rows[0]?.sources ?? -1;
    if (preRows !== 0 || preSources !== 0) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: production pre-state changed ` +
        `(${preRows} rows / ${preSources} sources; expected 0 / 0)`,
      );
    }

    for (const { chunk, embedding } of prepared) {
      await client.query(
        `INSERT INTO ain_knowledge_chunks
          (source_file, source_title, chunk_index, chunk_text, chunk_tokens,
           embedding, categories, domain, embedded_at)
         VALUES ($1, $2, $3, $4, $5, $6::vector, $7, $8, NOW())`,
        [
          chunk.sourceFile,
          chunk.sourceTitle,
          chunk.chunkIndex,
          chunk.chunkText,
          chunk.chunkTokens,
          toPgVectorLiteral(embedding),
          chunk.categories,
          chunk.domain,
        ],
      );
    }

    const staged = await client.query<DatabaseChunkRow>(`
      SELECT source_file, source_title, chunk_index, chunk_text, chunk_tokens, categories, domain
      FROM ain_knowledge_chunks
      ORDER BY source_file, chunk_index
    `);
    const stagedDigest = verifyDatabaseRowsAgainstChunks(staged.rows, expectedChunks);
    if (stagedDigest !== EA_INGEST_CONTRACT.chunkSetSha256) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: staged DB chunk-set digest ${stagedDigest} ` +
        `does not match ${EA_INGEST_CONTRACT.chunkSetSha256}`,
      );
    }

    const stats = await client.query<{ rows: number; sources: number; embedded: number }>(`
      SELECT count(*)::int AS rows,
             count(DISTINCT source_file)::int AS sources,
             count(embedding)::int AS embedded
      FROM ain_knowledge_chunks
    `);
    const row = stats.rows[0];
    if (
      !row ||
      row.rows !== EA_INGEST_CONTRACT.chunkCount ||
      row.sources !== 1 ||
      row.embedded !== EA_INGEST_CONTRACT.chunkCount
    ) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: staged DB shape mismatch ` +
        `(${row?.rows ?? -1} rows / ${row?.sources ?? -1} sources / ${row?.embedded ?? -1} embedded)`,
      );
    }

    await client.query('COMMIT');
    transactionOpen = false;
    return {
      rows: row.rows,
      sources: row.sources,
      embedded: row.embedded,
      chunkSetSha256: stagedDigest,
    };
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
        transactionOpen = false;
      } catch (rollbackError) {
        const original = error instanceof Error ? error.message : String(error);
        const rollback = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        throw new Error(
          `${EA_INGEST_CONTRACT.act} UNKNOWN WRITE OUTCOME: operation failed (${original}) ` +
          `and ROLLBACK could not be confirmed (${rollback}); inspect production before any retry`,
          { cause: rollbackError },
        );
      }
    }
    throw error;
  }
}
