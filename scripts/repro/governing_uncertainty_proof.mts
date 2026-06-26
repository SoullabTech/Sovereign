/**
 * Env-independent proof mirror of
 *   lib/maia/fieldLab/__tests__/governingUncertainty.test.ts
 *
 * The project's jest toolchain is not installed in this environment
 * (node_modules/jest absent), so this runner executes the SAME assertions against
 * the SAME real validator + real registry using node:assert + Node's native
 * TypeScript type-stripping.
 *
 *   node --experimental-strip-types scripts/repro/governing_uncertainty_proof.mts
 *
 * The jest test remains the permanent CI artifact; this is the runnable proof until
 * the test toolchain is reinstalled.
 */
import assert from 'node:assert/strict';
import {
  validateGoverningUncertainty,
  type GoverningUncertainty,
} from '../../lib/maia/fieldLab/governance.ts';
import { EXPERIMENTS } from '../../lib/maia/fieldLab/experiments.ts';

const admitted: GoverningUncertainty = {
  current: 'Does this surface reveal member pull without persistence?',
  transitionState: 'admitted',
  admittedAt: '2026-05-22',
  transitions: [],
};

const dwelling: GoverningUncertainty = {
  current: 'Can this surface persist anything without representing non-consenting third parties?',
  transitionState: 'dwelling',
  admittedAt: '2026-05-22',
  dwellBlocker: { type: 'architectural', description: 'persistence layer not yet built' },
  transitions: [
    {
      leaving: 'Does this surface reveal member pull without persistence?',
      entering: 'Can this surface persist anything without representing non-consenting third parties?',
      enteringState: 'dwelling',
      evidenceCarry: {
        carries: 'Member pull may carry.',
        mustBeNewlyProven: 'Persistence safety cannot carry; it must be newly proven.',
      },
      basis: 'U1 resolved across observed walks.',
      declaredAt: '2026-07-01',
    },
  ],
};

let passed = 0;
const check = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`); };
const has = (vs: string[], re: RegExp) => vs.some((s) => re.test(s));

console.log('governing-uncertainty law:');

// (a) the real registry obeys the law
for (const exp of EXPERIMENTS) {
  check(`registry: ${exp.slug} declares a valid governing uncertainty`, () => {
    assert.deepEqual(validateGoverningUncertainty(exp.slug, exp.governingUncertainty), []);
  });
}

// (b) valid fixtures pass
check('valid: admitted room with no transitions', () =>
  assert.deepEqual(validateGoverningUncertainty('admitted', admitted), []));
check('valid: dwelling room with declared pass + named blocker', () =>
  assert.deepEqual(validateGoverningUncertainty('dwelling', dwelling), []));

// (c) the validator catches each violation class
check('I1: empty current rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...admitted, current: '   ' }), /current.*empty/i)));
check('I2: non-admitted with no pass rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...admitted, transitionState: 'graduated' }), /no transition has been declared/i)));
check('I2: current not matching last pass rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...dwelling, current: 'a different question' }), /does not match the last declared transition/i)));
check('I3: dwelling without blocker rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...dwelling, dwellBlocker: undefined }), /must name its blocker/i)));
check('I3: blocker while not dwelling rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...admitted, dwellBlocker: { type: 'governance', description: 'x' } }), /only legal while dwelling/i)));
check('I4: pass missing carry-forward rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...dwelling, transitions: [{ ...dwelling.transitions[0], evidenceCarry: { carries: 'pull', mustBeNewlyProven: '' } }] }), /MUST BE NEWLY PROVEN/i)));
check('I5: non-ISO admittedAt rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...admitted, admittedAt: 'May 2026' }), /admittedAt is not an ISO date/i)));
check('I6: declaration before admission rejected', () =>
  assert.ok(has(validateGoverningUncertainty('x', { ...dwelling, transitions: [{ ...dwelling.transitions[0], declaredAt: '2026-01-01' }] }), /before a prior declaration or admittedAt/i)));

// (d) shelf-exclusion criterion is exactly `violations.length > 0`. partitionShelf /
//     getShelfExperiments (shelf.ts) route on this; jest covers the routing + the
//     dev-throw. Here we prove the criterion against the real registry + a broken room.
const broken: GoverningUncertainty = { current: '', transitionState: 'admitted', admittedAt: 'nope', transitions: [] };
check('shelf: every real room is kept (0 violations)', () => {
  for (const exp of EXPERIMENTS) assert.deepEqual(validateGoverningUncertainty(exp.slug, exp.governingUncertainty), []);
});
check('shelf: a falsely-governed room is excluded (>0 violations)', () =>
  assert.ok(validateGoverningUncertainty('broken', broken).length > 0));

console.log(`\n${passed}/${passed} green`);
