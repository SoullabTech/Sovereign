#!/usr/bin/env npx tsx
/**
 * Library Ingestion Script — PDF files
 *
 * Extracts text from PDFs and ingests into library_sources and library_chunks.
 * Follows the Jeeves pattern: silent archive, provenance-rich, consent-first.
 *
 * Usage:
 *   npx tsx scripts/library/ingestPdfSources.ts [options]
 *
 * Options:
 *   --dry-run          Show what would be ingested without writing to DB
 *   --path <dir>       Override LIBRARY_INGEST_PATH env var
 *   --skip-embeddings  Skip embedding generation (faster, can run separately)
 *   --copy-to <dir>    Copy extracted text to AIN vault (optional)
 *
 * Environment:
 *   LIBRARY_INGEST_PATH   Directory containing .pdf files to ingest
 *   DATABASE_URL          PostgreSQL connection string
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import { libraryService } from '../../lib/library/LibraryService';
import { validateTitle, validateAuthor, titleFromFilename, resolveIngestStatus } from '../../lib/library/ingestIntegrity';

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
  ALLOWED_EXTENSIONS: ['.pdf'],
  SKIP_PATTERNS: ['.git', 'node_modules', '.DS_Store', 'thumbs.db'],

  // PDF processing
  MIN_PDF_TEXT_LENGTH: 100,  // Skip PDFs with less than this much text (likely images/scans)
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

  // Clean up PDF extraction artifacts
  content = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

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
// PDF PROCESSING
// =============================================================================

interface PdfInfo {
  path: string;
  relativePath: string;
  name: string;
  content: string;
  checksum: string;
  title: string;
  author: string | null;
  folder: string;
  pageCount: number;
}

/**
 * Extract text from a PDF file
 */
async function extractPdfText(filePath: string): Promise<{ text: string; pages: number; info: any }> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
  };
}

/**
 * Recursively find all PDF files in a directory
 */
