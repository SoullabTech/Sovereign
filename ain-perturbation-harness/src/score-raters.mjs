#!/usr/bin/env node
/**
 * Score collected rater responses. RUN ONLY AFTER ALL RESPONSES ARE COLLECTED
 * AND STORED. Opening the answer key earlier violates the protocol.
 *
 *   node src/score-raters.mjs                 # reads human-validation/responses/*.md
 *   node src/score-raters.mjs --selftest      # proves the maths on synthetic raters
 *
 * Computes Fleiss' kappa (inter-rater agreement) and majority-vs-ground-truth
 * agreement. Both gates are frozen in PACKET_SPEC.md and are NOT arguments to
 * this script — a threshold you can pass on the command line is a threshold that
 * will be adjusted after seeing the result.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HV = path.join(ROOT, 'human-validation');

/* FROZEN — see PACKET_SPEC.md §6. Deliberately not configurable. */
const KAPPA_GATE = 0.60;          // spec §C1, by analogy
const TRUTH_GATE = 0.85;          // newly chosen for this unit
const MIN_RATERS = 3;
const CATS = ['A', 'B', 'C', 'D', 'E'];

/** Fleiss' kappa over an items × categories count matrix. */
export function fleissKappa(counts) {
  const N = counts.length;
  if (!N) return null;
  const n = counts[0].reduce((a, b) => a + b, 0);
  if (n < 2) return null;
  const Pi = counts.map((row) => (row.reduce((a, c) => a + c * c, 0) - n) / (n * (n - 1)));
  const Pbar = Pi.reduce((a, b) => a + b, 0) / N;
  const pj = counts[0].map((_, j) => counts.reduce((a, row) => a + row[j], 0) / (N * n));
  const Pe = pj.reduce((a, p) => a + p * p, 0);
  if (Pe === 1) return null;                       // no variance — kappa undefined
  return (Pbar - Pe) / (1 - Pe);
}

/** Parse a returned packet: "### Item 7" … "**Your answer …:**  `C`" */
export function parseResponses(text) {
  const out = {};
  const re = /###\s*Item\s*(\d+)[\s\S]*?\*\*Your answer[^`]*`\s*([A-Ea-e])?\s*`/g;
  let m;
  while ((m = re.exec(text)) !== null) if (m[2]) out[Number(m[1])] = m[2].toUpperCase();
  return out;
}

function report(raterAnswers, key) {
  const raters = Object.keys(raterAnswers);
  const items = key.items.map((i) => i.n);
  const notes = [];

  if (raters.length < MIN_RATERS) notes.push(`ONLY ${raters.length} RATER(S) — protocol requires ≥ ${MIN_RATERS}`);

  const usable = items.filter((n) => raters.every((r) => raterAnswers[r][n]));
  const missing = items.length - usable.length;

  const counts = usable.map((n) => CATS.map((c) => raters.filter((r) => raterAnswers[r][n] === c).length));
  const kappa = fleissKappa(counts);

  const truth = Object.fromEntries(key.items.map((i) => [i.n, i.truth_letter]));
  let majorityRight = 0;
  const perItem = [];
  for (const n of usable) {
    const tally = {};
    for (const r of raters) tally[raterAnswers[r][n]] = (tally[raterAnswers[r][n]] || 0) + 1;
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const majority = top[0][1] > raters.length / 2 ? top[0][0] : null;
    const ok = majority !== null && majority === truth[n];
    if (ok) majorityRight++;
    perItem.push({ n, truth: truth[n], answers: raters.map((r) => raterAnswers[r][n]).join(''), majority, ok });
  }
  const truthRate = usable.length ? majorityRight / usable.length : null;

  /* per-category and the two distinctions the spec flags as most at risk */
  const byCat = {};
  for (const p of perItem) {
    byCat[p.truth] = byCat[p.truth] || { ok: 0, n: 0 };
    byCat[p.truth].n++; if (p.ok) byCat[p.truth].ok++;
  }
  const bcConfusion = perItem.filter((p) => ['B', 'C'].includes(p.truth) && p.majority && ['B', 'C'].includes(p.majority) && p.majority !== p.truth).length;
  const dMiss = perItem.filter((p) => p.truth === 'D' && !p.ok).length;

  const kappaPass = kappa !== null && kappa >= KAPPA_GATE;
  const truthPass = truthRate !== null && truthRate >= TRUTH_GATE;

  console.log(`raters: ${raters.length} (${raters.join(', ')})   items scored: ${usable.length}/${items.length}${missing ? ` (${missing} incomplete)` : ''}`);
  console.log('');
  console.log(`Fleiss kappa            ${kappa === null ? 'undefined' : kappa.toFixed(4)}   gate ≥ ${KAPPA_GATE}   ${kappaPass ? 'PASS' : 'FAIL'}`);
  console.log(`majority vs truth       ${truthRate === null ? '—' : truthRate.toFixed(4)}   gate ≥ ${TRUTH_GATE}   ${truthPass ? 'PASS' : 'FAIL'}`);
  console.log('');
  console.log('per-category majority accuracy:');
  for (const c of CATS) if (byCat[c]) console.log(`  ${c}  ${byCat[c].ok}/${byCat[c].n}`);
  console.log('');
  console.log(`B<->C confusions (which side the onlooker is on): ${bcConfusion}`);
  console.log(`D misses (re-binding — unchanged clause, moved surroundings): ${dMiss}`);
  console.log('');
  console.log('disagreements (corpus evidence, not rater failure):');
  for (const p of perItem.filter((x) => !x.ok)) {
    console.log(`  item ${String(p.n).padStart(2)}  truth ${p.truth}  answers ${p.answers}  majority ${p.majority ?? 'none'}`);
  }
  for (const nte of notes) console.log(`\nNOTE  ${nte}`);
  const pass = kappaPass && truthPass && raters.length >= MIN_RATERS;
  console.log(`\n${pass ? 'PASS — ontology determinability validated independently' : 'FAIL — prose is under-determined; this is corpus evidence, and requires a v3 amendment. Do NOT add raters, loosen categories, drop items, or reseed.'}`);
  return pass;
}

