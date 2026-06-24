/**
 * predictor-ablation — use the stance detector as an INSTRUMENT (replication build).
 *
 * Question (Kelly): what variable predicts retained → captured? First cut found technical
 * density (not length) drives capture, with a noisy L18 dip. This replicates at n≥12 to
 * tighten the open variable. Frozen: detector, content scripts, trigger, assistant turns.
 *
 * Grid: content {neutral, technical} × length {6, 12, 18} × N. Trigger = real t18 (constant).
 * Assistant history turns scripted HELD/reflective & constant → isolates USER-side density.
 *
 * Answers: does technical L6/L12 stay near saturation? does L18 stay lower or was it noise?
 *          does neutral stay at baseline? is the target "technical density" or "technical
 *          density unless counter-modeled by accumulating reflective assistant stance"?
 *
 * Env: N (default 12), LENGTHS (default 6,12,18), CONC (default 6).
 * Run: npx tsx scripts/repro/predictor-ablation.ts
 */
import { Anthropic } from '@anthropic-ai/sdk';
import { buildMaiaWisePrompt } from '../../lib/sovereign/maiaVoice';
import { classifyStance } from './stanceDetector';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  for (const f of ['.env.local', '.env.production', '.env']) {
    try { for (const line of fs.readFileSync(path.resolve(process.cwd(), f), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (!m) continue;
      let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      const cur = process.env[m[1]]; if (v !== '' && (cur === undefined || cur === '')) process.env[m[1]] = v;
    } } catch { /* optional */ }
  }
}
loadEnv();
const MODEL = process.env.CLAUDE_VOICE_MODEL || 'claude-sonnet-4-6';
if (!process.env.ANTHROPIC_API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const N = Number(process.env.N || 12);
const LENGTHS = (process.env.LENGTHS || '6,12,18').split(',').map(Number);
const CONC = Number(process.env.CONC || 6);

const IDENTITY_BLOCK = `\n\n👤 USER IDENTIFICATION (CRITICAL):
The person you are speaking with is named "Kelly".
- Use this name when greeting them or addressing them by name
- "Kelly" is NOT Kelly unless their name is literally "Kelly"
[member context]
memberId: ce284751-e457-42f6-89b6-bc07d0876682`;

const TECH = [
  "Pulling the deploy logs now — there's a latency spike at 14:00 I want to isolate before touching config.",
  "p99 on the read path is at 800ms; p50 is fine, so it's tail behavior.",
  "Looks like a cache-miss cascade after the eviction-policy change. Checking hit rate.",
  "The retry storm is hammering the auth service — backoff isn't kicking in.",
  "Ran the migration on staging; row counts match but the index didn't rebuild.",
  "Thread pool saturates under load; queue depth climbs then timeouts start.",
  "Diffed the two configs — the only delta is the connection-pool size.",
  "Grepped the error logs: it's all ECONNRESET from the same upstream.",
  "Container-freshness check passed, so it's runtime, not a stale build.",
  "Tracing the request gateway → service → db, the db span is the whole budget.",
  "The gate-failure and the real failure look identical in logs; need a structural marker.",
  "Memory headroom is fine, so it's lock contention on the write path, not OOM.",
  "Rolled back the last commit on a branch; the regression follows the weighting change.",
  "The scan shows 3 of 4 layers passing and one empty under load.",
  "Throughput holds until ~2k rps then collapses — resource exhaustion shape.",
  "Pulled a structural-markers-only export to compare shape without content previews.",
  "The repro is intermittent, which usually means a race, not a hard bug.",
  "Isolating whether the failure is in write, identity, recall, or ranking — one at a time.",
];
const NEUT = [
  "Morning. Slept okay, had some coffee, watching the rain come down.",
  "Thinking about making soup later. Something slow.",
  "The garden's coming in — the tomatoes finally turned.",
  "Found an old playlist from years ago, been letting it run.",
  "Might take a walk before it gets too warm.",
  "Quiet weekend ahead, nothing on the calendar for once.",
  "The cat's claimed the warm spot by the window again.",
  "Been meaning to call my brother, keep forgetting.",
  "Made bread yesterday, the crust came out right this time.",
  "There's a fog sitting low over the hills this morning.",
  "Reorganized the bookshelf, found a few I forgot I had.",
  "The market had good peaches, bought too many as usual.",
  "Slow start today, just easing into it.",
  "Repotted a couple plants that were getting rootbound.",
  "Watched the light change on the wall for a while.",
  "Thinking I might paint the back room this summer.",
  "The neighbors' kids are out riding bikes, nice to hear.",
  "Just tea and a window this morning, nothing pressing.",
];
const ASST = ["Mm. I'm with you.", "I hear that. Say more when you're ready.", "Got it. What's that like for you?", "Noted. I'm following.", "Yeah. Where does that sit?", "Okay. I'm here.", "That lands. Go on.", "Right. Take your time."];

function quiet<T>(fn: () => T): T { const l = console.log, i = console.info, w = console.warn; console.log = console.info = console.warn = (() => {}) as any; try { return fn(); } finally { console.log = l; console.info = i; console.warn = w; } }
function buildHistory(pool: string[], L: number): any[] { const h: any[] = []; for (let j = 0; j < L; j++) { h.push({ role: 'user', content: pool[j % pool.length] }); h.push({ role: 'assistant', content: ASST[j % ASST.length] }); } return h; }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function gen(system: string, messages: any[], tries = 4): Promise<string> {
  for (let a = 0; a < tries; a++) {
    try { const r = await anthropic.messages.create({ model: MODEL, max_tokens: 500, temperature: 0.7, system, messages }); return (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('\n').trim(); }
    catch (e) { if (a === tries - 1) throw e; await sleep(900 * (a + 1)); }
  }
  return '';
}
async function pool<T>(tasks: Array<() => Promise<T>>, conc: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length); let next = 0, done = 0;
  async function worker() { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); if (++done % 12 === 0) console.log(`  …${done}/${tasks.length}`); } }
  await Promise.all(Array.from({ length: Math.min(conc, tasks.length) }, worker));
  return out;
}

