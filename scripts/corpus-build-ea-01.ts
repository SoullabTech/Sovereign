#!/usr/bin/env npx tsx

import pg from 'pg';

import { toPgVectorLiteral } from '../lib/db/pgvector';
import {
  EA01_BUILD_ID,
  EA01_SUBJECT_REL,
  assertEa01PostState,
  assertEa01PreState,
  buildEa01Plan,
  type Ea01BuildPlan,
  type Ea01DbState,
} from '../lib/corpus/ea01Build';

const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const EMBEDDING_MODEL = 'nomic-embed-text';
const EMBEDDING_DIM = 768;
const EXECUTE_PREFIX = `${EA01_BUILD_ID}:`;

const args = process.argv.slice(2);
const execute = args.includes('--execute');
const rollback = args.includes('--rollback');
if (execute && rollback) throw new Error('Choose only one of --execute or --rollback');

const mode = rollback ? 'rollback' : execute ? 'execute' : 'plan';
type Db = Pick<pg.Pool, 'query'> | Pick<pg.PoolClient, 'query'>;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required for execute/rollback');
  return url;
}

function requireExecutionToken(plan: Ea01BuildPlan, envName: string): void {
  const expected = `${EXECUTE_PREFIX}${plan.subjectSha256}:${plan.contentSha256}`;
  if (process.env[envName] !== expected) {
    throw new Error(`${envName} must equal ${expected}`);
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text.substring(0, 8000) }),
  });
  if (!response.ok) throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
  const data = await response.json() as { embedding?: number[] };
  const embedding = data.embedding ?? [];
  if (embedding.length !== EMBEDDING_DIM) {
    throw new Error(`Expected ${EMBEDDING_DIM}-dim embedding, received ${embedding.length}`);
  }
  return embedding;
}
async function precomputeEmbeddings(plan: Ea01BuildPlan): Promise<{
  ain: number[][];
  library: number[][];
}> {
  console.log(`[EA01] Precomputing ${plan.ainChunks.length} AIN embeddings...`);
  const ain: number[][] = [];
  for (const [index, chunk] of plan.ainChunks.entries()) {
    ain.push(await generateEmbedding(chunk.chunkText));
    if ((index + 1) % 10 === 0 || index + 1 === plan.ainChunks.length) {
      console.log(`[EA01] AIN embeddings ${index + 1}/${plan.ainChunks.length}`);
    }
  }

  console.log(`[EA01] Precomputing ${plan.libraryChunks.length} Library embeddings...`);
  const library: number[][] = [];
  for (const [index, chunk] of plan.libraryChunks.entries()) {
    library.push(await generateEmbedding(chunk.content));
    if ((index + 1) % 10 === 0 || index + 1 === plan.libraryChunks.length) {
      console.log(`[EA01] Library embeddings ${index + 1}/${plan.libraryChunks.length}`);
    }
  }
  return { ain, library };
}

