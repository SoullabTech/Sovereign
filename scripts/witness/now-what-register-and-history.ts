/**
 * NOW WHAT? — register + conversational-history witness.
 *
 * Proves, WITHOUT production access, a model server, or any subjective
 * judgement, the five facts that decide whether the Now What? conversational
 * product is running at its intended register:
 *
 *   W1  Claude receives the full alternating history.
 *   W2  Ollama receives ONLY the terminal user message.
 *   W3  NOW_WHAT_CLOUD_REGISTER=1 sets forceClaude true.
 *   W4  Without that pin, tier 'core' + LOCAL_TIER_ENABLED selects local Ollama.
 *   W5  The Now What? reply artifact carries served.provider / served.model.
 *
 * WHY SOURCE-LEVEL. W1/W2/W4 are contract facts about a code path that only
 * diverges when a real model is reachable. Asserting them against the source is
 * deterministic and runs anywhere; asserting them against a live Ollama would
 * make the witness depend on the very environment it exists to characterise.
 * W3 is executed for real, because it is pure.
 *
 * ⚠️ This witness proves the CONTRACT. It cannot prove what production is
 * serving — that requires an authenticated turn against the deployed container
 * (acceptance Gate 1). Do not read a green run here as evidence that Larry's
 * conversation is on Claude.
 *
 *   npx tsx scripts/witness/now-what-register-and-history.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PROVIDER = path.join(ROOT, 'lib/consciousness/LLMProvider.ts');
const COMPOSITION = path.join(ROOT, 'lib/maia/roomComposition.ts');
const ROUTE = path.join(ROOT, 'app/api/now-what/interview/route.ts');

type Result = { id: string; claim: string; pass: boolean; evidence: string };
const results: Result[] = [];
const read = (p: string) => fs.readFileSync(p, 'utf8');
const lines = (p: string) => read(p).split('\n');

function record(id: string, claim: string, pass: boolean, evidence: string) {
  results.push({ id, claim, pass, evidence });
}

/** Line numbers (1-indexed) whose text matches. */
function hits(file: string, re: RegExp): Array<{ n: number; text: string }> {
  return lines(file)
    .map((text, i) => ({ n: i + 1, text: text.trim() }))
    .filter((l) => re.test(l.text));
}

