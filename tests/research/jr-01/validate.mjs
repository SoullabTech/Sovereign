/**
 * JR-01 — corpus validator. The six construction laws as gates that fire.
 *
 *   node --experimental-strip-types tests/research/jr-01/validate.mjs [--json]
 *
 * ⛔ This checks the CORPUS, never a model. A green run says the instrument is
 * well-formed; it says nothing about relational reasoning.
 *
 * Exit 0 = every law satisfied. Exit 1 = at least one law violated. Exit 2 = could
 * not adjudicate. ⚠️ A WARN never becomes a pass: warnings are printed and counted
 * separately and do not affect the exit status, so they can never be mistaken for
 * a discharged obligation (FR-14 discipline).
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORPUS_V0 } from './corpus.v0.ts';
import { CELL, CELL_SHAPE, RESERVED_VOCABULARY, weakestGrounding } from './corpusContract.ts';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** Same-wording cells must be near-minimal edits of one another. */
const SAME_WORDING_MIN_OVERLAP = 0.60;
/** Different-wording cells must not be near-restatements. */
const DIFF_WORDING_MAX_OVERLAP = 0.40;
/** At least this many pairs must be ones where A and B look identical downstream. */
const MIN_SAME_SURFACE_PAIRS = 6;

const fails = [];
const warns = [];
const fail = (law, id, msg) => fails.push({ law, id, msg });
const warn = (law, id, msg) => warns.push({ law, id, msg });

const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));
const jaccard = (a, b) => {
  const A = words(a), B = words(b);
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 1 : inter / union;
};

const allPairs = CORPUS_V0.operators.flatMap((o) => o.pairs);

// ── L3 · repository-derived answer key ───────────────────────────────────────
for (const o of CORPUS_V0.operators) {
  if (o.citations.length === 0) fail('L3', o.id, 'no citation — the answer key has no repository source');
  for (const c of o.citations) {
    if (!existsSync(path.join(REPO, c.path))) fail('L3', o.id, `cited path does not exist: ${c.path}`);
    if (/:\d+/.test(c.path)) fail('L3', o.id, `citation carries a line number (${c.path}) — cite the operation, not the line`);
    if (!c.operation?.trim()) fail('L3', o.id, 'citation names no operation');
    if (!c.doesNotEstablish?.trim()) fail('L3', o.id, 'citation states no limit — absence of a caveat is itself a claim');
  }
  if (!o.doesNotEstablish?.trim()) fail('L3', o.id, 'operator states no limit on what a correct answer would establish');
}

// ── L6 · grounding recorded honestly (weakest citation wins) ─────────────────
for (const o of CORPUS_V0.operators) {
  const expected = weakestGrounding(o.citations);
  if (o.grounding !== expected) {
    fail('L6', o.id, `grounding is '${o.grounding}' but the weakest citation is '${expected}' — an operator may not report better standing than its weakest source`);
  }
}

// ── L5 · every operator carries all four cells, exactly once ────────────────
for (const o of CORPUS_V0.operators) {
  for (const cell of CELL) {
    const n = o.pairs.filter((p) => p.cell === cell).length;
    if (n !== 1) fail('L5', o.id, `cell '${cell}' appears ${n} times (must be exactly 1) — structural and alias tests must both be present and separate`);
  }
}

