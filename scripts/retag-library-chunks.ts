#!/usr/bin/env npx tsx
/**
 * Re-tag Library Chunks
 *
 * Re-runs the Spiralogic classifier on existing chunks with updated
 * thresholds, soft cues, and dual-tagging. Metadata only — no embeddings.
 *
 * Safe because:
 *   - Only touches meta JSONB, not embeddings
 *   - Idempotent (re-running produces same result)
 *   - Skips inherited metadata (wisdom-library entries)
 *
 * Usage:
 *   npx tsx scripts/retag-library-chunks.ts           # real run
 *   npx tsx scripts/retag-library-chunks.ts --dry-run  # preview changes
 */

import { Pool } from 'pg';
import {
  classifyChunkSpiralogic,
  type SpiralogicElement,
} from '../lib/library/spiralogicTagger';

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness',
  });

  try {
    console.log('════════════════════════════════════════════════════════════');
    console.log('  Re-tag Library Chunks (Tuned Classifier)');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`  Dry run: ${isDryRun}\n`);

    // Get "before" snapshot
    const beforeDist = await pool.query(`
      SELECT meta->>'element' as element, COUNT(*) as count
      FROM library_chunks
      GROUP BY meta->>'element'
      ORDER BY count DESC
    `);

    console.log('[Before] Element Distribution:');
    const beforeCounts: Record<string, number> = {};
    for (const row of beforeDist.rows) {
      const el = row.element || 'untagged';
      beforeCounts[el] = parseInt(row.count);
      console.log(`  ${el.padEnd(12)} ${row.count}`);
    }

    // Load all non-inherited chunks
    // Skip wisdom-library entries (they have 'tradition' in meta)
    const chunksResult = await pool.query(`
      SELECT id, content, meta
      FROM library_chunks
      WHERE meta->>'tradition' IS NULL
      ORDER BY id
    `);

    console.log(`\n  Chunks to re-tag: ${chunksResult.rows.length} (skipping inherited wisdom-library entries)`);

    let updated = 0;
    let unchanged = 0;
    let newlyTagged = 0;
    let elementChanged = 0;
    let secondaryAdded = 0;
    const batchSize = 500;
    let batch: { id: string; meta: any }[] = [];

    for (let i = 0; i < chunksResult.rows.length; i++) {
      const row = chunksResult.rows[i];
      const oldMeta = row.meta || {};
      const oldElement = oldMeta.element || null;
      const oldSecondary = oldMeta.element_secondary || null;

      // Re-classify with tuned classifier
      const tags = classifyChunkSpiralogic(row.content);

      // Check if anything changed
      const changed = (
        tags.element !== oldElement
        || tags.element_secondary !== oldSecondary
        || tags.phase !== (oldMeta.phase || null)
      );

      if (!changed) {
        unchanged++;
        continue;
      }

      // Track change types
      if (oldElement === null && tags.element !== null) newlyTagged++;
      if (oldElement !== null && tags.element !== oldElement) elementChanged++;
      if (tags.element_secondary !== null && oldSecondary === null) secondaryAdded++;

      // Build updated meta (preserve existing keys, update classification)
      const newMeta = {
        ...oldMeta,
        element: tags.element,
        element_secondary: tags.element_secondary,
        phase: tags.phase,
        domain: tags.domain,
        categories: tags.categories,
        spiralogic_tags: tags.spiralogic_tags,
      };

      batch.push({ id: row.id, meta: newMeta });
      updated++;

      // Flush batch
      if (batch.length >= batchSize) {
        if (!isDryRun) {
          await flushBatch(pool, batch);
        }
        batch = [];
        process.stdout.write(`  Progress: ${i + 1}/${chunksResult.rows.length} (${updated} updated)\r`);
      }
    }

    // Final flush
    if (batch.length > 0 && !isDryRun) {
      await flushBatch(pool, batch);
    }

    // Get "after" snapshot
    console.log('\n');
    if (!isDryRun) {
      const afterDist = await pool.query(`
        SELECT meta->>'element' as element, COUNT(*) as count
        FROM library_chunks
        GROUP BY meta->>'element'
        ORDER BY count DESC
      `);

      console.log('[After] Element Distribution:');
      const afterCounts: Record<string, number> = {};
      for (const row of afterDist.rows) {
        const el = row.element || 'untagged';
        afterCounts[el] = parseInt(row.count);
      }

      // Delta table
      console.log('\n  Element       Before    After     Delta');
      console.log('  ────────────  ────────  ────────  ────────');
      const elements: string[] = ['fire', 'earth', 'air', 'water', 'aether', 'untagged'];
      for (const el of elements) {
        const before = beforeCounts[el] || 0;
        const after = afterCounts[el] || 0;
        const delta = after - before;
        const sign = delta > 0 ? '+' : delta < 0 ? '' : ' ';
        const marker = (el === 'water' || el === 'aether') && delta > 0 ? ' ★' : '';
        console.log(`  ${el.padEnd(14)} ${String(before).padStart(8)}  ${String(after).padStart(8)}  ${sign}${delta}${marker}`);
      }

      // Secondary element distribution
      const secondaryDist = await pool.query(`
        SELECT meta->>'element_secondary' as element, COUNT(*) as count
        FROM library_chunks
        WHERE meta->>'element_secondary' IS NOT NULL
        GROUP BY meta->>'element_secondary'
        ORDER BY count DESC
      `);

      if (secondaryDist.rows.length > 0) {
        console.log('\n  Secondary Element Distribution:');
        for (const row of secondaryDist.rows) {
          console.log(`    ${(row.element || '?').padEnd(10)} ${row.count} chunks`);
        }
      }
    }

    // Summary
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  Summary');
    console.log('════════════════════════════════════════════════════════════');
    console.log(`  Total chunks processed: ${chunksResult.rows.length}`);
    console.log(`  Updated:     ${updated}`);
    console.log(`  Unchanged:   ${unchanged}`);
    console.log(`  Newly tagged (was untagged): ${newlyTagged}`);
    console.log(`  Element changed: ${elementChanged}`);
    console.log(`  Secondary element added: ${secondaryAdded}`);

    if (isDryRun) {
      console.log('\n  [DRY RUN] No changes written. Run without --dry-run to apply.');
    } else {
      // Structured telemetry line
      console.log(JSON.stringify({
        tag: 'library_retag_complete',
        timestamp: new Date().toISOString(),
        total_processed: chunksResult.rows.length,
        updated,
        unchanged,
        newly_tagged: newlyTagged,
        element_changed: elementChanged,
        secondary_added: secondaryAdded,
      }));
    }

    console.log('\n[DONE] Re-tag complete.');

  } finally {
    await pool.end();
  }
}

async function flushBatch(pool: Pool, batch: { id: string; meta: any }[]) {
  // Use a transaction for the batch
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of batch) {
      await client.query(
        `UPDATE library_chunks SET meta = $1 WHERE id = $2`,
        [JSON.stringify(item.meta), item.id]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

main().catch(error => {
  console.error('[FATAL]', error);
  process.exit(1);
});
