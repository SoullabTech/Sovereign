/**
 * Test 2 of the reconnection scope (docs/orientation/reconnection-scope.md).
 *
 * Validates that SpiralogicEngine.getFieldContext (new read-only method) can
 * retrieve vault-backed wisdom + spiral context end-to-end:
 *
 *   engine → ObsidianVaultBridge → vault
 *
 * Standalone — no adapter, no route, no member-facing impact. Read-only path:
 * does NOT advance any user spiral state, does NOT trip progression gates.
 *
 * Run:  npx tsx scripts/test-spiralogic-engine.ts
 */

process.env.OBSIDIAN_VAULT_PATH ||= '/Users/soullab/Documents/AIN/';

import { SpiralogicEngine } from '../lib/spiralogic/core/spiralogic-engine';

async function main() {
  console.log('═'.repeat(72));
  console.log('Test 2 — SpiralogicEngine.getFieldContext standalone');
  console.log('═'.repeat(72));
  console.log(`Vault path: ${process.env.OBSIDIAN_VAULT_PATH}`);
  console.log();

  const t0 = Date.now();
  const engine = new SpiralogicEngine();

  console.log('▸ initialize()');
  await engine.initialize();
  console.log(`  elapsed: ${Date.now() - t0}ms`);
  console.log();

  // ── Read-only: new user, no prior state ─────────────────────────────────
  const newUserId = 'test-new-user-' + Date.now();
  console.log(`▸ getFieldContext(userId="${newUserId}", element="fire")`);
  console.log('  (new user — no prior spiral state)');
  const t1 = Date.now();
  const fireCtx = await engine.getFieldContext(newUserId, 'fire');
  console.log(`  elapsed: ${Date.now() - t1}ms`);
  console.log(`  → available:    ${fireCtx.available}`);
  console.log(`  → element:      ${fireCtx.element}`);
  console.log(`  → depth:        ${fireCtx.depth}`);
  console.log(`  → quest:        ${fireCtx.quest?.question ?? 'null'}`);
  console.log(`  → theme:        ${fireCtx.quest?.theme ?? 'null'}`);
  console.log(`  → practices:    [${fireCtx.practices.join(', ')}]`);
  console.log(`  → reflections:  ${fireCtx.reflections.length} prompts`);
  console.log(`  → integrations: [${fireCtx.integrations.join(', ')}]`);
  console.log(`  → vaultWisdom:  ${fireCtx.vaultWisdom ? 'object' : 'null'}`);
  if (fireCtx.vaultWisdom) {
    console.log(`     concepts:   ${fireCtx.vaultWisdom.concepts?.length ?? 0}`);
    console.log(`     practices:  ${fireCtx.vaultWisdom.practices?.length ?? 0}`);
    console.log(`     frameworks: ${fireCtx.vaultWisdom.frameworks?.length ?? 0}`);
  }
  console.log();

  // ── Read-only: same user, different element ─────────────────────────────
  console.log(`▸ getFieldContext(userId="${newUserId}", element="water")`);
  const t2 = Date.now();
  const waterCtx = await engine.getFieldContext(newUserId, 'water');
  console.log(`  elapsed: ${Date.now() - t2}ms`);
  console.log(`  → quest:     ${waterCtx.quest?.question ?? 'null'}`);
  console.log(`  → practices: [${waterCtx.practices.join(', ')}]`);
  console.log();

  // ── Verify NO state mutation ────────────────────────────────────────────
  console.log('▸ getUserState(newUserId) — verifying no persisted state created');
  const persistedState = await engine.getUserState(newUserId);
  if (persistedState === null) {
    console.log('  ✓ No persisted state — read-only contract held');
  } else {
    console.log('  ✗ State persisted unexpectedly:', {
      elementDepths: persistedState.elementDepths,
      integrations: persistedState.integrations,
      lastTransition: persistedState.lastTransition,
    });
  }
  console.log();

  // ── Verify enterSpiral still works (sanity — not broken by addition) ────
  console.log('▸ enterSpiral(userId, "earth") — sanity check that progression still works');
  const sanityUser = 'sanity-user-' + Date.now();
  const t3 = Date.now();
  const progression = await engine.enterSpiral(sanityUser, 'earth');
  console.log(`  elapsed: ${Date.now() - t3}ms`);
  console.log(`  → success: ${progression.success}`);
  console.log(`  → element: ${progression.element}, depth: ${progression.depth}`);
  console.log(`  → integrations: ${progression.integrations?.length ?? 0}`);
  console.log();

  // ── Verdict ────────────────────────────────────────────────────────────
  const chainHealthy =
    fireCtx.quest !== null &&
    fireCtx.practices.length > 0 &&
    waterCtx.quest !== null &&
    persistedState === null &&
    progression.success;

  console.log('═'.repeat(72));
  console.log('Test 2 verdict:');
  console.log(`  ${fireCtx.quest ? '✓' : '✗'} Engine returns spiral quest for fire`);
  console.log(`  ${fireCtx.practices.length > 0 ? '✓' : '✗'} Engine returns practices for fire`);
  console.log(`  ${waterCtx.quest ? '✓' : '✗'} Engine returns spiral quest for water`);
  console.log(`  ${persistedState === null ? '✓' : '✗'} Read-only contract: no state created`);
  console.log(`  ${progression.success ? '✓' : '✗'} enterSpiral still works (not broken)`);
  console.log(`  ${fireCtx.available ? '✓' : '⚠'} Vault wisdom available: ${fireCtx.available}`);
  console.log();
  if (chainHealthy) {
    console.log('  ✓ Engine chain functional. Vault availability separate concern.');
  } else {
    console.log('  ✗ Engine chain has issues — see above');
  }
  console.log(`  Total elapsed: ${Date.now() - t0}ms`);
  console.log('═'.repeat(72));

  process.exit(chainHealthy ? 0 : 1);
}

main().catch((err) => {
  console.error('Test 2 FAILED:', err);
  process.exit(1);
});
