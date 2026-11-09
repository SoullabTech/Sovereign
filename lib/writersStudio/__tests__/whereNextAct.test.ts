import { passageActInstruction, passageActQuestion } from '../passageActs';

/**
 * WS-CRAFT-CONVENTIONS-01 · G-5 (founder: "yes" to option (a) with fallback, 2026-11-09).
 * "Ask MAIA where next" must not become an unstated ranking: the choice rests on the writer's own
 * focus, in manuscript order, with no implied importance; with no focus, MAIA asks.
 * ⛔ Proves the instruction is sent, not that MAIA follows it (that is the witness).
 */
const RULED_FIRST_LINE =
  'Which one or two exact passages could I look at next, given what I have been working on in this conversation? Name them in the order they appear in my manuscript, say in a sentence how each relates to what I have been working on, and do not say or imply that either matters more. If nothing in this conversation tells you what I am working on, ask me instead of choosing.';

describe('Ask MAIA where next', () => {
  const text = passageActInstruction('where-next');

  it('carries the ruled first line, word for word', () => {
    expect(text).toContain(RULED_FIRST_LINE);
  });

  it('keeps the two unchanged lines', () => {
    expect(text).toContain('Use only the text already authorized in this conversation. If that is insufficient, ask me to choose.');
    expect(text).toContain('Do not move focus or propose a revision.');
  });

  it('the writer\'s own words are unchanged', () => {
    expect(passageActQuestion('where-next')).toBe('Which passage should I work on next?');
  });

  it('defeat candidate: the old unanchored line is gone', () => {
    expect(text).not.toContain('Which one or two exact passages should I consider next?');
  });

  it('names no ranking basis', () => {
    expect(text).not.toMatch(/\b(most important|priority|biggest|weakest|strongest|best)\b/i);
  });
});
