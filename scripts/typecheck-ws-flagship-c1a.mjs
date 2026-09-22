#!/usr/bin/env node
/**
 * C1A typecheck — strict + noUncheckedIndexedAccess + JSX over the NEW pure
 * code (WriteFrame, the Write view adapters, the C1A laws/candidates) and the
 * unchanged authorship substrate they compose.
 *
 * ONE INHERITED ALLOWANCE, BY NAME. `flagshipTokens.ts` re-exports RADIUS ·
 * SPACE · MEASURE from `app/writers-studio/studioTheme.ts`, so any program
 * that contains a flagship component contains that file — and it was never
 * written to `noUncheckedIndexedAccess`. Its diagnostics are real, inherited,
 * and ⛔ NOT a C1A regression; C1A does not touch that file.
 *
 * ⛔ Refused: weakening the flag (manufactures a pass) · leaving the command
 * permanently red (an instrument nobody can pass decays into prose) ·
 * widening `tsconfig.ws-flagship.json` (its program is the canonical gate).
 * ⭐ FAIL-CLOSED: a diagnostic in any other file fails; an allowance that stops
 * matching is reported so it can be removed.
 */
import { spawnSync } from 'node:child_process';

const ALLOWED = [{
  file: 'app/writers-studio/studioTheme.ts',
  codes: ['TS18048', 'TS2532', 'TS2345'],
  why: 'pre-existing at canonical b23ae2d7f; reached via flagshipTokens.ts re-export; ' +
       'not written to noUncheckedIndexedAccess; outside the C1A population',
}];

const r = spawnSync('npx', ['tsc', '-p', 'tsconfig.ws-flagship-c1a.json', '--pretty', 'false'], { encoding: 'utf8' });
const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const matches = (l, a) => l.startsWith(a.file) && a.codes.some((c) => l.includes(`error ${c}:`));
const unexpected = lines.filter((l) => !ALLOWED.some((a) => matches(l, a)));
const unused = ALLOWED.filter((a) => !lines.some((l) => matches(l, a)));

console.log('C1A TYPECHECK — tsconfig.ws-flagship-c1a.json (strict · noUncheckedIndexedAccess · react-jsx)\n');
for (const a of ALLOWED) {
  const n = lines.filter((l) => matches(l, a)).length;
  console.log(`  inherited allowance  ${a.file}  ${a.codes.join('/')}  matched=${n}\n    why: ${a.why}`);
}
if (unused.length) { console.log('\n  ⚠️ STALE ALLOWANCE — no longer matches; remove it:'); for (const a of unused) console.log(`    ${a.file}`); }
if (unexpected.length) { console.log('\n  ⛔ UNEXPECTED DIAGNOSTICS:'); for (const l of unexpected) console.log(`    ${l}`); }
const ok = unexpected.length === 0 && unused.length === 0;
console.log(`\n  verdict  ${ok ? 'PASS — 0 diagnostics outside the named inherited allowance' : '⛔ FAIL'}`);
process.exit(ok ? 0 : 1);
