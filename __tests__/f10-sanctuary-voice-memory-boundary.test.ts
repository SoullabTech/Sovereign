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

/**
 * F10-SANCTUARY-WIRE-01 — the client must TRANSMIT Sanctuary state.
 *
 * The route-side guards above were correct and still failed to protect the
 * member, because the streaming voice request never carried the flag. The
 * route's own `sanctuary = false` destructure default then made every
 * `!sanctuary` guard on that path evaluate true.
 *
 * Witnessed in production on 2026-08-28 (turn 4fde4e90-4f09-4ff7-8021-d30cc94887d8):
 * with the Sanctuary indicator active, the route logged
 * `attempted=true notAttemptedReason=n/a promptIncluded=true`, five
 * conversation_memory_uses rows landed, trust_observations row 998 landed, and
 * maia_turns row 174884 persisted 38 characters of member speech and 797
 * characters of MAIA's response VERBATIM into the sovereign-learning store.
 *
 * These pins are on the CLIENT wire, because that is where the boundary broke.
 * A guard that is never reached cannot be tested by exercising the guard.
 */
const HOOK = 'hooks/useStreamingVoice.ts';
const hookSrc = readFileSync(join(ROOT, HOOK), 'utf8');
const CALLER = 'components/OracleConversation.tsx';
const callerSrc = readFileSync(join(ROOT, CALLER), 'utf8');

/** Extract the balanced `{...}` object literal that follows `marker`. */
function objectLiteralAfter(text: string, marker: string): string {
  const start = text.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  const open = text.indexOf('{', start);
  expect(open).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(open, i + 1);
  }
  throw new Error(`unbalanced object literal after ${marker}`);
}

describe('F10-WIRE · the voice request carries Sanctuary state', () => {
  it('sends `sanctuary` in the stream-conversation request body', () => {
    const bare = code(hookSrc);
    const body = objectLiteralAfter(bare, "apiFetch('/api/voice/stream-conversation'");
    // The body literal is nested inside the apiFetch options; assert on the
    // JSON.stringify payload specifically so a same-named key elsewhere in the
    // options (headers, signal) cannot satisfy this.
    const payload = objectLiteralAfter(body, 'JSON.stringify(');
    expect(payload).toMatch(/(^|[\s,{])sanctuary\s*[,}]/);
  });

  it('requires `sanctuary` on the options type — no silent default', () => {
    const bare = code(hookSrc);
    const opts = objectLiteralAfter(bare, 'interface StreamingVoiceOptions');
    // Required, not optional. `sanctuary?: boolean` would let a caller omit it
    // and reintroduce exactly the 2026-08-28 breach with no compile error.
    expect(opts).toMatch(/\bsanctuary\s*:\s*boolean\s*;/);
    expect(opts).not.toMatch(/\bsanctuary\s*\?\s*:/);
  });

  it('does not give `sanctuary` a destructure default', () => {
    const bare = code(hookSrc);
    // `sanctuary = false` in the destructure would restore the silent default
    // one layer up from the route, defeating the required-option pin above.
    expect(bare).not.toMatch(/\bsanctuary\s*=\s*false\s*,/);
    expect(bare).toMatch(/\bsanctuary\s*,/);
  });

  it('lists `sanctuary` in the send-callback dependencies', () => {
    const bare = code(hookSrc);
    // A stale closure would ignore a mid-session Sanctuary toggle: the UI would
    // show the boundary active while the wire kept sending the old value. That
    // is how Turn B was performed — Sanctuary was selected in Settings and the
    // member returned to /maia.
    const deps = bare.match(/\}, \[voice, speed, model[^\]]*\]/);
    expect(deps).not.toBeNull();
    expect(deps![0]).toContain('sanctuary');
  });

  it('passes the member-facing Sanctuary state from OracleConversation', () => {
    const bare = code(callerSrc);
    const opts = objectLiteralAfter(bare, 'useStreamingVoice(');
    // Must be the live state, not a literal. `sanctuary: false` here would
    // satisfy a naive "is the key present" check while transmitting nothing.
    expect(opts).toMatch(/sanctuary\s*:\s*isSanctuary\s*,/);
  });
});
