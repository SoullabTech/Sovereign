/**
 * WS2-07-F1 ACT 3 — FIXED-CLAIM WITNESS · the classifier alone, three times.
 *
 * FOUNDER CONTRACT (2026-09-04):
 *   lens              development
 *   doesNotEstablish  editorial-consequence      (the same for all 21)
 *   model             the pinned reader model
 *   reader            NOT CALLED
 *   classifier        -04 (the -03 run is recorded and superseded)
 *   three independent acts, exactly one classifier call each, over the
 *   identical 21-item array. NO RETRIES around `unclassifiable`.
 *
 * WHAT THIS WITNESS MAY PROVE
 *   - all three acts received byte-identical complete classifier requests
 *   - CLASSIFIER_VERSION is DEVELOPMENTAL-PHENOMENON-04
 *   - every disambiguation rule is rendered
 *   - no family change, no reader change
 *   - whether each exact claim stabilises or still varies under identical input
 *
 * WHAT IT MAY NOT CLAIM — and does not:
 *   that these labels reproduce, confirm or correct the original live 21
 *   placements. The original per-claim `doesNotEstablish` values were never
 *   captured, so the input here is controlled and synthetic, not historical.
 *   No check below compares a label to what PHENOMENON-02 produced.
 *
 *   ANTHROPIC_API_KEY=... npx tsx scripts/ws2-07-f1-act3-fixed-claim-witness.ts [--acts 3] [--model claude-opus-5] [--out FILE]
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

/** Founder-specified. One value, identical for all 21, so it cannot steer one
 *  claim's placement differently from another's. NOT a reconstruction of the
 *  historical per-claim values, which were never captured. */
const DECLARED_NON_CONCLUSIONS: readonly DevelopmentalNonConclusion[] = ['editorial-consequence'];

const LENS = 'development' as const;

/** The eight, as ratified. A change here is a family change. */
const EXPECTED_FAMILY = [
  'recurrence', 'unresolved-thread', 'register-shift', 'prospective-reference',
  're-explanation-first-mention', 'movement', 'term-drift', 'positional-asymmetry',
] as const;

/** The Act 3 refinements, each identified by a phrase that must render.
 *  Four landed under -03; the last two were added under -04 after the -03
 *  fixed-claim run failed on act1/o3 and on the recurrence/movement overlap. */
