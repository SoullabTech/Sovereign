#!/usr/bin/env node
/**
 * Domain B v2 scorer — SEPARATE FILE, by requirement.
 *
 *   node src/score-v2.mjs --run <run.json> [--json]
 *   node src/score-v2.mjs --selftest
 *
 * `score.mjs` (v1, 57196417895a6664) is NOT edited and NOT imported. v1↔v2
 * composition comparability depends on the v1 scorer being byte-stable, so
 * applicability is added by writing a new scorer, never by extending the old
 * one. Duplication is the mechanism that makes "must not alter or absorb the
 * existing composition score" structural rather than a promise.
 *
 * ============================================================================
 * APPLICABILITY IS A GATE, NOT MERELY A DIMENSION
 * ============================================================================
 *   operator pair
 *      -> applicability judgment
 *      -> DEFINED? -- no --> score applicability ONLY
 *          |
 *         yes
 *          -> step judgments -> composite judgment -> change taxonomy
 *
 * A system that correctly says "this composition does not exist" must not then
 * be penalized on a change-label task that is meaningless given its own answer.
 * So the gate keys on the SYSTEM'S OWN applicability judgment, not on ground
 * truth: when it declares a pair non-DEFINED, that pair's downstream labels are
 * RECORDED and reported (`gated_out`) but excluded from every composition
 * figure. Recorded, not interpreted.
 *
 * Ground-truth-blocked pairs have no triple in the corpus at all, so there is
 * nothing downstream for them by construction — the gate exists for the case
 * where the system declines a composition the corpus does provide.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B2 = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-v2-corpus.json'), 'utf8'));

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const norm = (t) => [...new Set(t ?? [])].sort();
const tally = () => ({ correct: 0, scorable: 0, unanswered: 0 });
const rate = (t) => (t.scorable ? +(t.correct / t.scorable).toFixed(4) : null);

export function scoreV2(run) {
  /* ---------------- applicability (its own dimension) ---------------- */
  const appAns = Object.fromEntries(
    (run.applicability ?? []).map((r) => [r.item_id, (r.value ?? '').toString().trim().toUpperCase()]),
  );

  const app = { overall: tally(), DEFINED: tally(), UNDEFINED: tally(), INAPPLICABLE: tally() };
  const confusion = {};                 // "TRUTH->ANSWER": n
  const declined = new Set();           // pairs the SYSTEM called non-DEFINED
  const outOfVocabApp = [];

  for (const it of B2.applicability) {
    const got = appAns[it.item_id];
    const pair = `${it.seed_id}::${it.t1}.${it.t2}`;
    if (got === undefined) { app.overall.unanswered++; app[it.ground_truth].unanswered++; continue; }
    if (!B2.applicability_values.includes(got)) outOfVocabApp.push(`${it.item_id}=${got}`);

    app.overall.scorable++;
    app[it.ground_truth].scorable++;
    const ok = got === it.ground_truth;
    if (ok) { app.overall.correct++; app[it.ground_truth].correct++; }
    else confusion[`${it.ground_truth}->${got}`] = (confusion[`${it.ground_truth}->${got}`] || 0) + 1;

    // THE GATE. Keyed on the system's answer, not on truth.
    if (got !== 'DEFINED') declined.add(pair);
  }

  /* ---------------- composition (gated) ---------------- */
  const bAns = {};
  const outOfVocabB = [];
  const VOCAB = new Set(B2.change_vocabulary);
  for (const r of run.domain_b ?? []) {
    const toks = norm(r.tokens);
    for (const t of toks) if (!VOCAB.has(t)) outOfVocabB.push(`${r.triple_id}::${r.role}=${t}`);
    bAns[`${r.triple_id}::${r.role}`] = toks;
  }

  const b = {
    step_accuracy: tally(),
    composition_consistency: tally(),
    identity_return: tally(),
    order_sensitive: tally(),
    information_loss: tally(),
  };
  const CLS_BUCKET = {
    composition_returns_identity: 'identity_return',
    composition_order_sensitive: 'order_sensitive',
    composition_information_losing: 'information_loss',
  };

  let stepsRightCompositeWrong = 0;
  let stepsRightCompositeRight = 0;
  const gated = { pairs: 0, change_items_recorded: 0 };

  for (const t of B2.triples) {
    const pair = `${t.seed_id}::${t.t1}.${t.t2}`;

    if (declined.has(pair)) {
      // Recorded, NOT interpreted. Never enters a composition figure, and never
      // counts as unanswered either — the system answered a prior question that
      // makes this one moot.
      gated.pairs++;
      for (const it of t.items) if (bAns[`${t.triple_id}::${it.role}`] !== undefined) gated.change_items_recorded++;
      continue;
    }

    const got = {};
    for (const it of t.items) got[it.role] = bAns[`${t.triple_id}::${it.role}`];

    for (const role of ['step1', 'step2']) {
      const it = t.items.find((i) => i.role === role);
      if (got[role] === undefined) { b.step_accuracy.unanswered++; continue; }
      b.step_accuracy.scorable++;
      if (eq(got[role], norm(it.ground_truth))) b.step_accuracy.correct++;
    }

    const comp = t.items.find((i) => i.role === 'composite');
    if (got.composite === undefined) { b.composition_consistency.unanswered++; continue; }
    b.composition_consistency.scorable++;
    const ok = eq(got.composite, norm(comp.ground_truth));
    if (ok) b.composition_consistency.correct++;

    const sub = CLS_BUCKET[t.composition_class];
    if (sub) { b[sub].scorable++; if (ok) b[sub].correct++; }

    const s1 = got.step1 !== undefined && eq(got.step1, norm(t.items[0].ground_truth));
    const s2 = got.step2 !== undefined && eq(got.step2, norm(t.items[1].ground_truth));
    if (s1 && s2) (ok ? stepsRightCompositeRight++ : stepsRightCompositeWrong++);
  }

  const fmt = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { ...v, rate: rate(v) }]));

  return {
    corpus: { version: B2.version, triples: B2.counts.triples, applicability_items: B2.counts.applicability_probe_items },
    applicability: {
      ...fmt(app),
      confusion,
      undefined_vs_inapplicable:
        (confusion['UNDEFINED->INAPPLICABLE'] || 0) + (confusion['INAPPLICABLE->UNDEFINED'] || 0),
      out_of_vocab: outOfVocabApp.length,
    },
    gate: {
      ...gated,
      note: 'Pairs the system itself judged non-DEFINED. Downstream change labels are recorded and excluded from every composition figure — never scored as composition reasoning.',
    },
    composition: {
      ...fmt(b),
      steps_correct_composite_wrong: stepsRightCompositeWrong,
      steps_correct_composite_right: stepsRightCompositeRight,
      teeth_available: B2.counts.composite_differs_from_union,
    },
    out_of_vocab_change: outOfVocabB.length,
  };
}

