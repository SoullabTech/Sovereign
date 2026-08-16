#!/usr/bin/env node
/**
 * JARVIS EPISTEMIC CI — the authoritative admission gate.
 *
 * Founder ruling 2026-08-16:
 *   "The PR supplies the claim record. Canonical supplies the prior epistemic
 *    history. CI independently recomputes the adjudication."
 *
 * This file NEVER modifies epistemic-guard.mjs; it invokes it as a subprocess so
 * the admitted guard artifact stays byte-identical to its preserved blob.
 *
 * AUTHORITATIVE FLOW
 *   target canonical SHA → canonical ledger history (trusted prior state)
 *                        → CI adjudicator ◀── PR claim record(s)
 *                        → independently computed result
 *                        → compare against the PR's proposed ledger delta
 *
 * FAIL CLOSED — every one of these BLOCKS:
 *   missing claim · malformed claim · guard unavailable · refused claim
 *   · history mutation · ledger-delta mismatch
 *
 * SCOPE, exactly and no further:
 *   Axis 1 enforced in authoritative CI against submitted, well-formed claim
 *   records, with canonical ledger history available to G5.
 *
 *   NOT: that claims are true. NOT: that fabricated evidence is detected
 *   (§3 — evidence fields are self-declared; form and class are checked, not
 *   veracity). NOT: that inadmissible claims cannot enter by any other route.
 *
 * Usage:
 *   node scripts/builder/epistemic-ci.mjs --base <sha> [--head <sha>] [--json]
 */

import { readFileSync, existsSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const GUARD = 'scripts/builder/epistemic-guard.mjs';
const LEDGER = '.ain/epistemic-ledger.jsonl';
const CLAIMS_DIR = '.ain/claims';
const ENFORCEMENT_MODE = 'blocking';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : d; };
const AS_JSON = argv.includes('--json');

const blocks = [];
const block = (rule, why, required) => blocks.push({ rule, why, required });
const note = [];

// ── resolve the target canonical base ────────────────────────────────────────
const BASE = arg('--base', process.env.JARVIS_BASE_SHA || '');
const HEAD = arg('--head', 'HEAD');
if (!BASE) block('BASE-UNRESOLVED', 'no canonical base SHA supplied', 'pass --base <sha> or set JARVIS_BASE_SHA');

const git = (args) => spawnSync('git', args, { encoding: 'utf8' });

// ── 0. guard availability — fail closed, never fail open ─────────────────────
if (!existsSync(GUARD)) {
  block('GUARD-UNAVAILABLE', `${GUARD} is not present in this checkout`, 'restore the guard artifact');
} else {
  const probe = spawnSync('node', [GUARD, 'statuses'], { encoding: 'utf8' });
  if (probe.status !== 0) {
    block('GUARD-UNAVAILABLE', `guard failed to execute (exit ${probe.status})`, 'the guard must run before it can adjudicate');
  }
}

// ── 1. canonical prior history, read from the BASE, never from the PR ────────
let canonicalBytes = '';
if (BASE) {
  const show = git(['show', `${BASE}:${LEDGER}`]);
  canonicalBytes = show.status === 0 ? show.stdout : '';
  if (show.status !== 0) note.push(`canonical ledger absent at ${BASE.slice(0, 12)} — treated as empty (genesis case)`);
}

// ── 2. history mutation — canonical MUST be an exact byte prefix of the PR's ──
const prBytes = existsSync(LEDGER) ? readFileSync(LEDGER, 'utf8') : '';
if (!prBytes.startsWith(canonicalBytes)) {
  const at = [...canonicalBytes].findIndex((c, i) => prBytes[i] !== c);
  block('HISTORY-MUTATION',
    `the PR ledger does not carry canonical history as an exact prefix (first divergence at byte ${at < 0 ? prBytes.length : at})`,
    'append only; never alter, delete, reorder, or regenerate prior canonical rows');
}
const appendedBytes = prBytes.startsWith(canonicalBytes) ? prBytes.slice(canonicalBytes.length) : '';
const appendedRows = appendedBytes.split('\n').filter(Boolean).map((l, i) => {
  try { return JSON.parse(l); } catch { block('LEDGER-MALFORMED', `appended ledger line ${i + 1} is not valid JSON`, 'append one JSON object per line'); return null; }
}).filter(Boolean);

