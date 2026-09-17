#!/usr/bin/env npx tsx
/**
 * CORPUS-INGEST-EA-01
 *
 * One-shot, fail-closed production ingestion path for the exact Elemental
 * Alchemy corpus revision authorized and dry-built in the predecessor acts.
 *
 * Default invocation is WITNESS ONLY: no Ollama call and no database connection.
 * Production write requires BOTH:
 *   --execute=CORPUS-INGEST-EA-01
 *   CORPUS_INGEST_EA_01_AUTHORIZED=YES
 *
 * The write path generates every embedding before opening a transaction. It then
 * acquires one PostgreSQL client, locks the target table against concurrent
 * writers, re-proves the empty pre-state, inserts all rows, reads the staged rows
 * back inside the same transaction, verifies them against the frozen chunk-set
 * digest, and only then COMMITs. Any mismatch ROLLBACKs to the empty pre-state.
 */
import pg from 'pg';

import { embedWithOllama } from '../lib/ai/localEmbeddingClient';
import {
  EA_INGEST_CONTRACT,
  witnessEaBuild,
} from '../lib/corpus/eaIngestContract';
import { commitPreparedEaChunks } from '../lib/corpus/eaIngestTransaction';

const EXECUTE_ARG = '--execute=CORPUS-INGEST-EA-01';
const AUTH_ENV = 'CORPUS_INGEST_EA_01_AUTHORIZED';

function printWitness(summary: {
  candidateCount: number;
  admitted: number;
  excluded: number;
  refused: number;
  sourceSha256: string;
  chunkCount: number;
  chunkSetSha256: string;
}): void {
  console.log('CORPUS-INGEST-EA-01 witness');
  console.log(`  candidates:       ${summary.candidateCount}`);
  console.log(`  verdict:          ${summary.admitted} admitted / ${summary.excluded} excluded / ${summary.refused} refused`);
  console.log(`  source SHA-256:   ${summary.sourceSha256}`);
  console.log(`  chunks:           ${summary.chunkCount}`);
  console.log(`  chunk-set SHA-256:${summary.chunkSetSha256}`);
}

async function main(): Promise<void> {
  const execute = process.argv.includes(EXECUTE_ARG);
  const witness = await witnessEaBuild(process.cwd());

  printWitness({
    candidateCount: witness.candidateCount,
    admitted: witness.verdict.admitted.length,
    excluded: witness.verdict.excluded.length,
    refused: witness.verdict.refused.length,
    sourceSha256: witness.sourceSha256,
    chunkCount: witness.chunks.length,
    chunkSetSha256: witness.chunkSetSha256,
  });

  if (!execute) {
    console.log('\nWITNESS ONLY — no embeddings generated and no database connection opened.');
    console.log(`Write mode requires ${EXECUTE_ARG} and ${AUTH_ENV}=YES.`);
    return;
  }

  if (process.env[AUTH_ENV] !== 'YES') {
    throw new Error(`${EA_INGEST_CONTRACT.act} refused: ${AUTH_ENV}=YES is required for write mode`);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(`${EA_INGEST_CONTRACT.act} refused: DATABASE_URL is not set`);
  }

  console.log(`\nPreparing ${witness.chunks.length} embeddings before any database write...`);
  const prepared: Array<{ chunk: (typeof witness.chunks)[number]; embedding: number[] }> = [];

  for (let i = 0; i < witness.chunks.length; i += 1) {
    const chunk = witness.chunks[i];
    const result = await embedWithOllama({
      text: chunk.chunkText,
      model: EA_INGEST_CONTRACT.embeddingModel,
    });

    if (result.model !== EA_INGEST_CONTRACT.embeddingModel) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: embedding model changed ` +
        `(${result.model} != ${EA_INGEST_CONTRACT.embeddingModel})`,
      );
    }
    if (result.embedding.length !== EA_INGEST_CONTRACT.embeddingDimensions) {
      throw new Error(
        `${EA_INGEST_CONTRACT.act} refused: embedding dimension changed at chunk ${i} ` +
        `(${result.embedding.length} != ${EA_INGEST_CONTRACT.embeddingDimensions})`,
      );
    }
    if (!result.embedding.every(Number.isFinite)) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: non-finite embedding value at chunk ${i}`);
    }
    if (!result.embedding.some((value) => value !== 0)) {
      throw new Error(`${EA_INGEST_CONTRACT.act} refused: zero embedding vector at chunk ${i}`);
    }

    prepared.push({ chunk, embedding: result.embedding });
    if ((i + 1) % 50 === 0 || i + 1 === witness.chunks.length) {
      console.log(`  embedded ${i + 1}/${witness.chunks.length}`);
    }
  }

  // Re-prove source and chunk identity after the potentially long embedding phase.
  const recheck = await witnessEaBuild(process.cwd());
  if (
    recheck.sourceSha256 !== witness.sourceSha256 ||
    recheck.chunkSetSha256 !== witness.chunkSetSha256 ||
    recheck.chunks.length !== witness.chunks.length
  ) {
    throw new Error(`${EA_INGEST_CONTRACT.act} refused: corpus changed while embeddings were being prepared`);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const result = await commitPreparedEaChunks(client, prepared, witness.chunks);
    console.log('\nCOMMITTED');
    console.log(`  rows:             ${result.rows}`);
    console.log(`  sources:          ${result.sources}`);
    console.log(`  embedded:         ${result.embedded}`);
    console.log(`  chunk-set SHA-256:${result.chunkSetSha256}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('UNKNOWN WRITE OUTCOME')) {
      console.error('\nUNKNOWN WRITE OUTCOME — stop. Inspect production before any retry.');
    } else {
      console.error('\nROLLED BACK OR REFUSED — no partial CORPUS-INGEST-EA-01 commit accepted.');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