async function verifyProvenanceSchema(db: Db): Promise<void> {
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*)::int
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'ain_knowledge_chunks'
         AND column_name IN ('source_checksum', 'content_checksum', 'normalization_id', 'authority_ref', 'corpus_build_id')) AS provenance_columns,
      (SELECT COUNT(*)::int
       FROM pg_constraint
       WHERE conrelid = 'ain_knowledge_chunks'::regclass
         AND conname = 'ain_knowledge_new_rows_require_provenance'
         AND contype = 'c') AS provenance_gate,
      (SELECT COUNT(*)::int
       FROM pg_constraint
       WHERE conrelid = 'ain_knowledge_chunks'::regclass
         AND conname = 'ain_knowledge_source_checksum_shape'
         AND contype = 'c') AS checksum_shape_gate,
      (SELECT COUNT(*)::int
       FROM pg_indexes
       WHERE schemaname = 'public'
         AND tablename = 'ain_knowledge_chunks'
         AND indexname = 'idx_ain_knowledge_provenance_chunk'
         AND indexdef ILIKE 'CREATE UNIQUE INDEX%') AS provenance_unique_index
  `);
  const row = result.rows[0] ?? {};
  const complete = Number(row.provenance_columns) === 5
    && Number(row.provenance_gate) === 1
    && Number(row.checksum_shape_gate) === 1
    && Number(row.provenance_unique_index) === 1;
  if (!complete) {
    throw new Error(
      `AIN provenance substrate is incomplete: columns=${row.provenance_columns ?? 0}; gate=${row.provenance_gate ?? 0}; checksum=${row.checksum_shape_gate ?? 0}; unique_index=${row.provenance_unique_index ?? 0}`,
    );
  }
}
async function readState(db: Db, plan: Ea01BuildPlan): Promise<Ea01DbState> {
  const result = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks) AS ain_total_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1) AS ain_subject_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1 AND embedding IS NOT NULL) AS ain_subject_embedded_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1 AND source_checksum = $2) AS ain_subject_digest_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1 AND corpus_build_id = $3) AS ain_subject_build_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1 AND content_checksum = $5) AS ain_subject_content_rows,
      (SELECT COUNT(*)::int FROM ain_knowledge_chunks WHERE source_file = $1 AND normalization_id = $6) AS ain_subject_normalization_rows,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path LIKE 'data/ain/source/%') AS library_corpus_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4) AS library_subject_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND ingestion_status = 'completed') AS library_subject_completed_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND identity_valid IS TRUE) AS library_subject_valid_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND checksum = $2) AS library_subject_digest_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND meta->>'corpus_build_id' = $3) AS library_subject_build_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND meta->>'content_checksum' = $5) AS library_subject_content_sources,
      (SELECT COUNT(*)::int FROM library_sources WHERE file_path = $4 AND meta->>'normalization_id' = $6) AS library_subject_normalization_sources,
      (SELECT COUNT(*)::int FROM library_chunks c JOIN library_sources s ON s.id = c.source_id WHERE s.file_path = $4) AS library_subject_chunks,
      (SELECT COUNT(*)::int FROM library_chunks c JOIN library_sources s ON s.id = c.source_id WHERE s.file_path = $4 AND c.embedding IS NOT NULL) AS library_subject_embedded_chunks
  `, [plan.subjectFile, plan.subjectSha256, plan.buildId, plan.subjectRel, plan.contentSha256, plan.normalizationId]);

  const row = result.rows[0];
  const n = (key: string) => Number(row[key] ?? 0);
  return {
    ainTotalRows: n('ain_total_rows'),
    ainSubjectRows: n('ain_subject_rows'),
    ainSubjectEmbeddedRows: n('ain_subject_embedded_rows'),
    ainSubjectDigestRows: n('ain_subject_digest_rows'),
    ainSubjectBuildRows: n('ain_subject_build_rows'),
    ainSubjectContentRows: n('ain_subject_content_rows'),
    ainSubjectNormalizationRows: n('ain_subject_normalization_rows'),
    libraryCorpusSources: n('library_corpus_sources'),
    librarySubjectSources: n('library_subject_sources'),
    librarySubjectCompletedSources: n('library_subject_completed_sources'),
    librarySubjectValidSources: n('library_subject_valid_sources'),
    librarySubjectDigestSources: n('library_subject_digest_sources'),
    librarySubjectBuildSources: n('library_subject_build_sources'),
    librarySubjectContentSources: n('library_subject_content_sources'),
    librarySubjectNormalizationSources: n('library_subject_normalization_sources'),
    librarySubjectChunks: n('library_subject_chunks'),
    librarySubjectEmbeddedChunks: n('library_subject_embedded_chunks'),
  };
}

