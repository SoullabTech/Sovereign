#!/usr/bin/env node
/** R1-0 strict typecheck with fail-closed inherited allowances pinned to the exact R1-0 base. */
import { execFileSync, spawnSync } from 'node:child_process';

const BASE = '88f84c04a09b7fa3ba9e858182d3d2632f249a49';
const CONFIG = 'tsconfig.ws-flagship-r1-readonly.json';
const ALLOWED = [
  { file: 'app/writers-studio/studioTheme.ts', codes: ['TS18048','TS2532','TS2345'] },
  { file: 'lib/manuscript/development/readState.ts', codes: ['TS2532','TS2538','TS2345','TS2322'] },
  { file: 'lib/manuscript/draftSections.ts', codes: ['TS18048','TS2538','TS2532'] },
];
const blob = (spec) => execFileSync('git', ['rev-parse', spec], { encoding: 'utf8' }).trim();
const live = (file) => execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim();
for (const a of ALLOWED) {
  const expected = blob(`${BASE}:${a.file}`); const now = live(a.file);
  if (expected !== now) {
    console.error(`⛔ inherited allowance moved: ${a.file}\n  base ${expected}\n  live ${now}`);
    process.exit(1);
  }
}
const r = spawnSync('npx', ['tsc','-p',CONFIG,'--pretty','false'], { encoding: 'utf8' });
const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const matches = (l,a) => l.startsWith(a.file) && a.codes.some((c) => l.includes(`error ${c}:`));
const unexpected = lines.filter((l) => !ALLOWED.some((a) => matches(l,a)));
const unused = ALLOWED.filter((a) => !lines.some((l) => matches(l,a)));
console.log(`R1-0 TYPECHECK — ${CONFIG} · base ${BASE.slice(0,9)}\n`);
for (const a of ALLOWED) console.log(`  inherited · blob-pinned  ${a.file}  matched=${lines.filter((l)=>matches(l,a)).length}`);
if (unused.length) { console.error('\n⛔ stale allowance:'); for (const a of unused) console.error(`  ${a.file}`); }
if (unexpected.length) { console.error('\n⛔ unexpected diagnostics:'); for (const l of unexpected) console.error(`  ${l}`); }
const ok = unexpected.length === 0 && unused.length === 0;
console.log(`\n  verdict  ${ok ? 'PASS — zero diagnostics outside blob-pinned inherited allowances' : '⛔ FAIL'}`);
process.exit(ok ? 0 : 1);
