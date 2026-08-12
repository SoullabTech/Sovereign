#!/usr/bin/env node
/**
 * Model-agnostic scorer for Domains A and B.
 *
 *   node src/score.mjs --run <run.json> [--json]
 *   node src/score.mjs --selftest
 *
 * KNOWS NOTHING ABOUT ANY PROVIDER. It consumes a normalized answer record:
 *
 *   { "domain_a": [ { "item_id": "A01::A-P1", "answers": { "P1": "Kwame", "P2": "...", "P3": "..." } } ],
 *     "domain_b": [ { "triple_id": "A01::R.R", "role": "composite", "tokens": [] } ] }
 *
 *   Domain A answers are participant NAMES (as the item presented them), or
 *   "neither" / "both". The scorer inverts names to role keys via item.names, so
 *   invariance is measured on ROLES — renaming cannot look like a judgment change.
 *
 *   Domain B answers are token arrays from the closed vocabulary; [] means
 *   "nothing changed".
 *
 * TWO SCORING RULES THAT ARE NOT NEGOTIABLE
 *   1. Unscorable is not incorrect. A missing answer is `unanswered`, reported
 *      separately, never folded into the error count.
 *   2. Eligibility is derived from GROUND TRUTH, not from transform labels. A
 *      structural transform that leaves ground truth unchanged is not a failed
 *      sensitivity case — it is not a sensitivity case at all.
 *
 * Every figure is reported as correct / scorable, never as a bare percentage, and
 * never collapsed into a master score. The shape is the finding.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-corpus.json'), 'utf8'));
const B = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-corpus.json'), 'utf8'));

const PROBE_KEYS = ['P1', 'P2', 'P3'];
const eq = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const norm = (t) => [...new Set(t ?? [])].sort();

/** correct / scorable, with unanswered tracked separately. */
const tally = () => ({ correct: 0, scorable: 0, unanswered: 0 });
const rate = (t) => (t.scorable ? +(t.correct / t.scorable).toFixed(4) : null);

/** Invert a presented name back to its role key. Returns 'neither'/'both' unchanged. */
function toRole(answer, names) {
  if (answer == null) return null;
  const a = String(answer).trim();
  if (/^(neither|none|nobody)$/i.test(a)) return 'neither';
  if (/^both$/i.test(a)) return 'both';
  for (const [key, name] of Object.entries(names)) {
    if (name.toLowerCase() === a.toLowerCase()) return key;
  }
  return `UNRESOLVED:${a}`;
}