const ACT3_RULES: readonly { id: string; needle: string }[] = [
  { id: 'predicate-not-subject', needle: 'DEVELOPMENTAL PREDICATE' },
  { id: 'unresolved-thread/movement', needle: 'unresolved thread / movement' },
  { id: 'movement/term-drift', needle: 'movement / term drift' },
  { id: 'recurrence-specificity', needle: 'recurrence / anything more specific' },
  { id: 'recurrence/movement', needle: 'recurrence / movement' },
  { id: 'unresolved-thread-tightened', needle: 'UNRESOLVED THREAD, TIGHTENED' },
];

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

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY must be in the environment (never printed)');
    process.exit(2);
  }
  if (process.env.MAIA_INFERENCE_MODE && process.env.MAIA_INFERENCE_MODE !== 'primary') {
    console.error(`MAIA_INFERENCE_MODE=${process.env.MAIA_INFERENCE_MODE} - this needs the primary seam`);
    process.exit(2);
  }

  const actCount = Math.max(1, parseInt(arg('acts', '3'), 10));
  const model = arg('model', 'claude-opus-5');
  const out = arg('out', '');
  const claims = WS2_07_F1_CAPTURED_CLAIMS;

  console.log('\nWS2-07-F1 ACT 3 - fixed-claim witness');
  console.log(`  ${CLASSIFIER_VERSION} · promptHash ${classifierPromptHash().slice(0, 12)}`);
  console.log(`  ${claims.length} frozen claims · lens ${LENS} · doesNotEstablish ${DECLARED_NON_CONCLUSIONS.join(',')}`);
  console.log(`  ${actCount} independent act(s) · ${model} · reader NOT called\n`);

  /* ---- J0 fixture ------------------------------------------------------- */
  const distinct = new Set(claims.map((c) => c.text)).size;
  check('J0', 'the frozen claim set is the captured twenty-one, all distinct',
    claims.length === 21 && distinct === 21 && claims.every((c) => c.text.trim().length > 0),
    `${claims.length} claims · ${distinct} distinct texts · acts of origin ${[...new Set(claims.map((c) => c.act))].join(',')}`);

  /* ---- J1 classifier version -------------------------------------------- */
  check('J1', 'classifier is at the Act 3 version',
    CLASSIFIER_VERSION === 'DEVELOPMENTAL-PHENOMENON-04',
    `CLASSIFIER_VERSION=${CLASSIFIER_VERSION}`);

  /* ---- J2 the four rules render ----------------------------------------- */
  const missingRules = ACT3_RULES.filter((r) => !CLASSIFIER_SYSTEM.includes(r.needle));
  check('J2', 'every Act 3 disambiguation rule is rendered to the model',
    missingRules.length === 0,
    missingRules.length === 0
      ? ACT3_RULES.map((r) => r.id).join(' · ')
      : `missing: ${missingRules.map((r) => r.id).join(', ')}`);

  /* ---- J3 no family change ---------------------------------------------- */
  const familyOk = DEVELOPMENTAL_PHENOMENA.length === EXPECTED_FAMILY.length
    && EXPECTED_FAMILY.every((p) => (DEVELOPMENTAL_PHENOMENA as readonly string[]).includes(p));
  check('J3', 'the phenomenon family is unchanged - exactly the ratified eight',
    familyOk, `${DEVELOPMENTAL_PHENOMENA.length} phenomena: ${DEVELOPMENTAL_PHENOMENA.join(', ')}`);

  /* ---- J4 no reader change ---------------------------------------------- */
  check('J4', 'the reader is untouched by Act 3',
    READER_VERSION === 'DEVELOPMENTAL-READER-02',
    `READER_VERSION=${READER_VERSION} (Act 3 is classifier-only)`);

  /* ---- the acts --------------------------------------------------------- */
  const payload: ClaimToClassify[] = claims.map((c) => ({
    text: c.text, doesNotEstablish: DECLARED_NON_CONCLUSIONS,
  }));

  /* The complete request: system + tool contract + rendered user turn. */
  const SEP = String.fromCharCode(0);
  const requestDigest = (): string => createHash('sha256')
    .update(CLASSIFIER_SYSTEM, 'utf8').update(SEP)
    .update(JSON.stringify(classifierTool()), 'utf8').update(SEP)
    .update(renderClassificationRequest(payload, LENS), 'utf8')
    .digest('hex');

  const digests: string[] = [];
  const labels: (readonly DevelopmentalPhenomenon[] | null)[] = [];
  const refusals: { act: number; refusal: string; detail: string; index: number | null }[] = [];

  for (let a = 1; a <= actCount; a++) {
    digests.push(requestDigest());
    process.stdout.write(`  act ${a}/${actCount} ... `);
    const r = await classifyClaims(payload, LENS, model);   /* one call. no retry. */
    if (!r.ok) {
      refusals.push({ act: a, refusal: r.refusal, detail: r.detail, index: r.index });
      labels.push(null);
      console.log(`REFUSED (${r.refusal}${r.index === null ? '' : ` at claim ${r.index}`})`);
      continue;
    }
    labels.push(r.phenomena);
    console.log(`${r.phenomena.length} classified`);
  }

  /* ---- J5 byte-identical requests --------------------------------------- */
  const uniqueDigests = [...new Set(digests)];
  check('J5', 'all acts received byte-identical complete classifier requests',
    uniqueDigests.length === 1,
    uniqueDigests.length === 1
      ? `one request digest across ${digests.length} act(s): ${uniqueDigests[0]!.slice(0, 16)}`
      : `${uniqueDigests.length} distinct digests - the input was not held constant`);

  /* ---- J6 no refusal, no unclassifiable --------------------------------- */
  check('J6', 'no act refused and no claim was unclassifiable',
    refusals.length === 0,
    refusals.length === 0
      ? `${labels.filter(Boolean).length}/${actCount} acts classified all ${claims.length}`
      : refusals.map((r) => `act ${r.act}: ${r.refusal}${r.index === null ? '' : ` @${r.index}`} - ${r.detail}`).join(' | '));

  /* ---- per-claim table --------------------------------------------------- */
  console.log('\nPER-CLAIM PLACEMENT (measurement - not gated, and not compared to the -02 run)\n');
  const rows = claims.map((c, i) => {
    const got = labels.map((l) => (l ? l[i]! : '(refused)'));
    const uniq = [...new Set(got)];
    return { id: `act${c.act}/${c.key}`, subject: c.subject, text: c.text, got, stable: uniq.length === 1, uniq };
  });
  for (const r of rows) {
    console.log(`  ${r.id}  [${r.subject}]`);
    console.log(`      ${r.text}`);
    r.got.forEach((g, i) => console.log(`      act${i + 1}: ${g}`));
    console.log(`      stable? ${r.stable ? 'yes' : 'NO'}\n`);
  }
  const varying = rows.filter((r) => !r.stable);
  console.log(`  ${rows.length - varying.length}/${rows.length} claims placed identically across ${labels.filter(Boolean).length} act(s)`);

  /* ---- founder review flags --------------------------------------------- */
  console.log('\nFLAGS FOR FOUNDER REVIEW');
  console.log('  (the last three are surfaces for judgement, not machine verdicts -');
  console.log('   whether a sense actually changed, or a more specific predicate applies,');
  console.log('   is a reading, and this script does not make it.)\n');

  const unclass = refusals.filter((r) => r.refusal === 'classifier_unclassifiable');
  console.log(`  [1] unclassifiable anywhere: ${unclass.length === 0 ? 'none' : unclass.map((r) => `act ${r.act} @claim ${r.index}`).join(', ')}`);

  const termDrift = rows.filter((r) => r.got.includes('term-drift'));
  console.log(`  [2] term-drift placements to check the term's sense actually changed: ${termDrift.length === 0 ? 'none' : ''}`);
  for (const r of termDrift) console.log(`        ${r.id} [${r.subject}] acts: ${r.got.join(', ')}`);

  const recur = rows.filter((r) => r.got.includes('recurrence'));
  console.log(`  [3] recurrence placements to check no more specific predicate applies: ${recur.length === 0 ? 'none' : ''}`);
  for (const r of recur) console.log(`        ${r.id} [${r.subject}] acts: ${r.got.join(', ')}`);

  const utVsMove = rows.filter((r) => r.uniq.includes('unresolved-thread') && r.uniq.includes('movement'));
  console.log(`  [4] unresolved-thread vs movement disagreement within one claim: ${utVsMove.length === 0 ? 'none' : ''}`);
  for (const r of utVsMove) console.log(`        ${r.id} [${r.subject}] acts: ${r.got.join(', ')}`);

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length} checks · ${failed.length} failures${failed.length ? ` · ${failed.map((f) => f.id).join(', ')}` : ''}\n`);

  if (out) {
    writeFileSync(out, JSON.stringify({
      lane: 'WS2-07-F1', kind: 'act3-fixed-claim-witness',
      classifierVersion: CLASSIFIER_VERSION, promptHash: classifierPromptHash(),
      readerVersion: READER_VERSION, readerCalled: false,
      model, lens: LENS, acts: actCount,
      declaredNonConclusions: DECLARED_NON_CONCLUSIONS,
      requestDigest: uniqueDigests.length === 1 ? uniqueDigests[0] : uniqueDigests,
      doesNotClaim: 'that these labels reproduce, confirm or correct the original live 21 placements; the historical per-claim doesNotEstablish values were never captured',
      ranAt: new Date().toISOString(),
      checks, refusals, rows,
      failures: failed.map((f) => f.id),
    }, null, 2) + '\n');
    console.log(`record: ${out}`);
  }
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
