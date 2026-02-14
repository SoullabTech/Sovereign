/**
 * testLibrarySearch — Post-ingest verification gate
 *
 * Runs sample queries against the Living Library to confirm
 * semantic search, fulltext fallback, and distillate retrieval
 * are all working after ingestion.
 *
 * Usage:
 *   npx tsx scripts/library/testLibrarySearch.ts
 *   npx tsx scripts/library/testLibrarySearch.ts --query "custom query"
 *
 * Exit 0 = all queries returned results (library is searchable)
 * Exit 1 = at least one query returned 0 results (pipeline issue)
 */

import 'dotenv/config';
import { libraryService } from '../../lib/library/LibraryService';
import { query } from '../../lib/database/postgres';

// ---------------------------------------------------------------------------
// Built-in test queries
// ---------------------------------------------------------------------------

const BUILT_IN_QUERIES = [
  { text: 'What is Spiralogic?', note: 'core concept — should hit multiple sources' },
  { text: 'elemental phases fire water', note: 'keyword-heavy — tests fulltext fallback' },
  { text: 'sovereignty and consent', note: 'AIN principle — tests semantic similarity' },
];

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(): { customQuery: string | null } {
  const args = process.argv.slice(2);
  let customQuery: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) {
      customQuery = args[i + 1];
      i++;
    }
  }

  return { customQuery };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log('📚 Library Search Verification');
  console.log('─'.repeat(50));

  // Pre-check: any sources at all?
  const sourceCount = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM library_sources WHERE ingestion_status = 'completed'`
  );
  const completed = parseInt(sourceCount[0]?.count ?? '0', 10);

  const chunkCount = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM library_chunks WHERE embedding IS NOT NULL`
  );
  const withEmbeddings = parseInt(chunkCount[0]?.count ?? '0', 10);

  console.log(`   Sources (completed): ${completed}`);
  console.log(`   Chunks (with embeddings): ${withEmbeddings}`);
  console.log('');

  if (completed === 0) {
    console.error('❌ No completed sources — run library:ingest first');
    process.exit(1);
  }

  if (withEmbeddings === 0) {
    console.error('❌ No chunks with embeddings — run library:backfill-embeddings first');
    process.exit(1);
  }

  // Build query list
  const { customQuery } = parseArgs();
  const queries = [...BUILT_IN_QUERIES];
  if (customQuery) {
    queries.push({ text: customQuery, note: 'custom query' });
  }

  let failures = 0;

  for (const q of queries) {
    const start = Date.now();
    const result = await libraryService.search(q.text, {
      limit: 5,
      mode: 'fast',
    });
    const elapsed = Date.now() - start;

    const chunksFound = result.chunks.length;
    const sourcesConsulted = result.total_sources_consulted;
    const hasDistillate = result.distillate !== null;
    const ok = chunksFound > 0;

    const icon = ok ? '✅' : '❌';
    console.log(`${icon} "${q.text}"`);
    console.log(`   ${q.note}`);
    console.log(`   chunks: ${chunksFound}  sources: ${sourcesConsulted}  distillate: ${hasDistillate ? 'yes' : 'no'}  ${elapsed}ms`);

    if (chunksFound > 0) {
      // Show top result preview
      const top = result.chunks[0];
      const preview = top.excerpt.substring(0, 120).replace(/\n/g, ' ');
      console.log(`   top: [${top.title ?? 'untitled'}] "${preview}..."`);
    }

    console.log('');

    if (!ok) failures++;
  }

  // Summary
  console.log('─'.repeat(50));
  if (failures === 0) {
    console.log(`✅ All ${queries.length} queries returned results — library is searchable`);
    process.exit(0);
  } else {
    console.log(`❌ ${failures}/${queries.length} queries returned 0 results — check pipeline`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
