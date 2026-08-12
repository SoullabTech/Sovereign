#!/usr/bin/env node
/**
 * Build the blinded human-validation packet for Domain B v2 ontology
 * determinability. NO MODEL CONTACT. NO NETWORK.
 *
 *   node src/build-rater-packet.mjs
 *
 * Emits:
 *   human-validation/rater-packet.md   the blinded instrument (given to raters)
 *   human-validation/ANSWER_KEY.json   sealed — MUST NOT be shown to raters
 *
 * ============================================================================
 * BLINDING RULES — enforced by verify-rater-packet.mjs, not by care
 * ============================================================================
 * The packet contains rendered examples and plain-language category
 * definitions. It must NOT contain: operator names (R/V/A/T/W/D), ontology
 * token names (third_party_added, witness_bound_to_*), scorer or corpus
 * filenames, expected labels, item ids encoding the operator pair, or any
 * model result. Categories are presented as neutral letters whose mapping to
 * tokens exists only in the sealed key.
 *
 * Order is randomized with a RECORDED SEED and a deterministic LCG — not
 * Math.random — so the packet is reproducible and the shuffle is auditable.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTDIR = path.join(ROOT, 'human-validation');
const B2 = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-v2-corpus.json'), 'utf8'));

/* ---- pre-registered parameters (frozen; see PACKET_SPEC.md) ---- */
const SEED = 20260811;
const PER_STRATUM = 8;
const THIRD = ['third_party_added', 'witness_bound_to_agent', 'witness_bound_to_recipient', 'witness_rebound'];

/* deterministic LCG — reproducible shuffle, no Math.random */
let _s = SEED;
const rnd = () => ((_s = (_s * 1664525 + 1013904223) >>> 0) / 4294967296);
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---- category presentation: neutral letters, plain language, no token names ---- */
const CATEGORIES = [
  { letter: 'A', token: 'third_party_added',
    text: 'A third person became part of what was done — they carried the act out together with the person who did it.' },
  { letter: 'B', token: 'witness_bound_to_agent',
    text: 'A third person appeared who took no part in what was done. They only saw it happen, and they are close to the person who DID the act.' },
  { letter: 'C', token: 'witness_bound_to_recipient',
    text: 'A third person appeared who took no part in what was done. They only saw it happen, and they are close to the person the act was DONE TO.' },
  { letter: 'D', token: 'witness_rebound',
    text: 'A third person who was already there as an onlooker is now close to the other one of the two people than they were before.' },
  { letter: 'E', token: null,
    text: 'Nothing changed about any third person.' },
];

/* ---- candidate pool: single-category items only ---- */
const pool = [];
for (const t of B2.triples) {
  for (const it of t.items) {
    const sub = it.ground_truth.filter((x) => THIRD.includes(x));
    if (sub.length > 1) continue;                       // combinations excluded — declared gap
    pool.push({
      key: `${t.triple_id}::${it.role}`,
      pair: `${t.t1}.${t.t2}`,
      truth_token: sub[0] ?? null,
      truth_letter: (CATEGORIES.find((c) => c.token === (sub[0] ?? null)) ?? {}).letter,
      from: it.from, to: it.to,
    });
  }
}
const combos = B2.triples.flatMap((t) => t.items).filter((it) => it.ground_truth.filter((x) => THIRD.includes(x)).length > 1).length;

/* ---- stratify by ground-truth category; mandatory inclusion of the repaired cases ---- */
const byCat = {};
for (const c of CATEGORIES) byCat[c.letter] = pool.filter((p) => p.truth_letter === c.letter);

