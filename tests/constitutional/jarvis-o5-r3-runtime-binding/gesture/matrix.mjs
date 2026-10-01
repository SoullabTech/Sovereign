#!/usr/bin/env node
/** O5-R3 RB-A4 — execution gesture separation matrix. */
import fs from 'node:fs';
import path from 'node:path';
import { GS_FALSIFIERS, ROOT } from './falsifiers.mjs';
import { REAL, GS_CANDIDATES } from './candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(s + '\n');
out('O5-R3 · E1 execution gesture separation · RB-A4');

const ids = Object.keys(GS_FALSIFIERS);
for (const id of ids) {
  const r = await GS_FALSIFIERS[id](REAL);
  out(`  ${id} real ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : '  ' + r.failures.join(' | ')}`);
  if (!r.pass) bad += 1;
}
const killers = new Set();
for (const c of GS_CANDIDATES) {
  const deaths = []; let why = '';
  for (const id of ids) {
    const r = await GS_FALSIFIERS[id](c.subject);
    if (!r.pass) { deaths.push(id); if (id === c.named) why = r.failures[0]; }
  }
  const namedDied = deaths.includes(c.named);
  if (namedDied) killers.add(c.named);
  const extra = deaths.filter((id) => id !== c.named);
  const ok = namedDied && extra.length === 0;
  if (!ok) bad += 1;
  out(`  ${c.id} → ${ok ? 'KILLED' : 'DEFECT'} on ${c.named}${namedDied ? '' : ' (SURVIVED)'}`);
  out('        ' + c.law);
  if (why) out('        why: ' + why);
  if (extra.length) out('        unclassified collateral: ' + extra.join(', '));
}
const orphan = ids.filter((id) => !killers.has(id));
if (orphan.length) { bad += 1; out('  falsifiers with no proven kill: ' + orphan.join(', ')); }

out('\nGS-W · Desktop wiring');
const renderer = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/renderer.js'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/index.html'), 'utf8');
const helper = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/e1-gesture-separation.js'), 'utf8');
const activeBranch = renderer.match(/else if \(primaryAction === 'REVIEW_AUTHORIZED'\) \{([\s\S]*?)\n    \} else \{/);
const authStart = renderer.indexOf('async function authorizeCanonicalExecutionOnce');
const authEnd = renderer.indexOf('async function prepareCanonicalExecutionTransport', authStart);
const auth = renderer.slice(authStart, authEnd);
const confirmStart = renderer.indexOf('async function confirmCanonicalExecution');
const confirmEnd = renderer.indexOf('async function revokeCanonicalExecution', confirmStart);
const confirm = renderer.slice(confirmStart, confirmEnd);
const checks = [
  ['GS-W1 helper loads before renderer', index.indexOf('e1-gesture-separation.js') < index.indexOf('renderer.js')],
  ['GS-W2 renderer delegates all three decisions to helper',
    /E1G\.confirmationReviewed/.test(renderer) && /E1G\.activeGrantPrimaryAction/.test(renderer) && /E1G\.confirmArmed/.test(renderer)],
  ['GS-W3 ACTIVE grant branch has review/revoke and no direct Confirm',
    !!activeBranch && /data-e1-review-active/.test(activeBranch[1]) && /data-e1-revoke/.test(activeBranch[1]) && !/data-e1-confirm/.test(activeBranch[1])],
  ['GS-W4 successful authorization discards the pre-authorization review before refresh',
    /if \(out\?\.ok\) activeCanonicalExecutionReview = null;/.test(auth)],
  ['GS-W5 confirmation arm is consumed before privileged IPC',
    confirm.indexOf('activeCanonicalExecutionReview = null') >= 0
      && confirm.indexOf('activeCanonicalExecutionReview = null') < confirm.indexOf("action: 'canonical-confirm-execute'")],
  ['GS-W6 helper is pure decision logic', !/workUnitAction|ipcRenderer|writeFile|fetch\(/.test(helper)],
];
for (const [name, ok] of checks) {
  out(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) bad += 1;
}

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · WIRING INTACT' : 'MATRIX DEFECT (' + bad + ')'}`);
process.exit(bad === 0 ? 0 : 1);
