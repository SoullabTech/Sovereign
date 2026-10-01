#!/usr/bin/env node
/**
 * C6A AUTHORIZED TRANSITION INTEGRITY — execution matrix (additive law RB-A2, 2026-10-01).
 *
 * PASS (exit 0) requires:
 *   · the REAL judge passes TI-1…TI-11 on real homes on disk;
 *   · every defeat candidate dies on its NAMED falsifier, every extra death is classified,
 *     no declared collateral is stale, and every falsifier has a proven kill;
 *   · the checker wiring: C6A judged by the shipped judge against --prewrite, post-write only,
 *     placed before C6, and C8 left exactly as it was (its own question, its own snapshot view).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { TI_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, TI_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);
out('O5-R3 · runtime binding · C6A authorized transition integrity · matrix');
out('pre-write standing → authorized transition integrity → current-holder proof → second-writer refusal integrity');

out('\nTI · real judge');
const ids = Object.keys(TI_FALSIFIERS);
for (const id of ids) {
  const r = await TI_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.slice(0, 3).join(' | ')}`}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of TI_CANDIDATES) {
  const deaths = []; let why = '';
  for (const id of ids) { const r = await TI_FALSIFIERS[id](c.subject); if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; } }
  const namedDied = deaths.includes(c.named);
  if (namedDied) killers.add(c.named);
  const extra = deaths.filter((id) => id !== c.named);
  const unclassified = extra.filter((id) => !(id in c.collateral));
  const stale = Object.keys(c.collateral).filter((id) => !deaths.includes(id));
  const ok = namedDied && !unclassified.length && !stale.length;
  if (!ok) bad += 1;
  out(`  ${c.id} → ${ok ? 'KILLED' : 'DEFECT'} on ${c.named}${namedDied ? '' : ' (SURVIVED — repair the suite)'}`);
  out(`        ${c.law}`);
  if (why) out(`        why: ${why}`);
  for (const id of extra) out(`        + ${id} ${id in c.collateral ? `CLASSIFIED: ${c.collateral[id]}` : 'UNCLASSIFIED'}`);
  for (const id of stale) out(`        ! declared collateral ${id} did not occur (stale)`);
}
const orphan = ids.filter((id) => !killers.has(id));
if (orphan.length) { bad += 1; out(`  falsifiers with no proven kill: ${orphan.join(', ')}`); }

out('\nTI-W · checker wiring');
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const checkerPath = path.join(ROOT, 'scripts/witness/o5-r3-runtime-witness.mjs');
const checker = strip(fs.readFileSync(checkerPath, 'utf8'));
const modPath = path.join(ROOT, 'scripts/witness/o5-r3-transition-integrity.mjs');
const wiring = {
  'TI-W1 C6A is judged by the shipped judge against the --prewrite governed capture': () =>
    /TI\.judgeTransition\(prewrite\.governed, home, bindingPair\)/.test(checker) && !/judgeTransitionWith/.test(checker),
  'TI-W2 C6A is post-write only and precedes C6': () => {
    const i = checker.indexOf("C('C6A'"); const j = checker.indexOf("C('C6',"); const pre = checker.indexOf("if (phase === 'pre-write') {");
    return i > 0 && j > i && pre > 0 && pre < i;
  },
  'TI-W3 C8 is untouched: byte identity of its own file view across the refusal': () =>
    /JSON\.stringify\(before\.files\) === JSON\.stringify\(now\.files\)/.test(checker) && /C\('C8', 'grant ledgers \+ lease byte-identical across the refused attempt'/.test(checker),
  'TI-W4 snapshots carry the governed capture for C6A': () => /governed: TI\.captureGoverned\(home\)/.test(checker),
  'TI-W5 a pre-write run refuses --prewrite as admission evidence (live run, exit 1)': () => {
    const r = spawnSync(process.execPath, [checkerPath, '--phase', 'pre-write', '--prewrite', '/dev/null'], { encoding: 'utf8' });
    return r.status === 1 && /cannot carry admission evidence/.test(r.stderr);
  },
  'TI-W6 the judge stays outside authority territory and never reads the binding record': () =>
    fs.existsSync(modPath) && !fs.existsSync(path.join(ROOT, 'scripts/builder/o5-r3-transition-integrity.mjs'))
    && !/runtime-binding/.test(strip(fs.readFileSync(modPath, 'utf8'))),
};
for (const [name, fn] of Object.entries(wiring)) { const ok = fn(); if (!ok) bad += 1; out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`); }

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
