#!/usr/bin/env npx tsx
/**
 * Test the Second Brain capture loop
 *
 * Usage:
 *   npx tsx scripts/secondbrain/testCapture.ts
 *   npx tsx scripts/secondbrain/testCapture.ts "Your thought here"
 *   npx tsx scripts/secondbrain/testCapture.ts --raw "Unclassified note"
 *
 * Environment:
 *   OBSIDIAN_REST_URL - e.g., http://127.0.0.1:27123
 *   OBSIDIAN_API_KEY  - Bearer token from Obsidian Local REST API settings
 *   ANTHROPIC_API_KEY - For classification
 */

import { capture } from '@/lib/secondbrain';

async function main() {
  const args = process.argv.slice(2);

  // Check environment
  if (!process.env.OBSIDIAN_REST_URL || !process.env.OBSIDIAN_API_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   OBSIDIAN_REST_URL (e.g., http://127.0.0.1:27123)');
    console.error('   OBSIDIAN_API_KEY  (from Obsidian Local REST API settings)');
    process.exit(1);
  }

  const skipClassification = args.includes('--raw');
  const textArgs = args.filter(a => !a.startsWith('--'));
  const text = textArgs.join(' ') || 'Test capture: Remember to check in with the team about the Q1 roadmap.';

  console.log('🧠 Second Brain Capture Test');
  console.log('─'.repeat(50));
  console.log(`Input: "${text}"`);
  console.log(`Mode: ${skipClassification ? 'Raw (no classification)' : 'Full classification'}`);
  console.log('─'.repeat(50));

  const result = await capture({
    text,
    source: 'claude-code',
    skipClassification,
  });

  if (result.success) {
    console.log('\n✅ Capture successful!');
    console.log(`   Path: ${result.path}`);
    console.log(`   Needs review: ${result.needsReview}`);

    if (result.classified) {
      console.log('\n📋 Classification:');
      console.log(`   Bucket: ${result.classified.bucket}`);
      console.log(`   Title: ${result.classified.title}`);
      console.log(`   Confidence: ${result.classified.confidence.toFixed(2)}`);
      if (result.classified.next_action) {
        console.log(`   Next action: ${result.classified.next_action}`);
      }
      if (result.classified.tags?.length) {
        console.log(`   Tags: ${result.classified.tags.join(', ')}`);
      }
    }
  } else {
    console.log('\n❌ Capture failed:');
    console.log(`   ${result.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
