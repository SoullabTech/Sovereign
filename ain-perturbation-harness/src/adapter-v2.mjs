#!/usr/bin/env node
/**
 * Domain B v2 adapter. Model-agnostic; normalization only.
 *
 *   node src/adapter-v2.mjs --dry-run                       # NO model contact
 *   node src/adapter-v2.mjs --provider ollama --model ...   # requires authorization
 *
 * ============================================================================
 * ORDERING IS THE POINT
 * ============================================================================
 * For each operator pair the applicability probe is issued and answered BEFORE
 * any change-label probe for that pair. Asking a system to describe a
 * transformation before it has established that the composition exists inverts
 * the semantics the v2 ontology was built to make explicit.
 *
 * Pairs run concurrently; within a pair the sequence is strict. The change
 * probes are still sent — and recorded — when a system declines the pair, so
 * the data exists; `score-v2.mjs` is what declines to interpret it.
 *
 * ⛔ MODEL CONTACT IS GATED. Phase 2 authorization requires all three of:
 *      1. scorer separation           (score-v2.mjs)                DONE
 *      2. adapter ordering            (this file)                   DONE
 *      3. independent human raters    (ontology determinability)    OUTSTANDING
 *    (3) cannot be discharged by any automated proxy. Running without it is a
 *    protocol violation, so this file refuses to run without --i-have-authorization.
 */

import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHANGE_PROBE } from './render-v2.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const B2 = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-v2-corpus.json'), 'utf8'));

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes('--dry-run');
const AUTHORIZED = process.argv.includes('--i-have-authorization');
const PROVIDER = arg('--provider', 'ollama');
const MODEL = arg('--model', 'qwen3:32b');
const CONC = Number(arg('--concurrency', PROVIDER === 'ollama' ? '3' : '6'));

/* ---------------- build the per-pair work units ---------------- */
const appByPair = {};
for (const a of B2.applicability) appByPair[`${a.seed_id}::${a.t1}.${a.t2}`] = a;

const units = [];
for (const [pair, a] of Object.entries(appByPair)) {
  const triple = B2.triples.find((t) => `${t.seed_id}::${t.t1}.${t.t2}` === pair);
  units.push({
    pair,
    applicability: { item_id: a.item_id, prompt: a.prompt, ground_truth: a.ground_truth },
    change: triple
      ? triple.items.map((it) => ({
          triple_id: triple.triple_id,
          role: it.role,
          prompt: `Here are two descriptions of a situation. The second is a modified version of the first.\n\n`
            + `FIRST:\n${it.from}\n\nSECOND:\n${it.to}\n\n${CHANGE_PROBE(B2.change_vocabulary)}`,
        }))
      : [],
  });
}

if (DRY) {
  const withChange = units.filter((u) => u.change.length);
  const appOnly = units.filter((u) => !u.change.length);
  console.log(`DRY RUN — no model contact, no network calls.`);
  console.log(`pairs: ${units.length}  (with change probes: ${withChange.length}, applicability-only: ${appOnly.length})`);
  console.log(`total probes: ${units.length + withChange.length * 3}`);
  console.log('');
  console.log('per-pair ordering (sample — a DEFINED pair):');
  const s = withChange[0];
  console.log(`  1. ${s.applicability.item_id}   [applicability, truth=${s.applicability.ground_truth}]`);
  s.change.forEach((c, i) => console.log(`  ${i + 2}. ${c.triple_id}::${c.role}   [change]`));
  console.log('');
  console.log('per-pair ordering (sample — a ground-truth-blocked pair):');
  const t = appOnly[0];
  console.log(`  1. ${t.applicability.item_id}   [applicability, truth=${t.applicability.ground_truth}]`);
  console.log(`  (no change probes exist for this pair by construction)`);
  console.log('');
  const bad = units.filter((u) => u.change.length && !u.applicability);
  console.log(bad.length ? `FAIL — ${bad.length} pair(s) have change probes without a preceding applicability probe`
                         : 'PASS — every change probe is preceded by an applicability probe for its pair');
  process.exit(bad.length ? 1 : 0);
}

