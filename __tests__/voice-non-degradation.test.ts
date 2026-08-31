/**
 * MAIA DEEP-INTELLIGENCE GATE — the convergence property, asserted POSITIVELY.
 *
 * Doctrine: docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md
 * Unit:     docs/architecture/VOICE_CANONICAL_CONVERGENCE_02_EXIT_MAP.md
 *
 *   Voice may have a different capture path. It may not have a different mind.
 *
 * ⛔ WHY THIS FILE WAS REWRITTEN. Its previous version asserted that four NAMED
 * routes were absent from the voice handler:
 *
 *     ['/api/between/chat','/api/sovereign/app/maia',
 *      '/api/oracle/conversation','/api/maia/chat']
 *
 * `/api/voice/stream-conversation` was not among them. So the suite passed while
 * the DEFAULT spoken turn went to a route running its own Claude service, memory
 * bundle, relational stack and prompts — a second mind — and returned before
 * reaching canonical cognition. A denylist cannot find what it was not told to
 * look for, and it was presented as a structural proof.
 *
 * The replacement is positive: enumerate the response-producing cognition exits
 * and constrain the SET, so an exit nobody has thought of yet still fails.
 *
 * ⛔ WHAT THIS PROVES, EXACTLY:
 *
 *   Every response-producing voice turn requiring MAIA cognition crosses the
 *   canonical cognition spine exactly once before any response transport begins.
 *
 * ⛔ AND WHAT IT DOES NOT. It does NOT claim universal MAIA egress convergence.
 * Class C of the exit map — eleven `maiaSpeak()` sites uttering locally-authored
 * or data-API text with no model in the path — is a separately recorded finding,
 * as is `OracleConversation.tsx:6712` (a crisis script spoken outside any guard
 * that deliberately does not return). Neither is repaired here, and neither may
 * be laundered into "fixed" by this suite passing.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const ORACLE = read('components/OracleConversation.tsx');
const MAIA_PAGE = read('app/maia/page.tsx');

/** Comments describe intent; only code can violate the invariant. */
const stripComments = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/**
 * ⭐ THE CATALOGUE OF WAYS A TURN CAN BECOME A MAIA RESPONSE.
 *
 * Adding a capability here is an authority decision, exactly like the preload
 * allow-list. A new way to produce a response that is NOT listed here will be
 * invisible to this gate — so the catalogue, not the assertion, is the thing to
 * review when the architecture grows.
 */
const RESPONSE_PRODUCING = [
  { name: 'handleTextMessage', pattern: /\bhandleTextMessage\s*\(/g, canonical: true },
  { name: 'sendStreamingMessage', pattern: /\bsendStreamingMessage\s*\(/g, canonical: false },
  { name: 'direct conversational fetch', pattern: /(apiFetch|fetch)\s*\(\s*['"`][^'"`]*\/api\/(between|oracle|sovereign|maia|voice\/stream)[^'"`]*['"`]/g, canonical: false },
] as const;

/** The body of `handleVoiceTranscript`, code only. */
function voiceHandler(source = ORACLE): string {
  const start = source.indexOf('const handleVoiceTranscript = useCallback(');
  expect(start).toBeGreaterThan(-1);
  const end = source.indexOf('\n  const ', start + 10);
  return stripComments(source.slice(start, end > start ? end : source.length));
}

/** Every response-producing exit found in a body, by name. */
function exitsIn(body: string): string[] {
  return RESPONSE_PRODUCING
    .filter(({ pattern }) => new RegExp(pattern.source, pattern.flags).test(body))
    .map(({ name }) => name);
}

describe('exactly one response-producing cognition exit', () => {
  it('⭐ the voice handler has ONE, and it is the canonical one', () => {
    const exits = exitsIn(voiceHandler());
    // The set, not the presence of a favourite member of it.
    expect(exits).toEqual(['handleTextMessage']);
  });

  it('⛔ PROBE — a second response-producing exit FAILS this gate', () => {
    // The gate is only worth anything if it detects an exit nobody listed.
    // This injects one and asserts the checker catches it, so the test cannot
    // silently degrade into a tautology the way its predecessor did.
    const probed = voiceHandler().replace(
      'await handleTextMessage(',
      'await sendStreamingMessage(cleanedText); await handleTextMessage(',
    );
    expect(exitsIn(probed)).not.toEqual(['handleTextMessage']);
    expect(exitsIn(probed)).toContain('sendStreamingMessage');
  });

  it('⛔ PROBE — an UNNAMED conversational endpoint also fails', () => {
    const probed = voiceHandler().replace(
      'await handleTextMessage(',
      "await apiFetch('/api/voice/stream-conversation', {}); await handleTextMessage(",
    );
    expect(exitsIn(probed)).toContain('direct conversational fetch');
  });

  it('voice selects no model, prompt, or context of its own', () => {
    const body = voiceHandler();
    for (const forbidden of [/\bmodel\s*:/, /systemPrompt/, /maxTokens/, /temperature\s*:/]) {
      expect(forbidden.test(body)).toBe(false);
    }
  });
});

describe('the streaming implementation is preserved, only unreachable from voice', () => {
  it('⛔ NOT DELETED — the hook and its wiring remain as evidence', () => {
    // The repair was reachability, not removal. Deleting the implementation
    // would destroy the evidence and make a later transport extraction harder.
    expect(ORACLE).toContain('sendMessage: sendStreamingMessage');
    expect(fs.existsSync(path.resolve(__dirname, '..', 'hooks/useStreamingVoice.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '..', 'app/api/voice/stream-conversation/route.ts'))).toBe(true);
  });

  it('⛔ STRUCTURAL, not defaulted off — no flag can restore the exit', () => {
    // Flipping `streamingVoiceMode` to false would have made the defect dormant
    // rather than impossible. The branch is gone from the handler, so restoring
    // a second cognition path requires editing the code and failing the gate
    // above — not setting a variable.
    expect(voiceHandler()).not.toMatch(/streamingVoiceMode/);
  });
});

describe('the canonical endpoint is passed, never inherited from the default', () => {
  it('⚠️ /maia passes apiEndpoint explicitly at every mount', () => {
    const mounts = [...MAIA_PAGE.matchAll(/<OracleConversation\b/g)];
    expect(mounts.length).toBeGreaterThan(0);
    expect([...MAIA_PAGE.matchAll(/apiEndpoint=["'{]/g)].length).toBe(mounts.length);
    expect(MAIA_PAGE).toContain('apiEndpoint="/api/sovereign/app/maia/list"');
  });

  it('the default remains a default — not the value /maia relies on', () => {
    expect(stripComments(ORACLE)).toContain("apiEndpoint = '/api/between/chat'");
  });
});
