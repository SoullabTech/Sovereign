#!/usr/bin/env node
/**
 * Corpus self-verification. Runs against the BUILT corpus, before any model sees it.
 *
 * WHAT THIS CATCHES
 *   Construction errors that would silently corrupt every downstream figure:
 *   presentation transforms that move ground truth (they must not), structural
 *   transforms that do not move it (weak items), involutions that fail to close,
 *   and renderings that collapse two conditions to identical text.
 *
 * WHY IT IS SEPARATE FROM SCORING
 *   A harness that cannot fail before contacting a model is not an instrument.
 *   Everything here is checkable without a model, so it must be checked without one.
 *
 * Exit 1 on any ERROR. WARN items are reported and do not fail — they are recorded
 * facts about corpus composition, not defects.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const m = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-corpus.json'), 'utf8'));

const errors = [];
const warns = [];
const by = (c) => m.items.filter((i) => i.condition === c);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const baseline = Object.fromEntries(by('baseline').map((i) => [i.seed_id, i]));

/* 1. presentation must NOT move ground truth */
for (const it of m.items.filter((i) => i.class === 'presentation')) {
  if (!eq(it.ground_truth, baseline[it.seed_id].ground_truth)) {
    errors.push(`presentation ${it.item_id} moved ground truth — transform is not presentation`);
  }
}

/* 2. null must NOT move ground truth, and must change the TEXT */
for (const it of m.items.filter((i) => i.class === 'null')) {
  const b = baseline[it.seed_id];
  if (!eq(it.ground_truth, b.ground_truth)) errors.push(`null ${it.item_id} moved ground truth`);
  if (it.text === b.text) {
    errors.push(`null ${it.item_id} is textually identical to baseline — noise floor would be trivially 1.0`);
  }
}

/* 3. involution must close */
for (const it of by('A-S1x2')) {
  if (!eq(it.ground_truth, baseline[it.seed_id].ground_truth)) {
    errors.push(`A-S1 is not an involution for ${it.seed_id} — declared structure (group-like) refuted`);
  }
}

/* 4. structural items whose truth does NOT move are WEAK, not wrong.
      They must be excluded from sensitivity scoring or they dilute it. */
const weak = [];
for (const it of m.items.filter((i) => i.class === 'structural' && i.condition !== 'A-S1x2')) {
  if (eq(it.ground_truth, baseline[it.seed_id].ground_truth)) weak.push(it.item_id);
}
if (weak.length) {
  warns.push(
    `${weak.length} structural item(s) leave ground truth unchanged (non-harmful acts make P1/P3 ` +
    `inapplicable in both role orders). EXCLUDED from structural sensitivity by score.mjs. ` +
    `Items: ${weak.join(', ')}`
  );
}

/* 5. no two conditions of the same seed may render identical text.
      EXEMPT: A-S1x2 — identical text there is not a collision, it is the PROOF that
      the involution closed. Flagging it would be flagging the property under test. */
const seen = new Map();
for (const it of m.items) {
  if (it.condition === 'A-S1x2') continue;
  const k = `${it.seed_id}::${it.text}`;
  if (seen.has(k)) errors.push(`${it.item_id} renders identically to ${seen.get(k)} — conditions not separable`);
  else seen.set(k, it.item_id);
}
/* 5b. A-S1x2 MUST render identically — that is the involution closing at text level. */
for (const it of by('A-S1x2')) {
  if (it.text !== baseline[it.seed_id].text) {
    errors.push(`A-S1x2 ${it.item_id} differs from baseline text — involution did not close`);
  }
}

/* 6. deferred conditions must be declared */
if (!m.deferred_conditions?.length) errors.push('deferred_conditions missing — silent coverage cap');

/* report */
console.log(`corpus: ${m.counts.items} items / ${m.counts.seeds} seeds  ${JSON.stringify(m.counts.by_class)}`);
console.log(`scorable structural items: ${m.items.filter(i => i.class === 'structural' && i.condition !== 'A-S1x2').length - weak.length}`);
for (const w of warns) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `\nFAIL — ${errors.length} error(s)` : `\nPASS — ${warns.length} warning(s), 0 errors`);
process.exit(errors.length ? 1 : 0);
