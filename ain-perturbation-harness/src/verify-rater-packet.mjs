#!/usr/bin/env node
/**
 * Verify the blinding of the rater packet. Run before any rater sees it.
 *
 * Blinding must be a property that can be CHECKED, not one that depends on the
 * author having been careful while writing the generator. Every leak class is
 * asserted mechanically here.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = path.join(ROOT, 'human-validation', 'rater-packet.md');
const K = path.join(ROOT, 'human-validation', 'ANSWER_KEY.json');

const errors = [];
if (!existsSync(P)) { console.log('ERROR packet missing'); process.exit(1); }
const packet = readFileSync(P, 'utf8');
const key = JSON.parse(readFileSync(K, 'utf8'));

/* 1. no ontology token names */
for (const tok of ['third_party_added', 'witness_bound_to_agent', 'witness_bound_to_recipient', 'witness_rebound',
                   'roles_reversed', 'act_flipped', 'response_flipped', 'response_removed']) {
  if (packet.includes(tok)) errors.push(`token name leaked into packet: ${tok}`);
}

/* 2. no operator names or pair ids (W.R, R∘W, "operator", etc.) */
if (/\b[RVATWD]\.[RVATWD]\b/.test(packet)) errors.push('operator pair id leaked (e.g. "W.R")');
for (const w of ['operator', 'composition', 'applicability', 'DEFINED', 'INAPPLICABLE', 'UNDEFINED', 'ground truth', 'ground_truth']) {
  if (new RegExp(`\\b${w}\\b`, 'i').test(packet)) errors.push(`internal vocabulary leaked: "${w}"`);
}

/* 3. no corpus/scorer filenames or item keys */
for (const w of ['domain-b', 'corpus', 'characterize', 'score.mjs', '.json', '.mjs', 'seed=', 'A01::', 'triple']) {
  if (packet.includes(w)) errors.push(`internal reference leaked: "${w}"`);
}

/* 4. no expected labels — the packet must not contain any item's answer */
for (const it of key.items) {
  if (packet.includes(it.key)) errors.push(`item key leaked: ${it.key}`);
}
if (/\*\*Your answer[^`]*`\s*[A-E]\s*`/.test(packet)) errors.push('an answer blank is pre-filled');

/* 5. the key must be sealed and complete */
if (!key.sealed) errors.push('answer key not marked sealed');
const packetItems = (packet.match(/^### Item \d+$/gm) || []).length;
if (packetItems !== key.items.length) errors.push(`packet has ${packetItems} items, key has ${key.items.length}`);

/* 6. every ontology category must appear in the sample, or it is unvalidated */
const letters = new Set(key.items.map((i) => i.truth_letter));
for (const l of ['A', 'B', 'C', 'D', 'E']) {
  if (!letters.has(l)) errors.push(`category ${l} (${key.category_map[l] ?? 'none'}) has no items — would go unvalidated`);
}

/* 7. the repaired W cases must be present */
const repaired = key.items.filter((i) => i.pair === 'W.R' || i.pair === 'R.W').length;
if (repaired === 0) errors.push('no W-repair items in the sample — the v2 fix would go unvalidated');

/* 8. order must not be grouped by answer (a giveaway) */
let runs = 1;
for (let i = 1; i < key.items.length; i++) if (key.items[i].truth_letter !== key.items[i - 1].truth_letter) runs++;
if (runs < key.items.length / 3) errors.push(`items appear grouped by answer (${runs} runs across ${key.items.length} items)`);

console.log(`packet items: ${packetItems}   categories covered: ${[...letters].sort().join('')}   W-repair items: ${repaired}`);
console.log(`answer-order runs: ${runs}/${key.items.length} (higher = better mixed)`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `\nFAIL — ${errors.length} blinding error(s)` : '\nPASS — packet is blind: no tokens, operators, keys, or expected answers');
process.exit(errors.length ? 1 : 0);
