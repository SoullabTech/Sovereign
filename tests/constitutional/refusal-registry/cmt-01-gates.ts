/**
 * CMT-01 gates — falsification runner for the canonical-turn lane.
 *
 *   npx tsx tests/constitutional/refusal-registry/cmt-01-gates.ts
 *
 * Deliberately a SEPARATE entrypoint from index.ts: R25 (G1) and R26 (G3) are EXPECTED RED
 * on the current tree until M3 — that red is the witnessed baseline the migration burns
 * down, not a regression in the main suite. They join index.ts when M3 turns them green.
 *
 *   R25  G1  floor invariance across tiers          — expected RED until M3 (D1)
 *   R26  G3  no open channel into cognition         — expected RED until M3 (200 casts)
 *   R27  G2  producer-set closure                    — green from M1
 *   R28  G4  identity provenance at the boundary     — green from M1
 *   R29  G6  manifest completeness / content-free    — green from M1
 *   R30  G9  no expansion beyond the adjudicated seed — green from M1
 */
import { runCheck, type RefusalCheck, type Tally } from './harness.ts';
import { check as r25 } from './refusal-25-canonical-floor-invariance.ts';
import { check as r26 } from './refusal-26-canonical-no-open-channel.ts';
import { check as r27 } from './refusal-27-canonical-producer-closure.ts';
import { check as r28 } from './refusal-28-canonical-identity-provenance.ts';
import { check as r29 } from './refusal-29-canonical-manifest-completeness.ts';
import { check as r30 } from './refusal-30-canonical-no-expansion.ts';

const CHECKS: RefusalCheck[] = [r25, r26, r27, r28, r29, r30];
const EXPECTED_RED_UNTIL_M3 = new Set(['R25', 'R26']);

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

console.log(`${BOLD}CMT-01 gates — canonical turn falsifiers${RESET}`);
console.log(`${DIM}docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §8 · R25/R26 expected RED until M3${RESET}`);

const tally: Tally = { passed: 0, failed: 0, warned: 0 };
const perCheck: Record<string, Tally> = {};
for (const check of CHECKS) {
  const before = { ...tally };
  runCheck(check, tally);
  perCheck[check.id] = { passed: tally.passed - before.passed, failed: tally.failed - before.failed, warned: tally.warned - before.warned };
}

console.log(`\n${BOLD}Summary${RESET}`);
let unexpectedRed = 0;
for (const [id, t] of Object.entries(perCheck)) {
  const state = t.failed > 0 ? 'RED' : 'GREEN';
  const expected = EXPECTED_RED_UNTIL_M3.has(id) ? 'expected RED until M3' : 'expected GREEN';
  const ok = (state === 'RED') === EXPECTED_RED_UNTIL_M3.has(id);
  if (!ok) unexpectedRed++;
  console.log(`  ${id}  ${state.padEnd(5)}  ${DIM}${expected}${RESET}  ${ok ? '' : '  ⚠ UNEXPECTED'}`);
}
console.log(`\n  ${tally.passed} passed · ${tally.failed} failed · ${tally.warned} warned`);
process.exit(unexpectedRed > 0 ? 1 : 0);
