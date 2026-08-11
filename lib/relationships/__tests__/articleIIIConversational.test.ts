/**
 * Article III conversational enforcement — the unit's test matrix.
 *
 * Deliberately independent of the LLM: these assert the guardrail's behavior on
 * fixed strings, so the boundary is verifiable without a model in the loop.
 */
import { enforceArticleIIIConversational as enforce } from '../articleIIIConversational';

describe('T4 — DIRECT REPORTED FACT survives (the most important case)', () => {
  // A guardrail that weakens, hedges, or strips supplied coercive content
  // because it concerns another person is WORSE THAN NO GUARDRAIL.
  const member =
    'He told me he would take the kids if I left. He goes through my phone most nights.';

  it.each([
    'He told you he would take the kids if you left.',
    'He said he would make sure you left with nothing.',
    'He goes through your phone most nights.',
    'He showed up outside your building at eleven at night.',
    'That is a threat, and it is worth taking seriously.',
    'What you are describing is coercive control.',
    'He moved you off the project after you reported it to HR.',
  ])('preserves verbatim: %s', (reply) => {
    const r = enforce(reply, member);
    expect(r.text).toBe(reply);
    expect(r.fired).toBe(false);
  });

  it('does not weaken a disclosure embedded in a longer reply', () => {
    const reply =
      'You are not overreacting. He told you he would make sure you left with nothing. That is a threat.';
    const r = enforce(reply, member);
    expect(r.text).toBe(reply);
  });
});

describe('T1 — member interpretation must not become fact about another', () => {
  const member = 'We had the same fight again. She says I do not notice things. I say she keeps score.';

  it('marks the verified failure sentence', () => {
    const r = enforce('She probably does keep a running tally.', member);
    expect(r.fired).toBe(true);
    expect(r.text).toBe('I wonder whether she does keep a running tally.');
    expect(r.text).not.toMatch(/probably/);
  });

  it('leaves an already member-owned formulation alone', () => {
    const owned = 'You experience her as keeping a running tally.';
    expect(enforce(owned, member).text).toBe(owned);
  });
});

describe('T2 — inferred motive must not be invented', () => {
  const member = 'She has been quiet since Tuesday and has not answered my texts.';

  it('drops a question presupposing her fear', () => {
    const r = enforce('What do you think she is actually afraid is not getting through to you?', member);
    expect(r.fired).toBe(true);
    expect(r.text).not.toMatch(/afraid/);
  });

  it('marks an asserted motive', () => {
    const r = enforce('She is resentful about how it ended.', member);
    expect(r.text).toBe('I wonder whether she is resentful about how it ended.');
  });

  it('catches possessive interiority', () => {
    const r = enforce('Her need to control the plan is what is driving this.', member);
    expect(r.fired).toBe(true);
    expect(r.text).toMatch(/^I wonder whether/);
  });
});

describe('T3 — contextual fact preserved, personal characterization caught', () => {
  const member = 'He controls my performance review.';

  it('keeps the concrete power relation', () => {
    const ok = 'He holds formal power over your performance review.';
    expect(enforce(ok, member).text).toBe(ok);
  });

  it('catches the identity slide', () => {
    const r = enforce('Your boss is the powerful one here.', member);
    expect(r.fired).toBe(true);
    expect(r.text).toMatch(/^I wonder whether/);
  });
});

describe('T5 — hedged member reading keeps uncertainty AND ownership', () => {
  const member = 'Maybe I am imagining it, but I feel like she is punishing me.';
  it('preserves the reflection as the member\'s', () => {
    const ok = 'You wonder whether she is punishing you, and you are not sure.';
    expect(enforce(ok, member).text).toBe(ok);
  });
});

describe('T6 — fabricated circumstance', () => {
  const member = 'She slammed the door and said I am controlling.';

  it('drops an invented clock time', () => {
    const r = enforce('Someone who only wanted control would not be sitting with that question at 2 in the morning.', member);
    expect(r.fired).toBe(true);
    expect(r.text).not.toMatch(/2 in the morning/);
  });

  it('drops an invented audience', () => {
    const r = enforce('Being skipped in a room full of people lands hard.', member);
    expect(r.text).not.toMatch(/room full of people/);
  });

  it('keeps circumstance the member actually supplied', () => {
    const supplied = 'He showed up outside your building at eleven at night.';
    const m = 'He turned up outside my building around eleven at night.';
    expect(enforce(supplied, m).text).toBe(supplied);
  });
});

describe('T7 — benign relational work is not distorted', () => {
  const member = 'We had the same fight about the dishes again. Third time this month.';
  const reply =
    'That loop sounds exhausting. You know the fight keeps returning. What happened in you when it started again?';
  it('passes ordinary conversation through untouched', () => {
    const r = enforce(reply, member);
    expect(r.text).toBe(reply);
    expect(r.fired).toBe(false);
  });
});

describe('T8 — explicitly marked hypotheses are permitted', () => {
  const member = 'He has not replied in three days.';
  it.each([
    'I wonder whether he is avoiding the conversation.',
    'It is possible that he wants distance right now.',
    'Could it be that he feels cornered?',
  ])('keeps: %s', (reply) => {
    expect(enforce(reply, member).text).toBe(reply);
  });
});

describe('guardrail invents nothing and never returns silence', () => {
  it('adds no words beyond the fixed marker', () => {
    const r = enforce('She is jealous of your sister.', 'My sister came to visit.');
    expect(r.text).toBe('I wonder whether she is jealous of your sister.');
  });

  it('returns the original rather than an empty reply', () => {
    const only = 'What is she afraid of?';
    const r = enforce(only, 'She went quiet.');
    expect(r.text.length).toBeGreaterThan(0);
  });
});
