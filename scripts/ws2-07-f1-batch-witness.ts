/**
 * WS2-07-F1 — PRODUCTION-SHAPED FIXED-BATCH WITNESS
 *
 * WHY THIS EXISTS. The fixed-21 stress witness (record:
 * WS2-07-F1_PHENOMENON-04_FIXED21_STRESS_WITNESS_2026-09-04.md) batched all 21
 * claims from THREE independent readings into one classifier request. Nothing
 * in production ever does that: one commission yields one reading, and the
 * classifier receives only that reading's claims, in one call. `act1/o3` was
 * therefore classified alongside two sibling readings of the same manuscript
 * material — both of which state non-recurrence in their own text, while
 * `act1/o3` does not. The measurement created a condition under which
 * cross-claim contamination is structurally possible.
 *
 * FOUNDER RULING (2026-09-04): change the measurement, not the model.
 *
 *   batch A   original act 1 claims · 7
 *   batch B   original act 2 claims · 7
 *   batch C   original act 3 claims · 7
 *
 * Each batch is classified THREE times, identically. Nine calls, each with the
 * shape production actually has:  ONE READING -> its claims -> ONE classifier
 * call. When `act1/o3` is tested, its two "does not recur later" siblings are
 * not in its context.
 *
 * SEMANTICS ARE FROZEN. This script does not touch classify.ts, does not edit
 * a rule, and does not gate on any expected label. It changes only what the
 * classifier is shown.
 *
 * WHAT IT MAY NOT CLAIM — and does not: that these labels reproduce, confirm or
 * correct the original live placements. The historical per-claim
 * `doesNotEstablish` was never captured, so `editorial-consequence` is a
 * founder-specified substitution and the input is controlled, not historical.
 *
 *   ANTHROPIC_API_KEY=... npx tsx scripts/ws2-07-f1-batch-witness.ts [--runs 3] [--model claude-opus-5] [--out FILE]
 */

import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import {
  CLASSIFIER_SYSTEM,
  CLASSIFIER_VERSION,
  classifierPromptHash,
  classifierTool,
  classifyClaims,
  renderClassificationRequest,
  type ClaimToClassify,
} from '../lib/manuscript/developmentalReading/classify';
import {
  DEVELOPMENTAL_PHENOMENA,
  type DevelopmentalPhenomenon,
} from '../lib/manuscript/developmentalReading/contract';
import { WS2_07_F1_CAPTURED_CLAIMS } from '../lib/manuscript/developmentalReading/__fixtures__/ws2-07-f1-claims';
import { READER_VERSION } from '../lib/manuscript/developmentalReader/render';
import type { DevelopmentalNonConclusion } from '../lib/manuscript/developmentalReader/contract';

const DECLARED_NON_CONCLUSIONS: readonly DevelopmentalNonConclusion[] = ['editorial-consequence'];
const LENS = 'development' as const;

const EXPECTED_FAMILY = [
  'recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
  're-explanation-first-mention', 'movement', 'term-drift', 'positional-asymmetry',
] as const;

/** Refusals that are a MEASUREMENT, not a gate failure. Exactly one: the
 *  refuse-whole behaviour the ruling preserved. Everything else is a seam or
 *  contract failure and fails K5. */
const MEASURED_NOT_FAILED = new Set(['classifier_unclassifiable']);

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback;
};