// ── Per-pair checks ─────────────────────────────────────────────────────────
const seen = new Set();
for (const p of allPairs) {
  const o = CORPUS_V0.operators.find((x) => x.id === p.operatorId);
  if (seen.has(p.id)) fail('ID', p.id, 'duplicate pair id');
  seen.add(p.id);
  if (p.id !== `${p.operatorId}.${p.cell}.${p.order}`) fail('ID', p.id, 'id does not match operator.cell.order');

  // answer keys must come from the operator's closed vocabulary
  for (const [side, s] of [['a', p.a], ['b', p.b]]) {
    if (!o.keys.includes(s.key)) fail('L3', p.id, `side ${side} key '${s.key}' is outside the operator's closed key set`);
    if (!s.because?.trim()) fail('L3', p.id, `side ${side} has no stated derivation`);
  }

  const shape = CELL_SHAPE[p.cell];

  // 2x2 integrity — relation axis decides whether the keys must agree
  if (shape.relation === 'same' && p.a.key !== p.b.key) {
    fail('2x2', p.id, `cell keeps the relation constant but the keys differ ('${p.a.key}' vs '${p.b.key}')`);
  }
  if (shape.relation === 'different' && p.a.key === p.b.key) {
    fail('2x2', p.id, `cell changes the relation but both keys are '${p.a.key}' — nothing is being perturbed`);
  }

  // L1 · wording axis — one perturbation per pair, measured.
  //
  // ⭐ WHAT THE WORDING AXIS COMPARES, AND WHY IT IS NOT THE SAME COMPARISON IN
  // EVERY CELL. For identity / paraphrase / perturbation the axis is a statement
  // about A against B INSIDE the pair. For `generalization` it cannot be: A and B
  // there differ in both wording and relation, and any two unrelated sentences
  // satisfy that trivially — the constraint would check nothing. What the cell is
  // actually for is carrying the SAME relational contrast into a surface the
  // perturbation cell never used, so the comparison that has teeth is the pair
  // against this operator's `relational_perturbation` pair.
  //
  // ⛔ This was a defect in the instrument, not a concession to the corpus: the
  // first draft compared A to B here and failed all twelve operators for being
  // internally minimal — which is exactly what a well-formed generalization pair
  // should be. The check below is STRICTER than no check, not weaker than the
  // one it replaces, and the within-pair minimality it stops enforcing was never
  // a property the law asked for.
  if (p.cell === 'generalization') {
    const target = o.pairs.find((q) => q.cell === 'relational_perturbation');
    if (!target) {
      fail('L1', p.id, 'no relational_perturbation pair to generalize away from');
    } else {
      const away = Math.max(jaccard(p.a.text, target.a.text), jaccard(p.b.text, target.b.text),
                            jaccard(p.a.text, target.b.text), jaccard(p.b.text, target.a.text));
      if (away > DIFF_WORDING_MAX_OVERLAP) {
        fail('L1', p.id, `generalization surface overlaps the perturbation pair at ${away.toFixed(2)} (> ${DIFF_WORDING_MAX_OVERLAP}) — same clothes, so nothing generalizes`);
      }
    }
  } else {
    const ov = jaccard(p.a.text, p.b.text);
    if (shape.wording === 'same' && ov < SAME_WORDING_MIN_OVERLAP) {
      fail('L1', p.id, `wording should be constant but overlap is ${ov.toFixed(2)} (< ${SAME_WORDING_MIN_OVERLAP}) — more than the target relation moved`);
    }
    if (shape.wording === 'different' && ov > DIFF_WORDING_MAX_OVERLAP) {
      fail('L1', p.id, `wording should differ but overlap is ${ov.toFixed(2)} (> ${DIFF_WORDING_MAX_OVERLAP}) — this is a restatement, not a new surface`);
    }
  }

  // L2 · no vocabulary leakage
  if (!p.testsVocabulary) {
    for (const [side, s] of [['a', p.a], ['b', p.b]]) {
      for (const term of RESERVED_VOCABULARY) {
        const rx = new RegExp(`\\b${term.replace(/[_ ]/g, '[_ ]')}\\b`, 'i');
        if (rx.test(s.text)) fail('L2', p.id, `side ${side} leaks reserved vocabulary '${term}' into the stimulus`);
      }
    }
  }
}

// ── L4 · position carries no signal ─────────────────────────────────────────
const ab = allPairs.filter((p) => p.order === 'AB').length;
const ba = allPairs.length - ab;
if (Math.abs(ab - ba) > 1) fail('L4', 'corpus', `order imbalance: ${ab} AB vs ${ba} BA — position becomes a cheap signal`);
for (const o of CORPUS_V0.operators) {
  const oab = o.pairs.filter((p) => p.order === 'AB').length;
  if (Math.abs(oab - (o.pairs.length - oab)) > 1) warn('L4', o.id, `operator-level order imbalance (${oab} AB of ${o.pairs.length})`);
}

// ── The law the census forced ───────────────────────────────────────────────
const sameSurface = allPairs.filter((p) => p.sameObservableSurface);
if (sameSurface.length < MIN_SAME_SURFACE_PAIRS) {
  fail('IDENTICAL-OUTPUT', 'corpus',
    `only ${sameSurface.length} pairs produce an identical downstream surface (need ${MIN_SAME_SURFACE_PAIRS}) — without them a model can score well by reading the payload`);
}
for (const p of sameSurface) {
  if (CELL_SHAPE[p.cell].relation !== 'different') {
    fail('IDENTICAL-OUTPUT', p.id, 'marked as same-surface but the relation does not change — that is not the trap, that is just a control');
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
const byGrounding = {};
for (const o of CORPUS_V0.operators) (byGrounding[o.grounding] ??= []).push(o.id);

const report = {
  corpus: CORPUS_V0.version,
  builtAgainst: CORPUS_V0.builtAgainst,
  operators: CORPUS_V0.operators.length,
  pairs: allPairs.length,
  stimuli: allPairs.length * 2,
  order: { AB: ab, BA: ba },
  sameObservableSurfacePairs: sameSurface.length,
  groundingManifest: byGrounding,
  failed: fails.length,
  warned: warns.length,
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ...report, fails, warns }, null, 2));
} else {
  console.log(`\nJR-01 corpus ${report.corpus} @ ${report.builtAgainst}`);
  console.log(`  ${report.operators} operators · ${report.pairs} pairs · ${report.stimuli} stimuli · order ${ab}/${ba} · same-surface ${sameSurface.length}`);
  console.log('\n  grounding manifest (L6 — these never merge):');
  for (const g of ['runtime_witnessed', 'shadow_executed', 'harness_exercised', 'contract_only', 'declared_unemitted']) {
    if (byGrounding[g]) console.log(`    ${g.padEnd(20)} ${byGrounding[g].join(' ')}`);
  }
  if (warns.length) {
    console.log('\n  ⚠️  warnings (never discharge an obligation):');
    for (const w of warns) console.log(`    [${w.law}] ${w.id}: ${w.msg}`);
  }
  if (fails.length) {
    console.log('\n  🛑 failures:');
    for (const f of fails) console.log(`    [${f.law}] ${f.id}: ${f.msg}`);
  }
  console.log(`\n  ${fails.length === 0 ? '✅' : '🛑'} ${report.failed} failed · ${report.warned} warned\n`);
}
process.exit(fails.length === 0 ? 0 : 1);
