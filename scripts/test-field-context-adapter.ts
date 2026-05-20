/**
 * Test 3 of the reconnection scope (docs/orientation/reconnection-scope.md).
 *
 * Validates the full chain that the conversation route would invoke:
 *
 *   SpiralogicCell (synthetic — bypassing classifier for test isolation)
 *     → getFieldContext (adapter)
 *       → SpiralogicEngine.getFieldContext (read-only)
 *         → ObsidianVaultBridge.getElementalWisdom (vault retrieval)
 *           → AIN Vault on disk
 *     → buildFieldContextPromptBlock (formatter)
 *
 * Also verifies:
 *   - singleton engine: second call reuses the same engine instance
 *   - graceful degradation: invalid cell returns empty context cleanly
 *   - prompt-block formatter: emits coherent Markdown for the prompt
 *
 * Standalone — no route, no member-facing impact.
 *
 * Run:  npx tsx scripts/test-field-context-adapter.ts
 */

process.env.OBSIDIAN_VAULT_PATH ||= '/Users/soullab/Documents/AIN/';

import {
  getFieldContext,
  buildFieldContextPromptBlock,
  _resetSingletonForTests,
} from '../lib/maia/fieldContextAdapter';

import type { SpiralogicCell } from '../lib/consciousness/spiralogic-core';

function synthCell(element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether', phase: 1 | 2 | 3): SpiralogicCell {
  return {
    element,
    phase,
    context: `test-${element.toLowerCase()}-${phase}`,
  } as SpiralogicCell;
}

async function main() {
  console.log('═'.repeat(72));
  console.log('Test 3 — Field Context Adapter (full chain)');
  console.log('═'.repeat(72));
  console.log(`Vault path: ${process.env.OBSIDIAN_VAULT_PATH}`);
  console.log();

  _resetSingletonForTests();

  // ── Call 1: cold start (engine init) ────────────────────────────────────
  const userId = 'test-adapter-user-' + Date.now();
  const fireCell = synthCell('Fire', 1);

  console.log('▸ Call 1: cold start — getFieldContext(userId, fireCell)');
  const t0 = Date.now();
  const ctx1 = await getFieldContext(userId, fireCell);
  const elapsed1 = Date.now() - t0;
  console.log(`  elapsed: ${elapsed1}ms (includes engine init)`);
  console.log(`  → element: ${ctx1.element}, depth: ${ctx1.depth}`);
  console.log(`  → quest: ${ctx1.quest?.question ?? 'null'}`);
  console.log(`  → practices: ${ctx1.practices.length}`);
  console.log(`  → available (vault wisdom): ${ctx1.available}`);
  console.log();

  // ── Call 2: warm (singleton reuse) ──────────────────────────────────────
  const waterCell = synthCell('Water', 2);
  console.log('▸ Call 2: warm — getFieldContext(userId, waterCell)');
  const t1 = Date.now();
  const ctx2 = await getFieldContext(userId, waterCell);
  const elapsed2 = Date.now() - t1;
  console.log(`  elapsed: ${elapsed2}ms (should be << ${elapsed1}ms if singleton reused)`);
  console.log(`  → quest: ${ctx2.quest?.question ?? 'null'}`);
  console.log(`  → practices: ${ctx2.practices.length}`);
  console.log();

  // ── Call 3: invalid cell (graceful degradation) ─────────────────────────
  console.log('▸ Call 3: graceful degradation — empty cell');
  const ctx3 = await getFieldContext(userId, { element: '' } as any);
  console.log(`  → available: ${ctx3.available}`);
  console.log(`  → element:   "${ctx3.element}"`);
  console.log(`  → quest:     ${ctx3.quest === null ? 'null' : 'unexpected'}`);
  console.log();

  // ── Call 4: prompt-block formatter ──────────────────────────────────────
  console.log('▸ Call 4: buildFieldContextPromptBlock(ctx1)');
  const block = buildFieldContextPromptBlock(ctx1);
  console.log('  ──────── prompt block (start) ────────');
  block.split('\n').forEach((l) => console.log('  ' + l));
  console.log('  ──────── prompt block (end) ────────');
  console.log();

  // ── Call 5: empty context produces empty string ─────────────────────────
  console.log('▸ Call 5: buildFieldContextPromptBlock(empty) — should return ""');
  const emptyBlock = buildFieldContextPromptBlock(ctx3);
  console.log(`  result: ${emptyBlock === '' ? '"" (empty)' : `non-empty (${emptyBlock.length} chars)`}`);
  console.log();

  // ── Verdict ────────────────────────────────────────────────────────────
  const singletonReused = elapsed2 < elapsed1; // warm call faster than cold
  const chainHealthy =
    ctx1.quest !== null &&
    ctx2.quest !== null &&
    ctx3.element === '' &&
    block.length > 0 &&
    emptyBlock === '';

  console.log('═'.repeat(72));
  console.log('Test 3 verdict:');
  console.log(`  ${ctx1.quest ? '✓' : '✗'} Cold call returns quest for fire`);
  console.log(`  ${ctx2.quest ? '✓' : '✗'} Warm call returns quest for water`);
  console.log(`  ${singletonReused ? '✓' : '⚠'} Singleton reuse: warm (${elapsed2}ms) < cold (${elapsed1}ms)`);
  console.log(`  ${ctx3.element === '' ? '✓' : '✗'} Graceful degradation on empty cell`);
  console.log(`  ${block.length > 0 ? '✓' : '✗'} Prompt-block formatter produces output`);
  console.log(`  ${emptyBlock === '' ? '✓' : '✗'} Empty context produces empty string`);
  console.log();
  if (chainHealthy) {
    console.log('  ✓ Adapter chain functional. Ready for route integration.');
  } else {
    console.log('  ✗ Adapter chain has issues — see above');
  }
  console.log('═'.repeat(72));

  process.exit(chainHealthy ? 0 : 1);
}

main().catch((err) => {
  console.error('Test 3 FAILED:', err);
  process.exit(1);
});