interface Check { id: string; label: string; ok: boolean; detail: string }
const checks: Check[] = [];
const check = (id: string, label: string, ok: boolean, detail: string) => {
  checks.push({ id, label, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${label}\n      ${detail}`);
};

interface RunOutcome {
  run: number;
  digest: string;
  labels: readonly DevelopmentalPhenomenon[] | null;
  refusal: { refusal: string; detail: string; index: number | null } | null;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY must be in the environment (never printed)');
    process.exit(2);
  }
  if (process.env.MAIA_INFERENCE_MODE && process.env.MAIA_INFERENCE_MODE !== 'primary') {
    console.error(`MAIA_INFERENCE_MODE=${process.env.MAIA_INFERENCE_MODE} - this needs the primary seam`);
    process.exit(2);
  }

  const runs = Math.max(1, parseInt(arg('runs', '3'), 10));
  const model = arg('model', 'claude-opus-5');
  const out = arg('out', '');

  /* Split the frozen 21 back into the three readings they came from. */
  const BATCHES = ([1, 2, 3] as const).map((act, i) => ({
    id: 'ABC'[i]!,
    act,
    claims: WS2_07_F1_CAPTURED_CLAIMS.filter((c) => c.act === act),
  }));

  console.log('\nWS2-07-F1 - production-shaped fixed-batch witness');
  console.log(`  ${CLASSIFIER_VERSION} · promptHash ${classifierPromptHash().slice(0, 12)}`);
  console.log(`  batches ${BATCHES.map((b) => `${b.id}=${b.claims.length}`).join(' ')} · ${runs} run(s) each · ${model}`);
  console.log(`  lens ${LENS} · doesNotEstablish ${DECLARED_NON_CONCLUSIONS.join(',')} · reader NOT called\n`);

  /* ---- K0 three frozen seven-claim batches ------------------------------ */
  const shapeOk = BATCHES.length === 3 && BATCHES.every((b) => b.claims.length === 7);
  const total = BATCHES.reduce((n, b) => n + b.claims.length, 0);
  check('K0', 'exactly three frozen seven-claim batches, one per original reading',
    shapeOk && total === 21,
    BATCHES.map((b) => `${b.id}: act ${b.act}, ${b.claims.length} claims`).join(' · '));

  /* ---- K1 classifier version -------------------------------------------- */
  check('K1', 'classifier is at PHENOMENON-04, unedited',
    CLASSIFIER_VERSION === 'DEVELOPMENTAL-PHENOMENON-04',
    `CLASSIFIER_VERSION=${CLASSIFIER_VERSION}`);

  /* ---- K2 reader untouched and never called ----------------------------- */
  check('K2', 'reader is READER-02 and is not called by this witness',
    READER_VERSION === 'DEVELOPMENTAL-READER-02',
    `READER_VERSION=${READER_VERSION} · no reader import beyond this version constant`);

  /* ---- K3 family -------------------------------------------------------- */
  const familyOk = DEVELOPMENTAL_PHENOMENA.length === EXPECTED_FAMILY.length
    && EXPECTED_FAMILY.every((p) => (DEVELOPMENTAL_PHENOMENA as readonly string[]).includes(p));
  check('K3', 'the phenomenon family is exactly the ratified eight',
    familyOk, `${DEVELOPMENTAL_PHENOMENA.length}: ${DEVELOPMENTAL_PHENOMENA.join(', ')}`);

  /* ---- run the nine calls ------------------------------------------------ */
  const SEP = String.fromCharCode(0);
  const digestOf = (payload: readonly ClaimToClassify[]): string => createHash('sha256')
    .update(CLASSIFIER_SYSTEM, 'utf8').update(SEP)
    .update(JSON.stringify(classifierTool()), 'utf8').update(SEP)
    .update(renderClassificationRequest(payload, LENS), 'utf8')
    .digest('hex');

  let callCount = 0;
  const results: { id: string; act: number; payload: ClaimToClassify[]; outcomes: RunOutcome[] }[] = [];

  for (const b of BATCHES) {
    const payload: ClaimToClassify[] = b.claims.map((c) => ({
      text: c.text, doesNotEstablish: DECLARED_NON_CONCLUSIONS,
    }));
    const outcomes: RunOutcome[] = [];
    for (let r = 1; r <= runs; r++) {
      process.stdout.write(`  batch ${b.id} run ${r}/${runs} ... `);
      const digest = digestOf(payload);
      callCount += 1;
      const res = await classifyClaims(payload, LENS, model);   /* one call. no retry, ever. */
      if (!res.ok) {
        outcomes.push({ run: r, digest, labels: null, refusal: { refusal: res.refusal, detail: res.detail, index: res.index } });
        console.log(`REFUSED (${res.refusal}${res.index === null ? '' : ` at claim ${res.index}`})`);
        continue;
      }
      outcomes.push({ run: r, digest, labels: res.phenomena, refusal: null });
      console.log(`${res.phenomena.length} classified`);
    }
    results.push({ id: b.id, act: b.act, payload, outcomes });
  }

  /* ---- K4 each batch's request constant across its repetitions ---------- */
  const perBatchDigests = results.map((b) => ({ id: b.id, uniq: [...new Set(b.outcomes.map((o) => o.digest))] }));
  const k4 = perBatchDigests.every((b) => b.uniq.length === 1);
  check('K4', 'each batch request is byte-identical across its repetitions',
    k4,
    perBatchDigests.map((b) => `${b.id}:${b.uniq.length === 1 ? b.uniq[0]!.slice(0, 12) : `${b.uniq.length} DISTINCT`}`).join(' · '));

  /* ---- K5 no seam or contract failure (unclassifiable is measured) ------- */
  const hardFailures = results.flatMap((b) => b.outcomes
    .filter((o) => o.refusal && !MEASURED_NOT_FAILED.has(o.refusal.refusal))
    .map((o) => `${b.id}/run${o.run}: ${o.refusal!.refusal} - ${o.refusal!.detail}`));
  check('K5', 'no malformed, provider, index or model-seam failure',
    hardFailures.length === 0,
    hardFailures.length === 0 ? `${callCount} call(s), none failed on contract or seam` : hardFailures.join(' | '));

  /* ---- K6 no retries ----------------------------------------------------- */
  check('K6', 'exactly one classifier call per batch-run, no retries',
    callCount === BATCHES.length * runs,
    `${callCount} call(s) for ${BATCHES.length} batch(es) x ${runs} run(s)`);

  /* ---- per-claim table --------------------------------------------------- */
  console.log('\nPER-CLAIM PLACEMENT (measurement - no expected-label gate)\n');
  const rows = results.flatMap((b) =>
    b.payload.map((_, i) => {
      const src = WS2_07_F1_CAPTURED_CLAIMS.filter((c) => c.act === b.act)[i]!;
      const got = b.outcomes.map((o) => (o.labels ? o.labels[i]! : `(${o.refusal!.refusal})`));
      const uniq = [...new Set(got)];
      return { batch: b.id, id: `act${src.act}/${src.key}`, subject: src.subject, text: src.text, got, stable: uniq.length === 1, uniq };
    }));
  for (const r of rows) {
    console.log(`  [batch ${r.batch}]  ${r.id}  [${r.subject}]`);
    r.got.forEach((g, i) => console.log(`      run${i + 1}: ${g}`));
    console.log(`      stable? ${r.stable ? 'yes' : 'NO'}`);
  }
  const varying = rows.filter((r) => !r.stable);
  console.log(`\n  ${rows.length - varying.length}/${rows.length} claims placed identically across ${runs} run(s) of their own batch`);
  if (varying.length) for (const r of varying) console.log(`      VARIES  ${r.id} [${r.subject}]  ${r.got.join(' · ')}`);

  /* ---- measured, never gated -------------------------------------------- */
  const unclass = results.flatMap((b) => b.outcomes
    .filter((o) => o.refusal?.refusal === 'classifier_unclassifiable')
    .map((o) => `${b.id}/run${o.run} @claim ${o.refusal!.index}`));
  console.log(`\n  unclassifiable (measured, never failed): ${unclass.length === 0 ? 'none' : unclass.join(', ')}`);

  /* ---- the claim this witness was built for ------------------------------ */
  const target = rows.find((r) => r.id === 'act1/o3');
  if (target) {
    console.log(`\n  act1/o3 in batch A, without its two "does not recur later" siblings in context:`);
    console.log(`      ${target.got.join(' · ')}  ${target.stable ? '(stable)' : '(VARIES)'}`);
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length} checks · ${failed.length} failures${failed.length ? ` · ${failed.map((f) => f.id).join(', ')}` : ''}\n`);

  if (out) {
    writeFileSync(out, JSON.stringify({
      lane: 'WS2-07-F1', kind: 'production-shaped-fixed-batch-witness',
      classifierVersion: CLASSIFIER_VERSION, promptHash: classifierPromptHash(),
      readerVersion: READER_VERSION, readerCalled: false,
      model, lens: LENS, runsPerBatch: runs, calls: callCount,
      declaredNonConclusions: DECLARED_NON_CONCLUSIONS,
      batchDigests: perBatchDigests,
      doesNotClaim: 'that these labels reproduce, confirm or correct the original live 21 placements; the historical per-claim doesNotEstablish values were never captured',
      ranAt: new Date().toISOString(),
      checks, rows, unclassifiable: unclass,
      failures: failed.map((f) => f.id),
    }, null, 2) + '\n');
    console.log(`record: ${out}`);
  }
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
