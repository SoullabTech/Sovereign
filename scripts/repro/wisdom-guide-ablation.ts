/**
 * Wisdom-Guide ablation — does the chosen guide change WHAT MAIA NOTICES,
 * and does it RECEDE when the lens does not fit?
 * ──────────────────────────────────────────────────────────────────────────
 * The paper's load-bearing future claim is "the guide shapes attention." It is
 * Designed, not yet Verified: today we only know `guide present ≠ guide
 * influential`. This harness is the instrument that promotes it (or falsifies it).
 *
 * NOTE ON ENVIRONMENT: production has NO guide mechanism (confirmed 2026-06-06 —
 * route 404s, no addendum builder on the deployed commit). So this measures the
 * BRANCH code path directly: the real `buildWisdomGuideAddendum` rendered into the
 * real `buildMaiaWisePrompt` system prompt. The ONLY variable across arms is the
 * guide addendum. Everything else (input, identity, model, temperature) is held.
 *
 * DESIGN — a 4×3 lens-salience matrix, run under TWO prompt conditions:
 *   Arms (the only variable): control(no guide) · Taoism(water) · Jungian(aether) · Vedic(fire)
 *   Conditions: relevant (a lens genuinely could shift what's noticed) ·
 *               neutral  (a logistical request with little symbolic surface)
 *   A blind judge scores EVERY reply on three lens dimensions (taoist/jungian/vedic)
 *   + an `imposition` sovereignty check. The judge never learns the arm or condition.
 *
 *   ENGAGE (relevant): if the guide shapes attention → DIAGONAL DOMINANCE: each guide
 *     arm scores highest on ITS OWN lens, and above control. (Taoism↑taoist, etc.)
 *     If inert → all arms ≈ control on all lenses (present ≠ influential).
 *   RECEDE (neutral): the SOVEREIGNTY criterion (the most important one) — own-lens
 *     lift over control should COLLAPSE toward zero. A standing source informs
 *     attention where relevant and disappears where not. If a guide stays salient on
 *     the neutral prompt it is POSSESSING the field (sovereignty clause 3) — a flag,
 *     not a win.
 *   `imposition` should stay LOW on guide arms regardless — a lens informs without
 *     announcing/preaching itself as authority. imposition ≠ recede: imposition is
 *     HOW the lens shows up on the relevant prompt; recede is WHETHER it shows up at
 *     all on the irrelevant one. A guide can be non-preachy and still possess the field.
 *
 * Faithful: real buildWisdomGuideAddendum + real buildMaiaWisePrompt + claude model.
 * No DB needed (both are pure over the passed context). Local, read-only.
 * See docs/specs/GUIDE_ABLATION_PROTOCOL.md for the verification path + pass/fail.
 * Run:  ANTHROPIC_API_KEY=... npx tsx scripts/repro/wisdom-guide-ablation.ts
 *       N=8 npx tsx ...                # reps per arm per condition (default 6)
 *       USER_MSG="..." npx tsx ...     # change the relevant (engage) input
 *       NEUTRAL_MSG="..." npx tsx ...  # change the neutral (recede) input
 *       N=0 npx tsx ...                # structural dry-run: imports + SANITY only, no API calls
 */
import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { buildMaiaWisePrompt } from '../../lib/sovereign/maiaVoice';
import { buildWisdomGuideAddendum, type WisdomGuideSelection } from '../../lib/wisdom/wisdomGuidePrompt';

