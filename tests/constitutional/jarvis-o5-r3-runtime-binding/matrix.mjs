#!/usr/bin/env node
/**
 * O5-R3 RUNTIME BINDING WITNESS — execution matrix.
 *
 * PASS (exit 0) requires:
 *   · the REAL module passes RB-1…RB-5;
 *   · every defeat candidate dies on its NAMED falsifier, every extra death is classified,
 *     no declared collateral is stale, and every falsifier has a proven kill;
 *   · the WIRING checks pass against the real main.js and the real codebase
 *     (startup write, re-bind write, terminate on quit, and no authority path reads the record).
 */
import fs from 'node:fs';
import path from 'node:path';
import { RB_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, RB_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);
out('O5-R3 · runtime binding witness · matrix');
out('The record describes the current binding; possession of the record grants no authority whatsoever.');

out('\nRB · real module');
const ids = Object.keys(RB_FALSIFIERS);
for (const id of ids) {
  const r = await RB_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.slice(0, 3).join(' | ')}`}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of RB_CANDIDATES) {
  const deaths = []; let why = '';
  for (const id of ids) { const r = await RB_FALSIFIERS[id](c.subject); if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; } }
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

// ── Wiring, against the real code (comments stripped before every scan) ──────
out('\nRB-W · wiring in the real Desktop');
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const main = strip(fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/main.js'), 'utf8'));
const body = (name) => { const i = main.indexOf(name); if (i < 0) return ''; let d = 0; let j = main.indexOf('{', i); const s = j; for (; j < main.length; j++) { if (main[j] === '{') d++; else if (main[j] === '}') { d--; if (!d) break; } } return main.slice(s, j + 1); };
const wiring = {
  'RB-W1 startup: the first act after app ready writes the record': () => /app\.whenReady\(\)\.then\(async \(\) => \{\s*writeRuntimeBinding\('startup'\);/.test(main),
  'RB-W2 re-bind: broadcastRepoChange writes the record before anything else': () => /^\{\s*writeRuntimeBinding\('rebind'\);/.test(body('function broadcastRepoChange')),
  'RB-W3 every runtime re-binding of RESOLVED is followed by broadcastRepoChange': () => {
    const assigns = [...main.matchAll(/\n\s+RESOLVED = /g)].map((m) => m.index);
    return assigns.length >= 2 && assigns.every((i) => { const tail = main.slice(i, i + 400); return /broadcastRepoChange\(\)/.test(tail); });
  },
  'RB-W4 quit: the record is marked terminated': () => /app\.on\('will-quit'[\s\S]{0,200}RB\.markTerminated\(/.test(main),
  'RB-W5 no authority path reads the record': () => {
    const offenders = [];
    const scan = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) { if (!['node_modules', '__tests__'].includes(e.name)) scan(p); } else if (/\.(m?js|cjs)$/.test(e.name)) { const src = strip(fs.readFileSync(p, 'utf8')); if (/runtime-binding/.test(src)) offenders.push(path.relative(ROOT, p)); } } };
    scan(path.join(ROOT, 'scripts/builder')); scan(path.join(ROOT, 'jarvis-desktop/src'));
    const allowed = new Set(['jarvis-desktop/src/main.js', 'jarvis-desktop/src/runtime-binding.js']);
    const bad2 = offenders.filter((o) => !allowed.has(o));
    if (bad2.length) out(`        readers outside main.js: ${bad2.join(', ')}`);
    return bad2.length === 0 && !/RB\.(readRecord|judgeLive)\(/.test(main);
  },
};
for (const [name, fn] of Object.entries(wiring)) { const ok = fn(); if (!ok) bad += 1; out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`); }

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
