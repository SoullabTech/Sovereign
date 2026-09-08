import { readFileSync } from 'fs';
import { join } from 'path';
import {
  checkEncouragement,
  isEncourageable,
  MAX_ENCOURAGEMENT_CHARS,
  type EncourageableAct,
} from '../goalEncouragement';

/**
 * GOALS SUPPORT · PHASE 1 — the check is the product.
 *
 * The governing question is not whether a model can write something pleasant:
 *
 *     Can MAIA add warmth without making herself part of the transaction?
 *
 * Every candidate below is plausible, fluent and well-meant. Each one takes a
 * little of the moment away from the writer, and none of them would look wrong
 * in review.
 *
 * The checker can afford to be this severe only because FR-16 made silence
 * lawful: a false refusal costs nothing, so there is no pressure to be lenient.
 */

const ok = (t: string, act: EncourageableAct = 'met') => checkEncouragement(t, act);
const refusalOf = (t: string, act: EncourageableAct = 'met') => {
  const r = checkEncouragement(t, act);
  return r.ok ? null : r.refusal;
};

describe('what passes', () => {
  it('accepts warmth that closes and stays about the work', () => {
    expect(ok('Three thousand words on the Torus chapter, done.').ok).toBe(true);
    expect(ok('The chapter you set out to finish is finished.').ok).toBe(true);
    expect(ok('Said and recorded.', 'declared').ok).toBe(true);
    expect(ok('Set aside.', 'set_aside').ok).toBe(true);
  });

  it('accepts a figure on completion — counted, not clocked (D-003)', () => {
    expect(ok('2,140 words became 3,000.').ok).toBe(true);
  });
});

describe('F-B · a response must close, not open', () => {
  it('refuses any question at all', () => {
    /* The simplest and strictest rule: a question recruits another turn the
       writer did not open. */
    expect(refusalOf('That chapter is done. What would you like to write next?')).toBe('asks_a_question');
    expect(refusalOf('Finished. How does that feel?')).toBe('asks_a_question');
  });

  it('refuses the seed of another obligation, however generous it sounds', () => {
    /* "What's next" is the trap named in FR-16: it converts completion into a
       treadmill and makes the reward for finishing a prompt to start again. */
    expect(refusalOf('The chapter is done. On to the next one.')).toBe('opens_the_next_thing');
    expect(refusalOf('Finished — keep going.')).toBe('opens_the_next_thing');
    expect(refusalOf('Done. Keep the momentum.')).toBe('opens_the_next_thing');
    expect(refusalOf('Now that this is done, another goal awaits.')).toBe('opens_the_next_thing');
  });
});

describe('the moment must stay the writer’s', () => {
  it('refuses praise aimed at the person', () => {
    /* "I did this, with MAIA nearby" — not "MAIA congratulated me, therefore
       this became a MAIA moment." */
    expect(refusalOf("You're doing so well.")).toBe('praises_the_person');
    expect(refusalOf('You are amazing.')).toBe('praises_the_person');
    expect(refusalOf('Proud of you.')).toBe('praises_the_person');
  });

  it('refuses narrating the writer’s interior', () => {
    expect(refusalOf('You must feel relieved.')).toBe('speaks_for_the_writer');
    expect(refusalOf('I can tell this mattered.')).toBe('speaks_for_the_writer');
  });

  it('refuses comparison, including to an earlier self', () => {
    expect(refusalOf('More than last time.')).toBe('compares');
    expect(refusalOf('Faster than before.')).toBe('compares');
  });
});

describe('FR-10 survives every grant level', () => {
  it('refuses the clock in any form', () => {
    expect(refusalOf('Finished, and with days to spare.')).toBe('invokes_the_clock');
    expect(refusalOf('Done today.')).toBe('invokes_the_clock');
    expect(refusalOf('You are ahead.')).toBe('invokes_the_clock');
    expect(refusalOf('That is a good pace.')).toBe('invokes_the_clock');
  });
});

