/**
 * MAIA-MEMORY-ATTRIBUTION-01 falsifier runner.
 *
 * R32 was frozen EXPECTED RED at e98ecaeec. R2/R3 burned that baseline down without
 * changing the detector. The runner now expects GREEN and fails if standing is flattened
 * again at candidate, bullet, or prompt compilation.
 */
import { runCheck, type Tally } from './harness.ts';
import { check as r32 } from './refusal-32-memory-bundle-standing-attribution.ts';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

console.log(`${BOLD}MAIA-MEMORY-ATTRIBUTION-01 — falsifiers${RESET}`);
console.log(`${DIM}R32 expected GREEN: FAST MemoryBundle preserves standing${RESET}`);

const tally: Tally = { passed: 0, failed: 0, warned: 0 };
runCheck(r32, tally);

const state = tally.failed > 0 ? 'RED' : 'GREEN';
const expected = state === 'GREEN';

console.log(`\n${BOLD}Summary${RESET}`);
console.log(`  R32  ${state.padEnd(5)}  ${DIM}expected GREEN after bounded repair${RESET}${expected ? '' : '  ⚠ UNEXPECTED'}`);
console.log(`  ${tally.passed} passed · ${tally.failed} failed · ${tally.warned} warned`);

process.exit(expected ? 0 : 1);
