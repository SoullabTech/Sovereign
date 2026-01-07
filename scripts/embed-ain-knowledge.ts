#!/usr/bin/env npx tsx
/**
 * AIN Knowledge Embedding Pipeline
 *
 * Processes all source texts in data/ain/source/, chunks them,
 * generates embeddings via local Ollama, and stores in PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/embed-ain-knowledge.ts
 *
 * Options:
 *   --dry-run     Show what would be processed without writing
 *   --force       Re-embed all chunks (clear existing data)
 *   --batch=N     Batch size for embedding (default: 10)
 */

import { processAllSources, KnowledgeChunk } from '../lib/ain/knowledge/ChunkingService';
import { toPgVectorLiteral } from '../lib/db/pgvector';
import pg from 'pg';

const AIN_SOURCE_DIR = './data/ain/source';
const OLLAMA_URL = 'http://localhost:11434/api/embeddings';
const EMBEDDING_MODEL = 'nomic-embed-text';
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');

// Parse args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          prompt: text.substring(0, 8000), // Limit context
        }),
      });

      if (!response.ok) {
        if (attempt < retries) {
          // Wait longer between retries
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data = await response.json();
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

async function main() {
  console.log('='.repeat(60));
  console.log('AIN Knowledge Embedding Pipeline');
  console.log('='.repeat(60));
  console.log(`Source directory: ${AIN_SOURCE_DIR}`);
  console.log(`Dry run: ${isDryRun}`);
  console.log(`Force re-embed: ${isForce}`);
  console.log('');

  // Check Ollama availability
  console.log('[1/5] Checking Ollama...');
  try {
    const testEmbed = await generateEmbedding('test');
    if (testEmbed.length === 0) {
      console.error('ERROR: Ollama not responding or nomic-embed-text not available');
      console.log('Run: ollama pull nomic-embed-text');
      process.exit(1);
    }
    console.log(`      Ollama OK (embedding dimension: ${testEmbed.length})`);
  } catch (error) {
    console.error('ERROR: Cannot connect to Ollama at localhost:11434');
    console.log('Ensure Ollama is running: ollama serve');
    process.exit(1);
  }

  // Process source files
  console.log('\n[2/5] Chunking source files...');
  const chunks = await processAllSources(AIN_SOURCE_DIR);
  console.log(`      Generated ${chunks.length} chunks`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Would embed these chunks:');
    const byDomain = chunks.reduce((acc, c) => {
      acc[c.domain] = (acc[c.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [domain, count] of Object.entries(byDomain).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${domain}: ${count} chunks`);
    }
    console.log('\nRun without --dry-run to embed.');
    return;
  }

  // Connect to database
  console.log('\n[3/5] Connecting to PostgreSQL...');
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query('SELECT 1');
    console.log('      Database connected');

    // Clear existing if force
    if (isForce) {
      console.log('      [FORCE] Clearing existing chunks...');
      await pool.query('TRUNCATE ain_knowledge_chunks');
    }

    // Check what's already embedded
    const existingResult = await pool.query('SELECT DISTINCT source_file FROM ain_knowledge_chunks');
    const existingFiles = new Set(existingResult.rows.map(r => r.source_file));
    console.log(`      ${existingFiles.size} files already embedded`);

    // Filter to new chunks
    const newChunks = isForce
      ? chunks
      : chunks.filter(c => !existingFiles.has(c.sourceFile));

    console.log(`      ${newChunks.length} new chunks to embed`);

    if (newChunks.length === 0) {
      console.log('\n[DONE] All sources already embedded.');
      return;
    }

    // Embed in batches
    console.log(`\n[4/5] Embedding chunks (batch size: ${BATCH_SIZE})...`);
    let processed = 0;
    let errors = 0;

    for (let i = 0; i < newChunks.length; i += BATCH_SIZE) {
      const batch = newChunks.slice(i, i + BATCH_SIZE);

      for (const chunk of batch) {
        try {
          const embedding = await generateEmbedding(chunk.chunkText);

          if (embedding.length === 0) {
            errors++;
            continue;
          }

          await pool.query(
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
            ]
          );

          processed++;
        } catch (error) {
          console.error(`\n      Error embedding chunk ${chunk.sourceFile}#${chunk.chunkIndex}:`, error);
          errors++;
        }
      }

      // Progress
      const pct = Math.round((i + batch.length) / newChunks.length * 100);
      process.stdout.write(`\r      Progress: ${processed}/${newChunks.length} (${pct}%)`);

      // Delay between batches to avoid overwhelming Ollama
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n');

    // Summary
    console.log('[5/5] Summary');
    console.log('='.repeat(60));
    console.log(`   Chunks processed: ${processed}`);
    console.log(`   Errors: ${errors}`);

    // Stats by domain
    const stats = await pool.query(`
      SELECT domain, COUNT(*) as chunks, COUNT(DISTINCT source_file) as files
      FROM ain_knowledge_chunks
      GROUP BY domain
      ORDER BY chunks DESC
    `);

    console.log('\n   By domain:');
    for (const row of stats.rows) {
      console.log(`      ${row.domain}: ${row.chunks} chunks from ${row.files} files`);
    }

    console.log('\n[DONE] AIN knowledge base ready for retrieval.');

  } finally {
    await pool.end();
  }
}

main().catch(console.error);
