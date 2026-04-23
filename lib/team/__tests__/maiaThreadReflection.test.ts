/**
 * Tests for lib/team/maiaThreadReflection.ts
 *
 * Covers the projection-guardrails added 2026-04-22 after observing
 * Haiku fabricating psychological frames ("what's underneath",
 * "you're defending", "a collision between two acts of trust") and
 * doubling down when the member pushed back.
 *
 * These tests assert:
 *   1. The guardrail-bearing strings are present in the system prompt
 *      (so a regression that removes them fails a test).
 *   2. Correction detection matches canonical pushback phrasings and
 *      does not false-positive on normal ideation language.
 *
 * What these tests do NOT cover:
 *   - Actual Haiku output quality (that's a human judgment on a real
 *     thread). The guardrails are wiring; quality is verdict.
 */

import {
  IDEAS_REFLECTION_SYSTEM_PROMPT,
  CORRECTION_ADDENDUM,
  latestBlockHasCorrection,
  type ThreadBlockSummary,
} from '../maiaThreadReflection';

function note(content: string): ThreadBlockSummary {
  return { type: 'note', label: 'Reflection', content };
}

// ─── system prompt guardrails ──────────────────────────────────────────

describe('IDEAS_REFLECTION_SYSTEM_PROMPT', () => {
  it('instructs the model to stay at the level of the idea', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/stay at the level of the idea/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /shape, clarify, sequence,? or scope/i
    );
  });

  it('names concrete ideas-mode moves (audience, sequence, first useful version)', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/clarify the audience/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/clarify sequence/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/first useful version/i);
  });

  it('explicitly bans "what\'s underneath" and "what you\'re really" patterns', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/what's underneath/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/what you're really doing/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/this isn't really about/i);
  });

  it('bans defending/avoiding/displacing language', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /defending.*avoiding.*displacing/is
    );
  });

  it('bans fabricated tension/collision language unless member named it', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/tension\/collision/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/unless the member has named it/i);
  });

  it('gates depth interpretation behind explicit member invitation', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /depth interpretation is earned only when/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /explicitly asks for deeper interpretation/i
    );
  });

  it('includes correction handling rule (drop frame, re-anchor)', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/correction handling/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /drop the prior interpretive frame/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /re-anchor in the member's own words/i
    );
  });

  it('preserves existing format constraints (sentence count, second person)', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/2 to 4 sentences/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/second person/i);
  });

  it('does NOT contain the removed projection-encouraging phrases', () => {
    // These three were the original licensing language for projection —
    // removed in this pass. Regression guard.
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).not.toMatch(
      /a small turn of seeing that they could not have given themselves/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).not.toMatch(
      /points to what is unspoken or almost-spoken/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).not.toMatch(
      /names the shape of what is present, not the content/i
    );
  });
});

// ─── correction addendum ───────────────────────────────────────────────

describe('CORRECTION_ADDENDUM', () => {
  it('instructs drop-frame and re-anchor behavior', () => {
    expect(CORRECTION_ADDENDUM).toMatch(/drop any prior interpretive frame/i);
    expect(CORRECTION_ADDENDUM).toMatch(/re-anchor in the member's own words/i);
  });

  it('suppresses apology/acknowledgment preambles', () => {
    expect(CORRECTION_ADDENDUM).toMatch(/no.*"i hear you".*openers/i);
  });
});

// ─── correction detection ─────────────────────────────────────────────

describe('latestBlockHasCorrection', () => {
  it('returns false on empty block list', () => {
    expect(latestBlockHasCorrection([])).toBe(false);
  });

  it('detects "that is not what I said"', () => {
    expect(latestBlockHasCorrection([note("That's not what I said.")])).toBe(true);
    expect(latestBlockHasCorrection([note('That is not what I meant.')])).toBe(true);
  });

  it('detects "I didn\'t say that" and "I never said"', () => {
    expect(latestBlockHasCorrection([note("I didn't say that.")])).toBe(true);
    expect(latestBlockHasCorrection([note('I never said anything about tension.')])).toBe(
      true
    );
  });

  it('detects "stop psychoanalyzing me"', () => {
    expect(latestBlockHasCorrection([note('stop psychoanalyzing me')])).toBe(true);
    expect(latestBlockHasCorrection([note('Stop projecting.')])).toBe(true);
  });

  it('detects "you are supposed to be helping me explore"', () => {
    expect(
      latestBlockHasCorrection([
        note("you are supposed to be helping me explore an idea"),
      ])
    ).toBe(true);
    expect(
      latestBlockHasCorrection([note("you're supposed to help me shape this")])
    ).toBe(true);
  });

  it('detects "that doesn\'t make sense"', () => {
    expect(latestBlockHasCorrection([note("that doesn't make sense")])).toBe(true);
  });

  it('detects "what makes you turn this into"', () => {
    expect(
      latestBlockHasCorrection([note('What makes you turn this into a challenge?')])
    ).toBe(true);
  });

  it('detects "what is wrong with you"', () => {
    expect(latestBlockHasCorrection([note('what is wrong with you? that is untrue')])).toBe(
      true
    );
  });

  it('detects "you\'re not listening" / "you\'re off base"', () => {
    expect(latestBlockHasCorrection([note("you're not listening to me")])).toBe(true);
    expect(latestBlockHasCorrection([note("you're off base here")])).toBe(true);
  });

  it('detects denial of projection ("I\'m not defending")', () => {
    expect(latestBlockHasCorrection([note("I'm not defending anything")])).toBe(true);
    expect(latestBlockHasCorrection([note("I'm not avoiding the question")])).toBe(
      true
    );
  });

  it('does NOT false-positive on normal ideation language', () => {
    expect(
      latestBlockHasCorrection([note('I want to start with the integration phase.')])
    ).toBe(false);
    expect(
      latestBlockHasCorrection([
        note("I'm thinking about the audience for these videos."),
      ])
    ).toBe(false);
    expect(
      latestBlockHasCorrection([note("I don't know what's wrong with this idea yet.")])
    ).toBe(false);
    expect(latestBlockHasCorrection([note('What makes this interesting is…')])).toBe(
      false
    );
  });

  it('only inspects the latest block, not earlier ones', () => {
    // Correction in an older block; latest is clean idea content.
    const blocks: ThreadBlockSummary[] = [
      note("stop psychoanalyzing me"),
      note('Let me think about the sequence.'),
    ];
    expect(latestBlockHasCorrection(blocks)).toBe(false);
  });
});
