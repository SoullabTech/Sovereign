#!/usr/bin/env npx tsx
/**
 * Living Library Ingestion Pipeline
 *
 * Populates the library_sources, library_chunks tables from:
 *   Phase A: Source texts in data/ain/source/ (filtered for wisdom content)
 *   Phase B: Curated wisdom teachings from lib/forge/wisdom-library.ts
 *
 * Generates embeddings via local Ollama (nomic-embed-text, 768-dim)
 * and classifies chunks with Spiralogic metadata.
 *
 * Usage:
 *   DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" npx tsx scripts/ingest-library.ts
 *
 * Options:
 *   --dry-run       Show what would be processed without writing
 *   --force         Re-ingest even if checksum matches (clears existing)
 *   --skip-wisdom   Skip Phase B (wisdom-library.ts teachings)
 *   --skip-sources  Skip Phase A (source files)
 *   --batch=N       Embedding batch size (default: 10)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import pg from 'pg';
import { chunkText, estimateTokens, extractTitle } from '../lib/ain/knowledge/ChunkingService';
import { classifyChunkSpiralogic, mergeTagsIntoMeta, isOperationalFile, inferSourceType, extractAuthor } from '../lib/library/spiralogicTagger';
import { validateTitle, validateAuthor, resolveIngestStatus } from '../lib/library/ingestIntegrity';
import { toPgVectorLiteral } from '../lib/db/pgvector';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SOURCE_DIR = './data/ain/source';
const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const EMBEDDING_MODEL = 'nomic-embed-text';
const CHUNK_MAX_TOKENS = 700;    // Slightly smaller than AIN for library_chunks spec (300-900)
const CHUNK_OVERLAP_TOKENS = 80;
const CHUNK_MIN_TOKENS = 40;
const EMBED_DELAY_MS = 300;      // Delay between Ollama calls

// Parse CLI args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const skipWisdom = args.includes('--skip-wisdom');
const skipSources = args.includes('--skip-sources');
const batchSize = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '10');

// =============================================================================
// EMBEDDING
// =============================================================================

async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt: text.substring(0, 8000),
        }),
      });

      if (!response.ok) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json() as { embedding: number[] };
      return data.embedding;
    } catch (error) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      console.error('[EMBED] Ollama error after retries:', error);
      return [];
    }
  }
  return [];
}

// =============================================================================
// HELPERS
// =============================================================================

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function sourceExistsByChecksum(pool: pg.Pool, checksum: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT COUNT(*)::int as count FROM library_sources WHERE checksum = $1',
    [checksum]
  );
  return (result.rows[0]?.count || 0) > 0;
}

async function createSource(pool: pg.Pool, params: {
  type: string;
  title: string;
  author: string | null;
  filePath: string;
  checksum: string;
  meta?: Record<string, any>;
  expectedChunkCount?: number;
  identityValid?: boolean;
  identityInvalidReason?: string | null;
}): Promise<string> {
  const result = await pool.query(
    `INSERT INTO library_sources (type, title, author, file_path, checksum, meta, ingestion_status, expected_chunk_count, identity_valid, identity_invalid_reason)
     VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)
     RETURNING id`,
    [
      params.type, params.title, params.author, params.filePath, params.checksum,
      JSON.stringify(params.meta || {}),
      params.expectedChunkCount ?? null,
      params.identityValid ?? null,
      params.identityInvalidReason ?? null,
    ]
  );
  return result.rows[0].id;
}

async function insertChunks(pool: pg.Pool, sourceId: string, chunks: Array<{
  content: string;
  tokenCount: number;
  meta: Record<string, any>;
}>): Promise<number> {
  let inserted = 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await client.query(
        `INSERT INTO library_chunks (source_id, chunk_index, content, token_count, meta)
         VALUES ($1, $2, $3, $4, $5)`,
        [sourceId, i, chunk.content, chunk.tokenCount, JSON.stringify(chunk.meta)]
      );
      inserted++;
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  return inserted;
}

async function embedChunksForSource(pool: pg.Pool, sourceId: string): Promise<{ embedded: number; errors: number }> {
  const result = await pool.query(
    'SELECT id, content FROM library_chunks WHERE source_id = $1 AND embedding IS NULL ORDER BY chunk_index',
    [sourceId]
  );

  let embedded = 0;
  let errors = 0;

  for (const row of result.rows) {
    try {
      const embedding = await generateEmbedding(row.content);
      if (embedding.length > 0) {
        await pool.query(
          'UPDATE library_chunks SET embedding = $2::vector WHERE id = $1',
          [row.id, toPgVectorLiteral(embedding)]
        );
        embedded++;
      } else {
        errors++;
      }
    } catch (error) {
      console.warn(`      [WARN] Failed to embed chunk ${row.id}:`, (error as Error).message);
      errors++;
    }

    // Delay between embedding calls
    await new Promise(r => setTimeout(r, EMBED_DELAY_MS));
  }

  return { embedded, errors };
}

async function updateSourceStatus(pool: pg.Pool, sourceId: string, status: string, stats?: { tokenCount: number; chunkCount: number }, error?: string): Promise<void> {
  await pool.query(
    `UPDATE library_sources SET
      ingestion_status = $2,
      token_count_total = $3,
      chunk_count = $4,
      ingestion_error = $5
     WHERE id = $1`,
    [sourceId, status, stats?.tokenCount || null, stats?.chunkCount || null, error || null]
  );
}

// =============================================================================
// PHASE A: SOURCE FILE INGESTION
// =============================================================================

async function ingestSourceFiles(pool: pg.Pool): Promise<{ processed: number; skipped: number; errors: number; chunks: number }> {
  console.log('\n[Phase A] Ingesting source files from', SOURCE_DIR);
  console.log('─'.repeat(60));

  const stats = { processed: 0, skipped: 0, errors: 0, chunks: 0 };

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`[ERROR] Source directory not found: ${SOURCE_DIR}`);
    return stats;
  }

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.txt') || f.endsWith('.md'))
    .sort();

  console.log(`   Found ${files.length} source files`);

  let wisdomFiles = 0;
  let operationalFiles = 0;

  for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
    const filename = files[fileIdx];
    const filePath = path.join(SOURCE_DIR, filename);

    // Filter out operational/technical docs
    if (isOperationalFile(filename)) {
      operationalFiles++;
      stats.skipped++;
      continue;
    }

    wisdomFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const checksum = sha256(content);

    // Dedup check
    if (!isForce) {
      const exists = await sourceExistsByChecksum(pool, checksum);
      if (exists) {
        stats.skipped++;
        continue;
      }
    }

    const title = extractTitle(filename);
    const sourceType = inferSourceType(filename);
    const author = extractAuthor(filename);

    if (isDryRun) {
      const chunkCount = chunkText(content, {
        maxTokens: CHUNK_MAX_TOKENS,
        overlapTokens: CHUNK_OVERLAP_TOKENS,
        minChunkTokens: CHUNK_MIN_TOKENS,
      }).length;
      console.log(`   [DRY] ${filename} → ${sourceType} | ${chunkCount} chunks | author: ${author || '?'}`);
      stats.processed++;
      stats.chunks += chunkCount;
      continue;
    }

    try {
      // Chunk the content first: expected count is planned from the FULL
      // content before any writes (D2 completeness contract).
      const textChunks = chunkText(content, {
        maxTokens: CHUNK_MAX_TOKENS,
        overlapTokens: CHUNK_OVERLAP_TOKENS,
        minChunkTokens: CHUNK_MIN_TOKENS,
      });

      // D1 identity contract: filename-derived title + curated-list author,
      // both validated. Invalid identity is recorded as failed, never as
      // retrievable content.
      const titleCheck = validateTitle(title);
      const authorCheck = validateAuthor(author);
      if (!titleCheck.valid || !authorCheck.valid) {
        const reasons = [...titleCheck.reasons, ...authorCheck.reasons].join(',');
        const failedId = await createSource(pool, {
          type: sourceType,
          title,
          author,
          filePath: filePath,
          checksum,
          meta: { original_filename: filename },
          expectedChunkCount: textChunks.length,
          identityValid: false,
          identityInvalidReason: reasons,
        });
        await updateSourceStatus(pool, failedId, 'failed', undefined, `identity_invalid: ${reasons}`);
        stats.errors++;
        continue;
      }

      // Create source record
      const sourceId = await createSource(pool, {
        type: sourceType,
        title,
        author,
        filePath: filePath,
        checksum,
        meta: {
          original_filename: filename,
          // Reproducibility: expected_chunk_count is only meaningful relative
          // to the chunker that produced it.
          chunking_params: {
            algorithm: 'chunkText@lib/ain/knowledge/ChunkingService',
            max_tokens: CHUNK_MAX_TOKENS,
            overlap_tokens: CHUNK_OVERLAP_TOKENS,
            min_chunk_tokens: CHUNK_MIN_TOKENS,
          },
        },
        expectedChunkCount: textChunks.length,
        identityValid: true,
      });

      // Classify each chunk with Spiralogic metadata
      const classifiedChunks = textChunks.map(chunkContent => {
        const tags = classifyChunkSpiralogic(chunkContent);
        return {
          content: chunkContent,
          tokenCount: estimateTokens(chunkContent),
          meta: mergeTagsIntoMeta({}, tags),
        };
      });

      // Insert chunks
      const chunkCount = await insertChunks(pool, sourceId, classifiedChunks);

      // Generate embeddings
      const embedResult = await embedChunksForSource(pool, sourceId);

      // Calculate total tokens
      const totalTokens = classifiedChunks.reduce((sum, c) => sum + c.tokenCount, 0);

      // D2: terminal status from expected vs actual — mismatch resolves to
      // 'partial', which is never retrieval-eligible.
      const outcome = resolveIngestStatus({
        expectedChunks: textChunks.length,
        actualChunks: chunkCount,
        identityValid: true,
      });
      await updateSourceStatus(pool, sourceId, outcome.status, {
        tokenCount: totalTokens,
        chunkCount,
      }, outcome.error || undefined);

      stats.processed++;
      stats.chunks += chunkCount;

      // Progress
      const pct = Math.round((fileIdx + 1) / files.length * 100);
      process.stdout.write(
        `\r   Progress: ${stats.processed} processed, ${stats.skipped} skipped, ${stats.errors} errors (${pct}%) — ${filename.substring(0, 40)}`
      );

      if (embedResult.errors > 0) {
        stats.errors += embedResult.errors;
      }

    } catch (error) {
      console.error(`\n   [ERROR] ${filename}:`, (error as Error).message);
      stats.errors++;
    }
  }

  console.log(`\n\n   Wisdom files: ${wisdomFiles} | Operational (skipped): ${operationalFiles}`);
  return stats;
}

// =============================================================================
// PHASE B: WISDOM LIBRARY INGESTION
// =============================================================================

async function ingestWisdomTeachings(pool: pg.Pool): Promise<{ processed: number; skipped: number; errors: number; chunks: number }> {
  console.log('\n[Phase B] Ingesting wisdom teachings from wisdom-library.ts');
  console.log('─'.repeat(60));

  const stats = { processed: 0, skipped: 0, errors: 0, chunks: 0 };

  // Dynamic import to handle the TS module
  const { wisdomLibrary } = await import('../lib/forge/wisdom-library');
  console.log(`   Found ${wisdomLibrary.length} wisdom teachings`);

  // Group teachings by tradition+teacher for logical source grouping
  const groups = new Map<string, typeof wisdomLibrary>();
  for (const teaching of wisdomLibrary) {
    const key = `${teaching.tradition}::${teaching.teacher}`;
    const existing = groups.get(key) || [];
    existing.push(teaching);
    groups.set(key, existing);
  }

  console.log(`   Grouped into ${groups.size} source records`);

  let groupIdx = 0;
  for (const [key, teachings] of groups) {
    const [tradition, teacher] = key.split('::');
    groupIdx++;

    // Create a synthetic "file content" for checksum
    const syntheticContent = teachings.map(t => t.quote).join('\n---\n');
    const checksum = sha256(syntheticContent);

    // Dedup check
    if (!isForce) {
      const exists = await sourceExistsByChecksum(pool, checksum);
      if (exists) {
        stats.skipped++;
        continue;
      }
    }

    const title = `${teacher} — ${tradition.charAt(0).toUpperCase() + tradition.slice(1)} Teachings`;

    if (isDryRun) {
      console.log(`   [DRY] ${title} → ${teachings.length} teachings`);
      stats.processed++;
      stats.chunks += teachings.length;
      continue;
    }

    try {
      // Create source record
      const sourceId = await createSource(pool, {
        type: 'teaching',
        title,
        author: teacher,
        filePath: `lib/forge/wisdom-library.ts::${key}`,
        checksum,
        meta: { tradition, teacher, source_type: 'curated_wisdom' },
        expectedChunkCount: teachings.length,
        identityValid: true,
      });

      // Each teaching becomes one chunk with rich metadata
      const classifiedChunks = teachings.map(teaching => {
        const tags = classifyChunkSpiralogic(teaching.quote, {
          element: teaching.element,
          phase: teaching.phase,
          tradition: teaching.tradition,
        });

        return {
          content: teaching.quote,
          tokenCount: estimateTokens(teaching.quote),
          meta: mergeTagsIntoMeta(
            {
              teacher: teaching.teacher,
              tradition: teaching.tradition,
              source_text: teaching.source || null,
            },
            tags
          ),
        };
      });

      // Insert chunks
      const chunkCount = await insertChunks(pool, sourceId, classifiedChunks);

      // Generate embeddings
      const embedResult = await embedChunksForSource(pool, sourceId);

      // Calculate total tokens
      const totalTokens = classifiedChunks.reduce((sum, c) => sum + c.tokenCount, 0);

      // D2: terminal status from expected vs actual.
      const outcome = resolveIngestStatus({
        expectedChunks: teachings.length,
        actualChunks: chunkCount,
        identityValid: true,
      });
      await updateSourceStatus(pool, sourceId, outcome.status, {
        tokenCount: totalTokens,
        chunkCount,
      }, outcome.error || undefined);

      stats.processed++;
      stats.chunks += chunkCount;

      process.stdout.write(
        `\r   Progress: ${groupIdx}/${groups.size} groups — ${title.substring(0, 50)}`
      );

      if (embedResult.errors > 0) {
        stats.errors += embedResult.errors;
      }

    } catch (error) {
      console.error(`\n   [ERROR] ${teacher}/${tradition}:`, (error as Error).message);
      stats.errors++;
    }
  }

  console.log('\n');
  return stats;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('═'.repeat(60));
  console.log('  Living Library Ingestion Pipeline');
  console.log('  "Wisdom arriving at the moment of readiness"');
  console.log('═'.repeat(60));
  console.log(`  Dry run:       ${isDryRun}`);
  console.log(`  Force:         ${isForce}`);
  console.log(`  Skip sources:  ${skipSources}`);
  console.log(`  Skip wisdom:   ${skipWisdom}`);
  console.log(`  Batch size:    ${batchSize}`);
  console.log('');

  // Step 1: Check Ollama
  if (!isDryRun) {
    console.log('[1/4] Checking Ollama...');
    try {
      const testEmbed = await generateEmbedding('test');
      if (testEmbed.length === 0) {
        console.error('   ERROR: Ollama not responding or nomic-embed-text not available');
        console.log('   Run: ollama pull nomic-embed-text');
        process.exit(1);
      }
      console.log(`   Ollama OK (embedding dimension: ${testEmbed.length})`);
    } catch (error) {
      console.error('   ERROR: Cannot connect to Ollama at localhost:11434');
      console.log('   Ensure Ollama is running: ollama serve');
      process.exit(1);
    }
  }

  // Step 2: Connect to database
  console.log('\n[2/4] Connecting to PostgreSQL...');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  });

  try {
    await pool.query('SELECT 1');
    console.log('   Database connected');

    // Check if tables exist
    const tableCheck = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'library_sources'"
    );
    if (tableCheck.rows.length === 0) {
      console.error('   ERROR: library_sources table not found. Run migration first:');
      console.error('   psql -U soullab maia_consciousness -f database/migrations/20260130000001_library_intelligence.sql');
      process.exit(1);
    }
    console.log('   Library tables verified');

    // Show current state
    const currentStats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM library_sources) as sources,
        (SELECT COUNT(*) FROM library_chunks) as chunks,
        (SELECT COUNT(*) FROM library_chunks WHERE embedding IS NOT NULL) as embedded
    `);
    const s = currentStats.rows[0];
    console.log(`   Current state: ${s.sources} sources, ${s.chunks} chunks, ${s.embedded} embedded`);

    if (isForce && !isDryRun) {
      console.log('   [FORCE] Clearing existing library data...');
      await pool.query('DELETE FROM library_chunks');
      await pool.query('DELETE FROM library_sources');
      console.log('   Cleared.');
    }

    // Step 3: Run ingestion phases
    console.log('\n[3/4] Ingestion');

    let sourceStats = { processed: 0, skipped: 0, errors: 0, chunks: 0 };
    let wisdomStats = { processed: 0, skipped: 0, errors: 0, chunks: 0 };

    if (!skipSources) {
      sourceStats = await ingestSourceFiles(pool);
    }

    if (!skipWisdom) {
      wisdomStats = await ingestWisdomTeachings(pool);
    }

    // Step 4: Summary
    console.log('\n[4/4] Summary');
    console.log('═'.repeat(60));

    if (!skipSources) {
      console.log('  Phase A (Source Files):');
      console.log(`    Processed: ${sourceStats.processed}`);
      console.log(`    Skipped:   ${sourceStats.skipped}`);
      console.log(`    Errors:    ${sourceStats.errors}`);
      console.log(`    Chunks:    ${sourceStats.chunks}`);
    }

    if (!skipWisdom) {
      console.log('  Phase B (Wisdom Teachings):');
      console.log(`    Processed: ${wisdomStats.processed}`);
      console.log(`    Skipped:   ${wisdomStats.skipped}`);
      console.log(`    Errors:    ${wisdomStats.errors}`);
      console.log(`    Chunks:    ${wisdomStats.chunks}`);
    }

    const totalChunks = sourceStats.chunks + wisdomStats.chunks;
    console.log(`\n  Total chunks created: ${totalChunks}`);

    if (!isDryRun && totalChunks > 0) {
      // Final stats from database
      const finalStats = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM library_sources WHERE ingestion_status = 'completed') as completed_sources,
          (SELECT COUNT(*) FROM library_chunks) as total_chunks,
          (SELECT COUNT(*) FROM library_chunks WHERE embedding IS NOT NULL) as embedded_chunks,
          (SELECT COUNT(DISTINCT meta->>'element') FROM library_chunks WHERE meta->>'element' IS NOT NULL) as elements_tagged,
          (SELECT COALESCE(SUM(token_count_total), 0) FROM library_sources) as total_tokens
      `);
      const f = finalStats.rows[0];
      console.log(`\n  Database state:`);
      console.log(`    Completed sources: ${f.completed_sources}`);
      console.log(`    Total chunks:      ${f.total_chunks}`);
      console.log(`    Embedded chunks:   ${f.embedded_chunks}`);
      console.log(`    Elements tagged:   ${f.elements_tagged}`);
      console.log(`    Total tokens:      ${f.total_tokens}`);

      // Element distribution
      const elementDist = await pool.query(`
        SELECT meta->>'element' as element, COUNT(*) as count
        FROM library_chunks
        WHERE meta->>'element' IS NOT NULL
        GROUP BY meta->>'element'
        ORDER BY count DESC
      `);
      if (elementDist.rows.length > 0) {
        console.log('\n  Element distribution:');
        for (const row of elementDist.rows) {
          console.log(`    ${row.element || 'untagged'}: ${row.count} chunks`);
        }
      }

      // Structured completion line — one authoritative record
      console.log(JSON.stringify({
        tag: 'library_ingest_complete',
        timestamp: new Date().toISOString(),
        sources: +f.completed_sources,
        chunks: +f.total_chunks,
        embedded: +f.embedded_chunks,
        elements_tagged: +f.elements_tagged,
        total_tokens: +f.total_tokens,
        embedding_model: 'nomic-embed-text',
        embedding_dim: 768,
      }));

      // Rebuild IVFFlat index after bulk insert
      console.log('\n  Rebuilding vector index...');
      try {
        await pool.query('REINDEX INDEX idx_library_chunks_embedding');
        console.log('  Index rebuilt.');
      } catch (indexError) {
        console.warn('  [WARN] Index rebuild skipped:', (indexError as Error).message);
      }
    }

    console.log('\n[DONE] Living Library ingestion complete.');
    if (isDryRun) {
      console.log('       Run without --dry-run to write to database.');
    }

  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('[FATAL]', error);
  process.exit(1);
});
