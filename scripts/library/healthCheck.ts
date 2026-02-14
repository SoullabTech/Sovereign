#!/usr/bin/env npx tsx
/**
 * Library Health Check
 *
 * Reports integrity of the Living Library:
 *   - Source counts by ingestion status
 *   - Chunks missing embeddings
 *   - Ollama reachability + model availability
 *
 * Usage:
 *   npx tsx scripts/library/healthCheck.ts
 *   npm run library:health
 */

import { query } from '../../lib/database/postgres';

async function healthCheck() {
  console.log('\n📚 Library Health Check\n');
  let hasIssues = false;

  // ─── 1. Source status ──────────────────────────────────────
  const statusCounts = await query<{ status: string; count: string }>(
    `SELECT ingestion_status AS status, COUNT(*) AS count
     FROM library_sources
     GROUP BY ingestion_status
     ORDER BY status`
  );

  console.log('Source Status:');
  let totalSources = 0;
  for (const row of statusCounts) {
    const count = parseInt(row.count);
    totalSources += count;
    const flag = (row.status === 'processing' || row.status === 'failed') ? ' ⚠️' : '';
    console.log(`   ${row.status.padEnd(12)} ${count}${flag}`);
    if (flag) hasIssues = true;
  }
  console.log(`   ${'TOTAL'.padEnd(12)} ${totalSources}\n`);

  // ─── 2. Chunks without embeddings ─────────────────────────
  const missingResult = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM library_chunks WHERE embedding IS NULL`
  );
  const missing = parseInt(missingResult[0].count);

  const totalChunksResult = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM library_chunks`
  );
  const totalChunks = parseInt(totalChunksResult[0].count);

  if (missing > 0) {
    console.log(`Chunks: ${totalChunks} total, ${missing} missing embeddings ⚠️`);
    console.log(`   Run: npm run library:backfill-embeddings\n`);
    hasIssues = true;
  } else {
    console.log(`Chunks: ${totalChunks} total, all embedded ✅\n`);
  }

  // ─── 3. Ollama reachability ────────────────────────────────
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const models = (data.models || []) as { name: string }[];
      const hasNomic = models.some(m => m.name?.includes('nomic-embed-text'));

      console.log(`Ollama: reachable at ${ollamaUrl} ✅`);
      console.log(`   Models loaded: ${models.length}`);
      if (hasNomic) {
        console.log(`   nomic-embed-text: available ✅\n`);
      } else {
        console.log(`   nomic-embed-text: MISSING ⚠️\n`);
        hasIssues = true;
      }
    } else {
      console.log(`Ollama: HTTP ${res.status} ⚠️\n`);
      hasIssues = true;
    }
  } catch (error: any) {
    console.log(`Ollama: unreachable (${error.message}) ⚠️\n`);
    hasIssues = true;
  }

  // ─── 4. Summary ────────────────────────────────────────────
  if (hasIssues) {
    console.log('⚠️  Issues detected. See above.\n');
    process.exit(1);
  } else {
    console.log('✅ Library healthy.\n');
    process.exit(0);
  }
}

healthCheck().catch(error => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});
