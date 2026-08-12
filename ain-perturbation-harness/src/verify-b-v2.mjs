#!/usr/bin/env node
/**
 * Domain B v2 self-verification, run before any model contact.
 *
 * Carries every v1 check, plus the one the v1 defect demanded:
 *
 *   THE READER-DETERMINABILITY TEST
 *   A deliberately naive reader — one that knows ONLY the ontology's wording and
 *   has never seen characterize() — must derive the same third-party / witness
 *   labels as the ground truth, from the rendered prose alone.
 *
 *   This is what v1 lacked. v1's ground truth was derivable only from a field
 *   (act.instigator) that the prose never exposed, so a correct reading of the
 *   text scored wrong. The reader below parses surface clauses; if it disagrees
 *   with the ground truth anywhere, the prose is under-determined and the corpus
 *   does not ship.
 *
 *   ⚠️ This is a PROXY for the independent-human-rater requirement (spec §R2),
 *   not a substitute for it. It proves the text is mechanically sufficient; it
 *   does not prove people find it clear. The human check remains outstanding.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHANGE_VOCAB, APPLICABILITY_VALUES, CLASS, OPERATORS } from './operators-v2.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const m = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-v2-corpus.json'), 'utf8'));

const errors = [];
const warns = [];
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const cls = (c) => m.triples.filter((t) => t.composition_class === c);

/* ---------- the naive reader: prose in, category out ---------- */
const ACT = /([A-Z][a-z]+)(?: and ([A-Z][a-z]+) together)? (?:betrayed|broke a promise to|protected|withheld something from) ([A-Z][a-z]+)/;
const OBS = /([A-Z][a-z]+) took no part in it, but saw it happen; \1 is close to ([A-Z][a-z]+)\./;

function readerLabels(text) {
  const out = new Set();
  const act = ACT.exec(text);
  if (!act) return { out, parsed: false, observer: null };
  const [, agent, participant, recipient] = act;
  if (participant) out.add('third_party_added');
  const obs = OBS.exec(text);
  let side = null;
  if (obs) {
    const bound = obs[2];
    side = bound === agent ? 'agent' : bound === recipient ? 'recipient' : `UNRESOLVED:${bound}`;
    out.add(`witness_bound_to_${side}`);
  }
  return { out, parsed: true, observer: side };
}

const THIRD = new Set([
  'third_party_added', 'witness_bound_to_agent', 'witness_bound_to_recipient', 'witness_rebound',
]);

/** Derive third-party tokens the way a reader would: from the two texts alone. */
function readerDelta(fromText, toText) {
  const a = readerLabels(fromText);
  const b = readerLabels(toText);
  if (!a.parsed || !b.parsed) return null;
  const out = [...b.out].filter((x) => !a.out.has(x));
  // An observer present in BOTH texts whose side changed is a re-binding,
  // not a newly introduced observer.
  if (a.observer && b.observer) {
    const i = out.findIndex((x) => x.startsWith('witness_bound_to_'));
    if (i > -1) out.splice(i, 1);
    if (a.observer !== b.observer) out.push('witness_rebound');
  }
  return out.sort();
}

/* 1. READER-DETERMINABILITY across every change item */
let checked = 0;
for (const t of m.triples) {
  for (const it of t.items) {
    const introduced = readerDelta(it.from, it.to);
    if (introduced === null) { errors.push(`${t.triple_id}/${it.role}: reader could not parse the act clause`); continue; }
    const expected = it.ground_truth.filter((x) => THIRD.has(x)).sort();
    checked++;
    if (!eq(introduced, expected)) {
      errors.push(
        `${t.triple_id}/${it.role}: PROSE UNDER-DETERMINED — reader derives ` +
        `${JSON.stringify(introduced)} from the text, ground truth says ${JSON.stringify(expected)}`,
      );
    }
  }
}

/* 2. the two categories must never be conflatable in one text */
for (const t of m.triples) {
  for (const it of t.items) {
    if (/took part in it/.test(it.to) && !/took no part in it/.test(it.to)) {
      if (/saw it happen/.test(it.to)) {
        warns.push(`${t.triple_id}/${it.role}: participant and observer clauses co-occur — check readability`);
      }
    }
  }
}

