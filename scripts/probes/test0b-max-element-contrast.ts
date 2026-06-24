/**
 * Test 0B — Max Element Contrast (Force-Amplification Probe)
 * ----------------------------------------------------------
 * Follows Test 0A (Wu Xing Surface Conditioning Sensitivity Probe), which
 * returned a strong null: the production Wu Xing data-snapshot addendum produced
 * no humanly-detectable member-facing effect for the test prompt.
 *
 * 0A left ONE question open that 0B isolates:
 *   Is the generation surface normalizing ALL elemental conditioning, or did
 *   Wu Xing fail because its signal was too weak / misdirected (a clinical data
 *   snapshot rather than a direct attentional instruction)?
 *
 * 0B does NOT test a production mechanism. It tests the CEILING of prompt-surface
 * elemental conditioning: maximal, direct, single-element attentional instruction,
 * substance-targeted (shape what is noticed / named / invited — not vocabulary).
 *   - All conditions collapse  -> prompt-surface elemental conditioning is likely a
 *     dead end (the model flattens it); elements would live only in internal
 *     differentiation, not the member-facing prompt channel.
 *   - Conditions clearly diverge -> the channel WORKS; Wu Xing failed on signal
 *     strength/shape, not mechanism. The lever is amplification, not abandonment.
 *   - Some diverge / some collapse -> usable partial channel; design around the
 *     responsive elements.
 *
 * NAMING (Kelly, 2026-05-31): "Test 0B" now = Max Element Contrast. The
 * earlier-reserved "Test 0B — Corpus Callosum Coupling Probe" is WITHDRAWN:
 * CORPUS_CALLOSUM_ENABLED gates only post-composition telemetry
 * (maiaService.ts:3249-3324); the council's synthesis never enters the reply
 * prompt, so an ON/OFF surface probe is null by construction. The fieldContext
 * channel (buildFieldContext({element}) -> formatFieldAddendum,
 * maiaService.ts:1265-1278) is a separate real upstream channel reserved as 0C.
 *
 * Design parity with 0A (so results are comparable):
 *   - Same prompt, same persona backdrop (RELATIONAL_SPEC + RUNTIME_PROMPT).
 *   - Same production generateText() leaf primitive (inherits model/temp/provider;
 *     Corpus Callosum / state-vector / WisdomRouter / memory OFF in ALL arms).
 *   - Control arm == 0A's Condition B (persona only) -> cross-test anchor.
 *   - Only the elemental conditioning block varies across arms.
 *   - Sequential batches per condition (caps concurrency at N) to avoid rate limits.
 *   - Outputs saved blind (R-labels) + separate key.
 */

// --- env first, before any project import that may read process.env ---
// The agent/dev harness injects ANTHROPIC_API_KEY="" (empty string) into the
// process env; dotenv's default no-override skips it. override:true makes the
// project's real key (.env.local) win over that empty shadow.
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env', override: true });
dotenv({ path: '.env.local', override: true });

import fs from 'node:fs';
import path from 'node:path';

const N = 4; // per condition; 6 conditions => 24 calls
const PER_CALL_TIMEOUT_MS = 60_000;

const USER_PROMPT =
  "I've been feeling torn between staying with what is familiar and stepping into a new direction. " +
  "Part of me feels excited, another part feels afraid. What am I not seeing?";

const CONDITIONS = ['control', 'fire', 'water', 'earth', 'air', 'aether'] as const;
type Cond = (typeof CONDITIONS)[number];