function planSummary(plan: Ea01BuildPlan) {
  return {
    tag: 'corpus_build_ea01_plan',
    build_id: plan.buildId,
    subject: plan.subjectRel,
    subject_sha256: plan.subjectSha256,
    content_sha256: plan.contentSha256,
    normalization_id: plan.normalizationId,
    rights_holder: plan.rightsHolder,
    authority_ref: plan.authorityRef,
    admitted_paths: plan.admittedPaths,
    ain_chunks: plan.ainChunks.length,
    library_chunks: plan.libraryChunks.length,
    library_tokens: plan.libraryTokenCount,
    execution_token: `${EXECUTE_PREFIX}${plan.subjectSha256}:${plan.contentSha256}`,
  };
}
async function insertAinChunks(
  client: pg.PoolClient,
  plan: Ea01BuildPlan,
  embeddings: number[][],
): Promise<void> {
  for (let i = 0; i < plan.ainChunks.length; i++) {
    const chunk = plan.ainChunks[i];
    await client.query(
      `INSERT INTO ain_knowledge_chunks
       (source_file, source_title, chunk_index, chunk_text, chunk_tokens,
        embedding, categories, domain, author, embedded_at,
        source_checksum, content_checksum, normalization_id, authority_ref, corpus_build_id)
       VALUES ($1,$2,$3,$4,$5,$6::vector,$7,$8,$9,NOW(),$10,$11,$12,$13,$14)`,
      [
        chunk.sourceFile,
        chunk.sourceTitle,
        chunk.chunkIndex,
        chunk.chunkText,
        chunk.chunkTokens,
        toPgVectorLiteral(embeddings[i]),
        chunk.categories,
        chunk.domain,
        plan.rightsHolder,
        plan.subjectSha256,
        plan.contentSha256,
        plan.normalizationId,
        plan.authorityRef,
        plan.buildId,
      ],
    );
  }
}
async function insertLibrarySource(
  client: pg.PoolClient,
  plan: Ea01BuildPlan,
  embeddings: number[][],
): Promise<string> {
  const sourceMeta = {
    corpus_build_id: plan.buildId,
    source_checksum: plan.subjectSha256,
    content_checksum: plan.contentSha256,
    normalization_id: plan.normalizationId,
    authority_ref: plan.authorityRef,
    rights_holder: plan.rightsHolder,
    source_path: plan.subjectRel,
    chunking_params: {
      algorithm: 'chunkText@lib/ain/knowledge/ChunkingService',
      max_tokens: 700,
      overlap_tokens: 80,
      min_chunk_tokens: 40,
    },
  };

  const sourceResult = await client.query(
    `INSERT INTO library_sources
     (type, title, author, file_path, checksum, meta, ingestion_status,
      token_count_total, chunk_count, expected_chunk_count, identity_valid)
     VALUES ($1,$2,$3,$4,$5,$6,'processing',$7,$8,$8,true)
     RETURNING id`,
    [
      plan.sourceType,
      plan.sourceTitle,
      plan.rightsHolder,
      plan.subjectRel,
      plan.subjectSha256,
      JSON.stringify(sourceMeta),
      plan.libraryTokenCount,
      plan.libraryChunks.length,
    ],
  );
  const sourceId = sourceResult.rows[0].id as string;
  for (let i = 0; i < plan.libraryChunks.length; i++) {
    const chunk = plan.libraryChunks[i];
    await client.query(
      `INSERT INTO library_chunks
       (source_id, chunk_index, content, token_count, embedding, meta)
       VALUES ($1,$2,$3,$4,$5::vector,$6)`,
      [
        sourceId,
        i,
        chunk.content,
        chunk.tokenCount,
        toPgVectorLiteral(embeddings[i]),
        JSON.stringify(chunk.meta),
      ],
    );
  }

  await client.query(
    `UPDATE library_sources
     SET ingestion_status = 'completed', ingestion_error = NULL,
         token_count_total = $2, chunk_count = $3,
         expected_chunk_count = $3, identity_valid = true
     WHERE id = $1`,
    [sourceId, plan.libraryTokenCount, plan.libraryChunks.length],
  );

  return sourceId;
}
async function rollbackExact(pool: pg.Pool, plan: Ea01BuildPlan): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM ain_knowledge_chunks
       WHERE source_file = $1
         AND source_checksum = $2
         AND content_checksum = $3
         AND normalization_id = $4
         AND corpus_build_id = $5`,
      [plan.subjectFile, plan.subjectSha256, plan.contentSha256, plan.normalizationId, plan.buildId],
    );
    await client.query(
      `DELETE FROM library_sources
       WHERE file_path = $1
         AND checksum = $2
         AND meta->>'content_checksum' = $3
         AND meta->>'normalization_id' = $4
         AND meta->>'corpus_build_id' = $5`,
      [plan.subjectRel, plan.subjectSha256, plan.contentSha256, plan.normalizationId, plan.buildId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const restored = await readState(pool, plan);
  assertEa01PreState(restored);
  console.log(JSON.stringify({ tag: 'corpus_build_ea01_rollback', restored }));
}
async function executeBuild(plan: Ea01BuildPlan): Promise<void> {
  requireExecutionToken(plan, 'CORPUS_BUILD_EA01_EXECUTE');
  const pool = new pg.Pool({ connectionString: requireDatabaseUrl() });

  try {
    await verifyProvenanceSchema(pool);
    const initialPre = await readState(pool, plan);
    assertEa01PreState(initialPre);
    console.log(JSON.stringify({ tag: 'corpus_build_ea01_pre', state: initialPre }));

    const embeddings = await precomputeEmbeddings(plan);
    const client = await pool.connect();
    let committed = false;
    let librarySourceId = '';

    try {
      await client.query('BEGIN');
      await client.query(
        'LOCK TABLE ain_knowledge_chunks, library_sources, library_chunks IN SHARE ROW EXCLUSIVE MODE',
      );
      const lockedPre = await readState(client, plan);
      assertEa01PreState(lockedPre);

      await insertAinChunks(client, plan, embeddings.ain);
      librarySourceId = await insertLibrarySource(client, plan, embeddings.library);

      const inTransactionPost = await readState(client, plan);
      assertEa01PostState(plan, inTransactionPost);
      await client.query('COMMIT');
      committed = true;
    } catch (error) {
      if (!committed) await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
    try {
      const post = await readState(pool, plan);
      assertEa01PostState(plan, post);
      console.log(JSON.stringify({
        tag: 'corpus_build_ea01_committed',
        build_id: plan.buildId,
        subject: plan.subjectRel,
        subject_sha256: plan.subjectSha256,
    content_sha256: plan.contentSha256,
    normalization_id: plan.normalizationId,
        library_source_id: librarySourceId,
        ain_chunks: plan.ainChunks.length,
        library_chunks: plan.libraryChunks.length,
        state: post,
      }));
    } catch (error) {
      console.error('[EA01] Post-commit witness failed; rolling back exact EA01 provenance rows.');
      await rollbackExact(pool, plan);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

async function rollbackBuild(plan: Ea01BuildPlan): Promise<void> {
  requireExecutionToken(plan, 'CORPUS_BUILD_EA01_ROLLBACK');
  const pool = new pg.Pool({ connectionString: requireDatabaseUrl() });
  try {
    await verifyProvenanceSchema(pool);
    await rollbackExact(pool, plan);
  } finally {
    await pool.end();
  }
}
async function main(): Promise<void> {
  const plan = buildEa01Plan(process.cwd());
  console.log(JSON.stringify(planSummary(plan)));

  if (mode === 'plan') {
    console.log('[EA01] PLAN ONLY — no Ollama call and no database connection were made.');
    return;
  }
  if (mode === 'rollback') {
    await rollbackBuild(plan);
    return;
  }
  await executeBuild(plan);
}

main().catch((error) => {
  console.error('[EA01:FATAL]', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
