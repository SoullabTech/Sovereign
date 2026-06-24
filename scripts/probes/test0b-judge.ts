/**
 * Test 0B — Attentional-Posture Recovery (Blind Semantic Judge)
 * -------------------------------------------------------------
 * Second scoring pass on the Test 0B max-element-contrast outputs.
 *
 * Rationale (Kelly, 2026-05-31): keyword scoring is insufficient — "the thing
 * being tested is attention, not terminology." Earth separates lexically; Fire's
 * lexicon is contaminated by generic reflective vocabulary; Water/Air/Aether move
 * ATTENTIONAL POSTURE without moving vocabulary, so they need semantic review.
 *
 * Method: a blind forced-choice classifier. Each 0B response is shown to a fresh
 * model (NO condition label) and asked which single elemental attentional posture
 * it most embodies, using Kelly's discriminators verbatim, with a NEUTRAL escape
 * so it is never forced to invent a posture. We then build a confusion matrix of
 * TRUE condition (rows) vs JUDGE label (cols) and measure recovery.
 *
 * Why this is the valid instrument:
 *   - BLIND: the judge never sees the key, so it cannot pattern-match to intent;
 *     this removes the unblinded-analyst bias in the author's own read.
 *   - SEMANTIC: classifies by where attention is placed / what it moves toward,
 *     not by terminology.
 *   - CONSERVATIVE: NEUTRAL is allowed; the judge is told to pick an element only
 *     when its attentional move is genuinely strongest.
 *
 * Read:
 *   - Element responses landing on their OWN posture, above the 1/5 chance line,
 *     => the surface moved under conditioning (0B positive, channel live).
 *   - Only Earth recovering => partially responsive; concrete embodied language is
 *     the strongest lever.
 *   - Everything scattering / NEUTRAL => collapse (cosmetic-only).
 *
 * CAVEAT (recorded): an LLM judge may be MORE sensitive than a human/member. This
 * is a detectability ceiling via semantic review; the human-mode arbiter remains
 * Kelly's own blind read of the packet. Single-shot judge (temp inherited from
 * production); not multi-vote.
 */

import { config as dotenv } from 'dotenv';
dotenv({ path: '.env', override: true });
dotenv({ path: '.env.local', override: true });

import fs from 'node:fs';
import path from 'node:path';

const PER_CALL_TIMEOUT_MS = 60_000;

// Latest 0B raw file (auto-pick newest test0b-raw-*.json).
function newestRaw(): string {
  const dir = path.join('scripts', 'probes', 'out');
  const f = fs
    .readdirSync(dir)
    .filter((x) => x.startsWith('test0b-raw-') && x.endsWith('.json'))
    .sort()
    .pop();
  if (!f) throw new Error('no test0b-raw-*.json found');
  return path.join(dir, f);
}

const JUDGE_SYSTEM =
  'You are a precise, skeptical text classifier. You read a single reflective response and decide ' +
  'which ONE elemental "attentional posture" it most embodies — based on WHERE the response places ' +
  'its attention and WHAT it moves the reader toward, NOT on vocabulary alone. If no single posture ' +
  'clearly dominates, answer NEUTRAL. Be conservative: pick an element only when its attentional move ' +
  'is genuinely the strongest. Do not be generous. Output exactly one line.';

// Kelly's discriminators, verbatim.
const RUBRIC = `Attentional postures:
- FIRE: possibility, initiation, desire, courage, forward motion — moves toward what the person wants / would do.
- WATER: feeling, grief, fear, tenderness, emotional truth — moves toward feeling what is here.
- EARTH: body, step, ground, concrete action, steadiness — moves toward something concrete/material.
- AIR: perspective, pattern, naming, distinction, meaning — moves toward seeing/naming clearly.
- AETHER: holding the whole, spaciousness, integration, witness — moves toward holding all of it.`;

