#!/usr/bin/env npx tsx
/**
 * Community Commons Corpus Ingestion
 *
 * Indexes Community Commons docs into the corpus_* tables for
 * sovereignty-first, traceable retrieval.
 *
 * Usage:
 *   DATABASE_URL="..." npx tsx scripts/ingest/commons-corpus.ts
 *   DATABASE_URL="..." npx tsx scripts/ingest/commons-corpus.ts --dry-run
 */

import { createHash } from 'crypto';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, basename } from 'path';
import { query } from '../../lib/db/postgres';
import { embedWithOllama } from '../../lib/ai/localEmbeddingClient';
import { toPgVectorLiteral } from '../../lib/db/pgvector';

// Configuration
const CORPUS_SLUG = 'commons.manuals';
const SOURCE_DIR = join(process.cwd(), 'Community-Commons');
const FILE_PATTERN = /\.md$/i;

interface ChunkStrategy {
  max_chars: number;
  overlap_chars: number;
  split_on: string[];
}

interface IngestionSummary {
  docs_processed: number;
  docs_added: number;
  docs_updated: number;
  docs_unchanged: number;
  chunks_inserted: number;
  errors: string[];
  started_at: string;
  finished_at?: string;
}

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  console.log('🔮 Community Commons Corpus Ingestion');
  console.log(`   Source: ${SOURCE_DIR}`);
  console.log(`   Corpus: ${CORPUS_SLUG}`);
  console.log(`   Dry run: ${isDryRun}`);
  console.log('');

  // Get corpus config
  const corpusResult = await query<{
    id: string;
    chunk_strategy: ChunkStrategy;
    embedding_model: string;
  }>(
    'SELECT id, chunk_strategy, embedding_model FROM corpora WHERE slug = $1',
    [CORPUS_SLUG]
  );

  if (corpusResult.rows.length === 0) {
    console.error(`❌ Corpus "${CORPUS_SLUG}" not found. Run migration first.`);
    process.exit(1);
  }

  const corpus = corpusResult.rows[0];
  const strategy = corpus.chunk_strategy;
  console.log(`   Chunk strategy: max=${strategy.max_chars}, overlap=${strategy.overlap_chars}`);
  console.log(`   Embedding model: ${corpus.embedding_model}`);
  console.log('');

  // Create ingestion record
  let ingestionId: string | null = null;
  if (!isDryRun) {
    const ingResult = await query<{ id: string }>(
      `INSERT INTO corpus_ingestions (corpus_id, status) VALUES ($1, 'running') RETURNING id`,
      [corpus.id]
    );
    ingestionId = ingResult.rows[0].id;
  }

  const summary: IngestionSummary = {
    docs_processed: 0,
    docs_added: 0,
    docs_updated: 0,
    docs_unchanged: 0,
    chunks_inserted: 0,
    errors: [],
    started_at: new Date().toISOString(),
  };

  try {
    // Discover markdown files
    const files = await discoverFiles(SOURCE_DIR, FILE_PATTERN);
    console.log(`📚 Found ${files.length} documents`);
    console.log('');

    for (const filePath of files) {
      try {
        await processDocument(filePath, corpus.id, strategy, summary);
      } catch (err) {
        const msg = `Error processing ${filePath}: ${err}`;
        console.error(`❌ ${msg}`);
        summary.errors.push(msg);
      }
    }

    // Finalize ingestion
    summary.finished_at = new Date().toISOString();

    if (!isDryRun && ingestionId) {
      await query(
        `UPDATE corpus_ingestions SET status = 'success', finished_at = NOW(), summary = $1 WHERE id = $2`,
        [JSON.stringify(summary), ingestionId]
      );
    }

    // Print summary
    console.log('');
    console.log('✅ Ingestion complete');
    console.log(`   Documents processed: ${summary.docs_processed}`);
    console.log(`   - Added: ${summary.docs_added}`);
    console.log(`   - Updated: ${summary.docs_updated}`);
    console.log(`   - Unchanged: ${summary.docs_unchanged}`);
    console.log(`   Chunks inserted: ${summary.chunks_inserted}`);
    if (summary.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${summary.errors.length}`);
    }

  } catch (err) {
    console.error('❌ Ingestion failed:', err);

    if (!isDryRun && ingestionId) {
      summary.errors.push(String(err));
      await query(
        `UPDATE corpus_ingestions SET status = 'failed', finished_at = NOW(), summary = $1 WHERE id = $2`,
        [JSON.stringify(summary), ingestionId]
      );
    }

    process.exit(1);
  }
}

async function discoverFiles(dir: string, pattern: RegExp): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files.sort();
}

async function processDocument(
  filePath: string,
  corpusId: string,
  strategy: ChunkStrategy,
  summary: IngestionSummary
) {
  const content = await readFile(filePath, 'utf-8');
  const contentHash = createHash('sha256').update(content).digest('hex');
  const relPath = relative(process.cwd(), filePath);
  const title = extractTitle(content, basename(filePath, '.md'));

  summary.docs_processed++;

  // Check if document exists and is unchanged
  const existingDoc = await query<{ id: string; content_hash: string; version: number }>(
    'SELECT id, content_hash, version FROM corpus_documents WHERE corpus_id = $1 AND source_uri = $2',
    [corpusId, relPath]
  );

  if (existingDoc.rows.length > 0) {
    const doc = existingDoc.rows[0];

    if (doc.content_hash === contentHash) {
      console.log(`⏭️  Unchanged: ${relPath}`);
      summary.docs_unchanged++;
      return;
    }

    // Document changed - delete old chunks, update document
    console.log(`🔄 Updating: ${relPath}`);

    if (!isDryRun) {
      await query('DELETE FROM corpus_chunks WHERE document_id = $1', [doc.id]);
      await query(
        `UPDATE corpus_documents SET content_hash = $1, version = $2, title = $3, updated_at = NOW() WHERE id = $4`,
        [contentHash, doc.version + 1, title, doc.id]
      );

      await insertChunks(doc.id, corpusId, content, strategy, summary);
    }

    summary.docs_updated++;
    return;
  }

  // New document
  console.log(`➕ Adding: ${relPath}`);

  if (!isDryRun) {
    const docResult = await query<{ id: string }>(
      `INSERT INTO corpus_documents (corpus_id, source_type, source_uri, title, content_hash, metadata)
       VALUES ($1, 'file', $2, $3, $4, $5) RETURNING id`,
      [
        corpusId,
        relPath,
        title,
        contentHash,
        JSON.stringify({ category: categorizeDoc(relPath) }),
      ]
    );

    await insertChunks(docResult.rows[0].id, corpusId, content, strategy, summary);
  }

  summary.docs_added++;
}

async function insertChunks(
  documentId: string,
  corpusId: string,
  content: string,
  strategy: ChunkStrategy,
  summary: IngestionSummary
) {
  const chunks = chunkContent(content, strategy);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkHash = createHash('sha256').update(chunk).digest('hex').slice(0, 16);

    // Generate embedding
    let embedding: number[] | null = null;
    try {
      const result = await embedWithOllama({ text: chunk });
      embedding = result.embedding;
    } catch (err) {
      console.warn(`   ⚠️  Embedding failed for chunk ${i}: ${err}`);
    }

    // Insert chunk
    await query(
      `INSERT INTO corpus_chunks (document_id, corpus_id, chunk_index, content, content_hash, tokens_est, embedding, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8)`,
      [
        documentId,
        corpusId,
        i,
        chunk,
        chunkHash,
        Math.ceil(chunk.length / 4), // rough token estimate
        embedding ? toPgVectorLiteral(embedding) : null,
        JSON.stringify({ section: extractSection(chunk) }),
      ]
    );

    summary.chunks_inserted++;
  }
}

function chunkContent(content: string, strategy: ChunkStrategy): string[] {
  const { max_chars, overlap_chars, split_on } = strategy;
  const chunks: string[] = [];

  // First, try to split on preferred boundaries
  let segments = [content];

  for (const delimiter of split_on) {
    const newSegments: string[] = [];
    for (const segment of segments) {
      if (segment.length <= max_chars) {
        newSegments.push(segment);
      } else {
        // Split on delimiter
        const parts = segment.split(delimiter);
        for (let i = 0; i < parts.length; i++) {
          const part = (i > 0 ? delimiter : '') + parts[i];
          newSegments.push(part);
        }
      }
    }
    segments = newSegments;
  }

  // Now merge small segments and split large ones
  let current = '';

  for (const segment of segments) {
    if (current.length + segment.length <= max_chars) {
      current += segment;
    } else {
      if (current.length > 0) {
        chunks.push(current.trim());
      }

      // Handle oversized segments
      if (segment.length > max_chars) {
        // Hard split with overlap
        let pos = 0;
        while (pos < segment.length) {
          const end = Math.min(pos + max_chars, segment.length);
          chunks.push(segment.slice(pos, end).trim());
          pos = end - overlap_chars;
          if (pos < 0) pos = end;
        }
        current = '';
      } else {
        current = segment;
      }
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.filter(c => c.length > 50); // Skip tiny chunks
}

function extractTitle(content: string, fallback: string): string {
  // Try to find H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // Try frontmatter title
  const fmMatch = content.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/);
  if (fmMatch) return fmMatch[1].trim();

  // Clean up fallback
  return fallback
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function extractSection(chunk: string): string | null {
  // Find the last heading in the chunk
  const matches = chunk.match(/^#{1,3}\s+(.+)$/gm);
  if (matches && matches.length > 0) {
    return matches[matches.length - 1].replace(/^#+\s+/, '').trim();
  }
  return null;
}

function categorizeDoc(path: string): string {
  const lower = path.toLowerCase();

  if (lower.includes('manual') || lower.includes('guide')) return 'manual';
  if (lower.includes('technical') || lower.includes('implementation')) return 'technical';
  if (lower.includes('announcement') || lower.includes('press')) return 'announcement';
  if (lower.includes('demo') || lower.includes('institutional')) return 'demo';
  if (lower.includes('devlog')) return 'devlog';

  return 'general';
}

main().catch(console.error);
