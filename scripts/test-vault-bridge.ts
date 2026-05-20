/**
 * Test 1 of the reconnection scope (docs/orientation/reconnection-scope.md).
 *
 * Validates that ObsidianVaultBridge can connect to the actual AIN vault
 * and return meaningful results. Bridge standalone — no engine, no adapter,
 * no member-facing route. Runs against the real vault at
 * /Users/soullab/Documents/AIN/.
 *
 * Run:  npx tsx scripts/test-vault-bridge.ts
 */

// Ensure vault path is set before bridge instantiation
process.env.OBSIDIAN_VAULT_PATH ||= '/Users/soullab/Documents/AIN/';

import { ObsidianVaultBridge } from '../lib/bridges/obsidian-vault-bridge';

async function main() {
  console.log('═'.repeat(72));
  console.log('Test 1 — ObsidianVaultBridge standalone');
  console.log('═'.repeat(72));
  console.log(`Vault path: ${process.env.OBSIDIAN_VAULT_PATH}`);
  console.log();

  const t0 = Date.now();
  const bridge = new ObsidianVaultBridge();

  console.log('▸ connect()');
  await bridge.connect();
  console.log(`  elapsed: ${Date.now() - t0}ms`);
  console.log();

  // ── Query 1: fire transformation ────────────────────────────────────────
  console.log('▸ query({ context: "fire transformation", maxResults: 3 })');
  const t1 = Date.now();
  const fireResult = await bridge.query({
    context: 'fire transformation',
    maxResults: 3,
    semanticSearch: false,
  });
  console.log(`  elapsed: ${Date.now() - t1}ms`);
  console.log(`  results: ${fireResult.knowledge.length}`);
  console.log(`  relevance: ${fireResult.relevance.toFixed(3)}`);
  console.log(`  top titles:`);
  fireResult.knowledge.slice(0, 3).forEach((n, i) => {
    console.log(`    ${i + 1}. ${n.title} (rel=${n.relevance?.toFixed(2) ?? 'n/a'})`);
  });
  console.log(`  unique tags (first 8): ${fireResult.tags.slice(0, 8).join(', ')}`);
  console.log(`  connections: ${fireResult.connections.length}`);
  console.log();

  // ── Query 2: field intelligence ────────────────────────────────────────
  console.log('▸ query({ context: "field intelligence emergence", maxResults: 3 })');
  const t2 = Date.now();
  const fieldResult = await bridge.query({
    context: 'field intelligence emergence',
    maxResults: 3,
    semanticSearch: false,
  });
  console.log(`  elapsed: ${Date.now() - t2}ms`);
  console.log(`  results: ${fieldResult.knowledge.length}`);
  console.log(`  top titles:`);
  fieldResult.knowledge.slice(0, 3).forEach((n, i) => {
    console.log(`    ${i + 1}. ${n.title}`);
  });
  console.log();

  // ── getElementalWisdom: fire ────────────────────────────────────────────
  console.log('▸ getElementalWisdom("fire")');
  const t3 = Date.now();
  const wisdom = await bridge.getElementalWisdom('fire');
  console.log(`  elapsed: ${Date.now() - t3}ms`);
  console.log(`  shape: { element, concepts[], practices[], frameworks[] }`);
  console.log(`    element:    ${wisdom.element}`);
  console.log(`    concepts:   ${wisdom.concepts.length}`);
  console.log(`    practices:  ${wisdom.practices.length}`);
  console.log(`    frameworks: ${wisdom.frameworks.length}`);
  if (wisdom.concepts.length > 0) {
    console.log(`    first concept: ${wisdom.concepts[0].title}`);
  }
  if (wisdom.practices.length > 0) {
    console.log(`    first practice: ${wisdom.practices[0].title}`);
  }
  if (wisdom.frameworks.length > 0) {
    console.log(`    first framework: ${wisdom.frameworks[0].name}`);
  }
  console.log();

  // ── getNotesByTag ──────────────────────────────────────────────────────
  console.log('▸ getNotesByTag("spiralogic")');
  const tagged = await bridge.getNotesByTag('spiralogic');
  console.log(`  matches: ${tagged.length}`);
  if (tagged.length > 0) {
    tagged.slice(0, 3).forEach((n, i) => {
      console.log(`    ${i + 1}. ${n.title}`);
    });
  }
  console.log();

  // ── Verdict ────────────────────────────────────────────────────────────
  const totalNotes = fireResult.knowledge.length + fieldResult.knowledge.length;
  console.log('═'.repeat(72));
  console.log('Test 1 verdict:');
  if (totalNotes > 0) {
    console.log('  ✓ Bridge connected to real vault');
    console.log('  ✓ Queries returning results');
    console.log('  ✓ Indexing functional');
    console.log(`  ✓ Total elapsed: ${Date.now() - t0}ms`);
  } else {
    console.log('  ✗ Bridge connected but returned zero results — vault may be empty or path wrong');
  }
  console.log('═'.repeat(72));
}

main().catch((err) => {
  console.error('Test 1 FAILED:', err);
  process.exit(1);
});
