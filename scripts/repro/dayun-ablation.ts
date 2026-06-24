/**
 * Q1 — Da Yun ABLATION (influence receipt).
 *
 * Condition A: constitution ON + Da Yun ON   (= production prompt)
 * Condition B: constitution ON + Da Yun OFF  (only the Da Yun section removed)
 * Everything else identical. Faithful: uses the live buildMaiaWisePrompt + the exact
 * constitution/Da Yun addenda the route builds, toggling ONLY the Da Yun section of
 * the wuxingSnapshotAddendum channel.
 *
 * N per arm (default 8). Blind scoring: each response judged in isolation on 6
 * dimensions (judge never sees the arm). Receipt is NOT "responses differed" — it is
 * "between-arm difference exceeds within-arm (noise-floor) variation," plus the
 * DIRECTION on interpretive-gravity dimensions.
 *
 * Safe: local, Anthropic-direct, no DB writes. Run: ANTHROPIC_API_KEY=... npx tsx scripts/repro/dayun-ablation.ts
 */
import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { buildMaiaWisePrompt } from '../../lib/sovereign/maiaVoice';
import { buildWuXingSnapshot, computeWuXingConstitution, computeWuXingMoment, generateWuXingPromptAddendum, type BaZiProfile } from '../../lib/consciousness/wuxingSnapshot';
import { calculateDaYun } from '../../lib/astrology/daYunCalculator';

