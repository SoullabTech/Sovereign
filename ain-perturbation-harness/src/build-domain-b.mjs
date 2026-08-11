#!/usr/bin/env node
/**
 * Build the Domain B composition corpus.
 *
 *   node ain-perturbation-harness/src/build-domain-b.mjs
 *
 * For every seed and every ORDERED operator pair (t1, t2), emit a triple:
 *
 *     S0 --t1--> S1 --t2--> S2      and the composite   S0 --------> S2
 *
 * Three probe items per triple (step1, step2, composite), each asking the SAME
 * closed-vocabulary question: what changed between these two descriptions?
 *
 * Ground truth for all three is DERIVED by structural comparison. The composite's
 * truth is derived from S0 vs S2 directly — never assembled from the steps. That is
 * what lets the corpus expose a system that is right on both steps and wrong on the
 * composite.
 *
 * Undefined pairs are RECORDED as findings, not skipped silently.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.mjs';
import { OPERATORS, composePair, characterize, CHANGE_VOCAB, CLASS } from './operators.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'corpus', 'domain-b-corpus.json');

const { seeds } = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-seeds.json'), 'utf8'));
const PLAIN = { voice: 'active', order: 'chrono', register: 'plain', intensity: 'flat' };
const OPS = Object.keys(OPERATORS);

const triples = [];
const undefinedPairs = [];

for (const seed of seeds) {
  for (const t1 of OPS) {
    for (const t2 of OPS) {
      const r = composePair(seed, t1, t2);

      if (r.class === CLASS.UNDEFINED) {
        undefinedPairs.push({
          triple_id: `${seed.id}::${t1}.${t2}`, seed_id: seed.id, t1, t2,
          undefined_at: r.undefined_at,
          reason: r.undefined_at === 'tau1'
            ? `${t1} is not defined on the seed state`
            : `${t2} is not defined on the state produced by ${t1}`,
        });
        continue;
      }

      const S0 = seed, { S1, S2 } = r;
      triples.push({
        triple_id: `${seed.id}::${t1}.${t2}`,
        seed_id: seed.id,
        t1, t2,
        composition_class: r.class,
        order_sensitive: r.order_sensitive,
        reverse_composite_change: r.reverse_composite_change,
        information_lost: r.information_lost,
        items: [
          { role: 'step1',     from: render(S0, PLAIN), to: render(S1, PLAIN), ground_truth: r.step1_change },
          { role: 'step2',     from: render(S1, PLAIN), to: render(S2, PLAIN), ground_truth: r.step2_change },
          { role: 'composite', from: render(S0, PLAIN), to: render(S2, PLAIN), ground_truth: r.composite_change },
        ],
        /* The teeth: steps report change, composite reports none. A system doing
           local pattern-matching answers the composite from the steps and fails. */
        composite_differs_from_union:
          JSON.stringify(r.composite_change) !==
          JSON.stringify([...new Set([...r.step1_change, ...r.step2_change])].sort()),
      });
    }
  }
}

const byClass = triples.reduce((a, t) => ((a[t.composition_class] = (a[t.composition_class] || 0) + 1), a), {});

const manifest = {
  built_from: 'domain-a-seeds.json',
  spec: 'docs/specs/RELATIONAL_GEOMETRY_SPECIFICATION.md',
  domain_a_frozen_at: 'c8ed036cf',
  deterministic: true,
  generator_model_used: false,
  operators: Object.fromEntries(OPS.map((k) => [k, { involution: OPERATORS[k].involution }])),
  change_vocabulary: CHANGE_VOCAB,
  probe:
    'Which of the following changed between the first description and the second? ' +
    `Select all that apply from [${CHANGE_VOCAB.join(', ')}], or answer "nothing changed".`,
  scope_note:
    'Domain B is built on EPISODE STRUCTURE, not person-over-time. The spec\'s ' +
    'developmental framing requires authored member material and blind raters, both ' +
    'unavailable. Composition over episode operators tests the same commitment and is ' +
    'mechanically derivable. The developmental version is deferred as Domain B-prime.',
  counts: {
    seeds: seeds.length,
    operator_pairs_attempted: seeds.length * OPS.length * OPS.length,
    triples: triples.length,
    probe_items: triples.length * 3,
    undefined_pairs: undefinedPairs.length,
    by_composition_class: byClass,
    composite_differs_from_union: triples.filter((t) => t.composite_differs_from_union).length,
  },
  undefined_pairs: undefinedPairs,
  triples,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');

console.log(`triples: ${triples.length}  probe items: ${triples.length * 3}  undefined pairs: ${undefinedPairs.length}`);
console.log(`by class: ${JSON.stringify(byClass, null, 0)}`);
console.log(`composite != union of steps (the teeth): ${manifest.counts.composite_differs_from_union}`);
