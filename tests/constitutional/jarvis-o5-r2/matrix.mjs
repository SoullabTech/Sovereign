#!/usr/bin/env node
/**
 * JARVIS O5-R2 — execution matrix (F4-R + Path B classifier PB-F1…PB-F7).
 *
 * PASS requires: the real classifier / reference passes every falsifier; each
 * defeat candidate dies on its named falsifier; every falsifier is some
 * candidate's named killer; every extra death is CLASSIFIED collateral; no
 * declared collateral is stale. Exit 0 only on LETHAL + DISCRIMINATING.
 */
import * as REAL from '../../../scripts/builder/o5-recovery-path-b-v1.mjs';
import { REFERENCE } from '../jarvis-o5-r1/reference.mjs';
import { existingFailureCodes } from '../jarvis-o5-r1/falsifiers.mjs';
import { F4R, extendedFailureCodes } from './f4r.mjs';
import { PB_FALSIFIERS } from './pathb-falsifiers.mjs';
import { PB_CANDIDATES } from './pathb-candidates.mjs';
import { CAUSE_OF } from '../jarvis-o5-r1/reference-cause-map.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);

function group(title, falsifiers, subject, candidates) {
  out(`\n${title}`);
  const ids = Object.keys(falsifiers);
  for (const id of ids) {
    const r = falsifiers[id](subject);
    out(`  ${id} ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.slice(0, 3).join(' | ')}`}`);
    if (!r.pass) bad += 1;
  }
  const killers = new Set();
  for (const c of candidates) {
    const deaths = ids.filter((id) => !falsifiers[id](c.subject).pass);
    const namedDied = deaths.includes(c.named);
    if (namedDied) killers.add(c.named);
    const extra = deaths.filter((id) => id !== c.named);
    const unclassified = extra.filter((id) => !(id in c.collateral));
    const stale = Object.keys(c.collateral).filter((id) => !deaths.includes(id));
    const ok = namedDied && !unclassified.length && !stale.length;
    if (!ok) bad += 1;
    out(`  ${c.id} → ${ok ? 'KILLED' : 'DEFECT'} on ${c.named}${namedDied ? '' : ' (SURVIVED — repair the suite)'}`);
    out(`        ${c.law}`);
    for (const id of extra) out(`        + ${id} ${id in c.collateral ? `CLASSIFIED: ${c.collateral[id]}` : 'UNCLASSIFIED'}`);
    for (const id of stale) out(`        ! declared collateral ${id} did not occur (stale)`);
  }
  const orphan = ids.filter((id) => !killers.has(id));
  if (orphan.length) { bad += 1; out(`  falsifiers with no proven kill: ${orphan.join(', ')}`); }
}

out('JARVIS O5-R2 · Path B recovery + F4-R · matrix');
out('The checkpoint is evidence about a prior execution; it is never authority to execute the next act.');

// ── R2A · F4-R ───────────────────────────────────────────────────────────────
const R1_ERA = new Set(existingFailureCodes());
const narrowMap = new Map();
for (const [cause, codes] of Object.entries(CAUSE_OF)) for (const c of codes) if (R1_ERA.has(c)) narrowMap.set(c, cause);
group('R2A · F4-R (widened failure-code inventory)', { 'F4-R': (s) => F4R(s.decisions, s.opts) }, { decisions: REFERENCE, opts: {} }, [
  { id: 'DC-F4R-1', named: 'F4-R', collateral: {}, law: 'a cause map that covers only the codes the frozen F4 extractor could see',
    subject: { decisions: { ...REFERENCE, classify: (code) => (narrowMap.has(code) ? REFERENCE.classify(code) : { code, cause: null, response: 'STOP', classified: false }) }, opts: {} } },
  { id: 'DC-F4R-2', named: 'F4-R', collateral: {}, law: 'a regressed extractor that silently loses reach (sees fewer codes than the decision record)',
    subject: { decisions: REFERENCE, opts: { extract: existingFailureCodes } } },
  { id: 'DC-F4R-3', named: 'F4-R', collateral: {}, law: 'a catch-all cause map: a newly introduced live code is silently "classified" with no mapping decision',
    subject: { decisions: { ...REFERENCE, classify: (code) => { const c = REFERENCE.classify(code); return c.classified ? c : { code, cause: 'EXECUTION', response: 'REATTEMPT_UNDER_EXISTING_LIFECYCLE', classified: true }; } },
      opts: { extract: () => [...extendedFailureCodes(), 'O5_R2_NEWLY_INTRODUCED_CODE'] } } },
]);

// ── R2B/R2C · Path B classifier ──────────────────────────────────────────────
group('R2C · Path B recovery classifier (real classifier under test)', PB_FALSIFIERS, REAL,
  PB_CANDIDATES.map((c) => ({ ...c, subject: c.classifier })));

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
