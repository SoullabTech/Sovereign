/**
 * Env-independent proof mirror of lib/sanctuary/__tests__/sanctuaryGuards.test.ts
 * (jest toolchain not installed here). Same assertions, same real guards, via node:assert.
 *
 *   node --experimental-strip-types scripts/repro/sanctuary_guard_proof.mts
 *
 * Sanctuary ⇒ nothing enters persistence — the OUT-bound mirror of the recall proof.
 */
import assert from 'node:assert/strict';
import { sanctuarySafeSummary, shouldPersistTurn, shouldPersistKeep } from '../../lib/sanctuary/sanctuaryGuards.ts';

let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`); };

check('HONORED: Sanctuary forces summary to null even with content supplied', () => {
  assert.equal(sanctuarySafeSummary(true, 'something said in confidence'), null);
});

check('Sanctuary forces null regardless of input shape', () => {
  assert.equal(sanctuarySafeSummary(true, ''), null);
  assert.equal(sanctuarySafeSummary(true, undefined), null);
  assert.equal(sanctuarySafeSummary(true, null), null);
});

check('continuity preserves the summary (capture works when allowed)', () => {
  assert.equal(sanctuarySafeSummary(false, 'a continuity summary'), 'a continuity summary');
});

check('continuity with no summary yields null (not undefined)', () => {
  assert.equal(sanctuarySafeSummary(false, undefined), null);
});

check('HONORED: Sanctuary ⇒ do not persist the turn', () => {
  assert.equal(shouldPersistTurn(true), false);
});

check('continuity ⇒ persist normally', () => {
  assert.equal(shouldPersistTurn(false), true);
});

check('HONORED: Sanctuary ⇒ do not persist a kept library item (0 rows)', () => {
  assert.equal(shouldPersistKeep(true), false);
});

check('continuity ⇒ a kept library item persists normally', () => {
  assert.equal(shouldPersistKeep(false), true);
});

console.log(`\nSANCTUARY-GUARD PROOF: ${passed}/8 green — Sanctuary ⇒ summary null + turn not persisted + keep refused.`);
