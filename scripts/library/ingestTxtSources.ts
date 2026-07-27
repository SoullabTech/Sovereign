#!/usr/bin/env npx tsx
/**
 * Library Ingestion Script — txt files
 *
 * Ingests a directory of .txt files into library_sources and library_chunks.
 * Follows the Jeeves pattern: silent archive, provenance-rich, consent-first.
 *
 * Usage:
 *   npx tsx scripts/library/ingestTxtSources.ts [options]
 *
 * Options:
 *   --dry-run          Show what would be ingested without writing to DB
 *   --path <dir>       Override LIBRARY_INGEST_PATH env var
 *   --skip-embeddings  Skip embedding generation (faster, can run separately)
 *   --reset-stuck      Reset sources stuck in "processing" to "pending"
 *
 * Environment:
 *   LIBRARY_INGEST_PATH   Directory containing .txt files to ingest
 *   DATABASE_URL          PostgreSQL connection string
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { libraryService } from '../../lib/library/LibraryService';
import { extractIdentity, resolveIngestStatus } from '../../lib/library/ingestIntegrity';
import { query } from '../../lib/database/postgres';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Chunking parameters
  CHUNK_TARGET_SIZE: 1000,   // Target characters per chunk
  CHUNK_MIN_SIZE: 300,       // Minimum chunk size
  CHUNK_MAX_SIZE: 1200,      // Maximum chunk size
  CHUNK_OVERLAP: 100,        // Overlap between chunks for context continuity

  // Token estimation (rough)
  CHARS_PER_TOKEN: 4,

  // File filtering
  ALLOWED_EXTENSIONS: ['.txt', '.md'],
  SKIP_PATTERNS: ['.git', 'node_modules', '.DS_Store', 'thumbs.db'],
};

// =============================================================================
// CHUNKING
// =============================================================================

interface Chunk {
  content: string;
  tokenCount: number;
  meta: {
    startChar: number;
    endChar: number;
    sectionHint?: string;
  };
}

/**
 * Deterministic chunking: ~800-1200 chars with 100 char overlap
 * Tries to break on paragraph/sentence boundaries when possible
 */
