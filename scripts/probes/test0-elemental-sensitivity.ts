/**
 * Test 0 — Elemental Conditioning Sensitivity Probe
 * ---------------------------------------------------
 * Question (Kelly, 2026-05-31): Can informed observers reliably tell apart
 * MAIA outputs generated WITH vs WITHOUT the elemental (Wu Xing) injection?
 *
 * This is NOT statistical significance. It is the smallest test capable of
 * changing the mind: a max-contrast sensitivity probe. If humans cannot
 * distinguish the strongest version of the contrast, the fine-grained
 * M-series is moot — and that null is the result worth having.
 *
 * Design:
 *   - Backdrop (both conditions): real MAIA persona (RELATIONAL_SPEC + RUNTIME_PROMPT).
 *   - Condition A: backdrop + real Wu Xing addendum (production generator).
 *   - Condition B: backdrop only.
 *   - Only the elemental block is toggled; everything else identical.
 *   - Generation via production generateText() -> inherits model/temp/provider.
 *   - N runs per condition. Outputs saved blind (R-labels) + separate key.
 *
 * Fidelity caveats (recorded, not hidden):
 *   - Isolation choice: only the elemental addendum is present, giving it MAX
 *     relative prominence vs the ~29-addendum production stack. Generous case.
 *   - Wu Xing addendum injected into systemPrompt (MAIA-side context), matching
 *     where production interpolates it (system template).
 *   - State-vector contract and all other addenda excluded from BOTH conditions.
 */

// --- env first, before any project import that may read process.env ---
// NOTE: the agent/dev harness injects ANTHROPIC_API_KEY="" (empty string) into
// the process env; dotenv's default no-override skips it. override:true makes
// the project's real key (.env.local) win over that empty shadow.
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env', override: true });
dotenv({ path: '.env.local', override: true });

import fs from 'node:fs';
import path from 'node:path';

const N = 6;
const PER_CALL_TIMEOUT_MS = 90_000;

const USER_PROMPT =
  "I've been feeling torn between staying with what is familiar and stepping into a new direction. " +
  "Part of me feels excited, another part feels afraid. What am I not seeing?";

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`timeout:${label}`)), ms)),
  ]);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('NO ANTHROPIC_API_KEY in env — aborting.');
    process.exit(1);
  }

  // Dynamic imports AFTER env is loaded.
  const { generateText } = await import('../../lib/ai/modelService');
  const { generateWuXingPromptAddendum } = await import('../../lib/consciousness/wuxingSnapshot');
  const { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC } = await import('../../lib/consciousness/MAIA_RUNTIME_PROMPT');

  // Representative snapshot matched to the prompt's content:
  // excitement (Fire excess) vs fear (Water deficient), torn familiar/new (Earth support).
  // spiritFocus omitted to avoid the internal getSpirit() dependency.
  const snapshot: any = {
    constitution: {
      dayMaster: 'wood',
      dayMasterYinYang: 'yang',
      dominant: ['fire'],
      deficient: ['water'],
      balanceScore: 56,
    },
    moment: {
      dayStem: 'jia',
      dayStemYinYang: 'yang',
      hourBranch: 'wu',
      seasonalQi: 'fire',
      organClock: { organ: 'Heart', element: 'fire', peakHour: '11am-1pm' },
    },
    analysis: {
      state: 'significant_imbalance',
      needsSupport: ['water', 'earth'],
      excessive: ['fire'],
      balancingMoves: [
        { rationale: 'Cool the excess Fire with Water — rest and reflection before deciding, not more activation.' },
        { rationale: 'Invite Earth to steady the ground so the choice between staying and leaving can be felt, not rushed.' },
      ],
    },
    computedAt: new Date(),
  };

  let wuxingAddendum = '';
  try {
    wuxingAddendum = generateWuXingPromptAddendum(snapshot);
  } catch (e: any) {
    console.error('Failed to generate Wu Xing addendum:', e?.message || e);
    process.exit(1);
  }

  const persona = `${MAIA_RELATIONAL_SPEC}\n\n${MAIA_RUNTIME_PROMPT}`;
  const systemA = `${persona}\n\n${wuxingAddendum}`;
  const systemB = persona;

  const fastMeta = {
    currentUserMessage: USER_PROMPT,
    fastProcessing: true,
    responseTarget: 'conversational',
  };

  async function runOne(condition: 'A' | 'B', i: number) {
    const systemPrompt = condition === 'A' ? systemA : systemB;
    try {
      const res: any = await withTimeout(
        generateText({ systemPrompt, userInput: USER_PROMPT, meta: { ...fastMeta } } as any),
        PER_CALL_TIMEOUT_MS,
        `${condition}#${i}`,
      );
      const provider = res?.provider ? `${res.provider.provider}/${res.provider.model}` : 'unknown';
      return { condition, i, provider, text: String(res?.text ?? '').trim() };
    } catch (e: any) {
      return { condition, i, provider: 'ERROR', text: `ERROR: ${e?.message || e}` };
    }
  }

  const tasks: Promise<any>[] = [];
  for (let i = 0; i < N; i++) {
    tasks.push(runOne('A', i));
    tasks.push(runOne('B', i));
  }
  const results = await Promise.all(tasks);

  const providers = Array.from(new Set(results.map((r) => r.provider)));

  // Blind shuffle + R-labels
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  const labeled = shuffled.map((r, idx) => ({ rid: `R${idx + 1}`, ...r }));

  const outDir = path.join('scripts', 'probes', 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  fs.writeFileSync(
    path.join(outDir, `test0-raw-${stamp}.json`),
    JSON.stringify({ userPrompt: USER_PROMPT, wuxingAddendum, providers, results: labeled }, null, 2),
  );

  const blind = labeled.map((r) => `### ${r.rid}\n\n${r.text}\n`).join('\n---\n\n');
  fs.writeFileSync(
    path.join(outDir, `test0-blind-${stamp}.md`),
    `# Test 0 — Blind Review Packet\n\n**Prompt:** ${USER_PROMPT}\n\n` +
      `**Task:** Sort these into two groups — generated WITH the elemental (Wu Xing) injection vs WITHOUT. ` +
      `Then say whether any difference is substantive (different insight/guidance) or cosmetic (elemental vocabulary only).\n\n---\n\n${blind}`,
  );

  fs.writeFileSync(
    path.join(outDir, `test0-key-${stamp}.txt`),
    labeled.map((r) => `${r.rid}: ${r.condition} (${r.provider})`).join('\n') + '\n',
  );

  console.log('=== TEST 0 COMPLETE ===');
  console.log('providers used :', providers.join(', '));
  console.log('N per condition:', N, '| total runs:', results.length);
  console.log('errors         :', results.filter((r) => r.provider === 'ERROR').length);
  console.log('blind packet   :', path.join(outDir, `test0-blind-${stamp}.md`));
  console.log('key            :', path.join(outDir, `test0-key-${stamp}.txt`));
  console.log('raw            :', path.join(outDir, `test0-raw-${stamp}.json`));
  console.log('');
  console.log('--- Wu Xing addendum injected in Condition A ---');
  console.log(wuxingAddendum);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