// Structural rows (genesis) are not adjudications and are not compared as such.
// Genesis is a ONE-TIME act at a true beginning; otherwise it would be a channel
// for smuggling unadjudicated rows into canonical history.
const structural = appendedRows.filter((r) => r.type !== 'transition');
const transitions = appendedRows.filter((r) => r.type === 'transition');
for (const s of structural) {
  if (s.type !== 'genesis')
    block('STRUCTURAL-ROW-UNEXPECTED', `appended row of type '${s.type}' is neither a transition nor genesis`,
      'only adjudicated transitions and a single genesis row may enter canonical history');
  else if (canonicalBytes !== '')
    block('STRUCTURAL-ROW-UNEXPECTED', 'a genesis row was appended, but canonical history is not empty',
      'genesis may be declared only at a true beginning; it may never be re-declared');
  else if (appendedRows[0] !== s)
    block('STRUCTURAL-ROW-UNEXPECTED', 'the genesis row is not the first row',
      'genesis must precede every adjudicated row');
}
if (structural.length > 1)
  block('STRUCTURAL-ROW-UNEXPECTED', `${structural.length} structural rows appended`, 'at most one genesis row may ever exist');

// ── 3. claim records — required, not optional. Absence fails closed. ─────────
let claimFiles = [];
if (!existsSync(CLAIMS_DIR)) {
  block('CLAIM-MISSING', `${CLAIMS_DIR} does not exist — a required epistemic run cannot read zero claims as success`,
    `submit at least one claim record under ${CLAIMS_DIR}/`);
} else {
  claimFiles = readdirSync(CLAIMS_DIR).filter((f) => f.endsWith('.json')).sort();
  if (claimFiles.length === 0) {
    block('CLAIM-MISSING', `no claim records found in ${CLAIMS_DIR} — the easiest way around an epistemic guard must not be to skip epistemics`,
      `submit at least one claim record under ${CLAIMS_DIR}/`);
  }
}

// ── 4/5. independently adjudicate, derive expected rows, compare to proposal ──
const tmp = mkdtempSync(path.join(tmpdir(), 'jarvis-ci-'));
const canonicalLedgerFile = path.join(tmp, 'canonical-ledger.jsonl');
writeFileSync(canonicalLedgerFile, canonicalBytes);

const DERIVED_FIELDS = ['type', 'claim_id', 'from', 'to', 'verdict', 'assertion', 'evidence_keys', 'refusals'];
const results = [];

