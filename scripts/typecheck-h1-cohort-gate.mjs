#!/usr/bin/env node
/**
 * H1-COHORT-GATE-01 typecheck. Runs tsconfig.h1-cohort-gate.json (strict +
 * noUncheckedIndexedAccess) and FAILS on any diagnostic in the lane's own files
 * (tests/constitutional/h1-cohort-gate/** and the H1-CG-03 implementation modules).
 *
 * The suite imports pure canon functions from app/writers-studio/**, which were
 * not written to noUncheckedIndexedAccess. Their diagnostics are INHERITED: they
 * are listed by file and code on every run, never hidden, and never counted
 * against the lane. The flag is not weakened to manufacture a pass. Those files
 * remain governed by the project gate (npm run typecheck).
 */
import { spawnSync } from 'node:child_process';

const res = spawnSync('npx', ['tsc', '-p', 'tsconfig.h1-cohort-gate.json', '--pretty', 'false'], { encoding: 'utf8' });
const lines = (res.stdout + res.stderr).split('\n').filter((l) => /\(\d+,\d+\): error TS\d+/.test(l));
const LANE = [
  'tests/constitutional/h1-cohort-gate/',
  'lib/access/houseStudioH1Access.ts',
  'app/writers-studio/h1Arrival.ts',
  'app/writers-studio/useHouseStudioH1WorkClaim.ts',
  'app/api/house-studio/admission/',
];
const isLane = (l) => LANE.some((p) => l.startsWith(p));
const lane = lines.filter(isLane);
const inherited = lines.filter((l) => !isLane(l));

if (inherited.length) {
  console.log(`inherited from imported canon (not this lane's; governed by npm run typecheck): ${inherited.length}`);
  for (const l of inherited) console.log(`  · ${l.replace(/: error (TS\d+): .*/, ' $1')}`);
}
if (lane.length) {
  console.log(`\n✗ ${lane.length} diagnostic(s) in H1-COHORT-GATE-01 files:`);
  for (const l of lane) console.log(`  ${l}`);
  process.exit(1);
}
if (res.status !== 0 && lines.length === 0) {
  console.log(res.stdout + res.stderr);
  console.log('✗ tsc failed without parseable diagnostics');
  process.exit(1);
}
console.log('✓ 0 diagnostics in H1-COHORT-GATE-01 files');
