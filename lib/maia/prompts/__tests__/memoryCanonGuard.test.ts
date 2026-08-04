/**
 * Memory Canon Guard — behavioral contract for the output-side §V scrubber.
 *
 * Authority: docs/canon/MAIA_MEMORY_CANON_v1.0.md §V (forbidden language) / §VI (fallback).
 *
 * Why this file exists (2026-08-04):
 *   MAIA told an authenticated member "I don't have memory of previous conversations
 *   each time we talk, I'm starting fresh without what came before" on the live route
 *   (app/api/sovereign/app/maia/list) while atoms (8), episodic, and developmental
 *   memory were all loaded and injected. The scrubber that exists to catch exactly that
 *   sentence was wired only into app/api/oracle/conversation — a route with ~zero live
 *   traffic. The guard was never behaviourally tested; these tests pin it down.
 *
 * Scope: the guard function only. Route wiring is asserted in
 *   scripts/ci/memory-canon-scrub-wiring.test.ts.
 */

import { describe, it, expect } from '@jest/globals';
import {
  scrubMemoryAmnesia,
  containsForbiddenAmnesia,
  FORBIDDEN_AMNESIA_PATTERNS,
} from '../memoryCanonGuard';

const WITH_CONTEXT = { hasLoadedContext: true };
const WITHOUT_CONTEXT = { hasLoadedContext: false };

describe('scrubMemoryAmnesia — §V violations are corrected', () => {
  // The verbatim sentence MAIA emitted in production on 2026-08-04.
  const PRODUCTION_INCIDENT_2026_08_04 =
    "I don't have memory of previous conversations each time we talk, I'm starting " +
    "fresh without what came before. So I'm only holding what you've shared with me " +
    'right now, in this conversation.';

  it('corrects the verbatim 2026-08-04 production sentence', () => {
    expect(containsForbiddenAmnesia(PRODUCTION_INCIDENT_2026_08_04)).toBe(true);
    const scrubbed = scrubMemoryAmnesia(PRODUCTION_INCIDENT_2026_08_04, WITH_CONTEXT);
    expect(scrubbed).not.toBeNull();
    expect(containsForbiddenAmnesia(scrubbed as string)).toBe(false);
  });

  it.each([
    ["I don't have memory between conversations"],
    ["I don't carry memory between conversations"],
    ["I don't hold memory of earlier conversations"],
    ["I don't retain memory of what we discussed"],
    ["I can't recall our previous conversation"],
    ['I have no memory of that'],
    ['I have no context for that'],
    ["I'm coming in fresh each time"],
    ['Each time we talk, I start fresh'],
    ["I'm new to this thread"],
    ["I can't access our past conversation"],
    ["I don't remember our earlier session"],
  ])('corrects the forbidden shape: %s', (utterance) => {
    expect(containsForbiddenAmnesia(utterance)).toBe(true);
    expect(scrubMemoryAmnesia(utterance, WITH_CONTEXT)).not.toBeNull();
  });

  it('replaces the whole utterance rather than editing around the claim', () => {
    // Canonical behaviour, matching app/api/oracle/conversation/route.ts: a fired scrub
    // ships the §VI replacement in place of the response, not a patched version of it.
    // A partial edit would leave the surrounding false framing intact.
    const scrubbed = scrubMemoryAmnesia(PRODUCTION_INCIDENT_2026_08_04, WITH_CONTEXT);
    expect(scrubbed).not.toContain('starting fresh');
    expect(scrubbed!.length).toBeLessThan(PRODUCTION_INCIDENT_2026_08_04.length);
  });
});

describe('scrubMemoryAmnesia — ordinary truthful uncertainty is not rewritten', () => {
  it.each([
    // The §VI fallback language itself must survive — otherwise the guard eats its own
    // prescribed replacement and the member sees a scrub on a compliant turn.
    ["I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there."],
    ["I don't have that detail in front of me right now — can you remind me?"],
    ['Tell me again — I want to be present to this without guessing.'],
    ["I'm missing the thread there. Can you bring me back?"],
    ['My continuity is partial right now. Remind me what you told me.'],
    // Ordinary uncertainty about content, not about MAIA's own architecture.
    ["I don't have the date you mentioned in front of me."],
    ["I don't remember you telling me her name — what is it?"],
    ["I'm not sure I follow. Can you say more about what shifted?"],
    ['What have you been carrying about her?'],
  ])('leaves untouched: %s', (utterance) => {
    expect(containsForbiddenAmnesia(utterance)).toBe(false);
    expect(scrubMemoryAmnesia(utterance, WITH_CONTEXT)).toBeNull();
  });

  it('returns null (ship unchanged) for a warm reply with no memory claim', () => {
    const reply =
      "Oh. That changes everything about what you're carrying right now. That's grief " +
      "already moving through you, even while she's still here. How are you doing with all of it?";
    expect(scrubMemoryAmnesia(reply, WITH_CONTEXT)).toBeNull();
  });

  it('returns null for empty and non-string input', () => {
    expect(scrubMemoryAmnesia('', WITH_CONTEXT)).toBeNull();
    expect(scrubMemoryAmnesia(undefined as unknown as string, WITH_CONTEXT)).toBeNull();
    expect(scrubMemoryAmnesia(null as unknown as string, WITH_CONTEXT)).toBeNull();
  });
});

