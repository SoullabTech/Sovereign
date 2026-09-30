#!/usr/bin/env node
/**
 * JARVIS O5-R3 — execution matrix (writer lease · ledger tail · reason code · settlement surfacing).
 *
 * PASS (exit 0) requires, per group:
 *   · the reference double passes every falsifier (the laws are mutually satisfiable);
 *   · every defeat candidate dies on its NAMED falsifier;
 *   · every extra death is CLASSIFIED collateral with a stated reason, and no declared collateral is stale;
 *   · every falsifier is some candidate's named killer.
 * Plus, Class A: where the real code can be run today, it must fail exactly the
 * falsifiers the census predicts (known-bad RED). A current-code PASS on a
 * predicted RED is a finding that stops the lane, never a quiet success.
 */
import { LEASE_FALSIFIERS } from './lease-falsifiers.mjs';
import { REFERENCE as LEASE_REFERENCE } from './lease-reference.mjs';
import { LEASE_CANDIDATES, buildLease } from './lease-candidates.mjs';
import { TAIL_FALSIFIERS, REASON_FALSIFIERS, SETTLEMENT_FALSIFIERS } from './settlement-falsifiers.mjs';
import {
  TAIL_REFERENCE, TAIL_CURRENT, TAIL_CANDIDATES,
  REASON_REFERENCE, REASON_CURRENT, REASON_CANDIDATES,
  SETTLEMENT_REFERENCE, SETTLEMENT_CANDIDATES,
} from './settlement-reference-candidates.mjs';

let bad = 0;
const out = (s) => process.stdout.write(`${s}\n`);
const subjectOf = (c) => c.subject;

async function group(title, falsifiers, reference, candidates) {
  out(`\n${title}`);
  const ids = Object.keys(falsifiers);
  for (const id of ids) {
    const r = await falsifiers[id](reference);
    out(`  ${id} reference ${r.pass ? 'PASS' : 'FAIL'}${r.pass ? '' : `  ${r.failures.slice(0, 3).join(' | ')}`}`);
    if (!r.pass) bad += 1;
  }
  const killers = new Set();
  for (const c of candidates) {
    const deaths = [];
    for (const id of ids) if (!(await falsifiers[id](subjectOf(c))).pass) deaths.push(id);
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

async function classA(title, falsifiers, current, predictedRed) {
  out(`\n${title}`);
  for (const [id, fn] of Object.entries(falsifiers)) {
    const r = await fn(current);
    const predicted = predictedRed.includes(id);
    const agrees = predicted === !r.pass;
    if (!agrees) bad += 1;
    out(`  ${id} current ${r.pass ? 'PASS' : 'RED '} ${predicted ? '(predicted RED)' : '(predicted PASS)'}${agrees ? '' : '  ⚠ DISAGREES WITH THE CENSUS'}`);
  }
}

out('JARVIS O5-R3 · grant settlement / lock integrity · matrix');
out('One process writes a delegation home\'s grant ledgers. The per-append lock guarantees each append is exclusive, not that there is one writer.');

// sanity: the candidate builder with no override IS the reference decision set
{
  const plain = buildLease({});
  let ok = true;
  for (const fn of Object.values(LEASE_FALSIFIERS)) ok = (await fn(plain)).pass && ok;
  out(`\nbuildLease({}) ≡ reference: ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) bad += 1;
}

await group('R3-L · process-lifetime writer lease', LEASE_FALSIFIERS, LEASE_REFERENCE, LEASE_CANDIDATES);
await group('R3-T · tail-tolerant grant-ledger reader + single-write append', TAIL_FALSIFIERS, TAIL_REFERENCE, TAIL_CANDIDATES);
await group('R3-C · honest reason for CLAIMED on ROUTED (relabel only)', REASON_FALSIFIERS, REASON_REFERENCE, REASON_CANDIDATES);
await group('R3-S · refused invalidate / consume returns are surfaced', SETTLEMENT_FALSIFIERS, SETTLEMENT_REFERENCE, SETTLEMENT_CANDIDATES);

await classA('Class A · canonical grant-ledger reader as it stands (read laws only; append is not exported, so R3-T2\'s append half and R3-T4…T6 are not run)',
  { 'R3-T1': TAIL_FALSIFIERS['R3-T1'], 'R3-T3': TAIL_FALSIFIERS['R3-T3'] },
  TAIL_CURRENT, ['R3-T1', 'R3-T3']);
await classA('Class A · Path B classifier as it stands', REASON_FALSIFIERS, REASON_CURRENT, ['R3-C1']);
out('\nNot Class A: the lease (no lease exists today — its absence is the finding) · settlement surfacing');
out('(the ignored returns live inside canonicalConfirmAuthorizedExecution; DC-S1/DC-S3 model that shape).');

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · CLASS A AS PREDICTED' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
