/**
 * SHADOW-01 gates — falsification runner for the Shadow Field lane.
 *
 *   npx tsx tests/constitutional/refusal-registry/shadow-01-gates.ts
 *
 * A SEPARATE entrypoint from index.ts, as CMT-01 is: these pin PROTOTYPE v1 (the
 * Dedicated room), which is not on the ordinary path and is not deployed.
 *
 *   R32  assembly sovereignty + no writer in v1   (Part III, F5, F8)
 *   R33  entry is an act, not a match; exit silent (L1, L6, F1, F2, F14)
 *   R34  prompt law prohibitions                   (L2, L5, F4, F11, F13, F15, F16)
 *
 * NOT EXERCISED IN v1 — these are structurally absent, and are never reported as PASS:
 *   F3   offer contract        — the Invoked entrance does not exist in v1
 *   F9   silent supersession   — no Field memory can return until the keep act exists
 *   F10  practitioner path     — absent in v1
 * Their truthful state is "not exercised / structurally absent", per the founder's
 * PROTOTYPE authorization.
 */
import { runCheck, type RefusalCheck, type Tally } from './harness.ts';
import { check as r32 } from './refusal-32-shadow-field-assembly-sovereignty.ts';
import { check as r33 } from './refusal-33-shadow-field-entry-is-an-act.ts';
import { check as r34 } from './refusal-34-shadow-field-prompt-law.ts';

const CHECKS: RefusalCheck[] = [r32, r33, r34];
const NOT_EXERCISED_IN_V1 = ['F3 offer contract', 'F9 supersession', 'F10 practitioner path'];

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

console.log(`${BOLD}SHADOW-01 gates — Shadow Field falsifiers (PROTOTYPE v1, Dedicated room)${RESET}`);
console.log(`${DIM}docs/programme/MAIA-SHADOW-FIELD-01_CONSTITUTION_v0.2_2026-09-06.md · all expected GREEN${RESET}`);

const tally: Tally = { passed: 0, failed: 0, warned: 0 };
const perCheck: Record<string, Tally> = {};
for (const check of CHECKS) {
  const before = { ...tally };
  runCheck(check, tally);
  perCheck[check.id] = {
    passed: tally.passed - before.passed,
    failed: tally.failed - before.failed,
    warned: tally.warned - before.warned,
  };
}

console.log(`\n${BOLD}Summary${RESET}`);
let red = 0;
for (const [id, t] of Object.entries(perCheck)) {
  const state = t.failed > 0 ? 'RED' : 'GREEN';
  if (t.failed > 0) red++;
  console.log(`  ${id}  ${state.padEnd(5)}  ${DIM}expected GREEN${RESET}`);
}
console.log(`\n${DIM}Not exercised in v1 (structurally absent, never PASS): ${NOT_EXERCISED_IN_V1.join(' · ')}${RESET}`);
console.log(`\n  ${tally.passed} passed · ${tally.failed} failed · ${tally.warned} warned`);
process.exit(red > 0 ? 1 : 0);
