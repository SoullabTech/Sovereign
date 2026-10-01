#!/usr/bin/env node
/**
 * PRE-WRITE LEASE STANDING — execution matrix (additive law, 2026-10-01).
 *
 * PASS (exit 0) requires:
 *   · the REAL standing module passes PW-1…PW-9;
 *   · every defeat candidate dies on its NAMED falsifier, every extra death is classified,
 *     no declared collateral is stale, and every falsifier has a proven kill;
 *   · the checker wiring: pre-write is a baseline that can never carry admission evidence,
 *     and the post-write C6 needs BOTH the strict standing and the field-for-field pair.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { PW_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, PW_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);
out('O5-R3 · runtime binding · pre-write lease standing · matrix');
out('Historical lease state may exist. Before the first write no live writer may hold authority; after it, the lease must be this exact Desktop.');

out('\nPW · real module');
const ids = Object.keys(PW_FALSIFIERS);
for (const id of ids) {
  const r = await PW_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.slice(0, 3).join(' | ')}`}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of PW_CANDIDATES) {
  const deaths = []; let why = '';
  for (const id of ids) { const r = await PW_FALSIFIERS[id](c.subject); if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; } }
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

out('\nPW-W · checker wiring');
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const checkerPath = path.join(ROOT, 'scripts/witness/o5-r3-runtime-witness.mjs');
const checker = strip(fs.readFileSync(checkerPath, 'utf8'));
const wiring = {
  'PW-W1 the checker judges C6 through the standing module (no private lease logic)': () =>
    /o5-r3-lease-standing\.mjs/.test(checker) && /STAND\.classifyLeaseStanding\(STAND\.readLeaseHistory\(home\)/.test(checker),
  'PW-W2 post-write C6 requires the strict standing AND the field-for-field pair': () =>
    /C\('C6',[\s\S]{0,200}pairEqual && STAND\.POST_WRITE_ACCEPTABLE\.includes\(standing\.standing\)/.test(checker),
  'PW-W3 a pre-write run refuses admission evidence (live run, exit 1)': () => {
    const r = spawnSync(process.execPath, [checkerPath, '--phase', 'pre-write', '--refusal', '/dev/null'], { encoding: 'utf8' });
    return r.status === 1 && /cannot carry admission evidence/.test(r.stderr);
  },
  'PW-W4 a pre-write verdict is never worded as admission': () =>
    /PRE-WRITE BASELINE PASS[^']*not admission/.test(checker) && !/pre-write[^\n]*CONSTITUTIONAL PASS/.test(checker),
  'PW-W5 the standing module stays outside authority territory (frozen RB-W5 perimeter)': () =>
    fs.existsSync(path.join(ROOT, 'scripts/witness/o5-r3-lease-standing.mjs')) && !fs.existsSync(path.join(ROOT, 'scripts/builder/o5-r3-lease-standing.mjs'))
    && !/runtime-binding/.test(strip(fs.readFileSync(path.join(ROOT, 'scripts/witness/o5-r3-lease-standing.mjs'), 'utf8'))),
};
for (const [name, fn] of Object.entries(wiring)) { const ok = fn(); if (!ok) bad += 1; out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`); }

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
