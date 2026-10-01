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
import { REASON_FALSIFIERS, SETTLEMENT_FALSIFIERS } from './settlement-falsifiers.mjs';
import { TAIL_FALSIFIERS } from './tail-falsifiers.mjs';
import { TAIL_REFERENCE, TAIL_CANDIDATES } from './tail-reference-candidates.mjs';
import { readCanonicalGrantLedgerV1 } from '../../../scripts/builder/canonical-provider-execution-grant-store-v1.mjs';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Class A adapter over the REAL reader (unfrozen). The frozen TAIL_CURRENT adapter hard-codes
 * `uncommitted_tail: null` because the pre-R3 reader had no such concept, so it can never show
 * the flip; this one reports what the real reader now reports (raw bytes decoded for the model).
 */
const CURRENT_READER = Object.freeze({
  parse(text) {
    const home = mkdtempSync(path.join(os.tmpdir(), 'o5r3-classa-'));
    try {
      mkdirSync(path.join(home, 'work-units-v2', 'execution-grants'), { recursive: true });
      writeFileSync(path.join(home, 'work-units-v2', 'execution-grants', 'wu-o5r3.jsonl'), text);
      const r = readCanonicalGrantLedgerV1('wu-o5r3', { home });
      const t = r.uncommitted_tail;
      return { events: r.events, uncommitted_tail: t ? { bytes: Buffer.from(t.bytes_b64, 'base64').toString('utf8'), offset: t.offset } : null };
    } finally { rmSync(home, { recursive: true, force: true }); }
  },
});
import {
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
    let why = '';
    for (const id of ids) {
      const r = await falsifiers[id](subjectOf(c));
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

await group('R3-L / R3-D · process-lifetime writer lease over the grant authority domain', LEASE_FALSIFIERS, LEASE_REFERENCE, LEASE_CANDIDATES);
await group('R3-T · grant-ledger tail: commit marker · single write · quarantine-before-truncate · no repair of history', TAIL_FALSIFIERS, TAIL_REFERENCE, TAIL_CANDIDATES);
await group('R3-C · honest reason for CLAIMED on ROUTED (relabel only)', REASON_FALSIFIERS, REASON_REFERENCE, REASON_CANDIDATES);
await group('R3-S · refused invalidate / consume returns are surfaced', SETTLEMENT_FALSIFIERS, SETTLEMENT_REFERENCE, SETTLEMENT_CANDIDATES);

// ⭐ Predictions FLIPPED at implementation (FREEZE.json anticipated this, in the open): before R3
// the canonical reader was RED on R3-T1/T3 and the classifier RED on R3-C1; after R3 all must PASS.
await classA('Class A · canonical grant-ledger reader AFTER R3 (read laws; append laws are witnessed by the integration proof)',
  { 'R3-T1': TAIL_FALSIFIERS['R3-T1'], 'R3-T3': TAIL_FALSIFIERS['R3-T3'] },
  CURRENT_READER, []);
await classA('Class A · Path B classifier AFTER R3', REASON_FALSIFIERS, REASON_CURRENT, []);
out('\nNot Class A here: the lease, store enforcement, append-lock compatibility, the fsync barrier and settlement');
out('surfacing are witnessed against the REAL stores by scripts/builder/__tests__/o5-r3-grant-writer-proof.mjs.');

out(`\n${bad === 0 ? 'MATRIX LETHAL + DISCRIMINATING · CLASS A AS PREDICTED' : `MATRIX DEFECT (${bad})`}`);
process.exit(bad === 0 ? 0 : 1);