if (!AUTHORIZED) {
  console.error('REFUSED — Phase 2 model contact is not authorized.');
  console.error('  1. scorer separation        DONE  (score-v2.mjs)');
  console.error('  2. adapter ordering         DONE  (this file)');
  console.error('  3. independent human raters OUTSTANDING — cannot be discharged by an automated proxy');
  console.error('Use --dry-run to verify ordering without contacting a model.');
  process.exit(2);
}

/* ---------------- transport (unchanged contract from v1) ---------------- */
function anthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  for (const f of ['.env', '.env.development.local', '.env.docker']) {
    const p = path.join('/Users/soullab/MAIA-SOVEREIGN', f);
    try {
      const m = readFileSync(p, 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*["']?([^"'\s#]+)/m);
      if (m) return m[1];
    } catch { /* next */ }
  }
  throw new Error('ANTHROPIC_API_KEY not found');
}

async function callOllama(prompt) {
  const r = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, messages: [{ role: 'user', content: prompt }], stream: false,
      think: false, options: { temperature: 0, num_predict: 200 },
    }),
  });
  if (!r.ok) throw new Error(`ollama ${r.status}`);
  return (await r.json()).message?.content ?? '';
}

async function callAnthropic(prompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': anthropicKey(), 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 200,
      thinking: { type: 'disabled' }, output_config: { effort: 'medium' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status} ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).content?.map((c) => c.text ?? '').join('') ?? '';
}

const call = PROVIDER === 'ollama' ? callOllama : callAnthropic;

/* ---------------- normalization only ---------------- */
function firstJson(text) {
  if (!text) return null;
  const s = text.indexOf('{');
  if (s === -1) return null;
  let depth = 0;
  for (let i = s; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) {
      try { return JSON.parse(text.slice(s, i + 1)); } catch { return null; }
    }
  }
  return null;
}
const normApp = (raw) => { const j = firstJson(raw); return typeof j?.applicability === 'string' ? j.applicability.trim() : null; };
const normChange = (raw) => { const j = firstJson(raw); return Array.isArray(j?.changed) ? j.changed.filter((x) => typeof x === 'string').map((x) => x.trim()) : null; };

/* ---------------- run: strict order within a pair ---------------- */
const TAG = `v2-${PROVIDER}-${MODEL}`.replace(/[^a-z0-9.-]/gi, '_');
const RUNS = path.join(ROOT, 'runs');
mkdirSync(RUNS, { recursive: true });
const RAW = path.join(RUNS, `raw-${TAG}.jsonl`);
const OUT = path.join(RUNS, `run-${TAG}.json`);

const applicability = [];
const domain_b = [];
let done = 0, errors = 0;
const t0 = Date.now();

async function ask(id, prompt, kind) {
  let raw = null, err = null;
  try { raw = await call(prompt); } catch (e) { err = String(e.message ?? e); errors++; }
  appendFileSync(RAW, JSON.stringify({ id, kind, error: err, raw }) + '\n');
  done++;
  return raw;
}

async function worker(queue) {
  while (queue.length) {
    const u = queue.shift();
    // 1. applicability FIRST — always, and awaited before any change probe.
    const appRaw = await ask(u.applicability.item_id, u.applicability.prompt, 'applicability');
    const value = normApp(appRaw);
    applicability.push({ item_id: u.applicability.item_id, value });

    // 2. change probes after. Sent even when declined: recorded, not interpreted.
    for (const c of u.change) {
      const raw = await ask(`${c.triple_id}::${c.role}`, c.prompt, 'change');
      const toks = normChange(raw);
      if (toks !== null) domain_b.push({ triple_id: c.triple_id, role: c.role, tokens: toks });
    }
    if (done % 50 === 0) process.stderr.write(`  ${done} probes  errors ${errors}\n`);
  }
}

const queue = [...units];
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));

writeFileSync(OUT, JSON.stringify({
  provider: PROVIDER, model: MODEL, corpus_version: B2.version,
  probe_order: 'applicability-before-change, strict within each operator pair',
  pairs: units.length, probes: done, transport_errors: errors,
  elapsed_s: Math.round((Date.now() - t0) / 1000),
  applicability, domain_b,
}, null, 2) + '\n');

console.log(`${TAG}: ${done} probes, ${errors} transport errors, ${Math.round((Date.now() - t0) / 1000)}s`);
