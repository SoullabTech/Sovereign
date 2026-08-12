#!/usr/bin/env node
/**
 * Model adapter. Corpus -> prompt -> raw answer -> NORMALIZATION ONLY -> run.json
 *
 *   node src/adapter.mjs --provider ollama   --model qwen3:32b
 *   node src/adapter.mjs --provider anthropic --model claude-opus-5
 *   node src/adapter.mjs --provider ollama --model qwen3:32b --limit 20   # smoke
 *
 * PROHIBITED IN THIS FILE, BY PROTOCOL
 *   No model-specific repair. No retry-until-parseable. No "helpful" reinterpretation
 *   of a malformed answer. No coercion of an out-of-vocabulary token to the nearest
 *   legal one. If a model returns something unresolvable, it STAYS unresolvable and
 *   becomes visible in the score as unanswered / unresolved / out-of-vocab.
 *
 * The only provider-specific code is transport: endpoint, auth, response envelope.
 * Prompt text, temperature intent, and normalization are identical across providers.
 *
 * Raw outputs are written separately from normalized scorer inputs, so any later
 * question about normalization can be re-answered from the raw record.
 */

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const A = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-a-corpus.json'), 'utf8'));
const B = JSON.parse(readFileSync(path.join(ROOT, 'corpus', 'domain-b-corpus.json'), 'utf8'));

/* ---------------- args ---------------- */
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const PROVIDER = arg('--provider', 'ollama');
const MODEL = arg('--model', 'qwen3:32b');
const LIMIT = Number(arg('--limit', '0'));
const CONC = Number(arg('--concurrency', PROVIDER === 'ollama' ? '2' : '6'));
const TAG = `${PROVIDER}-${MODEL}`.replace(/[^a-z0-9.-]/gi, '_');

const RUNS = path.join(ROOT, 'runs');
mkdirSync(RUNS, { recursive: true });
const RAW = path.join(RUNS, `raw-${TAG}.jsonl`);
const OUT = path.join(RUNS, `run-${TAG}.json`);

/* ---------------- prompts (identical across providers) ---------------- */

const A_PROMPT = (it) => `Read this short description of something that happened between people.

${it.text}

Answer these three questions. Reply with ONLY a JSON object, no other text.

P1. Whose trust was violated?
P2. Who is more likely to initiate contact next?
P3. Who, if anyone, owes repair?

Each answer must be exactly one of: a person's name as written above, "neither", or "both".

Format: {"P1": "...", "P2": "...", "P3": "..."}`;

const B_PROMPT = (item) => `Here are two descriptions of a situation. The second is a modified version of the first.

FIRST:
${item.from}

SECOND:
${item.to}

Which of the following changed between the first and the second? Reply with ONLY a JSON object, no other text.

Allowed values: ${B.change_vocabulary.join(', ')}

If nothing changed, return an empty list.

Format: {"changed": ["...", "..."]}`;

/* ---------------- transport ---------------- */

function anthropicKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  for (const f of ['.env', '.env.development.local', '.env.docker']) {
    const p = path.join('/Users/soullab/MAIA-SOVEREIGN', f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, 'utf8').match(/^\s*ANTHROPIC_API_KEY\s*=\s*["']?([^"'\s#]+)/m);
    if (m) return m[1];
  }
  throw new Error('ANTHROPIC_API_KEY not found');
}

async function callOllama(prompt) {
  const r = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      think: false,                       // transport-level: no extended reasoning
      options: { temperature: 0, num_predict: 200 },
    }),
  });
  if (!r.ok) throw new Error(`ollama ${r.status}`);
  return (await r.json()).message?.content ?? '';
}

async function callAnthropic(prompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': anthropicKey(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      // Transport-level parity with ollama's `think: false`. On Opus 5 thinking is
      // ON by default, so it must be disabled explicitly or the two providers would
      // be answering under different reasoning regimes. `disabled` is accepted only
      // at effort `high` or below — 400 at xhigh/max. `temperature` is removed on
      // this model family and 400s if sent.
      thinking: { type: 'disabled' },
      output_config: { effort: 'medium' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return j.content?.map((c) => c.text ?? '').join('') ?? '';
}

const call = PROVIDER === 'ollama' ? callOllama : callAnthropic;

/* ---------------- normalization ONLY ---------------- */

/** Extract the first balanced JSON object. Returns null if none — never guesses. */
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

const normA = (raw) => {
  const j = firstJson(raw);
  if (!j) return null;                                  // unanswered, not repaired
  const pick = (k) => (typeof j[k] === 'string' ? j[k].trim() : null);
  return { P1: pick('P1'), P2: pick('P2'), P3: pick('P3') };
};

const normB = (raw) => {
  const j = firstJson(raw);
  if (!j || !Array.isArray(j.changed)) return null;     // unanswered, not repaired
  return j.changed.filter((x) => typeof x === 'string').map((x) => x.trim());
};

/* ---------------- run ---------------- */

const tasks = [];
for (const it of A.items) tasks.push({ domain: 'a', id: it.item_id, prompt: A_PROMPT(it) });
for (const t of B.triples) {
  for (const item of t.items) {
    tasks.push({ domain: 'b', id: `${t.triple_id}::${item.role}`, triple_id: t.triple_id, role: item.role, prompt: B_PROMPT(item) });
  }
}
const work = LIMIT ? tasks.slice(0, LIMIT) : tasks;

const domain_a = [];
const domain_b = [];
let done = 0, errors = 0;
const t0 = Date.now();

async function worker(queue) {
  while (queue.length) {
    const task = queue.shift();
    let raw = null, err = null;
    try { raw = await call(task.prompt); }
    catch (e) { err = String(e.message ?? e); errors++; }

    appendFileSync(RAW, JSON.stringify({ id: task.id, domain: task.domain, error: err, raw }) + '\n');

    if (task.domain === 'a') domain_a.push({ item_id: task.id, answers: normA(raw) ?? { P1: null, P2: null, P3: null } });
    else {
      const toks = normB(raw);
      if (toks !== null) domain_b.push({ triple_id: task.triple_id, role: task.role, tokens: toks });
      // toks === null -> omitted entirely, so the scorer counts it as unanswered
    }

    if (++done % 25 === 0) {
      const rate = done / ((Date.now() - t0) / 1000);
      process.stderr.write(`  ${done}/${work.length}  ${rate.toFixed(2)}/s  errors ${errors}\n`);
    }
  }
}

const queue = [...work];
await Promise.all(Array.from({ length: CONC }, () => worker(queue)));

writeFileSync(OUT, JSON.stringify({
  provider: PROVIDER, model: MODEL,
  corpus_a_items: A.counts.items, corpus_b_triples: B.counts.triples,
  tasks_attempted: work.length, transport_errors: errors,
  elapsed_s: Math.round((Date.now() - t0) / 1000),
  domain_a, domain_b,
}, null, 2) + '\n');

console.log(`\n${TAG}: ${done} tasks, ${errors} transport errors, ${Math.round((Date.now() - t0) / 1000)}s`);
console.log(`raw:  ${path.relative(ROOT, RAW)}`);
console.log(`run:  ${path.relative(ROOT, OUT)}`);
