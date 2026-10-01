/**
 * MAIA-MEMORY-ATTRIBUTION-01 falsifier runner.
 *
 * R32 is EXPECTED RED on the current canonical tree. The runner exits 0 only when
 * the detector itself works and the prohibited current world is actually observed.
 * When a later repair turns R32 green, this expected-red runner must fail until the
 * programme explicitly advances the expected state.
 */
import { runCheck, type Tally } from './harness.ts';
import { check as r32 } from './refusal-32-memory-bundle-standing-attribution.ts';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

console.log(`${BOLD}MAIA-MEMORY-ATTRIBUTION-01 — falsifiers${RESET}`);
console.log(`${DIM}R32 expected RED: legacy FAST MemoryBundle flattens standing${RESET}`);

const tally: Tally = { passed: 0, failed: 0, warned: 0 };
runCheck(r32, tally);

const state = tally.failed > 0 ? 'RED' : 'GREEN';
const expected = state === 'RED';

console.log(`\n${BOLD}Summary${RESET}`);
console.log(`  R32  ${state.padEnd(5)}  ${DIM}expected RED before repair${RESET}${expected ? '' : '  ⚠ UNEXPECTED'}`);
console.log(`  ${tally.passed} passed · ${tally.failed} failed · ${tally.warned} warned`);

process.exit(expected ? 0 : 1);
