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
  PROGRESSION_DIRECTIVES,
  PROGRESSION_FLOOR,
  latestBlockHasCorrection,
  progressionStage,
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

// ─── progression + closure + directional offerings (2026-04-22 part 2) ─

describe('IDEAS_REFLECTION_SYSTEM_PROMPT — progression guardrails', () => {
  it('names the "name → question → close → offer" pattern explicitly', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /name\s*→\s*question\s*→\s*close\s*→\s*offer/i
    );
  });

  it('describes progression tiers based on prior reflection count', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/no prior reflections/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/one prior reflection/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/two or more prior reflections/i);
  });

  it('includes closure move phrases', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/you've already identified/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/that's enough to work from/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/from that/i);
  });

  it('includes synthesis/sequencing/framing offerings', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /a simple way to structure this would be/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/an initial version might look like/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/the question becomes whether/i);
  });

  it('preserves non-directive boundary (no "you should", etc.)', () => {
    // The ban on imperative verbs must remain from the projection-fix pass.
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/no imperative advice/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /"you should".*"you need to".*"try".*"consider"/is
    );
  });

  it('explicitly marks offerings as non-commands', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /offerings the member can take, leave, or modify/i
    );
  });

  it('has anti-repetition rule for structural distinctions', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/anti-repetition/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /do NOT restate or re-slice/i
    );
  });

  it('has a balance rule capping clarifying questions and requiring offerings', () => {
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/balance rule/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /at most one clarifying question/i
    );
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /at least one closure \+ offering/i
    );
  });

  it('preserves projection guardrails (no regression)', () => {
    // Regression guard — the projection fixes from part 1 must still be present.
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/stay at the level of the idea/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(/what's underneath/i);
    expect(IDEAS_REFLECTION_SYSTEM_PROMPT).toMatch(
      /drop the prior interpretive frame/i
    );
  });
});


// ─── progression stage (computed, not inferred) ─────────────────────────────
//
// Regression guard for the observed loop: a thread several reflections deep
// receiving the same scoping question turn after turn. The stage is derived
// from thread state so the model cannot drift past it.

describe('progressionStage', () => {
  it('opens in clarify on the first reflection', () => {
    expect(progressionStage(0)).toBe('clarify');
  });

  it('allows one more clarification after a single reflection', () => {
    expect(progressionStage(1)).toBe('clarify_or_close');
  });

  it('forces close_and_offer from the third reflection onward', () => {
    expect(progressionStage(2)).toBe('close_and_offer');
    expect(progressionStage(3)).toBe('close_and_offer');
    expect(progressionStage(12)).toBe('close_and_offer');
  });

  it('treats a negative or absent count as the first turn', () => {
    expect(progressionStage(-1)).toBe('clarify');
  });
});

describe('PROGRESSION_DIRECTIVES', () => {
  it('names every stage', () => {
    expect(Object.keys(PROGRESSION_DIRECTIVES).sort()).toEqual([
      'clarify',
      'clarify_or_close',
      'close_and_offer',
    ]);
  });

  it('bans the repeated scoping questions once clarification is over', () => {
    const d = PROGRESSION_DIRECTIVES.close_and_offer;
    expect(d).toMatch(/MUST NOT ask what the idea is for/);
    expect(d).toMatch(/who it serves/);
    expect(d).toMatch(/what problem it solves/);
    expect(d).toMatch(/first useful version/);
  });

  it('permits conceptual material to be developed on its own terms', () => {
    expect(PROGRESSION_DIRECTIVES.close_and_offer).toMatch(
      /conceptual or philosophical material/
    );
    expect(PROGRESSION_DIRECTIVES.close_and_offer).toMatch(
      /Do not redirect a conceptual thread into a scoping question/
    );
  });

  it('still asks for exactly one clarifying question on the first turn', () => {
    expect(PROGRESSION_DIRECTIVES.clarify).toMatch(/ONE clarifying question/);
  });
});

// ─── bounded context ────────────────────────────────────────────────────────

describe('PROGRESSION_FLOOR', () => {
  it('defers the move to the stance the member chose', () => {
    expect(PROGRESSION_FLOOR).toMatch(/follow the stance rather than any default sequence/);
  });

  it('keeps the anti-repetition floor', () => {
    expect(PROGRESSION_FLOOR).toMatch(/do not restate or re-slice a structural distinction/);
    expect(PROGRESSION_FLOOR).toMatch(/do not re-ask a question you have already asked/);
  });

  it('does not carry the close-and-offer demand that would override a stance', () => {
    expect(PROGRESSION_FLOOR).not.toMatch(/structural offering/);
    expect(PROGRESSION_FLOOR).not.toMatch(/Close the loop/);
  });
});
