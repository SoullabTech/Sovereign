#!/usr/bin/env tsx
/**
 * Offline Contrast Event Classifier
 *
 * Runs the heuristic classifier on stored contrast events that have
 * a next_user_message but no predicted state yet. Does NOT use LLM.
 *
 * Usage:
 *   npx tsx scripts/classify-contrast-events.ts           # classify unclassified
 *   npx tsx scripts/classify-contrast-events.ts --all      # re-classify all
 *   npx tsx scripts/classify-contrast-events.ts --dry-run  # preview only
 *
 * After running, review predictions at /admin/contrast (Review tab).
 */

import { query } from '../lib/db/postgres';
import { heuristicClassify, type PostResponseState } from '../lib/contrast/postResponseClassifier';

const args = process.argv.slice(2);
const reclassifyAll = args.includes('--all');
const dryRun = args.includes('--dry-run');

async function main() {
  console.log('🔍 Contrast Event Classifier (heuristic)');
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Scope: ${reclassifyAll ? 'ALL events' : 'unclassified only'}`);
  console.log('');

  const whereClause = reclassifyAll
    ? `WHERE next_user_message IS NOT NULL`
    : `WHERE next_user_message IS NOT NULL AND post_response_state_predicted IS NULL`;

  const result = await query(
    `SELECT id, next_user_message, post_response_state_reviewed
     FROM contrast_events
     ${whereClause}
     ORDER BY created_at DESC`
  );

  const events = result.rows;
  console.log(`   Found ${events.length} events to classify\n`);

  if (events.length === 0) {
    console.log('   Nothing to do.');
    process.exit(0);
  }

  let classified = 0;
  let skipped = 0;
  const distribution: Record<PostResponseState, number> = {
    shift: 0,
    continue: 0,
    resist: 0,
    unclear: 0,
  };

  for (const event of events) {
    const result = heuristicClassify(event.next_user_message);

    if (!result) {
      // Heuristic couldn't classify — mark as unclear
      const label: PostResponseState = 'unclear';
      distribution[label]++;

      if (!dryRun) {
        await query(
          `UPDATE contrast_events SET post_response_state_predicted = $1 WHERE id = $2`,
          [label, event.id]
        );
      }
      classified++;
      continue;
    }

    distribution[result.label]++;

    if (!dryRun) {
      await query(
        `UPDATE contrast_events SET post_response_state_predicted = $1 WHERE id = $2`,
        [result.label, event.id]
      );
    }

    // Show agreement/disagreement with human review
    if (event.post_response_state_reviewed) {
      const match = result.label === event.post_response_state_reviewed;
      console.log(`   ${match ? '✅' : '❌'} ${event.id.slice(0, 8)}: predicted=${result.label} reviewed=${event.post_response_state_reviewed} (conf=${result.confidence.toFixed(2)})`);
    }

    classified++;
  }

  console.log(`\n   Results:`);
  console.log(`   Classified: ${classified}`);
  console.log(`   Skipped:    ${skipped}`);
  console.log(`   Distribution:`);
  for (const [state, count] of Object.entries(distribution)) {
    const bar = '█'.repeat(count);
    console.log(`     ${state.padEnd(10)} ${String(count).padStart(3)} ${bar}`);
  }

  if (dryRun) {
    console.log('\n   (DRY RUN — no changes written)');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Classification failed:', err);
  process.exit(1);
});