describe('F-C · release means release', () => {
  it('refuses progress as leverage, even when the figure is true', () => {
    /* TRUTHFUL INFORMATION IS NOT NEUTRAL MERELY BECAUSE IT IS TRUE. At this
       moment a number has one function: to make the choice harder. */
    expect(refusalOf('Set aside, at 2,140 of 3,000.', 'set_aside')).toBe('leverages_progress');
    expect(refusalOf('You were so close.', 'set_aside')).toBe('leverages_progress');
    expect(refusalOf('Released — all that progress stands.', 'released')).toBe('leverages_progress');
  });

  it('refuses holding the goal open, which is an invitation back', () => {
    expect(refusalOf('Set aside. It will be here when you are ready.', 'set_aside'))
      .toBe('leverages_progress');
  });

  it('the same figure is fine on completion and refused on release', () => {
    /* The clearest statement of the placement rule: identical words, different
       moment, opposite meaning. */
    expect(ok('2,140 words became 3,000.', 'met').ok).toBe(true);
    expect(refusalOf('2,140 words became 3,000.', 'released')).toBe('leverages_progress');
  });
});

describe('F-C · declaration belongs to the writer first', () => {
  it('refuses approving of the goal', () => {
    /* Approval is a small act of co-authorship, and it is why declaration is
       the point most vulnerable to feeling like performing for MAIA. */
    expect(refusalOf('That is a great goal.', 'declared')).toBe('evaluates_the_goal');
    expect(refusalOf('Ambitious, and achievable.', 'declared')).toBe('evaluates_the_goal');
    expect(refusalOf('You can do this.', 'declared')).toBe('evaluates_the_goal');
  });

  it('refuses the CLASS of approval, not a list of phrases', () => {
    /* REGRESSION. The first list named "great goal" and "excellent" and let
       "That is a wonderful goal." through — found by exercising the checker
       against hand-written candidates rather than by any test. Enumerating the
       ways to approve of something is a losing game; there is always another
       adjective. */
    for (const leak of [
      'That is a wonderful goal.', 'A fine goal.', 'Bold.', 'What a brilliant aim.',
      'Nice one.', 'An inspiring thing to set yourself.',
    ]) {
      expect(refusalOf(leak, 'declared')).toBe('evaluates_the_goal');
    }
  });

  it('allows the same plain acknowledgement it would allow anywhere', () => {
    expect(ok('Recorded, in your words.', 'declared').ok).toBe(true);
  });
});

describe('bounds and shape', () => {
  it('refuses empty and refuses an essay', () => {
    expect(refusalOf('   ')).toBe('empty');
    expect(refusalOf('a'.repeat(MAX_ENCOURAGEMENT_CHARS + 1))).toBe('too_long');
  });

  it('answers only the three Phase 1 acts', () => {
    expect(isEncourageable('declared')).toBe(true);
    expect(isEncourageable('met')).toBe(true);
    expect(isEncourageable('released')).toBe(true);
    /* Phase 2 and Phase 3 are not begun by this module. */
    expect(isEncourageable('asked')).toBe(false);
  });
});

describe('what the module is structurally incapable of', () => {
  const src = readFileSync(join(process.cwd(), 'lib', 'writersStudio', 'goalEncouragement.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

  it('sends no manuscript — a support grant is not a reading grant', () => {
    for (const banned of ['recovered', 'draftExcerpt', 'manuscriptText', 'sections', 'body']) {
      expect(src).not.toMatch(new RegExp(`\\b${banned}\\b`));
    }
  });

  it('keeps no history, count or cadence', () => {
    for (const banned of ['lastSupported', 'count', 'history', 'previous', 'streak', 'cadence']) {
      expect(src).not.toMatch(new RegExp(`\\b${banned}\\b`, 'i'));
    }
  });

  it('treats a refusal as silence, never as an error to surface or retry', () => {
    expect(src).not.toMatch(/\bthrow\b|\bretry\b|catch\s*\(/);
    expect(src).toContain('return null');
  });
});