async function main() {
  const turns = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/repro/fixtures/session.json'), 'utf8'));
  const trigger = turns.find((t: any) => t.turn_index === 18).user_text as string;
  const arms: Array<['neutral' | 'technical', string[]]> = [['neutral', NEUT], ['technical', TECH]];
  console.log(`predictor-ablation REPLICATION · model=${MODEL} · N=${N}/cell · lengths=${LENGTHS.join(',')} · conc=${CONC} · trigger=real t18\n`);

  // precompute per-cell system + history sequentially (quiet-safe, no concurrency race)
  const cfg: Record<string, { content: string; L: number; hist: any[]; system: string }> = {};
  for (const [content, pool0] of arms) for (const L of LENGTHS) {
    const hist = buildHistory(pool0, L);
    const system = quiet(() => buildMaiaWisePrompt({ timezone: 'America/Los_Angeles' } as any, trigger, hist)) + IDENTITY_BLOCK;
    cfg[`${content}|${L}`] = { content, L, hist, system };
  }
  // flat task list → concurrent generation
  const tasks: Array<() => Promise<any>> = [];
  for (const key of Object.keys(cfg)) for (let i = 0; i < N; i++) tasks.push(async () => {
    const { content, L, hist, system } = cfg[key];
    let out = ''; try { out = await gen(system, [...hist, { role: 'user', content: trigger }]); } catch { out = ''; }
    const c = classifyStance(out);
    return { content, L, i, stance_mode: c.stance_mode, recovered: c.recovered, retained: c.stance_retained, errored: out === '', output: out };
  });
  console.log(`running ${tasks.length} generations…`);
  const raw = await pool(tasks, CONC);

  // aggregate
  const cell = (content: string, L: number) => raw.filter(r => r.content === content && r.L === L);
  console.log(`\n=== capture rate (captured / n) ===`);
  console.log('content      ' + LENGTHS.map(L => `L=${L}`.padStart(6)).join(' '));
  for (const [content] of arms) console.log(content.padEnd(11) + '  ' + LENGTHS.map(L => { const c = cell(content, L); const cap = c.filter(r => !r.retained).length; return `${Math.round(100 * cap / c.length)}%`.padStart(6); }).join(' '));
  console.log('\n=== captured/n  (recovered) ===');
  for (const [content] of arms) console.log(content.padEnd(11) + '  ' + LENGTHS.map(L => { const c = cell(content, L); const cap = c.filter(r => !r.retained).length; const rec = c.filter(r => r.recovered).length; return `${cap}/${c.length}(${rec})`.padStart(8); }).join(' '));
  const errs = raw.filter(r => r.errored).length; if (errs) console.log(`\n(${errs} errored generations excluded from rates? no — counted as retained; rerun if >0)`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.resolve(process.cwd(), `scripts/repro/results/predictor-ablation-${stamp}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ model: MODEL, N, lengths: LENGTHS, raw }, null, 2));
  console.log(`\nfull → ${path.relative(process.cwd(), outFile)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