// The W-repair cases must be represented, but must not FLOOD the sample:
// taking all 36 W.R/R.W items put 78% of the packet in two pairs and skewed the
// category marginals, which distorts kappa. Pre-registered rule: MANDATORY_SEEDS
// distinct seeds per (repaired pair, role) — every repaired case-type is covered,
// balance is preserved.
const MANDATORY_SEEDS = 2;
const REPAIRED = ['W.R', 'R.W'];
const seenCell = {};
const mandatory = [];
for (const p of pool) {
  if (!REPAIRED.includes(p.pair)) continue;
  const role = p.key.split('::').pop();
  const cell = `${p.pair}|${role}`;
  seenCell[cell] = seenCell[cell] || 0;
  if (seenCell[cell] >= MANDATORY_SEEDS) continue;
  seenCell[cell]++;
  mandatory.push(p);
}
const mandatoryKeys = new Set(mandatory.map((m) => m.key));

const selected = [...mandatory];
for (const c of CATEGORIES) {
  const already = selected.filter((s) => s.truth_letter === c.letter).length;
  const need = Math.max(0, PER_STRATUM - already);
  const avail = shuffle(byCat[c.letter].filter((p) => !mandatoryKeys.has(p.key)));
  selected.push(...avail.slice(0, need));
}

const items = shuffle(selected).map((s, i) => ({ n: i + 1, ...s }));

/* ---- write the sealed key ---- */
mkdirSync(OUTDIR, { recursive: true });
writeFileSync(path.join(OUTDIR, 'ANSWER_KEY.json'), JSON.stringify({
  sealed: true,
  warning: 'MUST NOT be shown to raters, and must not be opened until all rater responses are collected and stored.',
  corpus: 'domain-b-v2-corpus.json (8a3ee854bbdb49ed)',
  seed: SEED,
  per_stratum: PER_STRATUM,
  category_map: Object.fromEntries(CATEGORIES.map((c) => [c.letter, c.token])),
  excluded_multi_category_items: combos,
  items: items.map((i) => ({ n: i.n, key: i.key, pair: i.pair, truth_letter: i.truth_letter, truth_token: i.truth_token })),
}, null, 2) + '\n');

/* ---- write the blinded packet ---- */
const L = [];
L.push('# Reading task — which third person, if any?\n');
L.push('Thank you for helping. This should take about 20 minutes.\n');
L.push('You will read pairs of short descriptions of things that happened between people. In each pair, the **second** description is a modified version of the **first**.\n');
L.push('For each pair, decide **what changed about any third person** — someone other than the two people the description is mainly about.\n');
L.push('## The five answers\n');
for (const c of CATEGORIES) L.push(`**${c.letter}.** ${c.text}\n`);
L.push('## How to answer\n');
L.push('- Answer from the text alone. There is no outside knowledge you are missing.\n');
L.push('- Pick exactly one letter per item.\n');
L.push('- Work through the items **in order**, and **do not go back and change earlier answers** after seeing later ones.\n');
L.push('- Please do **not** discuss the items with anyone else until you have finished and submitted.\n');
L.push('- If an item feels genuinely ambiguous, still pick your best answer, and note the item number under "Notes" at the end. Ambiguity is useful information about the material — it is not a mistake on your part.\n');
L.push('\n---\n');
for (const it of items) {
  L.push(`\n### Item ${it.n}\n`);
  L.push(`**First:**\n\n> ${it.from}\n`);
  L.push(`**Second:**\n\n> ${it.to}\n`);
  L.push(`**Your answer (A / B / C / D / E):**  \`____\`\n`);
  L.push('\n---\n');
}
L.push('\n## Notes\n\nItems that felt ambiguous, and why (optional):\n\n\n');
L.push(`\n---\n\n*Packet ${items.length} items. Please return this completed file. Do not share your answers with other raters before submitting.*\n`);

writeFileSync(path.join(OUTDIR, 'rater-packet.md'), L.join('\n'));

const dist = {};
for (const i of items) dist[i.truth_letter] = (dist[i.truth_letter] || 0) + 1;
console.log(`packet: ${items.length} items  seed=${SEED}`);
console.log(`stratum distribution (sealed): ${JSON.stringify(dist)}`);
console.log(`mandatory W-repair items included: ${mandatory.length}`);
console.log(`multi-category items excluded from human validation (declared gap): ${combos}`);
console.log(`wrote human-validation/rater-packet.md and ANSWER_KEY.json`);
