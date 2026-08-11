#!/usr/bin/env node
/**
 * Build the Domain A corpus. Deterministic: same seeds -> byte-identical output.
 *
 *   node ain-perturbation-harness/src/build-corpus.mjs [--out <path>]
 *
 * Emits one JSON manifest: every item carries its condition, its rendered prompt,
 * and its DERIVED ground truth. Nothing is hand-keyed.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, PROBES } from './render.mjs';
import {
  groundTruth, STRUCTURAL, PRESENTATION_STRUCT, PRESENTATION_RENDER,
  NULL_EDITS, DEFERRED,
} from './transforms.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const outFlag = process.argv.indexOf('--out');
const OUT = outFlag > -1 ? process.argv[outFlag + 1] : path.join(ROOT, 'corpus', 'domain-a-corpus.json');

const src = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-seeds.json'), 'utf8'));
const { seeds, namePool, settingPool } = src;

const items = [];
let n = 0;

const push = (seed, condition, cls, ep, renderOpts, textFn) => {
  const gt = groundTruth(ep);
  const base = render(ep, renderOpts);
  const text = textFn ? textFn(base) : base;
  items.push({
    item_id: `${seed.id}::${condition}`,
    seed_id: seed.id,
    condition,
    class: cls,                       // baseline | presentation | structural | null
    names: { X: ep.participants.X.name, Y: ep.participants.Y.name },
    ground_truth: gt,                 // keys 'X'|'Y'|'neither' — resolve via names
    text,
  });
  n++;
};

for (const [i, seed] of seeds.entries()) {
  const ctx = { i, namePool, settingPool };
  const plain = { voice: 'active', order: 'chrono', register: 'plain', intensity: 'flat' };

  push(seed, 'baseline', 'baseline', seed, plain);

  // presentation — structure-level
  for (const [id, fn] of Object.entries(PRESENTATION_STRUCT)) {
    push(seed, id, 'presentation', fn(seed, ctx), plain);
  }
  // presentation — render-level
  for (const [id, opts] of Object.entries(PRESENTATION_RENDER)) {
    push(seed, id, 'presentation', seed, { ...plain, ...opts });
  }
  // presentation — one composed item, to test order-independence (spec §2 R3 refutation)
  push(seed, 'A-P1+P8', 'presentation',
    PRESENTATION_STRUCT['A-P1'](seed, ctx), { ...plain, voice: 'passive' });

  // structural
  for (const [id, fn] of Object.entries(STRUCTURAL)) {
    push(seed, id, 'structural', fn(seed), plain);
  }
  // involution check: A-S1 applied twice must equal baseline ground truth
  push(seed, 'A-S1x2', 'structural', STRUCTURAL['A-S1'](STRUCTURAL['A-S1'](seed)), plain);

  // null controls
  NULL_EDITS.forEach((edit, k) => {
    push(seed, `A-N0.${k}`, 'null', seed, plain, edit);
  });
}

const manifest = {
  built_from: 'domain-a-seeds.json',
  spec: 'docs/specs/RELATIONAL_GEOMETRY_SPECIFICATION.md',
  deterministic: true,
  generator_model_used: false,
  deferred_conditions: DEFERRED,
  deferred_reason:
    'Metaphor and literary register cannot be rendered mechanically. Including them ' +
    'would require a generator model and reintroduce the confound this corpus removes. ' +
    'Declared, not silently dropped — presentation-invariance figures from this corpus ' +
    'therefore do NOT cover metaphor.',
  probes: PROBES,
  counts: {
    seeds: seeds.length,
    items: items.length,
    by_class: items.reduce((a, it) => ((a[it.class] = (a[it.class] || 0) + 1), a), {}),
  },
  items,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');

console.log(`built ${n} items from ${seeds.length} seeds -> ${path.relative(ROOT, OUT)}`);
console.log(`by class: ${JSON.stringify(manifest.counts.by_class)}`);
console.log(`deferred (declared, not dropped): ${DEFERRED.join(', ')}`);