/* ---------------- self-test: prove the gate protects, and still has teeth ---------------- */
function selftest() {
  const oracleApp = B2.applicability.map((a) => ({ item_id: a.item_id, value: a.ground_truth }));
  const oracleB = B2.triples.flatMap((t) =>
    t.items.map((i) => ({ triple_id: t.triple_id, role: i.role, tokens: i.ground_truth })));

  const oracle = { applicability: oracleApp, domain_b: oracleB };

  // Declines every composition, then answers the change task badly anyway.
  const decliner = {
    applicability: B2.applicability.map((a) => ({ item_id: a.item_id, value: 'UNDEFINED' })),
    domain_b: B2.triples.flatMap((t) => t.items.map((i) => ({ triple_id: t.triple_id, role: i.role, tokens: ['roles_reversed'] }))),
  };

  // Correct applicability, but composite = union of steps (the v1 local_matcher).
  const localMatcher = {
    applicability: oracleApp,
    domain_b: B2.triples.flatMap((t) => [
      { triple_id: t.triple_id, role: 'step1', tokens: t.items[0].ground_truth },
      { triple_id: t.triple_id, role: 'step2', tokens: t.items[1].ground_truth },
      { triple_id: t.triple_id, role: 'composite', tokens: norm([...t.items[0].ground_truth, ...t.items[1].ground_truth]) },
    ]),
  };

  const o = scoreV2(oracle), d = scoreV2(decliner), l = scoreV2(localMatcher);
  const fails = [];

  if (o.applicability.overall.rate !== 1) fails.push('oracle not 1.0 on applicability');
  if (o.gate.pairs !== 0) fails.push('oracle gated pairs should be 0');
  if (o.composition.composition_consistency.rate !== 1) fails.push('oracle not 1.0 on composition');

  // THE GATE PROPERTY: a system that declines every composition is scored on
  // applicability only — its bad change labels must not appear anywhere.
  if (d.gate.pairs !== B2.counts.triples) fails.push(`decliner should gate all ${B2.counts.triples} pairs, gated ${d.gate.pairs}`);
  if (d.composition.composition_consistency.scorable !== 0) fails.push('GATE LEAK — decliner has scorable composition items');
  if (d.composition.step_accuracy.scorable !== 0) fails.push('GATE LEAK — decliner has scorable step items');
  if (d.gate.change_items_recorded === 0) fails.push('decliner change labels not recorded — gate must record, not discard');
  if (d.applicability.overall.rate === null || d.applicability.overall.rate >= 1) fails.push('decliner should lose applicability accuracy');

  // Teeth survive gating.
  if (l.composition.composition_consistency.rate === 1) fails.push('local_matcher not caught — composition metric has no teeth');
  if (l.composition.steps_correct_composite_wrong !== B2.counts.composite_differs_from_union) {
    fails.push(`local_matcher caught on ${l.composition.steps_correct_composite_wrong}, expected ${B2.counts.composite_differs_from_union}`);
  }

  console.log('SELF-TEST (v2)');
  console.log(`  oracle         applicability ${o.applicability.overall.correct}/${o.applicability.overall.scorable}  gated ${o.gate.pairs}  composition ${o.composition.composition_consistency.correct}/${o.composition.composition_consistency.scorable}`);
  console.log(`  decliner       applicability ${d.applicability.overall.correct}/${d.applicability.overall.scorable}  gated ${d.gate.pairs}  composition scorable ${d.composition.composition_consistency.scorable}  labels recorded ${d.gate.change_items_recorded}`);
  console.log(`  local_matcher  composition ${l.composition.composition_consistency.correct}/${l.composition.composition_consistency.scorable}  caught ${l.composition.steps_correct_composite_wrong}/${B2.counts.composite_differs_from_union}`);
  for (const f of fails) console.log(`ERROR ${f}`);
  console.log(fails.length ? `\nFAIL — ${fails.length} error(s)` : '\nPASS — gate protects a declining system; teeth survive gating');
  process.exit(fails.length ? 1 : 0);
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();
else {
  const i = argv.indexOf('--run');
  if (i === -1) { console.error('usage: score-v2.mjs --run <run.json> [--json] | --selftest'); process.exit(2); }
  const r = scoreV2(JSON.parse(readFileSync(argv[i + 1], 'utf8')));
  if (argv.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    const line = (k, v) => console.log(`  ${k.padEnd(26)} ${v.correct}/${v.scorable}${v.unanswered ? ` (unanswered ${v.unanswered})` : ''}  ${v.rate ?? '—'}`);
    console.log('APPLICABILITY (gate + dimension)');
    for (const k of ['overall', 'DEFINED', 'UNDEFINED', 'INAPPLICABLE']) line(k, r.applicability[k]);
    console.log(`  UNDEFINED<->INAPPLICABLE confusions  ${r.applicability.undefined_vs_inapplicable}`);
    console.log(`GATE  ${r.gate.pairs} pair(s) declined by the system — ${r.gate.change_items_recorded} change label(s) recorded, not interpreted`);
    console.log('COMPOSITION (gated)');
    for (const [k, v] of Object.entries(r.composition)) if (v && typeof v === 'object') line(k, v);
    console.log(`  steps-right / composite-wrong  ${r.composition.steps_correct_composite_wrong}  (teeth ${r.composition.teeth_available})`);
    console.log(`OUT-OF-VOCAB  applicability ${r.applicability.out_of_vocab} · change ${r.out_of_vocab_change}`);
  }
}
