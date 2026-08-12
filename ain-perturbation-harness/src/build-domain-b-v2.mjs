#!/usr/bin/env node
/**
 * Build Domain B v2. Writes corpus/domain-b-v2-corpus.json — a NEW file.
 * v1 corpora are never opened for writing here.
 *
 * Two amendments to v1, and only two:
 *   A. Blocked operator pairs become explicit APPLICABILITY probes
 *      (DEFINED / UNDEFINED / INAPPLICABLE), asked BEFORE any transformation
 *      judgment, so a non-performable operation cannot be silently coerced
 *      into an ordinary answer.
 *   B. W is disambiguated from T at the ONTOLOGY level: participant-in-act vs
 *      non-participating observer, each with its own prose clause.
 *
 * No other v1 case is altered. Seeds are the same file, byte-identical.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderV2, CHANGE_PROBE, APPLICABILITY_PROBE } from './render-v2.mjs';
import {
  OPERATORS, OP_DESCRIPTION, composePair, characterize,
  CHANGE_VOCAB, APPLICABILITY_VALUES, CLASS,
} from './operators-v2.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'corpus', 'domain-b-v2-corpus.json');

const { seeds } = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-seeds.json'), 'utf8'));
const OPS = Object.keys(OPERATORS);

const triples = [];
const applicability = [];

for (const seed of seeds) {
  for (const t1 of OPS) {
    for (const t2 of OPS) {
      const r = composePair(seed, t1, t2);

      if (r.blocked) {
        // AMENDMENT A: this is now a probed item, not a metadata footnote.
        const state = r.blocked_at === 'tau1' ? seed : r.S1;
        const op = r.blocked_at === 'tau1' ? t1 : t2;
        applicability.push({
          item_id: `${seed.id}::${t1}.${t2}::applicability`,
          seed_id: seed.id, t1, t2,
          blocked_at: r.blocked_at,
          operation: op,
          operation_description: OP_DESCRIPTION[op],
          ground_truth: r.blocked,                  // UNDEFINED | INAPPLICABLE
          blocking_mode: r.blocked === 'UNDEFINED' ? 'absence' : 'presence',
          text: renderV2(state),
          prompt: APPLICABILITY_PROBE(renderV2(state), OP_DESCRIPTION[op]),
        });
        continue;
      }

      const { S1, S2 } = r;
      // Every performable pair also carries an applicability probe, so the
      // DEFINED class is populated and the three-way choice is a real choice.
      applicability.push({
        item_id: `${seed.id}::${t1}.${t2}::applicability`,
        seed_id: seed.id, t1, t2,
        blocked_at: null,
        operation: t1,
        operation_description: OP_DESCRIPTION[t1],
        ground_truth: 'DEFINED',
        blocking_mode: null,
        text: renderV2(seed),
        prompt: APPLICABILITY_PROBE(renderV2(seed), OP_DESCRIPTION[t1]),
      });

      triples.push({
        triple_id: `${seed.id}::${t1}.${t2}`,
        seed_id: seed.id, t1, t2,
        composition_class: r.class,
        order_sensitive: r.order_sensitive,
        reverse_composite_change: r.reverse_composite_change,
        information_lost: r.information_lost,
        items: [
          { role: 'step1',     from: renderV2(seed), to: renderV2(S1), ground_truth: r.step1_change },
          { role: 'step2',     from: renderV2(S1),   to: renderV2(S2), ground_truth: r.step2_change },
          { role: 'composite', from: renderV2(seed), to: renderV2(S2), ground_truth: r.composite_change },
        ],
        composite_differs_from_union:
          JSON.stringify(r.composite_change) !==
          JSON.stringify([...new Set([...r.step1_change, ...r.step2_change])].sort()),
      });
    }
  }
}

const byClass = triples.reduce((a, t) => ((a[t.composition_class] = (a[t.composition_class] || 0) + 1), a), {});
const byApp = applicability.reduce((a, x) => ((a[x.ground_truth] = (a[x.ground_truth] || 0) + 1), a), {});

const manifest = {
  version: 'domain-b-v2',
  supersedes: 'domain-b v1 (d4110fc014386aca) — PRESERVED, NOT REPAIRED',
  built_from: 'domain-a-seeds.json (byte-identical to v1)',
  deterministic: true,
  generator_model_used: false,
  amendments: [
    'A. Blocked operator pairs are now explicit applicability probes (DEFINED/UNDEFINED/INAPPLICABLE), asked before any transformation judgment.',
    'B. W disambiguated from T at the ontology level: participant-in-act vs non-participating observer, each with its own explicit prose clause.',
  ],
  not_amended:
    'No other v1 case was altered. v1 scores were not used to adjust any individual v2 answer.',
  ontology: {
    third_party_added: 'A third person TAKES PART IN THE ACT, carrying it out together with the agent. The act itself is different because of them.',
    witness_bound_to_agent: 'A third person TAKES NO PART in the act; they observe it and are affiliated with the person who did the act, as it stands at the end.',
    witness_bound_to_recipient: 'A third person TAKES NO PART in the act; they observe it and are affiliated with the person who received the act, as it stands at the end.',
  },
  applicability_semantics: {
    DEFINED: 'The operation can be carried out and would change the description.',
    UNDEFINED: 'Blocked by ABSENCE — what the operation needs is not in the description.',
    INAPPLICABLE: 'Blocked by PRESENCE — what the operation would introduce is already there.',
  },
  change_vocabulary: CHANGE_VOCAB,
  applicability_values: APPLICABILITY_VALUES,
  change_probe: CHANGE_PROBE(CHANGE_VOCAB),
  counts: {
    seeds: seeds.length,
    operator_pairs_attempted: seeds.length * OPS.length * OPS.length,
    triples: triples.length,
    change_probe_items: triples.length * 3,
    applicability_probe_items: applicability.length,
    by_composition_class: byClass,
    by_applicability: byApp,
    composite_differs_from_union: triples.filter((t) => t.composite_differs_from_union).length,
  },
  applicability,
  triples,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');

console.log(`v2 triples: ${triples.length}  change items: ${triples.length * 3}  applicability items: ${applicability.length}`);
console.log(`by class: ${JSON.stringify(byClass)}`);
console.log(`by applicability: ${JSON.stringify(byApp)}`);
console.log(`teeth (composite != union): ${manifest.counts.composite_differs_from_union}`);