const LABELS = ['FIRE', 'WATER', 'EARTH', 'AIR', 'AETHER', 'NEUTRAL'] as const;
type Label = (typeof LABELS)[number];

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout:${label}`)), ms)),
  ]);
}

function parseLabel(s: string): Label {
  const up = (s || '').toUpperCase();
  for (const L of LABELS) if (up.includes(L)) return L;
  return 'NEUTRAL';
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('NO ANTHROPIC_API_KEY in env — aborting.');
    process.exit(1);
  }
  const { generateText } = await import('../../lib/ai/modelService');

  const rawPath = newestRaw();
  const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const items: Array<{ rid: string; condition: string; text: string }> = raw.results.filter(
    (r: any) => r.provider !== 'ERROR',
  );

  async function judge(it: { rid: string; condition: string; text: string }) {
    const userInput = `${RUBRIC}\n\nResponse to classify:\n"""\n${it.text}\n"""\n\nAnswer with exactly one line: ELEMENT|one short reason. ELEMENT must be one of {FIRE,WATER,EARTH,AIR,AETHER,NEUTRAL}.`;
    try {
      const res: any = await withTimeout(
        generateText({ systemPrompt: JUDGE_SYSTEM, userInput, meta: { responseTarget: 'classification' } } as any),
        PER_CALL_TIMEOUT_MS,
        it.rid,
      );
      const out = String(res?.text ?? '').trim();
      return { ...it, judged: parseLabel(out), rawJudge: out.split('\n')[0].slice(0, 160) };
    } catch (e: any) {
      return { ...it, judged: 'NEUTRAL' as Label, rawJudge: `ERROR:${e?.message || e}` };
    }
  }

  // Sequential batches of 6 (rate-limit safe).
  const judged: any[] = [];
  for (let i = 0; i < items.length; i += 6) {
    const batch = await Promise.all(items.slice(i, i + 6).map(judge));
    judged.push(...batch);
  }

  // Confusion matrix: rows = true condition, cols = judged label.
  const conds = ['control', 'fire', 'water', 'earth', 'air', 'aether'];
  const mat: Record<string, Record<Label, number>> = {};
  for (const c of conds) mat[c] = { FIRE: 0, WATER: 0, EARTH: 0, AIR: 0, AETHER: 0, NEUTRAL: 0 };
  for (const j of judged) mat[j.condition][j.judged as Label]++;

  console.log('=== TEST 0B — BLIND ATTENTIONAL-POSTURE RECOVERY ===');
  console.log('raw source     :', rawPath);
  console.log('judged          :', judged.length, '| judge=blind forced-choice (+NEUTRAL)');
  console.log('');
  console.log('CONFUSION MATRIX  (rows=TRUE condition, cols=JUDGE blind label)');
  console.log(`  ${'true\\judge'.padEnd(9)}` + LABELS.map((l) => l.slice(0, 6).padStart(7)).join(''));
  for (const c of conds) {
    console.log(`  ${c.padEnd(9)}` + LABELS.map((l) => String(mat[c][l]).padStart(7)).join(''));
  }

  // Recovery: for the 5 element conditions, did judge assign the matching posture?
  let correct = 0,
    total = 0;
  console.log('\nPER-ELEMENT RECOVERY (own-posture hits / n):');
  for (const c of ['fire', 'water', 'earth', 'air', 'aether']) {
    const n = conds.includes(c) ? Object.values(mat[c]).reduce((a, b) => a + b, 0) : 0;
    const hit = mat[c][c.toUpperCase() as Label];
    correct += hit;
    total += n;
    console.log(`  ${c.padEnd(8)} ${hit}/${n}`);
  }
  console.log(`\n  OVERALL element recovery: ${correct}/${total}  (chance ≈ ${(total / 5).toFixed(1)}/${total} at 1/5)`);
  const controlTop = (Object.entries(mat['control']) as [Label, number][]).sort((a, b) => b[1] - a[1])[0];
  console.log(`  CONTROL lands mostly on: ${controlTop[0]} (${controlTop[1]}/${Object.values(mat['control']).reduce((a, b) => a + b, 0)})`);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join('scripts', 'probes', 'out', `test0b-judge-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ rawPath, matrix: mat, judged }, null, 2));
  console.log('\njudgments saved :', outPath);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