/* ---------------- self-test: prove the maths before trusting it ---------------- */
function selftest() {
  const key = JSON.parse(readFileSync(path.join(HV, 'ANSWER_KEY.json'), 'utf8'));
  const truth = Object.fromEntries(key.items.map((i) => [i.n, i.truth_letter]));
  const ns = key.items.map((i) => i.n);
  const fails = [];

  // perfect agreement with truth -> kappa 1, truth 1
  const perfect = { r1: { ...truth }, r2: { ...truth }, r3: { ...truth } };
  const cP = ns.map((n) => CATS.map((c) => (truth[n] === c ? 3 : 0)));
  if (Math.abs(fleissKappa(cP) - 1) > 1e-9) fails.push(`perfect agreement should give kappa 1, got ${fleissKappa(cP)}`);

  // total disagreement among 3 raters on every item -> kappa <= 0
  const cD = ns.map(() => [1, 1, 1, 0, 0]);
  const kD = fleissKappa(cD);
  if (!(kD <= 0.01)) fails.push(`three-way split should give kappa ~<=0, got ${kD}`);

  // unanimous but WRONG -> kappa 1, truth 0: the exact case kappa alone cannot catch
  const wrong = Object.fromEntries(ns.map((n) => [n, truth[n] === 'A' ? 'B' : 'A']));
  const cW = ns.map((n) => CATS.map((c) => (wrong[n] === c ? 3 : 0)));
  const kW = fleissKappa(cW);
  if (kW === null || kW < 0.99) fails.push(`unanimous-but-wrong should still give high kappa, got ${kW}`);

  // parser round-trip
  const sample = '### Item 3\n\n**Your answer (A / B / C / D / E):**  `C`\n';
  if (parseResponses(sample)[3] !== 'C') fails.push('parser failed to read an answer');
  const blank = '### Item 4\n\n**Your answer (A / B / C / D / E):**  `____`\n';
  if (parseResponses(blank)[4] !== undefined) fails.push('parser read an unfilled blank as an answer');

  console.log('SELF-TEST (rater scoring)');
  console.log(`  perfect agreement      kappa ${fleissKappa(cP).toFixed(4)}`);
  console.log(`  three-way split        kappa ${kD.toFixed(4)}`);
  console.log(`  unanimous but WRONG    kappa ${kW.toFixed(4)}  <- why the truth gate exists alongside kappa`);
  console.log(`  parser                 reads filled answers, ignores blanks`);
  for (const f of fails) console.log(`ERROR ${f}`);
  console.log(fails.length ? `\nFAIL — ${fails.length} error(s)` : '\nPASS — kappa behaves correctly, including the unanimous-but-wrong case');
  process.exit(fails.length ? 1 : 0);
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();
else {
  const RESP = path.join(HV, 'responses');
  if (!existsSync(RESP)) {
    console.error('No responses/ directory. Collect and store all rater responses first —');
    console.error('the answer key must not be opened until then (PACKET_SPEC.md §5).');
    process.exit(2);
  }
  const files = readdirSync(RESP).filter((f) => f.endsWith('.md'));
  if (!files.length) { console.error('responses/ is empty.'); process.exit(2); }
  const key = JSON.parse(readFileSync(path.join(HV, 'ANSWER_KEY.json'), 'utf8'));
  const answers = {};
  for (const f of files) answers[path.basename(f, '.md')] = parseResponses(readFileSync(path.join(RESP, f), 'utf8'));
  process.exit(report(answers, key) ? 0 : 1);
}