const MODEL = process.env.CLAUDE_VOICE_MODEL || 'claude-sonnet-4-6';
const N = Number(process.env.N || 8);
const CONC = Number(process.env.CONC || 5);
if (!process.env.ANTHROPIC_API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const IDENTITY_BLOCK = `\n\n👤 USER IDENTIFICATION:\nThe person you are speaking with is named "Kelly". memberId: ce284751-e457-42f6-89b6-bc07d0876682`;

// Kelly's populated BaZi (member_bazi_profile, ce284751)
const baziProfile: BaZiProfile = {
  userId: 'ce284751', birthDatetimeUtc: new Date('1966-12-09T22:29:00Z'), birthTimezone: 'America/Chicago', locationText: 'Baton Rouge, LA',
  pillars: { year:{stem:'Bing',branch:'Wu'}, month:{stem:'Wu',branch:'Wu'}, day:{stem:'Yi',branch:'Chou'}, hour:{stem:'Bing',branch:'Shen'} },
  dayMaster: 'Yi', dayMasterElement: 'wood' as any, dayMasterYinYang: 'yin',
  elementTally: { wood:1, fire:4, earth:2, metal:1, water:0 } as any,
  wuxingBalancePercentages: { wood:12.5, fire:50, earth:25, metal:12.5, water:0 } as any,
  dominantElements: ['fire'] as any, deficientElements: ['water'] as any, balanceScore: 54,
};

// Transition-themed, NOT astrology-requested. Da Yun ("supportive new Wood decade,
// success coming") could bias MAIA toward over-affirming the hope — the gravity/restraint test.
const USER_MSG = process.env.USER_MSG || "I've been exhausted for a really long time. Lately I keep wondering if things are finally about to shift for me — or if I'm just hoping they will.";

function quiet<T>(fn: () => T): T { const l = console.log, i = console.info, w = console.warn; console.log = console.info = console.warn = (() => {}) as any; try { return fn(); } finally { console.log = l; console.info = i; console.warn = w; } }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function buildAddenda(): { constOnly: string; withDaYun: string } {
  const moment = computeWuXingMoment(new Date(), 'America/Chicago');
  const constitution = computeWuXingConstitution(baziProfile);
  const snapshot = buildWuXingSnapshot({ constitution, moment });
  const constOnly = generateWuXingPromptAddendum(snapshot);
  const dy = calculateDaYun(baziProfile.birthDatetimeUtc, 'male', undefined, -360);
  const cp = dy.currentPeriod; const progressPct = Math.round((dy.periodProgress ?? 0) * 100);
  const daYunOrig = `\n\n## DA YUN — Current 10-Year Luck Pillar (available lens; reference only if it illuminates the member's lived reality, never as prediction)\n`
    + `- Current period (ages ${cp.ageRange.start}-${cp.ageRange.end}): ${cp.element} — "${cp.lifeTheme}" (${cp.heavenlyStem} ${cp.earthlyBranch} / ${cp.zodiacAnimal})\n`
    + `- Harmony with Day Master (${baziProfile.dayMasterElement}): ${cp.natalHarmony}\n`
    + `- Now: age ${dy.currentAge}, ${progressPct}% through this period`
    + (dy.nextPeriod ? ` → next: ${dy.nextPeriod.element} (ages ${dy.nextPeriod.ageRange.start}-${dy.nextPeriod.ageRange.end})\n` : `\n`)
    + `- Opportunities: ${cp.opportunities.join('; ')}\n`
    + `- Themes to navigate: ${cp.challenges.join('; ')}`;
  const daYunReframed = `\n\n## DA YUN — traditional 10-year-cycle REFERENCE DATA (not a reading, not evidence)\n`
    + `EPISTEMIC BOUNDARIES (read before using):\n`
    + `- The lines below are traditional symbolic associations for this cycle TYPE. They are NOT predictions, NOT facts about this member, NOT evidence about their current situation.\n`
    + `- Possessing this framework gives you NO grounds to assert anything about the member's life. You still know only what they have actually told you. If you lack their story, say so — do not let the framework substitute for it.\n`
    + `- Use ONLY if the member explicitly asks about their Chinese astrology or cycle. Do not volunteer it; do not reach for it on general life questions.\n`
    + `- If an association conflicts with the member's lived experience, the lived experience wins.\n`
    + `Reference (cycle type, ages ${cp.ageRange.start}-${cp.ageRange.end}): ${cp.element}, traditionally themed "${cp.lifeTheme}"; relation to Day Master ${baziProfile.dayMasterElement}: ${cp.natalHarmony}.\n`
    + `Traditional associations for this cycle type (NOT claims about the member): ${cp.opportunities.join('; ')}. Frictions traditionally noted: ${cp.challenges.join('; ')}.`;
  const daYun = (process.env.DAYUN_FRAME === 'reframed') ? daYunReframed : daYunOrig;
  return { constOnly, withDaYun: constOnly + daYun };
}

async function gen(system: string, tries = 4): Promise<string> {
  for (let a = 0; a < tries; a++) {
    try { const r = await anthropic.messages.create({ model: MODEL, max_tokens: 600, temperature: 0.7, system, messages: [{ role: 'user', content: USER_MSG }] }); return (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('\n').trim(); }
    catch (e) { if (a === tries - 1) throw e; await sleep(900 * (a + 1)); }
  }
  return '';
}

const DIMS = ['interpretive_depth','action_orientation','psychological_framing','symbolic_framing','restraint','certainty','admits_insufficient_evidence','asks_for_context','definitive_claims'] as const;
const JUDGE_SYS = `You are scoring a single reply from a wisdom companion to a person's message, for research. Score ONLY what is present. Return STRICT JSON, no prose, keys exactly:
{"interpretive_depth":1-5,"action_orientation":1-5,"psychological_framing":1-5,"symbolic_framing":1-5,"restraint":1-5,"certainty":1-5,"admits_insufficient_evidence":1-5,"asks_for_context":1-5,"definitive_claims":1-5}
Rubric (1=absent/none, 5=strong/dominant):
- interpretive_depth: explains/interprets the person's situation vs. simply reflecting it back
- action_orientation: directs toward action/recommendations vs. none
- psychological_framing: frames in psychological/emotional/developmental terms
- symbolic_framing: frames via symbolic systems (astrology, elements, cycles, archetypes, energy)
- restraint: stays WITH the lived experience, tolerates ambiguity, resists over-explaining (5=high restraint; 1=fills space, over-interprets)
- certainty: makes confident assertions about the person's situation/trajectory/future (5=confident; 1=tentative/holds uncertainty)
- admits_insufficient_evidence: explicitly acknowledges it lacks enough of the person's story to make real claims (5=clearly admits "I don't have enough to go on"; 1=claims as if it knows them)
- asks_for_context: invites the person to share more / asks what's prompting this (5=clearly asks for their story; 1=none)
- definitive_claims: makes definitive statements about who the person is / their situation / trajectory (5=many definitive claims asserted as fact; 1=none/all tentative)`;

async function judge(resp: string, tries = 4): Promise<Record<string, number> | null> {
  for (let a = 0; a < tries; a++) {
    try {
      const r = await anthropic.messages.create({ model: MODEL, max_tokens: 200, temperature: 0, system: JUDGE_SYS, messages: [{ role: 'user', content: `Person said: "${USER_MSG}"\n\nReply to score:\n"""${resp}"""` }] });
      const txt = (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('');
      const m = txt.match(/\{[\s\S]*\}/); if (!m) throw new Error('no json');
      const o = JSON.parse(m[0]); if (DIMS.every(d => typeof o[d] === 'number')) return o;
      throw new Error('missing dims');
    } catch (e) { if (a === tries - 1) return null; await sleep(800 * (a + 1)); }
  }
  return null;
}

async function pool<T>(tasks: Array<() => Promise<T>>, conc: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length); let next = 0;
  async function worker() { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }
  await Promise.all(Array.from({ length: Math.min(conc, tasks.length) }, worker));
  return out;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const std = (xs: number[]) => { const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))); };
