/**
 * MAIA CONVERSATIONAL INTELLIGENCE — NON-DEGRADATION RULE, asserted.
 *
 * Doctrine: docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md
 *
 *   Voice may have a different capture path. It may not have a different mind.
 *
 * ⛔ WHY A SOURCE-PROPERTY TEST. The thing this rule forbids cannot be caught by
 * a behavioural test, because a degraded voice path still answers. It sounds
 * fine. It returns text. Every transport assertion stays green while MAIA
 * quietly becomes a thinner system on one modality. The only place the
 * degradation is visible is the wiring, so the wiring is what is pinned.
 *
 * ⛔ These assertions are deliberately about STRUCTURE, not output quality. They
 * prove that a spoken turn converges on the same cognition boundary as a typed
 * one. They do NOT prove the intelligence beyond that point is good — that is
 * the human witness the doctrine reserves, and no test substitutes for it.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

const ORACLE = read('components/OracleConversation.tsx');
const MAIA_PAGE = read('app/maia/page.tsx');

/** Comments describe intent; only code can violate the invariant. */
const code = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** The body of `handleVoiceTranscript`, up to the next top-level useCallback. */
function voicePath(): string {
  const start = ORACLE.indexOf('const handleVoiceTranscript = useCallback(');
  expect(start).toBeGreaterThan(-1);
  const after = ORACLE.indexOf('const handleVoiceTranscript', start + 10);
  const end = ORACLE.indexOf('\n  const ', start + 10);
  return code(ORACLE.slice(start, end > start ? end : after > start ? after : start + 40000));
}

describe('the spoken turn converges on the canonical MAIA cognition boundary', () => {
  it('⭐ voice funnels into handleTextMessage — it does not carry its own send', () => {
    // This IS the convergence point. If it ever disappears, voice has grown a
    // second conversational path and the invariant is broken.
    expect(voicePath()).toContain('handleTextMessage(');
  });

  it('⛔ the voice path opens no conversation request of its own', () => {
    const body = voicePath();
    // Non-conversational side calls (journal capture, transits) are legitimate
    // and named; a call to a CONVERSATION endpoint from here would mean voice
    // reaching MAIA by a route typed turns never take.
    const conversationalRoutes = [
      '/api/between/chat',
      '/api/sovereign/app/maia',
      '/api/oracle/conversation',
      '/api/maia/chat',
    ];
    for (const route of conversationalRoutes) {
      expect(body).not.toContain(route);
    }
  });

  it('⛔ voice selects no model, prompt, or context of its own', () => {
    const body = voicePath();
    for (const forbidden of [/\bmodel\s*:/, /systemPrompt/, /maxTokens/, /temperature\s*:/]) {
      expect(forbidden.test(body)).toBe(false);
    }
  });
});

describe('the canonical endpoint is passed, and there is no default to inherit', () => {
  it('⚠️ /maia passes apiEndpoint explicitly at every mount', () => {
    // Every mount names its route. Kept as a source assertion even though the
    // prop is now required, because it also pins WHICH route /maia names — a
    // thing the type system cannot check.
    const mounts = [...MAIA_PAGE.matchAll(/<OracleConversation\b/g)];
    expect(mounts.length).toBeGreaterThan(0);
    const endpoints = [...MAIA_PAGE.matchAll(/apiEndpoint=["'{]/g)];
    expect(endpoints.length).toBe(mounts.length);
    expect(MAIA_PAGE).toContain("apiEndpoint=\"/api/sovereign/app/maia/list\"");
  });

  it('⭐ the omission hazard is closed — no default route exists to fall back to', () => {
    // ⛔ SUPERSEDES a former assertion here that pinned the default's literal
    // value ("apiEndpoint = '/api/between/chat'"). That default WAS the hazard:
    // a surface mounting OracleConversation and forgetting the prop silently
    // reached a different cognition path — degradation by omission rather than
    // by intent. `apiEndpoint` is now a REQUIRED prop with no default, so an
    // omitted route is a compile error under tsconfig.ship.json (which covers
    // app/** and components/**), not a silent reroute. Strictly stronger than
    // the assertion it replaces: it forbids the fallback rather than describing it.
    const src = code(ORACLE);
    expect(src).toContain('apiEndpoint: string;'); // required, not optional
    expect(src).not.toMatch(/apiEndpoint\s*=\s*['"]/); // no default value anywhere
  });
});
