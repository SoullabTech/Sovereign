#!/usr/bin/env node
/**
 * AIN Context/Memory Behavioral Contribution Probe — RUNNER (frozen)
 *
 * Arms:
 *   A = Claude + AIN retrieval path (nomic-embed-text cosine top-K over pooled 160-atom store)
 *   B = Claude, no context injected (memory contribution disabled)
 *   C = retrieval layer alone (no model) — cosine displacement + retrieved-set Jaccard
 *   D = Claude + all 4 atoms of the correct item, no retrieval (information ceiling)
 *
 * Preserves exact context supplied per item per arm in raw/.
 * See PRE_REGISTRATION.md. Do not edit after freeze commit; record deviations instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(DIR, 'raw');
fs.mkdirSync(RAW, { recursive: true });

const SEED = 20260811;
const K = 4;
const MODEL = 'claude-opus-5';
const OLLAMA = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const SYSTEM = 'Answer with the single word or shortest phrase that answers the question. If the context does not determine the answer, reply exactly: UNKNOWN.';

// --- api key from .env (never logged) ---
function loadKey() {
  for (const f of ['.env', '.env.production', '.env.development.local']) {
    const p = '/Users/soullab/MAIA-SOVEREIGN/' + f;
    if (!fs.existsSync(p)) continue;
    const line = fs.readFileSync(p, 'utf8').split('\n').find(l => l.trim().startsWith('ANTHROPIC_API_KEY='));
    if (!line) continue;
    const v = line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    if (v && v.length > 40) return v;
  }
  throw new Error('ANTHROPIC_API_KEY not found');
}
const KEY = loadKey();

// --- deterministic shuffle (mulberry32) ---
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, seed) { const r = rng(seed); const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

// --- embeddings via AIN's model ---
const embedCache = new Map();
async function embed(text) {
  if (embedCache.has(text)) return embedCache.get(text);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(OLLAMA + '/api/embeddings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
        signal: AbortSignal.timeout(60000),
      });
      const j = await r.json();
      if (!j.embedding) throw new Error('no embedding');
      embedCache.set(text, j.embedding);
      return j.embedding;
    } catch (e) { if (attempt === 2) throw e; }
  }
}
const cos = (a, b) => { let d = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return d / (Math.sqrt(na) * Math.sqrt(nb)); };

// --- claude ---
async function ask(context, question) {
  const userText = context ? `Context from memory:\n${context}\n\n${question}` : question;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        // DEVIATION D-1 (2026-08-11): pre-registration froze temperature:0, but the API
        // rejects it — "`temperature` is deprecated for this model" (HTTP 400) on claude-opus-5.
        // Parameter removed; model default applies. Recorded, not silently amended.
        // DEVIATION D-2 (2026-08-11): max_tokens 64 -> 512. claude-opus-5 emits a `thinking`
        // block before the text block; 34 of 64 tokens went to thinking on a trivial item,
        // risking truncation of the answer itself. Budget raised; contract otherwise unchanged.
        body: JSON.stringify({ model: MODEL, max_tokens: 512, system: SYSTEM, messages: [{ role: 'user', content: userText }] }),
        signal: AbortSignal.timeout(90000),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
      const j = await r.json();
      // DEVIATION D-3 (2026-08-11): response content is [thinking, text] on claude-opus-5.
      // Original extractor read content[0].text and silently yielded '' on every call.
      // Now concatenates all type==='text' blocks. Scoring rules themselves unchanged.
      const textOut = (j.content ?? []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      return { text: textOut, model: j.model, stop: j.stop_reason, sentContext: userText };
    } catch (e) { if (attempt === 2) return { text: null, error: String(e.message), sentContext: userText }; await new Promise(s => setTimeout(s, 1500 * (attempt + 1))); }
  }
}

// --- scoring ---
const norm = s => (s ?? '').toLowerCase().trim().replace(/^["'`]+|["'`.!]+$/g, '').replace(/\s+/g, ' ').trim();
function correct(resp, expected, aliases) {
  const n = norm(resp);
  if (!n) return false;
  return [expected, ...(aliases || [])].some(e => norm(e) === n);
}

// --- main ---
const corpus = JSON.parse(fs.readFileSync(path.join(DIR, 'corpus.json'), 'utf8'));
const items = shuffle(corpus.items, SEED);

// pooled store: every item contributes its 4 canonical atoms (slot id = itemId:idx)
const slots = [];
for (const it of corpus.items) it.atoms.forEach((t, i) => slots.push({ id: `${it.id}:${i}`, itemId: it.id, idx: i, text: t }));

console.log(`[probe] embedding ${slots.length} pooled atoms + variants + ${items.length} queries…`);
for (const s of slots) s.vec = await embed(s.text);
for (const it of corpus.items) { it._pertVec = await embed(it.perturbed_atom); it._ctrlVec = await embed(it.control_atom); it._qVec = await embed(it.question); }
console.log('[probe] embeddings done.');

function retrieve(item, variant) {
  // store copy with the variant's edited atom swapped into its slot
  const view = slots.map(s => {
    if (s.itemId !== item.id) return s;
    if (variant === 'perturbed' && s.idx === item.lb_index) return { ...s, text: item.perturbed_atom, vec: item._pertVec };
    if (variant === 'control' && s.idx === item.control_index) return { ...s, text: item.control_atom, vec: item._ctrlVec };
    return s;
  });
  const scored = view.map(s => ({ ...s, sim: cos(item._qVec, s.vec) })).sort((a, b) => b.sim - a.sim).slice(0, K);
  return scored;
}
const bullets = arr => arr.map(t => `- ${t}`).join('\n');

const rows = [];
const rawOut = [];
const VARIANTS = ['canonical', 'perturbed', 'control'];

let n = 0;
for (const item of items) {
  n++;
  for (const variant of VARIANTS) {
    const expected = variant === 'perturbed' ? item.perturbed_answer : item.canonical_answer;
    const aliases = variant === 'perturbed' ? item.perturbed_aliases : item.canonical_aliases;

    // variant's own atom list (ground truth for arm D)
    const full = item.atoms.slice();
    if (variant === 'perturbed') full[item.lb_index] = item.perturbed_atom;
    if (variant === 'control') full[item.control_index] = item.control_atom;

    const ret = retrieve(item, variant);
    const retIds = ret.map(r => r.id);
    const hitLB = retIds.includes(`${item.id}:${item.lb_index}`);
    const hitRule = ret.some(r => r.itemId === item.id && r.idx !== item.lb_index);
    const ownCount = ret.filter(r => r.itemId === item.id).length;

    const [A, D] = await Promise.all([
      ask(bullets(ret.map(r => r.text)), item.question),
      ask(bullets(full), item.question),
    ]);
    const B = variant === 'control' ? { text: null, skipped: true, sentContext: item.question } : await ask(null, item.question);

    const row = {
      id: item.id, variant, expected,
      A: A.text, A_ok: correct(A.text, expected, aliases),
      B: B.text, B_ok: B.skipped ? null : correct(B.text, expected, aliases),
      D: D.text, D_ok: correct(D.text, expected, aliases),
      retIds, hitLB, hitRule, ownCount,
      A_err: A.error ?? null, D_err: D.error ?? null, B_err: B.error ?? null,
    };
    rows.push(row);
    rawOut.push({ ...row, contexts: { A: A.sentContext, B: B.sentContext, D: D.sentContext }, retrievedTexts: ret.map(r => ({ id: r.id, sim: r.sim, text: r.text })) });
  }
  process.stdout.write(`\r[probe] ${n}/${items.length} items`);
}
console.log('\n[probe] inference done.');

// --- Arm C: retrieval-only metrics ---
const jac = (a, b) => { const A = new Set(a), B = new Set(b); const i = [...A].filter(x => B.has(x)).length; return i / (new Set([...a, ...b]).size); };
const byId = id => rows.filter(r => r.id === id);
const jaccards = [], lbDisp = [], ctrlDisp = [];
for (const it of corpus.items) {
  const c = byId(it.id).find(r => r.variant === 'canonical');
  const p = byId(it.id).find(r => r.variant === 'perturbed');
  jaccards.push(jac(c.retIds, p.retIds));
  lbDisp.push(1 - cos(slots.find(s => s.id === `${it.id}:${it.lb_index}`).vec, it._pertVec));
  ctrlDisp.push(1 - cos(slots.find(s => s.id === `${it.id}:${it.control_index}`).vec, it._ctrlVec));
}

// --- pair-correct / flip rate ---
function flip(arm) {
  let ok = 0, denom = 0;
  for (const it of corpus.items) {
    const c = byId(it.id).find(r => r.variant === 'canonical');
    const p = byId(it.id).find(r => r.variant === 'perturbed');
    if (arm === 'B' && (c.B_ok === null || p.B_ok === null)) continue;
    const cErr = c[arm + '_err'], pErr = p[arm + '_err'];
    if (cErr || pErr) continue;
    denom++;
    if (c[arm + '_ok'] && p[arm + '_ok']) ok++;
  }
  return { ok, denom, rate: denom ? ok / denom : null };
}
const pairVec = arm => corpus.items.map(it => {
  const c = byId(it.id).find(r => r.variant === 'canonical');
  const p = byId(it.id).find(r => r.variant === 'perturbed');
  return (c[arm + '_ok'] && p[arm + '_ok']) ? 1 : 0;
});
function bootstrapCI(x, y, iters = 10000, seed = SEED) {
  const r = rng(seed); const n = x.length; const ds = [];
  for (let b = 0; b < iters; b++) { let sx = 0, sy = 0; for (let i = 0; i < n; i++) { const j = Math.floor(r() * n); sx += x[j]; sy += y[j]; } ds.push((sx - sy) / n); }
  ds.sort((a, b) => a - b);
  return [ds[Math.floor(0.025 * iters)], ds[Math.floor(0.975 * iters)]];
}
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const median = a => { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const A = pairVec('A'), B = pairVec('B'), D = pairVec('D');
const controlOK = { A: rows.filter(r => r.variant === 'control' && r.A_ok).length, D: rows.filter(r => r.variant === 'control' && r.D_ok).length };

const summary = {
  frozen_protocol: 'PRE_REGISTRATION.md', model: MODEL, K, seed: SEED,
  n_items: corpus.items.length, pooled_atoms: slots.length,
  flip_rate: { A: flip('A'), B: flip('B'), D: flip('D') },
  attribution_delta_A_minus_B: { point: mean(A) - mean(B), ci95: bootstrapCI(A, B) },
  A_minus_D: { point: mean(A) - mean(D), ci95: bootstrapCI(A, D) },
  retrieval: {
    median_jaccard_canonical_vs_perturbed: median(jaccards),
    mean_jaccard: mean(jaccards),
    mean_cosine_displacement_load_bearing: mean(lbDisp),
    mean_cosine_displacement_control: mean(ctrlDisp),
    lb_recall_at_K: rows.filter(r => r.hitLB).length / rows.length,
    mean_own_item_atoms_in_topK: mean(rows.map(r => r.ownCount)),
  },
  control_variant_correct: controlOK,
  errors: rows.filter(r => r.A_err || r.B_err || r.D_err).map(r => ({ id: r.id, variant: r.variant, A_err: r.A_err, B_err: r.B_err, D_err: r.D_err })),
};

fs.writeFileSync(path.join(RAW, 'raw_responses.jsonl'), rawOut.map(r => JSON.stringify(r)).join('\n'));
fs.writeFileSync(path.join(RAW, 'rows.json'), JSON.stringify(rows, null, 2));
fs.writeFileSync(path.join(RAW, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
