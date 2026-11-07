/** @jest-environment node */
import { checkQuotes, passageFacts, quotedSpans } from '../teachingAccuracy';
import { PASSAGE_A, PASSAGE_B } from '../accuracyPassages';

describe('the fictional passages are what the witness says they are', () => {
  it('A: the third sentence is the longest, and lengths do not fall', () => {
    const f = passageFacts(PASSAGE_A.text);
    expect(f.sentences.map((s) => s.words)).toEqual([4, 5, 28, 4]);
    expect(f.longest).toBe(3);
    expect(f.strictlyFalling).toBe(false);
    expect(PASSAGE_A.text).toContain(PASSAGE_A.marker);
  });

  it('B: the sentences really do get shorter', () => {
    const f = passageFacts(PASSAGE_B.text);
    expect(f.sentences.map((s) => s.words)).toEqual([22, 9, 3, 1]);
    expect(f.strictlyFalling).toBe(true);
    expect(f.longest).toBe(1);
    expect(PASSAGE_B.text).toContain(PASSAGE_B.marker);
  });
});

describe('quote check', () => {
  it('passes a faithful quote, in curly or straight quotes, across case and an ellipsis', () => {
    const reply = 'The phrase “the spring the old fence came down” dates the dog’s habit, and "Lay perfectly still … long grass" holds the image.';
    expect(checkQuotes(reply, PASSAGE_A.text).every((q) => q.faithful)).toBe(true);
    expect(quotedSpans(reply)).toHaveLength(2);
  });

  it('defeat candidate: catches a misquote of the kind the 2c walk saw', () => {
    const reply = 'Look at “the summer the old fence fell down”: it dates the habit.';
    expect(checkQuotes(reply, PASSAGE_A.text)).toEqual([{ quote: 'the summer the old fence fell down', faithful: false }]);
  });

  it('defeat candidate: a quote of the other passage is not faithful to this one', () => {
    expect(checkQuotes('Notice “a whisper on the slate”.', PASSAGE_A.text)[0]!.faithful).toBe(false);
  });

  it('ignores apostrophes, so possessives do not become quotes', () => {
    expect(quotedSpans('Mara’s window and the dog’s stillness')).toEqual([]);
  });

  it('a reply with no quotes yields no checks: vacuous, not evidence of accuracy', () => {
    expect(checkQuotes('The third sentence is the shortest.', PASSAGE_A.text)).toEqual([]);
  });
});