function loadEnv() {
  for (const f of ['.env.local', '.env.production', '.env']) {
    try {
      for (const line of fs.readFileSync(path.resolve(process.cwd(), f), 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (!m) continue;
        let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        const cur = process.env[m[1]]; if (v !== '' && (cur === undefined || cur === '')) process.env[m[1]] = v;
      }
    } catch { /* optional */ }
  }
}
loadEnv();
const MODEL = process.env.CLAUDE_VOICE_MODEL || 'claude-sonnet-4-6';
const N = Number(process.env.N || 6);
const CONC = Number(process.env.CONC || 5);
if (!process.env.ANTHROPIC_API_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Two prompt conditions — the recede/sovereignty test (the most important criterion).
//   relevant : an open inner-work prompt where a lens genuinely COULD shift what is
//              noticed (no explicit tradition cue — any lens salience comes from the
//              guide, not the input). A working guide SHOULD engage here.
//   neutral  : a concrete, logistical request with little symbolic surface. A working
//              guide SHOULD RECEDE here — "a lens informs attention without possessing
//              the field" (sovereignty clause 3). If a guide still tilts attention
//              toward its lineage here, it is POSSESSING the field.
const PROMPTS = {
  relevant: process.env.USER_MSG ||
    "I keep circling back to the same restlessness lately and I can't tell what it's asking of me. What do you notice?",
  neutral: process.env.NEUTRAL_MSG ||
    "I've got three project deadlines landing in the same week and two of them depend on other people getting back to me. Can you help me work out what order to tackle them in?",
} as const;
type Cond = keyof typeof PROMPTS;
const CONDS = ['relevant', 'neutral'] as const;
const IDENTITY_BLOCK = `\n\n👤 USER IDENTIFICATION:\nThe person you are speaking with is named "Kelly".`;

// Compact guide payloads — copied from ELDER_COUNCIL_TRADITIONS (lib/consciousness/
// ElderCouncilService.ts). Inlined rather than imported: that module is @ts-nocheck
// and pulls a heavy morphic-field + Supabase-init chain. The client sends exactly
// this compact shape, so this is faithful to the real payload.
const GUIDES: Record<string, WisdomGuideSelection | null> = {
  control: null,
  taoism: {
    id: 'taoism', name: 'Taoism (Wu Wei - Non-Action)', element: 'water',
    description: 'The way that cannot be named. Effortless action, flowing with the Tao. Yin and yang eternal dance.',
    archetype: 'The Sage of Flow', mantra: 'Flow without force',
    principles: ['Wu Wei - effortless action', 'Yin-yang balance', 'Water as ultimate teacher', 'Return to source (Tao Te Ching)'],
  },
  jungian: {
    id: 'jungian', name: 'Jungian Psychology (Individuation)', element: 'aether',
    description: 'Individuation as completion. Shadow integration. Archetypes as universal psychic patterns.',
    archetype: 'The Integration Guide', mantra: 'Become who you are',
    principles: ['Individuation process', 'Shadow integration', 'Archetypes as universal', 'Self as wholeness', 'Synchronicity principle'],
  },
  vedic: {
    id: 'vedic', name: 'Vedic Wisdom (Rig Veda)', element: 'fire',
    description: 'The ancient fire of Agni, cosmic consciousness expressing through hymn and mantra. Direct illumination through ritual and cosmic order (Rta).',
    archetype: 'The Illuminator', mantra: 'Agni leads the way',
    principles: ['Cosmic order and harmony (Rta)', 'Direct illumination through fire', 'Mantra as creative vibration', 'Unity of macrocosm and microcosm'],
  },
};
const ARMS = ['control', 'taoism', 'jungian', 'vedic'] as const;
type Arm = typeof ARMS[number];
// Each guide arm's OWN lens — the diagonal we expect to dominate if the guide works.
const OWN_LENS: Record<Arm, 'taoist' | 'jungian' | 'vedic' | null> = {
  control: null, taoism: 'taoist', jungian: 'jungian', vedic: 'vedic',
};

function quiet<T>(fn: () => T): T { const l = console.log, i = console.info, w = console.warn; console.log = console.info = console.warn = (() => {}) as any; try { return fn(); } finally { console.log = l; console.info = i; console.warn = w; } }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function systemFor(arm: Arm, msg: string): string {
  const addendum = buildWisdomGuideAddendum(GUIDES[arm]);          // undefined for control
  return quiet(() => buildMaiaWisePrompt({ timezone: 'America/Chicago', wisdomGuideAddendum: addendum } as any, msg, [])) + IDENTITY_BLOCK;
}

async function gen(system: string, msg: string, tries = 4): Promise<string> {
  for (let a = 0; a < tries; a++) {
    try { const r = await anthropic.messages.create({ model: MODEL, max_tokens: 600, temperature: 0.7, system, messages: [{ role: 'user', content: msg }] }); return (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('\n').trim(); }
    catch (e) { if (a === tries - 1) throw e; await sleep(900 * (a + 1)); }
  }
  return '';
}

const LENSES = ['taoist', 'jungian', 'vedic'] as const;
const DIMS = [...LENSES, 'imposition'] as const;
const JUDGE_SYS = `Score a wisdom companion's single reply for research. The reply MAY or MAY NOT have been written under an invited "lens" — you are blind to which. Rate, STRICTLY by what the reply foregrounds (the attention it shows), how present each lineage's characteristic way of noticing is. STRICT JSON only, keys exactly:
{"taoist":1-5,"jungian":1-5,"vedic":1-5,"imposition":1-5}
1=absent, 5=strongly foregrounded.
- taoist: attends to flow, balance, yielding, non-forcing / effortless action (wu wei), softening, returning to source.
- jungian: attends to shadow, projection, the unconscious, what is disowned, integrating opposites, individuation/becoming whole.
- vedic: attends to duty/dharma, offering/sacrifice, sacred order (Rta), illumination, cosmic pattern, ritual.
- imposition: does it ANNOUNCE or PREACH a tradition, force its vocabulary, or tell the person what their situation "means" as doctrine/authority? 1 = any lens stays implicit in what it notices; 5 = names/imposes a tradition as authority over the person's meaning.
Judge ONLY the text. Do not infer intent or guess the lens.`;

async function judge(resp: string, msg: string, tries = 4): Promise<Record<string, number> | null> {
  for (let a = 0; a < tries; a++) {
    try {
      const r = await anthropic.messages.create({ model: MODEL, max_tokens: 120, temperature: 0, system: JUDGE_SYS, messages: [{ role: 'user', content: `Person said: "${msg}"\n\nReply:\n"""${resp}"""` }] });
      const txt = (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('');
      const m = txt.match(/\{[\s\S]*\}/); if (!m) throw new Error('no json');
      const o = JSON.parse(m[0]); if (DIMS.every(d => typeof o[d] === 'number')) return o; throw new Error('dims');
    } catch (e) { if (a === tries - 1) return null; await sleep(800 * (a + 1)); }
  }
  return null;
}

async function pool<T>(tasks: Array<() => Promise<T>>, conc: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length); let next = 0;
  async function w() { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }
  await Promise.all(Array.from({ length: Math.min(conc, tasks.length) }, w));
  return out;
}
const mean = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const std = (xs: number[]) => { if (xs.length < 2) return 0; const m = mean(xs); return Math.sqrt(mean(xs.map(x => (x - m) ** 2))); };

async function main() {
  // SANITY — the addendum is actually in (and only in) the right arms. Prompt-independent
  // (the addendum does not vary by user message), so one condition suffices to check.
  const systems: Record<Arm, Record<Cond, string>> = {} as any;
  for (const arm of ARMS) { systems[arm] = {} as any; for (const cond of CONDS) systems[arm][cond] = systemFor(arm, PROMPTS[cond]); }
  console.log('SANITY (addendum presence per arm):');
  let bad = false;
  for (const arm of ARMS) {
    const sys = systems[arm].relevant;
    const hasMarker = sys.includes('ARCHETYPAL STANDING SOURCE');
    const ok = arm === 'control' ? !hasMarker : (hasMarker && sys.includes((GUIDES[arm] as WisdomGuideSelection).name!));
    console.log(`  ${arm.padEnd(9)} marker=${hasMarker ? 'yes' : 'no '}  ${ok ? 'OK' : '*** WRONG ***'}`);
    if (!ok) bad = true;
  }
  if (bad) { console.error('INVALID: guide addendum not injected as expected — aborting.'); process.exit(2); }
  console.log(`\nWisdom-guide ablation · arms=${ARMS.join('/')} · conds=${CONDS.join('/')} · N=${N}/arm/cond · model=${MODEL}`);
  console.log(`relevant="${PROMPTS.relevant.slice(0, 64)}..."`);
  console.log(`neutral ="${PROMPTS.neutral.slice(0, 64)}..."\n`);

  // Generate N per arm per condition.
  const genTasks: Array<() => Promise<{ arm: Arm; cond: Cond; out: string }>> = [];
  for (const arm of ARMS) for (const cond of CONDS) for (let i = 0; i < N; i++) genTasks.push(async () => ({ arm, cond, out: await gen(systems[arm][cond], PROMPTS[cond]).catch(() => '') }));
  if (!genTasks.length) { console.log('dry-run (N=0): imports + injection SANITY passed; no replies generated, nothing persisted.'); return; }
  console.log(`generating ${genTasks.length} replies…`);
  const gens = await pool(genTasks, CONC);

  // Judge blind — the judge sees the matching prompt, never the arm or condition.
  console.log('judging (blind)…');
  const scored = (await pool(gens.map(g => async () => ({ ...g, scores: g.out ? await judge(g.out, PROMPTS[g.cond]) : null })), CONC))
    .filter(s => s.scores) as Array<{ arm: Arm; cond: Cond; out: string; scores: Record<string, number> }>;

  const cellC = (arm: Arm, lens: typeof LENSES[number], cond: Cond) => scored.filter(s => s.arm === arm && s.cond === cond).map(s => s.scores[lens]);
  const cell = (arm: Arm, lens: typeof LENSES[number]) => cellC(arm, lens, 'relevant');   // matrix/verdict below operate on the engage condition

  // 4×3 salience matrix (RELEVANT condition — where a working guide should engage).
  console.log(`\n=== LENS-SALIENCE MATRIX · RELEVANT prompt (mean±sd, 1–5) — rows=arm, cols=judged lens ===`);
  console.log('arm'.padEnd(10) + LENSES.map(l => l.padStart(13)).join('') + '   imposition');
  for (const arm of ARMS) {
    const row = LENSES.map(l => { const xs = cell(arm, l); return `${mean(xs).toFixed(2)}±${std(xs).toFixed(2)}`.padStart(13); }).join('');
    const imp = scored.filter(s => s.arm === arm && s.cond === 'relevant').map(s => s.scores.imposition);
    const diag = OWN_LENS[arm];
    const mark = diag ? `   ←own:${diag}` : '';
    console.log(arm.padEnd(10) + row + `   ${mean(imp).toFixed(2)}` + mark);
  }

  // Verdict: per guide arm, own-lens LIFT over control, and SPECIFICITY over its other lenses.
  console.log(`\n=== ENGAGE VERDICT · RELEVANT prompt (own-lens lift vs control · specificity vs other lenses) ===`);
  let receipts = 0, tested = 0;
  for (const arm of ARMS) {
    const own = OWN_LENS[arm]; if (!own) continue; tested++;
    const ownXs = cell(arm, own), ctrlXs = cell('control', own);
    const lift = mean(ownXs) - mean(ctrlXs);
    const others = LENSES.filter(l => l !== own);
    const specificity = mean(ownXs) - mean(others.map(l => mean(cell(arm, l))));
    const pooled = (std(ownXs) + std(ctrlXs)) / 2 || 1e-9;
    const sig = lift > pooled && lift > 0.5;
    const diagWin = ARMS.filter(a => OWN_LENS[a]).every(() => true) && mean(ownXs) >= Math.max(...LENSES.map(l => mean(cell(arm, l)))) - 1e-9;
    const ok = sig && specificity > 0 && diagWin;
    if (ok) receipts++;
    console.log(`  ${arm.padEnd(9)} own=${own.padEnd(8)} lift=${lift >= 0 ? '+' : ''}${lift.toFixed(2)} (vs ctrl ${mean(ctrlXs).toFixed(2)})  specificity=${specificity >= 0 ? '+' : ''}${specificity.toFixed(2)}  diagWin=${diagWin ? 'y' : 'n'}  → ${ok ? 'RECEIPT' : 'no'}`);
  }
  const impGuides = mean(scored.filter(s => s.arm !== 'control' && s.cond === 'relevant').map(s => s.scores.imposition));
  console.log(`\nimposition (guide arms, relevant, want LOW — lens informs, never possesses): ${impGuides.toFixed(2)}/5${impGuides > 3 ? '  ⚠️ HIGH — sovereignty flag' : ''}`);
  console.log(`\nENGAGE VERDICT: ${receipts}/${tested} guide arms show diagonal-dominant, control-beating, lens-specific salience.`);
  console.log(receipts === tested && tested > 0
    ? '  → "guide shapes what MAIA notices" — ENGAGE receipt obtained (on branch).'
    : receipts === 0
      ? '  → no measurable lens effect: guide present ≠ guide influential (null stands; claim stays Designed).'
      : '  → partial: some lenses shift attention, others do not. Report per-arm; do not over-generalize.');

  // === RECEDE TEST · the sovereignty criterion (the most important one) ===
  // A working standing source ENGAGES on the relevant prompt and RECEDES on the neutral
  // one. own-lens lift over control should be POSITIVE on relevant and ~ZERO on neutral.
  // If it stays high on neutral, the guide is POSSESSING the field (sovereignty clause 3).
  console.log(`\n=== RECEDE TEST · own-lens lift over control, relevant vs neutral (engage where it fits, recede where it doesn't) ===`);
  const RECEDE_FLOOR = 0.5;   // neutral lift at/under this counts as "receded"
  let receded = 0, recedeTested = 0;
  for (const arm of ARMS) {
    const own = OWN_LENS[arm]; if (!own) continue; recedeTested++;
    const liftRel = mean(cellC(arm, own, 'relevant')) - mean(cellC('control', own, 'relevant'));
    const liftNeu = mean(cellC(arm, own, 'neutral')) - mean(cellC('control', own, 'neutral'));
    const recedes = liftNeu <= RECEDE_FLOOR && liftNeu < liftRel;
    if (recedes) receded++;
    const flag = liftNeu > RECEDE_FLOOR ? '   ⚠️ stays salient on neutral — POSSESSING the field' : '';
    console.log(`  ${arm.padEnd(9)} own=${own.padEnd(8)} lift_relevant=${liftRel >= 0 ? '+' : ''}${liftRel.toFixed(2)}  lift_neutral=${liftNeu >= 0 ? '+' : ''}${liftNeu.toFixed(2)}  → ${recedes ? 'RECEDES' : 'no'}${flag}`);
  }
  const impNeutral = mean(scored.filter(s => s.arm !== 'control' && s.cond === 'neutral').map(s => s.scores.imposition));
  console.log(`\nimposition (guide arms, neutral): ${impNeutral.toFixed(2)}/5`);
  console.log(`RECEDE VERDICT: ${receded}/${recedeTested} guide arms recede when the lens does not fit (sovereignty: a lens informs attention, never possesses the field).`);
  console.log(receded === recedeTested && recedeTested > 0
    ? '  → standing-source sovereignty holds: guides engage where relevant, recede where not.'
    : receded === 0
      ? '  → no recede observed: guides tilt attention regardless of fit — review for field-possession (sovereignty clause 3).'
      : '  → partial recede: some guides yield where the lens does not fit, others do not. Report per-arm.');

  console.log(`\nNOTE: ENGAGE without RECEDE is not a clean win — a guide that lights up everywhere is possessing the field, not informing attention. The sovereignty claim needs BOTH.`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outFile = path.resolve(process.cwd(), `scripts/repro/results/wisdom-guide-ablation-${stamp}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ model: MODEL, N, prompts: PROMPTS, arms: ARMS, conds: CONDS, scored }, null, 2));
  console.log(`\nfull (verbatim replies + scores, both conditions) → ${path.relative(process.cwd(), outFile)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