export function score(run) {
  /* ---------------- Domain A ---------------- */
  const aItems = Object.fromEntries(A.items.map((i) => [i.item_id, i]));
  const aAns = Object.fromEntries((run.domain_a ?? []).map((r) => [r.item_id, r.answers]));
  const baseGT = Object.fromEntries(
    A.items.filter((i) => i.class === 'baseline').map((i) => [i.seed_id, i.ground_truth]),
  );
  const baseAns = {};
  for (const it of A.items.filter((i) => i.class === 'baseline')) {
    const ans = aAns[it.item_id];
    if (ans) baseAns[it.seed_id] = Object.fromEntries(PROBE_KEYS.map((k) => [k, toRole(ans[k], it.names)]));
  }

  const a = {
    baseline_accuracy: tally(),
    presentation_invariance: tally(),
    structural_sensitivity: tally(),
    reversal_sensitivity: tally(),
    null_robustness: tally(),
  };
  const unresolved = [];

  for (const it of A.items) {
    const ans = aAns[it.item_id];
    for (const k of PROBE_KEYS) {
      const bucket =
        it.class === 'baseline' ? a.baseline_accuracy
        : it.class === 'presentation' ? a.presentation_invariance
        : it.class === 'null' ? a.null_robustness
        : null; // structural handled below (needs eligibility)

      if (it.class === 'structural') {
        // RULE 2: eligibility from ground truth, not label.
        const moved = it.ground_truth[k] !== baseGT[it.seed_id][k];
        if (!moved) continue;                       // not a sensitivity case at all
        if (!ans || ans[k] == null) { a.structural_sensitivity.unanswered++; continue; }
        const role = toRole(ans[k], it.names);
        if (String(role).startsWith('UNRESOLVED')) unresolved.push(`${it.item_id}/${k}=${ans[k]}`);
        a.structural_sensitivity.scorable++;
        const ok = role === it.ground_truth[k];
        if (ok) a.structural_sensitivity.correct++;
        if (it.condition === 'A-S1') {
          a.reversal_sensitivity.scorable++;
          if (ok) a.reversal_sensitivity.correct++;
        }
        continue;
      }

      if (!bucket) continue;
      if (!ans || ans[k] == null) { bucket.unanswered++; continue; }
      const role = toRole(ans[k], it.names);
      if (String(role).startsWith('UNRESOLVED')) unresolved.push(`${it.item_id}/${k}=${ans[k]}`);

      if (it.class === 'baseline') {
        bucket.scorable++;
        if (role === it.ground_truth[k]) bucket.correct++;
      } else {
        // Invariance/robustness are measured against the BASELINE ANSWER, not truth:
        // the question is stability of judgment, which a model can hold stably while
        // being stably wrong. Accuracy is reported separately by baseline_accuracy.
        const ref = baseAns[it.seed_id]?.[k];
        if (ref == null) { bucket.unanswered++; continue; }
        bucket.scorable++;
        if (role === ref) bucket.correct++;
      }
    }
  }

  /* ---------------- Domain B ---------------- */
  const bAns = {};
  const bOutOfVocab = [];
  const VOCAB = new Set(B.change_vocabulary);
  for (const r of run.domain_b ?? []) {
    const toks = norm(r.tokens);
    // Out-of-vocabulary tokens are RECORDED, never coerced or dropped. An answer
    // outside the closed vocabulary still scores as incorrect — silently mapping it
    // to the nearest legal token would be model-specific repair.
    for (const t of toks) if (!VOCAB.has(t)) bOutOfVocab.push(`${r.triple_id}::${r.role}=${t}`);
    bAns[`${r.triple_id}::${r.role}`] = toks;
  }

  const b = {
    step_accuracy: tally(),
    composition_consistency: tally(),
    identity_return: tally(),
    order_sensitive: tally(),
    information_loss: tally(),
  };
  let stepsRightCompositeWrong = 0;
  let stepsRightCompositeRight = 0;

  const CLS_BUCKET = {
    composition_returns_identity: 'identity_return',
    composition_order_sensitive: 'order_sensitive',
    composition_information_losing: 'information_loss',
  };

  for (const t of B.triples) {
    const got = {};
    for (const it of t.items) got[it.role] = bAns[`${t.triple_id}::${it.role}`];

    for (const role of ['step1', 'step2']) {
      const it = t.items.find((i) => i.role === role);
      if (got[role] === undefined) { b.step_accuracy.unanswered++; continue; }
      b.step_accuracy.scorable++;
      if (eq(got[role], norm(it.ground_truth))) b.step_accuracy.correct++;
    }

    const comp = t.items.find((i) => i.role === 'composite');
    if (got.composite === undefined) {
      b.composition_consistency.unanswered++;
    } else {
      b.composition_consistency.scorable++;
      const ok = eq(got.composite, norm(comp.ground_truth));
      if (ok) b.composition_consistency.correct++;

      const sub = CLS_BUCKET[t.composition_class];
      if (sub) { b[sub].scorable++; if (ok) b[sub].correct++; }

      // THE DIAGNOSTIC B EXISTS FOR: local competence without global consistency.
      const s1 = got.step1 !== undefined && eq(got.step1, norm(t.items[0].ground_truth));
      const s2 = got.step2 !== undefined && eq(got.step2, norm(t.items[1].ground_truth));
      if (s1 && s2) (ok ? stepsRightCompositeRight++ : stepsRightCompositeWrong++);
    }
  }

  /* undefined pairs: DECLARED GAP, not a silent zero. */
  const undefinedHandling = {
    status: 'NOT_SCORABLE',
    reason:
      'The corpus emits no probe items for undefined operator pairs — 24 pairs are ' +
      'recorded in the manifest but never presented, so a model inventing a defined ' +
      'composite cannot be observed. Scoring this requires a Domain B v2 amendment ' +
      'adding an applicability probe. B is frozen at d6164dd8e; unfreezing is a ' +
      'founder decision, not a scorer decision.',
    pairs_recorded: B.counts.undefined_pairs,
    pairs_probed: 0,
  };

  const fmt = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { ...v, rate: rate(v) }]));

  return {
    domain_a: fmt(a),
    domain_b: {
      ...fmt(b),
      steps_correct_composite_wrong: stepsRightCompositeWrong,
      steps_correct_composite_right: stepsRightCompositeRight,
      teeth_available: B.counts.composite_differs_from_union,
    },
    undefined_case_handling: undefinedHandling,
    unresolved_answers: unresolved.slice(0, 20),
    unresolved_count: unresolved.length,
    out_of_vocab_b: bOutOfVocab.slice(0, 20),
    out_of_vocab_b_count: bOutOfVocab.length,
    corpus: { domain_a_items: A.counts.items, domain_b_triples: B.counts.triples },
  };
}

/* ---------------- self-test ---------------- */
/**
 * Proves the metric can detect the target failure mode BEFORE any model exists.
 *
 *   oracle        — answers every item from ground truth.
 *   local_matcher — answers both STEPS correctly, then answers the composite as the
 *                   union of the two step labels. This is exactly the behaviour B was
 *                   built to catch: locally competent, globally inconsistent.
 *
 * The self-test asserts the scorer separates them. If it cannot, the scorer is not
 * an instrument regardless of what any model later scores on it.
 */
