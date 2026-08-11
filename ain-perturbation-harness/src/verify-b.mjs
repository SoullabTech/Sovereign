#!/usr/bin/env node
/**
 * Domain B self-verification. Runs before any model is contacted.
 *
 * The central assertion is COVERAGE, not closure: every composition class must be
 * REPRESENTED, because a class with zero instances cannot be detected, and an
 * undetectable class is a gap in the instrument rather than a finding about the
 * algebra. "Everything composes" is not an acceptance criterion here — it would be
 * a result, and a suspicious one.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OPERATORS, CHANGE_VOCAB, CLASS } from './operators.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const m = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-corpus.json'), 'utf8'));

const errors = [];
const warns = [];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const cls = (c) => m.triples.filter((t) => t.composition_class === c);

/* 1. every class represented — an unrepresented class is undetectable */
for (const c of [CLASS.IDENTITY, CLASS.DEFINED, CLASS.ORDER_SENSITIVE, CLASS.INFO_LOSING]) {
  if (cls(c).length === 0) errors.push(`composition class '${c}' has 0 instances — undetectable, instrument gap`);
}
if (m.undefined_pairs.length === 0) errors.push(`no undefined pairs — partiality is untestable`);

/* 2. involutions must square to identity; non-involutions must not */
for (const [op, meta] of Object.entries(OPERATORS)) {
  const self = m.triples.filter((t) => t.t1 === op && t.t2 === op);
  const selfUndef = m.undefined_pairs.filter((u) => u.t1 === op && u.t2 === op);
  if (meta.involution) {
    if (!self.length) { errors.push(`${op} declared involution but ${op}.${op} produced no triple`); continue; }
    for (const t of self) {
      if (t.composition_class !== CLASS.IDENTITY) {
        errors.push(`${t.triple_id}: ${op} declared involution but ${op}∘${op} is not identity — declared structure refuted`);
      }
    }
  } else if (self.length && self.some((t) => t.composition_class === CLASS.IDENTITY)) {
    errors.push(`${op} declared NON-involution but ${op}∘${op} returned identity`);
  } else if (!self.length && !selfUndef.length) {
    warns.push(`${op}∘${op} neither defined nor recorded undefined`);
  }
}

/* 3. the teeth: identity triples must have non-empty steps and empty composite */
for (const t of cls(CLASS.IDENTITY)) {
  const [s1, s2, comp] = t.items;
  if (comp.ground_truth.length !== 0) errors.push(`${t.triple_id}: identity class but composite change is non-empty`);
  if (s1.ground_truth.length === 0 && s2.ground_truth.length === 0) {
    warns.push(`${t.triple_id}: identity with no-op steps — no teeth, both steps and composite are empty`);
  }
}
const teeth = m.triples.filter((t) => t.composite_differs_from_union).length;
if (teeth === 0) errors.push('no triple where the composite differs from the union of its steps — nothing tests global structure');

/* 4. order-sensitive triples must actually differ under reversal */
for (const t of cls(CLASS.ORDER_SENSITIVE)) {
  if (eq(t.items[2].ground_truth, t.reverse_composite_change)) {
    errors.push(`${t.triple_id}: classed order-sensitive but reverse composite is identical`);
  }
}

/* 5. information-losing triples must name what was lost */
for (const t of cls(CLASS.INFO_LOSING)) {
  if (!t.information_lost?.length) errors.push(`${t.triple_id}: classed information-losing but nothing recorded as lost`);
}

/* 6. closed vocabulary */
const vocab = new Set(CHANGE_VOCAB);
for (const t of m.triples) {
  for (const it of t.items) {
    for (const tok of it.ground_truth) {
      if (!vocab.has(tok)) errors.push(`${t.triple_id}/${it.role}: token '${tok}' outside closed vocabulary`);
    }
  }
}

/* 7. within a triple, a probe item whose truth is non-empty must show different text */
for (const t of m.triples) {
  for (const it of t.items) {
    if (it.ground_truth.length > 0 && it.from === it.to) {
      errors.push(`${t.triple_id}/${it.role}: change asserted but rendered text is identical`);
    }
    if (it.ground_truth.length === 0 && it.from !== it.to) {
      errors.push(`${t.triple_id}/${it.role}: no change asserted but rendered text differs`);
    }
  }
}

console.log(`domain B: ${m.counts.triples} triples / ${m.counts.probe_items} probe items / ${m.counts.undefined_pairs} undefined pairs`);
console.log(`by class: ${JSON.stringify(m.counts.by_composition_class)}`);
console.log(`teeth (composite != union of steps): ${teeth}`);
for (const w of warns) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `\nFAIL — ${errors.length} error(s)` : `\nPASS — ${warns.length} warning(s), 0 errors`);
process.exit(errors.length ? 1 : 0);
