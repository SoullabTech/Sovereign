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

const STUDIO_THEME = {
  file: 'app/writers-studio/studioTheme.ts',
  codes: ['TS18048', 'TS2532', 'TS2345'],
  why: 'pre-existing at canonical b23ae2d7f; reached via flagshipTokens.ts re-export; ' +
       'not written to noUncheckedIndexedAccess; outside the C1A population',
};
/** C1B reaches four more proven host modules through the live host's real imports. */
const C1B_HOST_NEIGHBOURS = [
  { file: 'app/press/manuscript/workingDraftClient.ts', codes: ['TS2532'], why: 'pre-existing; reached via useSectionWriting → AUTOSAVE_DELAY_MS; authority module, untouched' },
  { file: 'app/writers-studio/canvasIdentity.ts', codes: ['TS2322'], why: 'pre-existing; reached via useLivingWorks; untouched' },
  { file: 'app/writers-studio/useLivingWorks.ts', codes: ['TS2322'], why: 'pre-existing; the Work-resolution hook the host reuses; untouched' },
  { file: 'app/writers-studio/workContext.ts', codes: ['TS2322'], why: 'pre-existing; the Work-resolution law the host reuses; untouched' },
];
const ALLOWED_BY_CONFIG = {
  'tsconfig.ws-flagship-c1a.json': [STUDIO_THEME],
  'tsconfig.ws-flagship-c1b.json': [STUDIO_THEME, ...C1B_HOST_NEIGHBOURS],
  /** C1C1 adds the pure Discuss modules; it reaches no new pre-existing neighbour. */
  'tsconfig.ws-flagship-c1c1.json': [STUDIO_THEME, ...C1B_HOST_NEIGHBOURS],
};

/** C1B reuses this runner: `node scripts/typecheck-ws-flagship-c1a.mjs tsconfig.ws-flagship-c1b.json`. */
const CONFIG = process.argv[2] ?? 'tsconfig.ws-flagship-c1a.json';
const ALLOWED = ALLOWED_BY_CONFIG[CONFIG] ?? [];
const r = spawnSync('npx', ['tsc', '-p', CONFIG, '--pretty', 'false'], { encoding: 'utf8' });
const lines = `${r.stdout ?? ''}${r.stderr ?? ''}`.split('\n').map((l) => l.trim()).filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
const matches = (l, a) => l.startsWith(a.file) && a.codes.some((c) => l.includes(`error ${c}:`));
const unexpected = lines.filter((l) => !ALLOWED.some((a) => matches(l, a)));
const unused = ALLOWED.filter((a) => !lines.some((l) => matches(l, a)));

console.log(`FLAGSHIP TYPECHECK — ${CONFIG} (strict · noUncheckedIndexedAccess · react-jsx)\n`);
for (const a of ALLOWED) {
  const n = lines.filter((l) => matches(l, a)).length;
  console.log(`  inherited allowance  ${a.file}  ${a.codes.join('/')}  matched=${n}\n    why: ${a.why}`);
}
if (unused.length) { console.log('\n  ⚠️ STALE ALLOWANCE — no longer matches; remove it:'); for (const a of unused) console.log(`    ${a.file}`); }
if (unexpected.length) { console.log('\n  ⛔ UNEXPECTED DIAGNOSTICS:'); for (const l of unexpected) console.log(`    ${l}`); }
const ok = unexpected.length === 0 && unused.length === 0;
console.log(`\n  verdict  ${ok ? 'PASS — 0 diagnostics outside the named inherited allowance' : '⛔ FAIL'}`);
process.exit(ok ? 0 : 1);