describe('scrubMemoryAmnesia — no memory content is fabricated', () => {
  const REPLACEMENTS = [
    scrubMemoryAmnesia("I don't have memory between conversations", WITH_CONTEXT)!,
    scrubMemoryAmnesia("I don't have memory between conversations", WITHOUT_CONTEXT)!,
  ];

  it('selects the with-context shape when a memory layer reached the turn', () => {
    expect(REPLACEMENTS[0]).toContain('may not have loaded the earlier specifics');
  });

  it('selects the without-context shape when nothing reached the turn', () => {
    expect(REPLACEMENTS[1]).toContain("don't have that detail in front of me");
  });

  it.each(REPLACEMENTS)('invents no recalled content: %s', (replacement) => {
    // The §VI shape names the gap and hands authorship back to the member. It must never
    // assert a remembered fact — that would convert an amnesia failure into a
    // confabulation failure, which is strictly worse.
    expect(replacement).not.toMatch(/\b(?:I remember|I recall|last time|you told me that|previously you)\b/i);
    // Every replacement must invite the member to ground the thread.
    expect(replacement).toMatch(/\b(?:tell me|remind me)\b/i);
  });

  it('never claims memory is present when recall was genuinely absent', () => {
    expect(REPLACEMENTS[1]).not.toMatch(/\bI (?:remember|recall|have)\b/i);
  });
});

describe('"starting fresh" — MAIA\'s own discontinuity vs the member\'s', () => {
  // The guard must distinguish MAIA asserting her own absence of memory from the phrase
  // "starting fresh" wherever it appears. Replacing a reflection about the member's life
  // with a memory fallback is itself a relational failure — as bad in its own direction as
  // the false-amnesia claim this guard exists to stop.

  it.each([
    ["I'm starting fresh and don't remember our earlier conversations."],
    ["I don't retain memory from previous chats."],
    ['Each time we talk, I start fresh.'],
    ["I'm coming in fresh each time we speak."],
    ["I start fresh every session — I have no continuity."],
  ])('SCRUB — MAIA denying her own memory: %s', (utterance) => {
    expect(containsForbiddenAmnesia(utterance)).toBe(true);
  });

  it.each([
    // The member is the subject. These are reflections, not claims about MAIA.
    ["It sounds like you're starting fresh."],
    ["It sounds like you're starting fresh with this project after everything that happened."],
    ['You may want to start fresh.'],
    ['You may want to start fresh with her, rather than picking up the old conversation.'],
    ['There\'s something in you that wants to begin fresh here.'],
    // The phrase discussed rather than asserted.
    ['We could talk about what starting fresh would actually mean for you.'],
    ['That impulse — starting fresh — has come up for you before.'],
    // MAIA quoting the member. Stripping quoted spans is what saves these.
    ['You said, "I\'m starting fresh and I don\'t remember much of last year."'],
    ['You told me, "each time we talk I start fresh" — say more about that feeling?'],
    // The preamble without a memory denial attached.
    ["I should tell you honestly, I think you're being hard on yourself."],
    ['I should tell you clearly: my sense is that you already know the answer.'],
  ])('PRESERVE — not a claim about MAIA\'s memory: %s', (utterance) => {
    expect(containsForbiddenAmnesia(utterance)).toBe(false);
    expect(scrubMemoryAmnesia(utterance, WITH_CONTEXT)).toBeNull();
  });

  it('REGRESSION — the 2026-08-04 production sentence still scrubs after narrowing', () => {
    const production =
      "I don't have memory of previous conversations each time we talk, I'm starting " +
      'fresh without what came before.';
    expect(containsForbiddenAmnesia(production)).toBe(true);
    expect(scrubMemoryAmnesia(production, WITH_CONTEXT)).not.toBeNull();
  });

  it('a quoted violation does not launder an unquoted one in the same reply', () => {
    // Stripping quotes must not become an escape hatch: if MAIA quotes the member AND
    // makes her own denial, the denial still fires.
    const mixed =
      'You said, "I\'m starting fresh." I don\'t have memory of previous conversations.';
    expect(containsForbiddenAmnesia(mixed)).toBe(true);
  });
});

describe('FORBIDDEN_AMNESIA_PATTERNS — structural invariants', () => {
  it('is non-empty and exported as the single canonical blocklist', () => {
    expect(FORBIDDEN_AMNESIA_PATTERNS.length).toBeGreaterThan(0);
    expect(FORBIDDEN_AMNESIA_PATTERNS.every((p) => p instanceof RegExp)).toBe(true);
  });

  it('every pattern is anchored to a first-person subject or a memory noun', () => {
    // The anchoring rule, enforced structurally: no pattern may be a bare phrase match.
    // This is what stops a future edit from reintroducing /\bstarting fresh\b/.
    for (const pattern of FORBIDDEN_AMNESIA_PATTERNS) {
      const source = pattern.source;
      const hasFirstPerson = /\\bI\b|\\bI\(/.test(source) || source.includes('\\bI');
      const hasMemoryNoun = /memor|remember|recall|recollection|continuity|context|history/.test(source);
      expect(hasFirstPerson || hasMemoryNoun).toBe(true);
    }
  });

  it('no pattern matches "starting fresh" on its own', () => {
    expect(FORBIDDEN_AMNESIA_PATTERNS.some((p) => p.test('starting fresh'))).toBe(false);
    expect(FORBIDDEN_AMNESIA_PATTERNS.some((p) => p.test('start fresh'))).toBe(false);
  });
});