for (const [i, f] of claimFiles.entries()) {
  const p = path.join(CLAIMS_DIR, f);
  let claim;
  try { claim = JSON.parse(readFileSync(p, 'utf8')); }
  catch { block('CLAIM-MALFORMED', `${p} is not valid JSON`, 'a claim record must parse before it can be adjudicated'); continue; }

  if (!claim || typeof claim !== 'object' || !claim.id || !claim.status || !claim.assertion) {
    block('CLAIM-MALFORMED', `${p} lacks required id/status/assertion`, 'use the existing claim-record contract; this wiring does not define a second schema');
    continue;
  }

  // CI recomputes against CANONICAL history — the claimant cannot supply the
  // ledger state against which its own claim is judged. The guard writes into a
  // CI-owned temp ledger seeded from canonical, so the row CI compares against is
  // produced by the guard's own record builder, not re-derived here. Claims are
  // processed in filename order so each sees the prior ones, exactly as the PR
  // would have built the delta.
  const r = spawnSync('node', [GUARD, 'transition', '--claim', p, '--to', claim.status,
    '--ledger', canonicalLedgerFile, '--json'], { encoding: 'utf8' });

  let derivedReturn;
  try { derivedReturn = JSON.parse(r.stdout); }
  catch {
    block('GUARD-UNAVAILABLE', `guard produced no parseable verdict for ${f} (exit ${r.status})`, 'a guard that cannot rule must block, never pass');
    continue;
  }

  // the authoritative row: the last line the guard just wrote to the temp ledger
  const ciRows = readFileSync(canonicalLedgerFile, 'utf8').split('\n').filter(Boolean);
  let derived;
  try { derived = JSON.parse(ciRows[ciRows.length - 1]); }
  catch {
    block('GUARD-UNAVAILABLE', `guard wrote no adjudicated row for ${f}`, 'a guard that cannot record must block, never pass');
    continue;
  }
  derived.verdict = derivedReturn.verdict ?? derived.verdict;

  if (derived.verdict !== 'PERMITTED') {
    block('CLAIM-REFUSED', `${claim.id}: ${derived.verdict} — ${(derived.refusals || []).map((x) => `${x.guard} ${x.rule}`).join(', ')}`,
      (derived.refusals || [])[0]?.required_test || 'supply evidence of the class the requested status requires');
  }

  const proposed = transitions[i];
  if (!proposed) {
    block('LEDGER-DELTA-MISMATCH', `${claim.id}: adjudicated but no corresponding appended ledger row`,
      'append the adjudicated row for every submitted claim, in filename order');
  } else {
    for (const k of DERIVED_FIELDS) {
      const a = JSON.stringify(derived[k] ?? (k === 'type' ? 'transition' : null));
      const b = JSON.stringify(proposed[k] ?? null);
      if (a !== b) block('LEDGER-DELTA-MISMATCH', `${claim.id}: field '${k}' differs from the independently computed result`,
        'the appended row must equal what CI derives; a claimant may not author its own verdict');
    }
    if (!proposed.ts || Number.isNaN(Date.parse(proposed.ts)))
      block('LEDGER-DELTA-MISMATCH', `${claim.id}: row has no valid ISO 'ts'`, 'ts is claimant-supplied and must at least be well-formed');
    if (proposed.enforcement_mode !== ENFORCEMENT_MODE)
      block('LEDGER-DELTA-MISMATCH', `${claim.id}: enforcement_mode is '${proposed.enforcement_mode}', expected '${ENFORCEMENT_MODE}'`,
        'rows entering canonical history are governing adjudications and must say so');
  }
  results.push({ claim: claim.id, verdict: derived.verdict });
}

if (transitions.length > claimFiles.length)
  block('LEDGER-DELTA-MISMATCH', `${transitions.length} adjudicated rows appended for ${claimFiles.length} claim record(s)`,
    'append exactly one adjudicated row per submitted claim');

// ── verdict ──────────────────────────────────────────────────────────────────
const out = {
  gate: 'jarvis-epistemic-ci', enforcement_mode: ENFORCEMENT_MODE,
  base: BASE || null, head: git(['rev-parse', HEAD]).stdout.trim() || null,
  canonical_rows: canonicalBytes.split('\n').filter(Boolean).length,
  claims: claimFiles.length, appended_rows: transitions.length, structural_rows: structural.length,
  results, notes: note, blocks,
  verdict: blocks.length ? 'BLOCKED' : 'PASS',
};

if (AS_JSON) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`JARVIS EPISTEMIC CI — enforcement_mode=${ENFORCEMENT_MODE}`);
  console.log(`base ${(BASE || 'none').slice(0, 12)} · canonical rows ${out.canonical_rows} · claims ${out.claims} · appended ${out.appended_rows}`);
  note.forEach((n) => console.log(`  note: ${n}`));
  results.forEach((r) => console.log(`  ${r.verdict === 'PERMITTED' ? '✓' : '✗'} ${r.claim} → ${r.verdict}`));
  if (blocks.length) {
    console.log(`\n⛔ BLOCKED — ${blocks.length} condition(s):`);
    blocks.forEach((b) => console.log(`  [${b.rule}] ${b.why}\n      required: ${b.required}`));
  } else console.log(`\n✅ PASS — every submitted claim was independently adjudicated and matches the proposed ledger delta.`);
}

process.exit(blocks.length ? 1 : 0);
