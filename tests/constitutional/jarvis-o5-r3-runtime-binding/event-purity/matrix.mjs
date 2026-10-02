#!/usr/bin/env node
/** RB-A4 · C6B grant-event purity execution matrix. */
import fs from 'node:fs';
import path from 'node:path';
import { EP_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, EP_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(s + '\n');
out('O5-R3 · runtime binding · C6B grant-event purity · matrix');
out('structural transition (C6A) → exact single authorization event (C6B) → current-holder proof (C6)');

out('\nEP · real judge');
const ids = Object.keys(EP_FALSIFIERS);
for (const id of ids) {
  const r = await EP_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : '  ' + r.failures.slice(0, 3).join(' | ')}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of EP_CANDIDATES) {
  const deaths = []; let why = '';
  for (const id of ids) {
    const r = await EP_FALSIFIERS[id](c.subject);
    if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; }
  }
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
  for (const id of extra) out(`        + ${id} ${id in c.collateral ? 'CLASSIFIED: ' + c.collateral[id] : 'UNCLASSIFIED'}`);
  for (const id of stale) out(`        ! declared collateral ${id} did not occur (stale)`);
}
const orphan = ids.filter((id) => !killers.has(id));
if (orphan.length) { bad += 1; out(`  falsifiers with no proven kill: ${orphan.join(', ')}`); }

out('\nEP-W · checker wiring');
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const checkerPath = path.join(ROOT, 'scripts/witness/o5-r3-runtime-witness.mjs');
const checker = strip(fs.readFileSync(checkerPath, 'utf8'));
const judgePath = path.join(ROOT, 'scripts/witness/o5-r3-grant-event-integrity.mjs');

const wiring = {
  'EP-W1 C6B uses the shipped judge against pre-write and current governed captures': () =>
    /EVENT\.judgeGrantEventPurity\(prewrite\.governed, currentGoverned, home\)/.test(checker)
    && /currentGoverned = home \? TI\.captureGoverned\(home\) : null/.test(checker)
    && !/judgeGrantEventPurityWith/.test(checker),
  'EP-W2 C6B is post-write only and sits after C6A but before C6': () => {
    const a = checker.indexOf("C('C6A'"); const b = checker.indexOf("C('C6B'"); const c = checker.indexOf("C('C6',");
    const pre = checker.indexOf("if (phase === 'pre-write') {");
    return pre > 0 && a > pre && b > a && c > b;
  },
  'EP-W3 C8 remains its independent byte-identity question': () =>
    /JSON\.stringify\(before\.files\) === JSON\.stringify\(now\.files\)/.test(checker)
    && /C\('C8', 'grant ledgers \+ lease byte-identical across the refused attempt'/.test(checker),
  'EP-W4 event-purity judge is read-only witness code outside authority territory': () =>
    fs.existsSync(judgePath)
    && !fs.existsSync(path.join(ROOT, 'scripts/builder/o5-r3-grant-event-integrity.mjs'))
    && !/runtime-binding/.test(strip(fs.readFileSync(judgePath, 'utf8'))),
  'EP-W5 final admission verdict names both C6A and C6B': () =>
    /CONSTITUTIONAL PASS — C1–C8 \+ C6A \+ C6B witnessed/.test(checker),
};
for (const [name, fn] of Object.entries(wiring)) {
  const ok = fn(); if (!ok) bad += 1; out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : 'MATRIX DEFECT (' + bad + ')'}`);
process.exit(bad === 0 ? 0 : 1);