async function findPdfFiles(dir: string, basePath: string = dir): Promise<PdfInfo[]> {
  const files: PdfInfo[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip hidden/excluded patterns
    if (CONFIG.SKIP_PATTERNS.some(p => entry.name.includes(p))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await findPdfFiles(fullPath, basePath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
        try {
          const { text, pages, info } = await extractPdfText(fullPath);

          // Skip PDFs with too little text (likely scans/images)
          if (text.length < CONFIG.MIN_PDF_TEXT_LENGTH) {
            console.log(`   ⚠️  Skipping ${entry.name} - too little text (${text.length} chars), likely scan/image`);
            continue;
          }

          const checksum = crypto.createHash('sha256').update(text).digest('hex');

          // Extract title from PDF metadata or filename — metadata is used
          // only if it validates (D1); PDF Title fields are frequently junk
          // ("untitled", tool names, empty strings).
          const fromFilename = titleFromFilename(
            path.basename(entry.name, ext).replace(/^\d+[-_]?\s*/, '')
          );
          let title = fromFilename;
          const metaTitle = (info?.Title || '').trim().substring(0, 200);
          if (metaTitle && validateTitle(metaTitle).valid) {
            title = metaTitle;
          }
          title = title.trim().substring(0, 200);

          // Extract author from PDF metadata — only if it looks like a name.
          const metaAuthor = (info?.Author || '').trim();
          const author: string | null =
            metaAuthor && validateAuthor(metaAuthor).valid ? metaAuthor : null;

          files.push({
            path: fullPath,
            relativePath: path.relative(basePath, fullPath),
            name: entry.name,
            content: text,
            checksum,
            title,
            author,
            folder: path.dirname(path.relative(basePath, fullPath)) || '.',
            pageCount: pages,
          });
        } catch (error: any) {
          console.log(`   ❌ Error reading ${entry.name}: ${error.message}`);
        }
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
  copyToPath?: string;
}): Promise<IngestionResult> {
  const result: IngestionResult = {
    files_seen: 0,
    files_ingested: 0,
    files_skipped: 0,
    files_failed: 0,
    chunks_created: 0,
    errors: [],
  };

  console.log(`\n📚 PDF Library Ingestion Starting`);
  console.log(`   Path: ${options.inputPath}`);
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Embeddings: ${options.skipEmbeddings ? 'SKIP' : 'GENERATE'}`);
  if (options.copyToPath) {
    console.log(`   Copy to: ${options.copyToPath}`);
  }
  console.log('');

  // Find all files
  if (!fs.existsSync(options.inputPath)) {
    console.error(`❌ Path does not exist: ${options.inputPath}`);
    result.errors.push(`Path does not exist: ${options.inputPath}`);
    return result;
  }

  console.log('Scanning for PDFs (this may take a while)...\n');
  const files = await findPdfFiles(options.inputPath);
  result.files_seen = files.length;

  console.log(`Found ${files.length} PDFs with extractable text\n`);

  for (const file of files) {
    try {
      console.log(`Processing: ${file.relativePath}`);
      console.log(`   📄 Title: ${file.title}`);
      console.log(`   📖 Pages: ${file.pageCount}`);

      // Check if already ingested
      const exists = await libraryService.sourceExists(file.checksum);
      if (exists) {
        console.log(`   ⏭️  Already ingested (checksum match)`);
        result.files_skipped++;
        continue;
      }

      // Chunk the content
      const chunks = chunkText(file.content);
      console.log(`   ✂️  Chunks: ${chunks.length}`);
      console.log(`   📊 Tokens: ~${chunks.reduce((sum, c) => sum + c.tokenCount, 0)}`);

      if (options.dryRun) {
        console.log(`   🔍 DRY RUN — would ingest`);
        result.files_ingested++;
        result.chunks_created += chunks.length;
        continue;
      }

      // Copy extracted text to AIN vault if requested
      if (options.copyToPath) {
        const txtFileName = path.basename(file.name, '.pdf') + '.txt';
        const copyPath = path.join(options.copyToPath, txtFileName);
        fs.writeFileSync(copyPath, file.content, 'utf-8');
        console.log(`   📝 Copied to: ${copyPath}`);
      }

      // D1: identity must validate before content becomes retrievable.
      const titleCheck = validateTitle(file.title);
      if (!titleCheck.valid) {
        console.warn(`   ❌ Identity invalid (${titleCheck.reasons.join(',')}) — recording as failed, no chunks written`);
        const failedId = await libraryService.createSource({
          type: 'book',
          title: file.title,
          author: file.author || undefined,
          filePath: file.relativePath,
          checksum: file.checksum,
          meta: { filename: file.name, folder: file.folder, pageCount: file.pageCount, originalFormat: 'pdf', ingested_by: 'ingestPdfSources.ts', chunking_version: 'v1' },
          expectedChunkCount: chunks.length,
          identityValid: false,
          identityInvalidReason: titleCheck.reasons.join(','),
        });
        await libraryService.updateSourceStatus(failedId, 'failed', `identity_invalid: ${titleCheck.reasons.join(',')}`);
        result.files_failed++;
        result.errors.push(`${file.relativePath}: identity_invalid`);
        continue;
      }

      // Create source record (D2: expected chunk count planned up front)
      const expectedChunks = chunks.length;
      const sourceId = await libraryService.createSource({
        type: 'book',
        title: file.title,
        author: file.author || undefined,
        filePath: file.relativePath,
        checksum: file.checksum,
        meta: {
          filename: file.name,
          folder: file.folder,
          pageCount: file.pageCount,
          originalFormat: 'pdf',
          ingested_by: 'ingestPdfSources.ts',
          chunking_version: 'v1',
          // Reproducibility: expected_chunk_count is only meaningful relative
          // to the chunker that produced it.
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

      // D2: terminal status from expected vs actual.
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

      if (outcome.status === 'completed') {
        console.log(`   ✅ Ingested successfully`);
        result.files_ingested++;
        result.chunks_created += addedChunks;
      } else {
        console.error(`   ⚠️  Ingest ${outcome.status}: ${outcome.error}`);
        result.files_failed++;
        result.errors.push(`${file.relativePath}: ${outcome.error}`);
      }

    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
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

  let inputPath = process.env.LIBRARY_INGEST_PATH || '';
  let copyToPath: string | undefined;

  const pathIndex = args.indexOf('--path');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    inputPath = args[pathIndex + 1];
  }

  const copyIndex = args.indexOf('--copy-to');
  if (copyIndex !== -1 && args[copyIndex + 1]) {
    copyToPath = args[copyIndex + 1];
  }

  if (!inputPath) {
    console.error('❌ No input path specified.');
    console.error('   Set LIBRARY_INGEST_PATH env var or use --path <directory>');
    process.exit(1);
  }

  // Resolve to absolute path
  inputPath = path.resolve(inputPath);
  if (copyToPath) {
    copyToPath = path.resolve(copyToPath);
    if (!fs.existsSync(copyToPath)) {
      fs.mkdirSync(copyToPath, { recursive: true });
    }
  }

  const result = await ingest({
    dryRun,
    inputPath,
    skipEmbeddings,
    copyToPath,
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 PDF INGESTION SUMMARY');
  console.log('='.repeat(50));
  console.log(`   PDFs seen:      ${result.files_seen}`);
  console.log(`   PDFs ingested:  ${result.files_ingested}`);
  console.log(`   PDFs skipped:   ${result.files_skipped}`);
  console.log(`   PDFs failed:    ${result.files_failed}`);
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