function selftest() {
  const nameOf = (it, key) => (key === 'neither' || key === 'both' ? key : it.names[key]);

  const oracle = {
    domain_a: A.items.map((it) => ({
      item_id: it.item_id,
      answers: Object.fromEntries(PROBE_KEYS.map((k) => [k, nameOf(it, it.ground_truth[k])])),
    })),
    domain_b: B.triples.flatMap((t) => t.items.map((i) => ({ triple_id: t.triple_id, role: i.role, tokens: i.ground_truth }))),
  };

  const local = {
    domain_a: oracle.domain_a,
    domain_b: B.triples.flatMap((t) => [
      { triple_id: t.triple_id, role: 'step1', tokens: t.items[0].ground_truth },
      { triple_id: t.triple_id, role: 'step2', tokens: t.items[1].ground_truth },
      { triple_id: t.triple_id, role: 'composite', tokens: norm([...t.items[0].ground_truth, ...t.items[1].ground_truth]) },
    ]),
  };

  const o = score(oracle);
  const l = score(local);
  const fails = [];

  if (o.domain_a.baseline_accuracy.rate !== 1) fails.push('oracle did not score 1.0 on baseline accuracy');
  if (o.domain_a.structural_sensitivity.rate !== 1) fails.push('oracle did not score 1.0 on structural sensitivity');
  if (o.domain_a.presentation_invariance.rate !== 1) fails.push('oracle did not score 1.0 on presentation invariance');
  if (o.domain_b.composition_consistency.rate !== 1) fails.push('oracle did not score 1.0 on composition consistency');
  if (o.domain_b.steps_correct_composite_wrong !== 0) fails.push('oracle produced steps-right/composite-wrong cases');

  if (l.domain_b.step_accuracy.rate !== 1) fails.push('local_matcher should be perfect on steps');
  if (l.domain_b.composition_consistency.rate === 1) fails.push('local_matcher was NOT caught — composition metric has no teeth');
  if (l.domain_b.steps_correct_composite_wrong !== B.counts.composite_differs_from_union) {
    fails.push(`local_matcher caught on ${l.domain_b.steps_correct_composite_wrong} cases, expected ${B.counts.composite_differs_from_union}`);
  }
  if (l.domain_b.identity_return.rate !== 0) fails.push('local_matcher should score 0 on identity-return');

  console.log('SELF-TEST');
  console.log(`  oracle        composition ${o.domain_b.composition_consistency.correct}/${o.domain_b.composition_consistency.scorable}  steps-right/composite-wrong ${o.domain_b.steps_correct_composite_wrong}`);
  console.log(`  local_matcher steps       ${l.domain_b.step_accuracy.correct}/${l.domain_b.step_accuracy.scorable}  composition ${l.domain_b.composition_consistency.correct}/${l.domain_b.composition_consistency.scorable}  identity-return ${l.domain_b.identity_return.correct}/${l.domain_b.identity_return.scorable}`);
  console.log(`  local_matcher caught on   ${l.domain_b.steps_correct_composite_wrong} triples (teeth available ${B.counts.composite_differs_from_union})`);
  for (const f of fails) console.log(`ERROR ${f}`);
  console.log(fails.length ? `\nFAIL — ${fails.length} error(s)` : '\nPASS — scorer separates global consistency from local competence');
  process.exit(fails.length ? 1 : 0);
}

/* ---------------- cli ---------------- */
const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();
else {
  const i = argv.indexOf('--run');
  if (i === -1) { console.error('usage: score.mjs --run <run.json> [--json] | --selftest'); process.exit(2); }
  const result = score(JSON.parse(readFileSync(argv[i + 1], 'utf8')));
  if (argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    const line = (k, v) => console.log(`  ${k.padEnd(26)} ${v.correct}/${v.scorable}${v.unanswered ? ` (unanswered ${v.unanswered})` : ''}  ${v.rate ?? '—'}`);
    console.log('DOMAIN A'); for (const [k, v] of Object.entries(result.domain_a)) line(k, v);
    console.log('DOMAIN B');
    for (const [k, v] of Object.entries(result.domain_b)) if (v && typeof v === 'object') line(k, v);
    console.log(`  steps-right / composite-wrong  ${result.domain_b.steps_correct_composite_wrong}  (teeth available ${result.domain_b.teeth_available})`);
    console.log(`UNDEFINED HANDLING  ${result.undefined_case_handling.status} — ${result.undefined_case_handling.pairs_probed}/${result.undefined_case_handling.pairs_recorded} probed`);
    console.log(`UNRESOLVED (A)  ${result.unresolved_count}   OUT-OF-VOCAB (B)  ${result.out_of_vocab_b_count}`);
  }
}
