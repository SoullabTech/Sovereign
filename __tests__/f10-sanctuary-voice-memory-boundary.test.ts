/**
 * F10 — Sanctuary is a RETRIEVAL boundary on the voice path, not only a
 * retention one.
 *
 * Until 2026-08-28 the live voice memory build in
 * app/api/voice/stream-conversation/route.ts was guarded by `if (userId)`.
 * A Sanctuary voice turn therefore retrieved cross-session turns,
 * developmental memories and breakthrough moments via MemoryBundleService and
 * injected the formatted result into voiceSystemPrompt. No write occurred —
 * ConversationMemoryUsesStore.recordRetrievedCandidates is gated on a traceId
 * that call does not pass — so Sanctuary Invariant 1 (no retention) held while
 * Invariant 6 (absolute boundary) did not.
 *
 * These pins witness RETRIEVAL AND INJECTION, not persistence.
 *
 * Method: the memory composition lives inside a streaming route handler that
 * cannot be invoked without a live request, so — as with the R2 continuity
 * contract in this directory — the seam is asserted against the real source
 * rather than simulated. The assertions below locate the actual
 * MemoryBundleService.build call site and walk out to its governing guard, so
 * they cannot be satisfied by a comment or by an unrelated `!sanctuary`
 * elsewhere in the file.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { guardVoiceChunk } from '@/lib/maia/prompts/voiceStreamGuard';

const ROOT = join(__dirname, '..');
const ROUTE = 'app/api/voice/stream-conversation/route.ts';
const src = readFileSync(join(ROOT, ROUTE), 'utf8');

/** Strip line + block comments so no pin can be satisfied by prose. */
function code(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/**
 * The live (prompt-reaching) build site: the MemoryBundleService.build call
 * whose result is formatted into voiceMemoryContext. This is deliberately NOT
 * the MaiaWisdomProvider build — that branch is discarded before the prompt
 * (M1/F5) and already carries its own Sanctuary hard wall.
 */
function liveBuildSite() {
  const bare = code(src);
  const idx = bare.indexOf('MemoryBundleService.build(');
  expect(idx).toBeGreaterThan(-1);
  return { bare, idx };
}

describe('F10 · Sanctuary control — retrieval is not invoked', () => {
  it('governs the live MemoryBundleService.build call with a sanctuary predicate', () => {
    const { bare, idx } = liveBuildSite();

    // Walk backwards to the nearest enclosing `if (...) {` — the guard that
    // decides whether retrieval happens at all.
    const before = bare.slice(0, idx);
    const guardStart = before.lastIndexOf('if (');
    expect(guardStart).toBeGreaterThan(-1);
    const guard = before.slice(guardStart, before.indexOf('{', guardStart) + 1);

    // The exact pre-F10 defect, pinned so it cannot silently return.
    expect(guard.replace(/\s+/g, ' ')).not.toBe('if (userId) {');

    expect(guard).toContain('userId');
    expect(guard).toMatch(/!\s*sanctuary/);
  });

  it('leaves voiceMemoryContext empty when the guard does not run, so nothing can be injected', () => {
    const bare = code(src);

    // Empty initialiser: guard false => stays ''.
    expect(bare).toMatch(/let voiceMemoryContext = ''/);
    expect(bare).toMatch(/let voiceMemoryLoaded = false/);

    // voiceMemoryContext is assigned exactly once, and only from formatForPrompt
    // inside the guarded block — there is no second producer that could
    // repopulate it under Sanctuary.
    const assignments = bare.match(/voiceMemoryContext\s*=(?!=)/g) ?? [];
    expect(assignments).toHaveLength(2); // the initialiser + the guarded assignment
    expect(bare).toMatch(/voiceMemoryContext = MemoryBundleService\.formatForPrompt\(bundle\) \|\| ''/);
  });

  it('routes memory into voiceSystemPrompt only through voiceMemoryContext, which empty-filters out', () => {
    const bare = code(src);
    // M1.5 split the inline array into a named `voicePromptParts` so prompt
    // inclusion could be witnessed at the insertion site. Same contributors,
    // same filter, same join — the span moved, the contract did not.
    const start = bare.indexOf('const voicePromptParts');
    expect(start).toBeGreaterThan(-1);
    const composition = bare.slice(start, bare.indexOf('undefined;', start));

    // The only memory contributor in the composed prompt.
    expect(composition).toContain('voiceMemoryContext');
    expect(composition).not.toContain('memoryDirective');
    expect(composition).not.toContain('bundle');

    // Empty strings are dropped, so a Sanctuary turn contributes no memory block.
    expect(composition).toMatch(/\.filter\(\(s\): s is string => !!s && s\.length > 0\)/);
  });
});

describe('F10 · Negative control — non-Sanctuary retrieval behaviour is unchanged', () => {
  it('preserves the exact retrieval arguments (no ranking, scope or limit drift)', () => {
    const bare = code(src);
    const start = bare.indexOf('MemoryBundleService.build(');
    const call = bare.slice(start, bare.indexOf('});', start));

    // Pinned so an "observability" or "relevance" change cannot ride along in
    // this candidate. M1 established these as the behavioural baseline M2 needs.
    expect(call).toContain('currentInput: message');
    expect(call).toContain('sessionId: effectiveSessionId');
    expect(call).toContain("scope: 'cross_session'");
    expect(call).toContain('maxBullets: 5');
    expect(call).not.toContain('traceId');   // F9 — not in this candidate
    expect(call).not.toContain('threshold'); // M3 — not in this candidate
  });

  it('preserves the formatting seam and the loaded-context signal', () => {
    const bare = code(src);
    expect(bare).toMatch(/voiceMemoryLoaded = voiceMemoryContext\.length > 0/);
  });
});

describe('F10 · Sanctuary must not force a false continuity claim', () => {
  // Consequence of the repair: under Sanctuary, voiceMemoryLoaded is now false
  // where it was previously true whenever the (improperly retrieved) bundle
  // produced text. hasLoadedContext does not decide WHETHER the amnesia posture
  // is scrubbed — it selects WHICH replacement is spoken. So F10 changes what
  // MAIA says in Sanctuary, and that substitution must not become a false
  // continuity claim.
  const AMNESIA = "I don't have memory between conversations.";

  it('selects the no-context replacement when nothing was loaded, and it claims no continuity', () => {
    const v = guardVoiceChunk(AMNESIA, { recentTail: '', hasLoadedContext: false });
    expect(v.scrubbed).toBe(true);
    // Truthful inside Sanctuary: asserts no recall, promises no history.
    expect(v.safeText).toContain("I don't have that detail in front of me right now");
    expect(v.safeText).not.toMatch(/earlier specifics|loaded/i);
  });

  it('keeps the loaded-context replacement for non-Sanctuary turns (unchanged)', () => {
    const v = guardVoiceChunk(AMNESIA, { recentTail: '', hasLoadedContext: true });
    expect(v.scrubbed).toBe(true);
    expect(v.safeText).toContain('may not have loaded the earlier specifics yet');
  });
});

// ═══════════════════════════════════════════════════════════════════
// F10 CLIENT WIRE (F10-SANCTUARY-WIRE-01)
//
// The server half above proves the route's guard exists. It cannot prove the
// guard is ever GIVEN a true — and on 2026-08-28 it was not: `useStreamingVoice`
// sent no `sanctuary` field at all, so the route's `sanctuary = false`
// destructure default opened the memory gate on a turn the member had placed in
// Sanctuary (witness 4fde4e90-4f09-4ff7-8021-d30cc94887d8: attempted=true,
// promptIncluded=true). The predicate was correct and inert for its whole life.
//
// WHAT THESE PINS PROVE: the member's Sanctuary state is threaded from its
// single authority into the request body.
// WHAT THEY DO NOT PROVE: that a runtime `true` arrives at the server as `true`.
// `@testing-library/react` is not a dependency here and the jsdom project
// matches only `lib/hooks/**/*.dom.test.tsx`, so no render test is available.
// That claim belongs to the runtime witness, not to this file.
// ═══════════════════════════════════════════════════════════════════

const hookSrc = code(readFileSync(join(ROOT, 'hooks/useStreamingVoice.ts'), 'utf8'));
const callerSrc = code(readFileSync(join(ROOT, 'components/OracleConversation.tsx'), 'utf8'));

describe('F10 client wire · Sanctuary reaches the route', () => {
  it('the hook accepts sanctuary as an option', () => {
    expect(hookSrc).toMatch(/sanctuary\?:\s*boolean/);
    expect(hookSrc).toMatch(/sanctuary = false,/); // destructured, defaulted like the route
  });

  it('the streaming request body carries sanctuary', () => {
    // Anchor on the actual POST to the route, not on the word appearing anywhere.
    const i = hookSrc.indexOf("apiFetch('/api/voice/stream-conversation'");
    expect(i).toBeGreaterThan(-1);
    const body = hookSrc.slice(i, hookSrc.indexOf('}),', i));
    expect(body).toContain('sanctuary');
    // The exact pre-repair defect, pinned so it cannot silently return.
    expect(body).toContain('conversationHistory');
    expect(body).toContain('sessionId');
  });

  it('the caller threads isSanctuary into the hook — one authority, not two', () => {
    const i = callerSrc.indexOf('} = useStreamingVoice({');
    expect(i).toBeGreaterThan(-1);
    const opts = callerSrc.slice(i, callerSrc.indexOf('onTextChunk', i));
    expect(opts).toMatch(/sanctuary:\s*isSanctuary/);
  });

  it('the hook never reads Sanctuary from storage itself', () => {
    // A second source of truth could disagree with what the member can see, and
    // would fail silently in the unsafe direction. isSanctuary stays sole authority.
    const storageReads = hookSrc.match(/localStorage[^\n]*/g) ?? [];
    for (const line of storageReads) {
      expect(line).not.toMatch(/sanctuary/i);
      expect(line).not.toMatch(/maia_settings/);
    }
  });

  it('isSanctuary is still hydrated from the settings the member sees', () => {
    expect(callerSrc).toMatch(/localStorage\.getItem\('maia_settings'\)/);
    expect(callerSrc).toMatch(/settings\.sanctuary === true/);
  });
});
