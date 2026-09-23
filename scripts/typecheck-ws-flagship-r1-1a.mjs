#!/usr/bin/env node
/**
 * R1-1A strict typecheck — strict + noUncheckedIndexedAccess + react-jsx over the read-only Review
 * seam, the flagship Review presentation files it lives in, the frozen witness fixtures it renders,
 * and the R1-1A suite. Inherited allowances are BLOB-PINNED to the R1-1A base: an allowance that
 * moves is a regression, not an allowance.
 */
import { execFileSync, spawnSync } from 'node:child_process';

const BASE = '981a996cef8e1626f6997e032d5b91b0a52cee86';
const CONFIG = 'tsconfig.ws-flagship-r1-1a.json';
const ALLOWED = [
  { file: 'app/writers-studio/studioTheme.ts', codes: ['TS18048', 'TS2532', 'TS2345'],
    why: 'pre-existing at canonical; reached via flagshipTokens.ts re-export; not written to noUncheckedIndexedAccess' },
];
const blob = (spec) => execFileSync('git', ['rev-parse', spec], { encoding: 'utf8' }).trim();
const live = (file) => execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim();
for (const a of ALLOWED) {
  const expected = blob(`${BASE}:${a.file}`); const now = live(a.file);
  if (expected !== now) { console.error(`⛔ inherited allowance moved: ${a.file}\n  base ${expected}\n  live ${now}`); process.exit(1); }
}
const r = spawnSync('npx', ['tsc', '-p', CONFIG, '--pretty', 'false'], { encoding: 'utf8' });
const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const matches = (l, a) => l.startsWith(a.file) && a.codes.some((c) => l.includes(`error ${c}:`));
const unexpected = lines.filter((l) => !ALLOWED.some((a) => matches(l, a)));
const unused = ALLOWED.filter((a) => !lines.some((l) => matches(l, a)));
console.log(`R1-1A TYPECHECK — ${CONFIG} (strict · noUncheckedIndexedAccess · react-jsx)\n`);
for (const a of ALLOWED) console.log(`  inherited allowance  ${a.file}  ${a.codes.join('/')}  matched=${lines.filter((l) => matches(l, a)).length}\n    why: ${a.why}`);
if (unused.length) { console.log('\n  ⚠️ STALE ALLOWANCE — remove it:'); for (const a of unused) console.log(`    ${a.file}`); }
if (unexpected.length) { console.log('\n  ⛔ UNEXPECTED DIAGNOSTICS:'); for (const l of unexpected) console.log(`    ${l}`); }
const ok = unexpected.length === 0 && unused.length === 0;
console.log(`\n  verdict  ${ok ? 'PASS — zero diagnostics outside blob-pinned inherited allowances' : '⛔ FAIL'}`);
process.exit(ok ? 0 : 1);