/* 3. applicability coverage — every value must have instances */
const byApp = m.counts.by_applicability;
for (const v of APPLICABILITY_VALUES) {
  if (!byApp[v]) errors.push(`applicability value '${v}' has 0 instances — undetectable, instrument gap`);
}
/* both blocking modes must be populated, or the three-way split is decorative */
for (const mode of ['absence', 'presence']) {
  if (!m.applicability.some((a) => a.blocking_mode === mode)) {
    errors.push(`blocking mode '${mode}' has 0 instances — the UNDEFINED/INAPPLICABLE split is decorative`);
  }
}
/* applicability probes must precede transformation judgment: every blocked pair
   must appear ONLY as an applicability item, never as a triple */
const tripleIds = new Set(m.triples.map((t) => `${t.seed_id}::${t.t1}.${t.t2}`));
for (const a of m.applicability.filter((x) => x.ground_truth !== 'DEFINED')) {
  if (tripleIds.has(`${a.seed_id}::${a.t1}.${a.t2}`)) {
    errors.push(`${a.item_id}: blocked pair also emitted as a transformation triple — coercion path open`);
  }
}

/* 4. composition classes represented (carried from v1) */
for (const c of [CLASS.IDENTITY, CLASS.DEFINED, CLASS.ORDER_SENSITIVE, CLASS.INFO_LOSING]) {
  if (cls(c).length === 0) errors.push(`composition class '${c}' has 0 instances — undetectable`);
}

/* 5. involutions square to identity; non-involutions do not */
for (const [op, meta] of Object.entries(OPERATORS)) {
  const self = m.triples.filter((t) => t.t1 === op && t.t2 === op);
  if (meta.involution) {
    if (!self.length) { errors.push(`${op} declared involution but ${op}.${op} produced no triple`); continue; }
    for (const t of self) {
      if (t.composition_class !== CLASS.IDENTITY) errors.push(`${t.triple_id}: ${op}∘${op} is not identity`);
    }
  } else if (self.some((t) => t.composition_class === CLASS.IDENTITY)) {
    errors.push(`${op} declared NON-involution but ${op}∘${op} returned identity`);
  }
}

/* 6. teeth still present */
const teeth = m.triples.filter((t) => t.composite_differs_from_union).length;
if (teeth === 0) errors.push('no triple where composite differs from union of steps');

/* 7. order-sensitive triples actually differ under reversal */
for (const t of cls(CLASS.ORDER_SENSITIVE)) {
  if (eq(t.items[2].ground_truth, t.reverse_composite_change)) {
    errors.push(`${t.triple_id}: classed order-sensitive but reverse composite identical`);
  }
}

/* 8. closed vocabulary */
const vocab = new Set(CHANGE_VOCAB);
for (const t of m.triples) for (const it of t.items) for (const tok of it.ground_truth) {
  if (!vocab.has(tok)) errors.push(`${t.triple_id}/${it.role}: token '${tok}' outside closed vocabulary`);
}

/* 9. text/truth consistency */
for (const t of m.triples) for (const it of t.items) {
  if (it.ground_truth.length > 0 && it.from === it.to) errors.push(`${t.triple_id}/${it.role}: change asserted, text identical`);
  if (it.ground_truth.length === 0 && it.from !== it.to) errors.push(`${t.triple_id}/${it.role}: no change asserted, text differs`);
}

console.log(`domain B v2: ${m.counts.triples} triples / ${m.counts.change_probe_items} change items / ${m.counts.applicability_probe_items} applicability items`);
console.log(`by class: ${JSON.stringify(m.counts.by_composition_class)}`);
console.log(`by applicability: ${JSON.stringify(byApp)}`);
console.log(`reader-determinability: ${checked} items checked against prose alone`);
console.log(`teeth: ${teeth}`);
for (const w of warns) console.log(`WARN  ${w}`);
for (const e of errors.slice(0, 15)) console.log(`ERROR ${e}`);
if (errors.length > 15) console.log(`  … and ${errors.length - 15} more`);
console.log(errors.length ? `\nFAIL — ${errors.length} error(s)` : `\nPASS — ${warns.length} warning(s), 0 errors`);
process.exit(errors.length ? 1 : 0);