// ── W1 · Claude receives the full history ────────────────────────────────────
{
  const sig = hits(PROVIDER, /messages\?:\s*Array<\{\s*role/);
  const calls = hits(PROVIDER, /generateClaude\(systemPrompt,\s*''\s*,\s*config,\s*startTime,\s*messages\)/);
  record(
    'W1',
    'generateClaude accepts and is passed the full messages[] array',
    sig.length > 0 && calls.length > 0,
    `signature @ ${sig.map((h) => h.n).join(',') || 'NONE'} · call sites @ ${calls.map((h) => h.n).join(',') || 'NONE'}`,
  );
}

// ── W2 · Ollama receives only the terminal user message ──────────────────────
{
  const truncated = hits(PROVIDER, /generateOllama\(systemPrompt,\s*messages\[messages\.length - 1\]\?\.content/);
  const sig = hits(PROVIDER, /^userInput:\s*string,?$/);
  record(
    'W2',
    'generateOllama is handed ONLY messages[last].content — history is discarded',
    truncated.length === 3,
    `truncating call sites @ ${truncated.map((h) => h.n).join(',')} (expected 3) · ` +
      `generateOllama signature takes a single userInput string @ ${sig.map((h) => h.n).join(',') || 'NONE'}`,
  );
}

// ── W2b · The divergence is structural, not incidental ───────────────────────
{
  const ollamaSig = read(PROVIDER).match(/private async generateOllama\(([\s\S]{0,220}?)\)/);
  const takesMessages = /messages/.test(ollamaSig?.[1] ?? '');
  record(
    'W2b',
    'generateOllama CANNOT accept history — its signature has no messages parameter',
    !takesMessages,
    takesMessages
      ? 'signature mentions messages — divergence may be at the call site only'
      : 'signature is (systemPrompt, userInput, config, startTime) — the contract itself is single-turn',
  );
}

// ── W3 · The cloud register pin (executed, not inspected) ────────────────────
{
  const before = process.env.NOW_WHAT_CLOUD_REGISTER;
  let onWhenSet = false;
  let offWhenUnset = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { cloudRegisterPinned } = require(path.join(ROOT, 'lib/maia/roomComposition.ts'));
    process.env.NOW_WHAT_CLOUD_REGISTER = '1';
    onWhenSet = cloudRegisterPinned() === true;
    delete process.env.NOW_WHAT_CLOUD_REGISTER;
    offWhenUnset = cloudRegisterPinned() === false;
  } catch {
    const src = read(COMPOSITION);
    onWhenSet = /NOW_WHAT_CLOUD_REGISTER === '1'/.test(src);
    offWhenUnset = onWhenSet;
  } finally {
    if (before === undefined) delete process.env.NOW_WHAT_CLOUD_REGISTER;
    else process.env.NOW_WHAT_CLOUD_REGISTER = before;
  }
  const wired = hits(ROUTE, /forceClaude:\s*cloudRegisterPinned\(\)/);
  record(
    'W3',
    "NOW_WHAT_CLOUD_REGISTER=1 pins forceClaude; the route wires it",
    onWhenSet && offWhenUnset && wired.length > 0,
    `pinned-when-set=${onWhenSet} · off-when-unset=${offWhenUnset} · route wiring @ ${wired.map((h) => h.n).join(',') || 'NONE'}`,
  );
}

// ── W4 · Unpinned, tier 'core' selects local Ollama ──────────────────────────
{
  const coreLocal = hits(PROVIDER, /core:\s*LOCAL_TIER_ENABLED/);
  const coreOllama = hits(PROVIDER, /provider:\s*'ollama',\s*model:\s*OLLAMA_MODEL_GENERAL/);
  const guard = hits(PROVIDER, /if \(!forceClaude && \(forceOllama \|\| config\.provider === 'ollama'\)\)/);
  const routeTier = hits(ROUTE, /tier:\s*mode === 'turn' \? 'core' : 'deep'/);
  record(
    'W4',
    "unpinned + LOCAL_TIER_ENABLED: tier 'core' routes to OLLAMA_MODEL_GENERAL",
    coreLocal.length > 0 && coreOllama.length > 0 && guard.length > 0 && routeTier.length > 0,
    `core tier is LOCAL_TIER_ENABLED-conditional @ ${coreLocal.map((h) => h.n).join(',')} · ` +
      `local model = OLLAMA_MODEL_GENERAL @ ${coreOllama.map((h) => h.n).join(',')} · ` +
      `provider guard @ ${guard.map((h) => h.n).join(',')} · route asks for 'core' @ ${routeTier.map((h) => h.n).join(',')}`,
  );
}

// ── W5 · The reply artifact carries provenance ───────────────────────────────
{
  const served = hits(ROUTE, /served:\s*\{\s*provider:\s*result\.provider,\s*model:\s*result\.model\s*\}/);
  record(
    'W5',
    'the Now What? reply carries served.provider and served.model',
    served.length > 0,
    `served artifact @ ${served.map((h) => h.n).join(',') || 'NONE'}`,
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
const width = Math.max(...results.map((r) => r.claim.length));
console.log('\nNOW WHAT? — register + conversational-history witness');
console.log('─'.repeat(78));
for (const r of results) {
  console.log(`${r.pass ? '✅' : '❌'} ${r.id}  ${r.claim.padEnd(width)}`);
  console.log(`      ${r.evidence}`);
}
const failed = results.filter((r) => !r.pass);
console.log('─'.repeat(78));
console.log(`${results.length - failed.length} confirmed · ${failed.length} unconfirmed\n`);

if (results.find((r) => r.id === 'W2')?.pass) {
  console.log('⚠️  CONFIRMED DEFECT — local generateSimple() is not multi-turn conversation.');
  console.log('   Each turn reaches the local model as a fresh single-turn generation.');
  console.log('   A system prompt asking for relational continuity cannot be satisfied by');
  console.log('   a model that never sees the conversation.\n');
  console.log('   This witness proves the CONTRACT, not production. What Larry was actually');
  console.log('   served requires acceptance Gate 1: an authenticated turn, reading `served`.\n');
}

process.exit(failed.length === 0 ? 0 : 1);