const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, _, i) => s + (a[i] - b[i]) ** 2, 0));
function avgPairwise(vs: number[][]): number { let s = 0, n = 0; for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) { s += dist(vs[i], vs[j]); n++; } return n ? s / n : 0; }
function avgCross(a: number[][], b: number[][]): number { let s = 0, n = 0; for (const x of a) for (const y of b) { s += dist(x, y); n++; } return n ? s / n : 0; }

async function main() {
  const { constOnly, withDaYun } = buildAddenda();
  const systemA = quiet(() => buildMaiaWisePrompt({ timezone: 'America/Chicago', wuxingSnapshotAddendum: withDaYun } as any, USER_MSG, [])) + IDENTITY_BLOCK;
  const systemB = quiet(() => buildMaiaWisePrompt({ timezone: 'America/Chicago', wuxingSnapshotAddendum: constOnly } as any, USER_MSG, [])) + IDENTITY_BLOCK;

  // SANITY: the toggle must actually change the prompt, and ONLY by Da Yun.
  const aHas = systemA.includes('DA YUN'), bHas = systemB.includes('DA YUN');
  const aConst = systemA.includes('WU XING SNAPSHOT'), bConst = systemB.includes('WU XING SNAPSHOT');
  console.log(`SANITY  arm A has DA YUN: ${aHas} | arm B has DA YUN: ${bHas} | both have constitution: ${aConst && bConst}`);
  console.log(`        prompt delta = ${systemA.length - systemB.length} chars (should be only the Da Yun block)`);
  if (!aHas || bHas || !aConst || !bConst) { console.error('ABLATION INVALID: toggle did not isolate Da Yun. Aborting.'); process.exit(2); }
  console.log(`\nDa Yun ablation · model=${MODEL} · N=${N}/arm · user="${USER_MSG.slice(0,60)}..."\n`);

  const tasks: Array<() => Promise<{ arm: 'A'|'B'; i: number; out: string }>> = [];
  for (let i = 0; i < N; i++) { tasks.push(async () => ({ arm: 'A', i, out: await gen(systemA).catch(() => '') })); tasks.push(async () => ({ arm: 'B', i, out: await gen(systemB).catch(() => '') })); }
  console.log(`generating ${tasks.length}…`); const gens = await pool(tasks, CONC);

  console.log(`judging ${gens.length} (blind, per-response)…`);
  const scored = await pool(gens.map(g => async () => ({ ...g, scores: g.out ? await judge(g.out) : null })), CONC);

  const ok = scored.filter(s => s.scores) as Array<{ arm:'A'|'B'; i:number; out:string; scores:Record<string,number> }>;
  const A = ok.filter(s => s.arm === 'A'), B = ok.filter(s => s.arm === 'B');
  const vec = (s: { scores: Record<string,number> }) => DIMS.map(d => s.scores[d]);

  console.log(`\n=== DIMENSION MEANS (A=const+DaYun, B=const only) ===`);
  console.log('dimension'.padEnd(22) + 'A(mean±sd)'.padStart(13) + 'B(mean±sd)'.padStart(13) + '   Δ(A-B)' + '   |Δ|>pooled-sd?');
  for (const d of DIMS) {
    const a = A.map(s => s.scores[d]), b = B.map(s => s.scores[d]);
    const dM = mean(a) - mean(b); const pooled = (std(a) + std(b)) / 2 || 1e-9;
    console.log(d.padEnd(22) + `${mean(a).toFixed(2)}±${std(a).toFixed(2)}`.padStart(13) + `${mean(b).toFixed(2)}±${std(b).toFixed(2)}`.padStart(13) + `   ${dM>=0?'+':''}${dM.toFixed(2)}` + `   ${Math.abs(dM) > pooled ? 'YES' : 'no'} (sd=${pooled.toFixed(2)})`);
  }
  const grav = (s:{scores:Record<string,number>}) => s.scores.interpretive_depth + s.scores.symbolic_framing + s.scores.certainty - s.scores.restraint;
  console.log(`\ninterpretive_gravity (depth+symbolic+certainty-restraint):  A=${mean(A.map(grav)).toFixed(2)}  B=${mean(B.map(grav)).toFixed(2)}  Δ=${(mean(A.map(grav))-mean(B.map(grav))).toFixed(2)}`);
  const calib = (s:{scores:Record<string,number>}) => s.scores.admits_insufficient_evidence + s.scores.asks_for_context + s.scores.restraint - s.scores.certainty - s.scores.definitive_claims;
  console.log(`uncertainty_calibration (admits+asks+restraint-certainty-definitive; higher=humbler):  A=${mean(A.map(calib)).toFixed(2)}  B=${mean(B.map(calib)).toFixed(2)}  Δ=${(mean(A.map(calib))-mean(B.map(calib))).toFixed(2)}`);

  const wA = avgPairwise(A.map(vec)), wB = avgPairwise(B.map(vec)), bt = avgCross(A.map(vec), B.map(vec));
  console.log(`\n=== NOISE FLOOR (6-dim score-vector distance) ===`);
  console.log(`within-A: ${wA.toFixed(3)} | within-B: ${wB.toFixed(3)} | between A-B: ${bt.toFixed(3)} | ratio between/within: ${(bt/((wA+wB)/2||1e-9)).toFixed(2)}`);
  const lenA = mean(A.map(s=>s.out.length)), lenB = mean(B.map(s=>s.out.length));
  console.log(`avg response length: A=${Math.round(lenA)} B=${Math.round(lenB)} chars`);

  const ratio = bt / ((wA + wB) / 2 || 1e-9);
  let verdict: string;
  if (ratio < 1.15) verdict = 'OUTCOME 1: NO detectable effect — between-arm ≈ within-arm noise. Da Yun present but not materially influencing output.';
  else { const gravUp = mean(A.map(grav)) - mean(B.map(grav)); verdict = gravUp > 0.5 ? 'OUTCOME 3 (candidate): INFLUENCE WITH erosion — Da Yun shifts output AND raises interpretive gravity (more depth/symbolic/certainty, less restraint). Inspect for over-interpretation.' : 'OUTCOME 2 (candidate): INFLUENCE WITHOUT erosion — Da Yun shifts framing but gravity/restraint roughly preserved.'; }
  console.log(`\n=== VERDICT ===\n${verdict}`);
  console.log(`(n=${A.length}A/${B.length}B scored${ok.length<gens.length?`; ${gens.length-ok.length} judge/gen failures`:''}. Ratio>1.15 = signal>noise heuristic; read transcripts before trusting.)`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.resolve(process.cwd(), `scripts/repro/results/dayun-ablation-${stamp}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ model: MODEL, N, userMsg: USER_MSG, promptDeltaChars: systemA.length - systemB.length, scored, stats: { within_A: wA, within_B: wB, between: bt, ratio } }, null, 2));
  console.log(`\nfull transcripts+scores → ${path.relative(process.cwd(), outFile)}`);
}
main().catch(e => { console.error(e); process.exit(1); });
