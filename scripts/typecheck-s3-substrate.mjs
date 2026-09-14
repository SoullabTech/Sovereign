#!/usr/bin/env node
/**
 * S3 substrate typecheck — strict, with ONE declared inherited allowance.
 *
 * WHY THIS WRAPPER EXISTS. `tsconfig.s3-substrate.json` sets
 * `noUncheckedIndexedAccess`, which the repository's ship config has not
 * adopted. That flag is right for S3's own files — and it also re-checks the
 * whole of `lib/db/postgres.ts`, which S3 imports, under a stricter rule than
 * the repo agreed to. The diagnostic it surfaces there is real, inherited, and
 * ⛔ NOT an S3 regression: `insertOne()` promises `T` and returns
 * `result.rows[0]`, which is `T | undefined`.
 *
 * ⛔ THE TWO THINGS THIS REFUSES TO DO:
 *   1. weaken the flag so the command turns green — that manufactures a pass
 *   2. leave the command permanently RED — an instrument nobody can pass
 *      teaches people to ignore it, and decays into prose
 *
 * So: the flag stays, and exactly one inherited diagnostic is ALLOWED BY NAME.
 * Anything else fails. ⭐ The allowance is keyed on file + error code + a
 * semantic message fragment, never a line number — D1's rule, because a record
 * anchored to a line becomes unreadable the moment an edit lands above it.
 *
 * ⭐ FAIL-CLOSED: an allowance that stops matching produces a FAILURE, never a
 * silent pass.
 *
 * The underlying `insertOne` unsoundness is recorded as its own finding. ⛔ It
 * belongs to whoever owns lib/db/postgres.ts, not to S3 — the lane that found
 * a defect does not thereby own it.
 */

import { spawnSync } from 'node:child_process';

const ALLOWED = [
  {
    file: 'lib/db/postgres.ts',
    code: 'TS2322',
    fragment: "is not assignable to type 'T'",
    why: 'insertOne() returns result.rows[0] (T | undefined) as T — inherited, ' +
         'surfaced only by noUncheckedIndexedAccess, unchanged since the Class-B freeze',
  },
];

const r = spawnSync('npx', ['tsc', '-p', 'tsconfig.s3-substrate.json', '--pretty', 'false'],
  { encoding: 'utf8' });

const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));

const matches = (l, a) =>
  l.startsWith(a.file) && l.includes(`error ${a.code}:`) && l.includes(a.fragment);

const unexpected = lines.filter((l) => !ALLOWED.some((a) => matches(l, a)));
const unused = ALLOWED.filter((a) => !lines.some((l) => matches(l, a)));

console.log('S3 SUBSTRATE TYPECHECK\n');
for (const a of ALLOWED) {
  const seen = lines.some((l) => matches(l, a));
  console.log(`  ${seen ? '⚠️ ' : '·  '} allowed: ${a.file} ${a.code} — ${a.why}`);
}
if (unexpected.length) {
  console.log('\n⛔ UNEXPECTED DIAGNOSTICS');
  for (const l of unexpected) console.log(`   ${l}`);
}
if (unused.length) {
  console.log('\n⭐ An allowance no longer fires — the inherited defect may be fixed.');
  console.log('   Remove it from this script rather than leaving a stale exemption.');
  for (const a of unused) console.log(`   ${a.file} ${a.code}`);
}

const ok = unexpected.length === 0;
console.log(`\n${ok ? '⭐ no unexpected diagnostics' : `⛔ ${unexpected.length} unexpected`}`);
process.exit(ok ? 0 : 1);
