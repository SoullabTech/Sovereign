#!/usr/bin/env npx tsx
/**
 * Backfill Missing Embeddings
 *
 * Finds library_chunks with NULL embeddings and generates them
 * via local Ollama (nomic-embed-text). Processes up to 1000 per run.
 *
 * Usage:
 *   npx tsx scripts/library/backfillEmbeddings.ts
 *   npm run library:backfill-embeddings
 */

import { query } from '../../lib/database/postgres';
import { generateLocalEmbedding } from '../../lib/memory/embeddings';

async function backfill() {
  console.log('\n🧠 Backfilling Missing Embeddings\n');

  const chunks = await query<{ id: string; content: string; source_id: string }>(
    `SELECT id, content, source_id
     FROM library_chunks
     WHERE embedding IS NULL
     ORDER BY created_at
     LIMIT 1000`
  );

  console.log(`Found ${chunks.length} chunks without embeddings\n`);

  if (chunks.length === 0) {
    console.log('✅ All chunks already embedded.\n');
    return;
  }

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progress = `[${i + 1}/${chunks.length}]`;
    const start = Date.now();

    try {
      const embedding = await generateLocalEmbedding(chunk.content);

      if (embedding && embedding.length > 0) {
        await query(
          `UPDATE library_chunks SET embedding = $2::vector WHERE id = $1`,
          [chunk.id, JSON.stringify(embedding)]
        );
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`${progress} ✅ chunk ${chunk.id.substring(0, 8)}... (${elapsed}s)`);
        succeeded++;
      } else {
        console.log(`${progress} ⚠️  chunk ${chunk.id.substring(0, 8)}... empty embedding (skipped)`);
        failed++;
      }
    } catch (error: any) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.error(`${progress} ❌ chunk ${chunk.id.substring(0, 8)}... ${error.message} (${elapsed}s)`);
      failed++;
    }
  }

  console.log(`\n📊 Backfill Results:`);
  console.log(`   Succeeded: ${succeeded}`);
  console.log(`   Failed:    ${failed}\n`);

  // Check if more remain
  const remaining = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM library_chunks WHERE embedding IS NULL`
  );
  const left = parseInt(remaining[0].count);
  if (left > 0) {
    console.log(`   ${left} chunks still missing — run again to continue.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

backfill().catch(error => {
  console.error('Backfill failed:', error.message);
  process.exit(1);
});