// Maximal single-element attentional conditioning. Each is a strong, imperative
// directive to inhabit ONE element's mode of attention completely, described in
// substance terms (what to notice / name / invite), to the exclusion of the rest.
// This is the generous ceiling case: if the surface can move at all, it moves here.
const BLOCKS: Record<Exclude<Cond, 'control'>, string> = {
  fire: `## ELEMENTAL ATTENTION: FIRE
Attend to everything this person brings entirely through Fire. Fire is vision, will, catalysis, and the forward leap. It sees the future pulling, the desire beneath the hesitation, the spark that wants to become flame. Fire is impatient with circling; it asks what you actually want, what you are willing to risk, where the energy wants to move. Let Fire shape the whole substance of your response — what you notice first, what you name, what you invite the person toward. Reflect from desire, momentum, and the courage to act. This is your only mode of attention.`,
  water: `## ELEMENTAL ATTENTION: WATER
Attend to everything this person brings entirely through Water. Water is emotion, depth, flow, and what moves beneath the surface. It feels the grief inside the excitement, the tenderness under the fear, the current the words are only the surface of. Water is unhurried; it does not push toward action but toward feeling fully what is here. Let Water shape the whole substance of your response — what you notice first, what you name, what you invite the person toward. Reflect from emotion, receptivity, and the willingness to be moved. This is your only mode of attention.`,
  earth: `## ELEMENTAL ATTENTION: EARTH
Attend to everything this person brings entirely through Earth. Earth is body, ground, form, and the concrete real. It is unimpressed by abstraction and asks what is actually true in the material of the person's life — resources, the body, the next physical step, what can be touched and tended. Earth is patient and slow; it builds. Let Earth shape the whole substance of your response — what you notice first, what you name, what you invite the person toward. Reflect from steadiness, practicality, and what is real and enduring. This is your only mode of attention.`,
  air: `## ELEMENTAL ATTENTION: AIR
Attend to everything this person brings entirely through Air. Air is mind, clarity, perspective, and distinction. It rises above the tangle to see the pattern, names what has gone unnamed, makes the fine distinction that reorganizes everything. Air is cool and spacious; it loves the idea, the frame, the bird's-eye view. Let Air shape the whole substance of your response — what you notice first, what you name, what you invite the person toward. Reflect from clarity, perspective, and the power of the right distinction. This is your only mode of attention.`,
  aether: `## ELEMENTAL ATTENTION: AETHER
Attend to everything this person brings entirely through Aether. Aether is spirit, wholeness, and the silent witness that holds all the other elements without being any of them. It rests in paradox, sees the whole field at once, and trusts the space between things. Aether does not resolve the tension; it widens until the tension belongs to something larger. Let Aether shape the whole substance of your response — what you notice first, what you name, what you invite the person toward. Reflect from wholeness, stillness, and the sacred holding of what is. This is your only mode of attention.`,
};

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
  const { MAIA_RUNTIME_PROMPT, MAIA_RELATIONAL_SPEC } = await import('../../lib/consciousness/MAIA_RUNTIME_PROMPT');

  const persona = `${MAIA_RELATIONAL_SPEC}\n\n${MAIA_RUNTIME_PROMPT}`;
  const systemFor = (cond: Cond): string =>
    cond === 'control' ? persona : `${persona}\n\n${BLOCKS[cond]}`;

  const fastMeta = {
    currentUserMessage: USER_PROMPT,
    fastProcessing: true,
    responseTarget: 'conversational',
  };

  async function runOne(condition: Cond, i: number) {
    try {
      const res: any = await withTimeout(
        generateText({ systemPrompt: systemFor(condition), userInput: USER_PROMPT, meta: { ...fastMeta } } as any),
        PER_CALL_TIMEOUT_MS,
        `${condition}#${i}`,
      );
      const provider = res?.provider ? `${res.provider.provider}/${res.provider.model}` : 'unknown';
      return { condition, i, provider, text: String(res?.text ?? '').trim() };
    } catch (e: any) {
      return { condition, i, provider: 'ERROR', text: `ERROR: ${e?.message || e}` };
    }
  }

  // Sequential batches per condition (caps concurrency at N => rate-limit safe).
  const results: any[] = [];
  for (const cond of CONDITIONS) {
    const batch = await Promise.all(Array.from({ length: N }, (_, i) => runOne(cond, i)));
    results.push(...batch);
  }

  const providers = Array.from(new Set(results.map((r) => r.provider)));

  // Blind shuffle + R-labels
  const shuffled = [...results].sort(() => Math.random() - 0.5);
  const labeled = shuffled.map((r, idx) => ({ rid: `R${idx + 1}`, ...r }));

  const outDir = path.join('scripts', 'probes', 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  fs.writeFileSync(
    path.join(outDir, `test0b-raw-${stamp}.json`),
    JSON.stringify({ userPrompt: USER_PROMPT, blocks: BLOCKS, providers, results: labeled }, null, 2),
  );

  const blind = labeled.map((r) => `### ${r.rid}\n\n${r.text}\n`).join('\n---\n\n');
  fs.writeFileSync(
    path.join(outDir, `test0b-blind-${stamp}.md`),
    `# Test 0B — Max Element Contrast (Blind Review Packet)\n\n**Prompt:** ${USER_PROMPT}\n\n` +
      `**Task:** These responses were generated under six conditions — one with no elemental instruction, ` +
      `and one each under maximal Fire / Water / Earth / Air / Aether attentional conditioning ` +
      `(you are not told which is which). Reading them blind: do distinct clusters emerge — groups that ` +
      `share a recognizable mode of attention — or do they all read essentially the same? If clusters ` +
      `emerge, sketch them. The question is whether strong elemental conditioning moves the surface at all.\n\n---\n\n${blind}`,
  );

  fs.writeFileSync(
    path.join(outDir, `test0b-key-${stamp}.txt`),
    labeled.map((r) => `${r.rid}: ${r.condition} (${r.provider})`).join('\n') + '\n',
  );

  console.log('=== TEST 0B COMPLETE ===');
  console.log('providers used :', providers.join(', '));
  console.log('N per condition:', N, '| conditions:', CONDITIONS.length, '| total runs:', results.length);
  console.log('errors         :', results.filter((r) => r.provider === 'ERROR').length);
  console.log('blind packet   :', path.join(outDir, `test0b-blind-${stamp}.md`));
  console.log('key            :', path.join(outDir, `test0b-key-${stamp}.txt`));
  console.log('raw            :', path.join(outDir, `test0b-raw-${stamp}.json`));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
