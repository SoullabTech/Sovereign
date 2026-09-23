// @ts-check
/**
 * B1 execution matrix — founder-workspace-viewmodel.v1
 * Reference (fixture + live) must PASS; each defeat candidate must DIE on its named law.
 * Collateral kills are reported; an UNCLASSIFIED collateral is a matrix failure.
 * Run: node tests/constitutional/founder-workspace/matrix.mjs   (exit 0 = LETHAL + DISCRIMINATING)
 */
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { CANDIDATES } from './candidates.mjs';
import { fixtureReference, liveReference } from './reference.mjs';

/** Collateral a candidate is EXPECTED to cause because embodying its error necessarily breaks a second law. */
const CLASSIFIED_COLLATERAL = /** @type {Record<string, string[]>} */ ({});

let failures = 0;
const out = (/** @type {string} */ s) => console.log(s);

for (const [name, vm, mode] of /** @type {[string, any, 'fixture'|'live'][]} */ ([['F1 fixture (fixture mode)', fixtureReference(), 'fixture'], ['live reference', liveReference(), 'live']])) {
  const r = validateViewModel(vm, { mode });
  out(`${r.ok ? 'PASS' : 'FAIL'}  reference · ${name} · ${r.violations.length} violations`);
  if (!r.ok) { failures++; r.violations.slice(0, 8).forEach((v) => out(`        ${v.law} ${v.path}: ${v.detail}`)); }
}

// F1 fixture must NOT be consumable live (it carries ILLUSTRATIVE units) — VM-5 is doing its job
{
  const r = validateViewModel(fixtureReference(), { mode: 'live' });
  const laws = new Set(r.violations.map((v) => v.law));
  const ok = !r.ok && laws.has('VM-5');
  out(`${ok ? 'PASS' : 'FAIL'}  fixture refused in live mode on VM-5 (laws: ${[...laws].join(',')})`);
  if (!ok) failures++;
}

for (const c of CANDIDATES) {
  const vm = c.apply(liveReference());
  const r = validateViewModel(vm, { mode: 'live' });
  const laws = [...new Set(r.violations.map((v) => v.law))];
  const dead = laws.includes(c.kills);
  const collateral = laws.filter((l) => l !== c.kills);
  const unclassified = collateral.filter((l) => !(CLASSIFIED_COLLATERAL[c.id] || []).includes(l));
  const ok = dead && unclassified.length === 0;
  out(`${ok ? 'DEAD' : 'SURVIVED'}  ${c.id} → ${c.kills}  (${c.belief})  laws=${laws.join(',') || 'none'}${collateral.length ? `  collateral=${collateral.join(',')} ${unclassified.length ? 'UNCLASSIFIED' : 'classified'}` : ''}`);
  if (!ok) failures++;
}

out(failures === 0 ? '\nMATRIX: LETHAL + DISCRIMINATING (exit 0)' : `\nMATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
