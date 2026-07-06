/**
 * Verification for lib/consciousness/interruptionLedger.ts
 * The brick has to answer to the ground: it runs and the checks pass, or it doesn't.
 * Run: npx tsx scripts/repro/interruption-ledger-check.ts
 */
import {
  computeInterruptionMetadata,
  noveltyScore,
  frictionSignals,
} from '../../lib/consciousness/interruptionLedger';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean): void {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
}

// restatement -> low novelty
check(
  'restatement scores low novelty',
  noveltyScore('the river moves without finalizing itself', [
    'the river moves without finalizing itself, it has direction',
  ]) < 0.5,
);

// genuinely new -> high novelty
check(
  'new content scores high novelty',
  noveltyScore('quartz lattices repeat across scales', [
    'grief arrives before the interpretation',
  ]) > 0.8,
);

// member correction -> friction detected
const f = frictionSignals("no, that's not what I meant — actually you're missing the point");
check('member correction detected', f.correction && f.markers.length >= 1);

// sanctuary -> refused
check(
  'sanctuary returns null (refused outright)',
  computeInterruptionMetadata({
    memberMessage: 'anything',
    assistantResponse: 'anything',
    priorResponses: [],
    sanctuary: true,
  }) === null,
);

// friction turn -> flagged as candidate interruption
const m = computeInterruptionMetadata({
  memberMessage: "no, that's wrong",
  assistantResponse: 'a revised take',
  priorResponses: ['an old take'],
});
check('friction turn flagged as candidate interruption', m !== null && m.isInterruption === true);

// neutral turn -> not flagged
const n = computeInterruptionMetadata({
  memberMessage: 'tell me more about water',
  assistantResponse: 'water is feeling, relation, dissolution',
  priorResponses: [],
});
check('neutral turn not flagged', n !== null && n.isInterruption === false);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