function chunkText(content: string): Chunk[] {
  const chunks: Chunk[] = [];
  let position = 0;

  while (position < content.length) {
    // Calculate chunk end position
    let endPosition = position + CONFIG.CHUNK_TARGET_SIZE;

    // If this would be the last chunk and it's small, extend to end
    if (content.length - endPosition < CONFIG.CHUNK_MIN_SIZE) {
      endPosition = content.length;
    } else if (endPosition < content.length) {
      // Try to find a good break point (paragraph > sentence > word)
      const searchWindow = content.substring(
        endPosition - 100,
        Math.min(endPosition + 100, content.length)
      );

      // Prefer paragraph break
      const paragraphBreak = searchWindow.lastIndexOf('\n\n');
      if (paragraphBreak > 50) {
        endPosition = endPosition - 100 + paragraphBreak + 2;
      } else {
        // Try sentence break
        const sentenceBreak = searchWindow.search(/[.!?]\s+/);
        if (sentenceBreak > 30) {
          endPosition = endPosition - 100 + sentenceBreak + 2;
        } else {
          // Fall back to word break
          const wordBreak = searchWindow.lastIndexOf(' ');
          if (wordBreak > 0) {
            endPosition = endPosition - 100 + wordBreak + 1;
          }
        }
      }
    }

    // Extract chunk content
    const chunkContent = content.substring(position, endPosition).trim();

    if (chunkContent.length >= CONFIG.CHUNK_MIN_SIZE || position + CONFIG.CHUNK_MAX_SIZE >= content.length) {
      // Try to detect section from first line
      const firstLine = chunkContent.split('\n')[0];
      const sectionHint = firstLine.length < 80 && /^[A-Z#*]/.test(firstLine)
        ? firstLine.replace(/^#+\s*/, '').trim()
        : undefined;

      chunks.push({
        content: chunkContent,
        tokenCount: Math.ceil(chunkContent.length / CONFIG.CHARS_PER_TOKEN),
        meta: {
          startChar: position,
          endChar: endPosition,
          sectionHint,
        },
      });
    }

    // Move position with overlap
    position = endPosition - CONFIG.CHUNK_OVERLAP;

    // Prevent infinite loop
    if (position <= chunks[chunks.length - 1]?.meta.startChar) {
      position = endPosition;
    }
  }

  return chunks;
}

// =============================================================================
// FILE PROCESSING
// =============================================================================

interface FileInfo {
  path: string;
  relativePath: string;
  name: string;
  content: string;
  checksum: string;
  title: string;
  author: string | null;
  identityValid: boolean;
  identityInvalidReason: string | null;
  folder: string;
}

/**
 * Recursively find all txt/md files in a directory
 */
function findFiles(dir: string, basePath: string = dir): FileInfo[] {
  const files: FileInfo[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip hidden/excluded patterns
    if (CONFIG.SKIP_PATTERNS.some(p => entry.name.includes(p))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...findFiles(fullPath, basePath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf-8');

        // Strip null bytes (PostgreSQL text columns reject 0x00)
        const originalLength = content.length;
        content = content.replace(/\x00/g, '');
        if (content.length < originalLength) {
          console.warn(`   ⚠️  Stripped ${originalLength - content.length} null bytes from ${entry.name}`);
        }

        // Strip BOM (byte order mark) if present
        content = content.replace(/^\uFEFF/, '');

        const checksum = crypto.createHash('sha256').update(content).digest('hex');

        // Validated identity extraction (D1): filename-derived title, heading
        // override only when the heading itself validates, author only from a
        // head-of-document byline. See lib/library/ingestIntegrity.ts.
        const identity = extractIdentity(content, path.basename(entry.name, ext));

        files.push({
          path: fullPath,
          relativePath: path.relative(basePath, fullPath),
          name: entry.name,
          content,
          checksum,
          title: identity.title,
          author: identity.author,
          identityValid: identity.validation.valid,
          identityInvalidReason: identity.validation.reasons.join(',') || null,
          folder: path.dirname(path.relative(basePath, fullPath)) || '.',
        });
      }
    }
  }

  return files;
}

// =============================================================================
// MAIN INGESTION
// =============================================================================

interface IngestionResult {
  files_seen: number;
  files_ingested: number;
  files_skipped: number;
  files_failed: number;
  chunks_created: number;
  errors: string[];
}

async function ingest(options: {
  dryRun: boolean;
  inputPath: string;
  skipEmbeddings: boolean;
  resetStuck: boolean;
}): Promise<IngestionResult> {
  const result: IngestionResult = {
    files_seen: 0,
    files_ingested: 0,
    files_skipped: 0,
    files_failed: 0,
    chunks_created: 0,
    errors: [],
  };

  console.log(`\n📚 Library Ingestion Starting`);
  console.log(`   Path: ${options.inputPath}`);
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Embeddings: ${options.skipEmbeddings ? 'SKIP' : 'GENERATE'}`);
  console.log('');

  // Reset stuck "processing" sources so they can be retried
  if (options.resetStuck) {
    const stuck = await query<{ id: string; title: string }>(
      `SELECT id, title FROM library_sources WHERE ingestion_status = 'processing'`
    );
    if (stuck.length > 0) {
      console.log(`🔄 Resetting ${stuck.length} stuck source(s):`);
      for (const s of stuck) {
        console.log(`   - ${s.title}`);
        await query(
          `UPDATE library_sources SET ingestion_status = 'pending', ingestion_error = NULL, updated_at = NOW() WHERE id = $1`,
          [s.id]
        );
      }
      console.log('');
    } else {
      console.log(`✅ No stuck sources\n`);
    }
  }

  // Load skip list
  const skipListPath = path.join(options.inputPath, '.skiplist');
  const skipSet = new Set<string>();
  if (fs.existsSync(skipListPath)) {
    const lines = fs.readFileSync(skipListPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        skipSet.add(trimmed);
      }
    }
    console.log(`   Skip list: ${skipSet.size} entries`);
  }

  // Find all files
  if (!fs.existsSync(options.inputPath)) {
    console.error(`❌ Path does not exist: ${options.inputPath}`);
    result.errors.push(`Path does not exist: ${options.inputPath}`);
    return result;
  }

  const files = findFiles(options.inputPath);
  result.files_seen = files.length;

  console.log(`Found ${files.length} files to process\n`);

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi];
    const fileStart = Date.now();
    try {
      // Check skip list
      if (skipSet.has(file.relativePath) || skipSet.has(file.name)) {
        console.log(`[${fi + 1}/${files.length}] ${file.relativePath}`);
        console.log(`   ⏭️  Skipped (.skiplist)`);
        result.files_skipped++;
        continue;
      }

      console.log(`[${fi + 1}/${files.length}] ${file.relativePath}`);

      // Check if already ingested
      const exists = await libraryService.sourceExists(file.checksum);
      if (exists) {
        console.log(`   ⏭️  Already ingested (checksum match)`);
        result.files_skipped++;
        continue;
      }

      // Chunk the content
      const chunks = chunkText(file.content);
      console.log(`   📄 Title: ${file.title}`);
      console.log(`   ✂️  Chunks: ${chunks.length}`);
      console.log(`   📊 Tokens: ~${chunks.reduce((sum, c) => sum + c.tokenCount, 0)}`);

      if (options.dryRun) {
        console.log(`   🔍 DRY RUN — would ingest`);
        result.files_ingested++;
        result.chunks_created += chunks.length;
        continue;
      }

      // D1: identity-invalid sources are recorded as failed, never ingested
      // as retrievable content.
      if (!file.identityValid) {
        console.warn(`   ❌ Identity invalid (${file.identityInvalidReason}) — recording as failed, no chunks written`);
        const failedId = await libraryService.createSource({
          type: 'txt',
          title: file.title,
          author: file.author || undefined,
          filePath: file.relativePath,
          checksum: file.checksum,
          meta: { filename: file.name, folder: file.folder, ingested_by: 'ingestTxtSources.ts', chunking_version: 'v1' },
          expectedChunkCount: chunks.length,
          identityValid: false,
          identityInvalidReason: file.identityInvalidReason || 'identity_invalid',
        });
        await libraryService.updateSourceStatus(failedId, 'failed', `identity_invalid: ${file.identityInvalidReason}`);
        result.files_failed++;
        result.errors.push(`${file.relativePath}: identity_invalid (${file.identityInvalidReason})`);
        continue;
      }

      // Create source record (D2: expected chunk count planned from full content)
      const expectedChunks = chunks.length;
      const sourceId = await libraryService.createSource({
        type: 'txt',
        title: file.title,
        author: file.author || undefined,
        filePath: file.relativePath,
        checksum: file.checksum,
        meta: {
          filename: file.name,
          folder: file.folder,
          ingested_by: 'ingestTxtSources.ts',
          chunking_version: 'v1',
          // Reproducibility: expected_chunk_count is only meaningful relative
          // to the chunker that produced it. A later audit must not mistake a
          // changed chunker for an incomplete historical ingest.
          chunking_params: {
            algorithm: 'char-window/paragraph-break',
            target_size: CONFIG.CHUNK_TARGET_SIZE,
            min_size: CONFIG.CHUNK_MIN_SIZE,
            max_size: CONFIG.CHUNK_MAX_SIZE,
            overlap: CONFIG.CHUNK_OVERLAP,
          },
        },
        expectedChunkCount: expectedChunks,
        identityValid: true,
      });

      // Update status to processing
      await libraryService.updateSourceStatus(sourceId, 'processing');

      // Add chunks
      const addedChunks = await libraryService.addChunks(
        sourceId,
        chunks.map(c => ({
          content: c.content,
          tokenCount: c.tokenCount,
          meta: c.meta,
        }))
      );

      // Generate embeddings if not skipped
      if (!options.skipEmbeddings) {
        console.log(`   🧠 Generating embeddings...`);
        const embedded = await libraryService.generateChunkEmbeddings(sourceId);
        console.log(`   ✅ Embedded ${embedded}/${addedChunks} chunks`);
      }

      // D2: resolve terminal status from expected vs actual — a mismatch is
      // 'partial', which is never retrieval-eligible. Explicit success or
      // explicit failure; no silent "completed whatever happened".
      const outcome = resolveIngestStatus({
        expectedChunks,
        actualChunks: addedChunks,
        identityValid: true,
      });
      await libraryService.updateSourceStatus(sourceId, outcome.status, outcome.error || undefined, {
        tokenCount: chunks.reduce((sum, c) => sum + c.tokenCount, 0),
        chunkCount: addedChunks,
        expectedChunkCount: expectedChunks,
      });

      const elapsed = ((Date.now() - fileStart) / 1000).toFixed(1);
      if (outcome.status === 'completed') {
        console.log(`   ✅ Ingested successfully (${elapsed}s)`);
        result.files_ingested++;
        result.chunks_created += addedChunks;
      } else {
        console.error(`   ⚠️  Ingest ${outcome.status}: ${outcome.error} (${elapsed}s)`);
        result.files_failed++;
        result.errors.push(`${file.relativePath}: ${outcome.error}`);
      }

    } catch (error: any) {
      const elapsed = ((Date.now() - fileStart) / 1000).toFixed(1);
      console.error(`   ❌ Error after ${elapsed}s: ${error.message}`);
      result.files_failed++;
      result.errors.push(`${file.relativePath}: ${error.message}`);
    }
  }

  return result;
}

// =============================================================================
// CLI
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  const dryRun = args.includes('--dry-run');
  const skipEmbeddings = args.includes('--skip-embeddings');
  const resetStuck = args.includes('--reset-stuck');

  let inputPath = process.env.LIBRARY_INGEST_PATH || '';

  const pathIndex = args.indexOf('--path');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    inputPath = args[pathIndex + 1];
  }

  if (!inputPath) {
    console.error('❌ No input path specified.');
    console.error('   Set LIBRARY_INGEST_PATH env var or use --path <directory>');
    process.exit(1);
  }

  // Resolve to absolute path
  inputPath = path.resolve(inputPath);

  const result = await ingest({
    dryRun,
    inputPath,
    skipEmbeddings,
    resetStuck,
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 INGESTION SUMMARY');
  console.log('='.repeat(50));
  console.log(`   Files seen:     ${result.files_seen}`);
  console.log(`   Files ingested: ${result.files_ingested}`);
  console.log(`   Files skipped:  ${result.files_skipped}`);
  console.log(`   Files failed:   ${result.files_failed}`);
  console.log(`   Chunks created: ${result.chunks_created}`);

  if (result.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    result.errors.forEach(e => console.log(`   - ${e}`));
  }

  console.log('');

  if (dryRun) {
    console.log('🔍 This was a DRY RUN. No changes were made to the database.');
    console.log('   Run without --dry-run to actually ingest.');
  }

  process.exit(result.files_failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
