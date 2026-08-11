/**
 * Return selection guard (J-6A).
 *
 * What this proves: every returned entry is chosen by a calendar rule the
 * member could check themselves, and the account given for the choice names
 * real dates. What it deliberately also proves is a NEGATIVE — that nothing in
 * this path reads, scores, or ranks the CONTENT of an entry. The last test
 * swaps every entry's text for noise and asserts the same entry comes back.
 * If someone later adds relevance scoring here, that test fails.
 */
import { pickReturn, passageOf, type ReturnableEntry } from '../return';

const NOW = new Date(2026, 7, 10, 9, 0, 0); // 10 August 2026

function entry(id: string, date: Date, content = `words of ${id}`): ReturnableEntry {
  return { id, content, createdAt: date.toISOString() };
}

/** Enough recent entries that the corpus guard is satisfied. */
const filler = [
  entry('recent-1', new Date(2026, 7, 9)),
  entry('recent-2', new Date(2026, 7, 7)),
];

describe('a journal with no past', () => {
  it('returns nothing rather than reaching for something', () => {
    expect(pickReturn([entry('a', new Date(2026, 7, 9))], NOW)).toBeNull();
    expect(pickReturn([], NOW)).toBeNull();
  });

  it('returns nothing when the only older writing is days old', () => {
    const young = [...filler, entry('b', new Date(2026, 7, 4))];
    expect(pickReturn(young, NOW)).toBeNull();
  });
});

describe('the same calendar day, an earlier year', () => {
  const anniversary = entry('year-ago', new Date(2025, 7, 10));
  const picked = pickReturn([...filler, anniversary, entry('old', new Date(2024, 2, 3))], NOW);

  it('wins over every other rule', () => {
    expect(picked?.entry.id).toBe('year-ago');
  });

  it('says so plainly', () => {
    expect(picked?.why).toBe('Written one year ago today');
  });

  it('counts years rather than assuming one', () => {
    const older = pickReturn([...filler, entry('three', new Date(2023, 7, 10))], NOW);
    expect(older?.why).toBe('Written 3 years ago today');
  });

  it('accounts for itself with real dates and no claim about meaning', () => {
    expect(picked?.account).toContain('August 10, 2025');
    expect(picked?.account).toContain('August 10, 2026');
    expect(picked?.account).toContain('Nothing about the content was measured');
  });
});

describe('the same week, an earlier year', () => {
  it('is used when the exact day has nothing', () => {
    const picked = pickReturn([...filler, entry('near', new Date(2025, 7, 12))], NOW);
    expect(picked?.entry.id).toBe('near');
    expect(picked?.why).toBe('Written a year ago this week');
  });

  it('does not stretch past three days', () => {
    const picked = pickReturn([...filler, entry('far', new Date(2025, 7, 20))], NOW);
    expect(picked?.why).toBe('Written last August');
  });
});

describe('falling back through the calendar', () => {
  it('reaches for the same month in an earlier year', () => {
    const picked = pickReturn([...filler, entry('aug', new Date(2024, 7, 28))], NOW);
    expect(picked?.entry.id).toBe('aug');
    expect(picked?.why).toBe('Written in August 2024');
  });

  it('then for the earliest entry still inside this month', () => {
    const picked = pickReturn([...filler, entry('early', new Date(2026, 7, 1))], NOW);
    expect(picked?.entry.id).toBe('early');
    expect(picked?.why).toBe('Written earlier this month');
  });

  it('then for the beginning of the journal', () => {
    const picked = pickReturn([...filler, entry('first', new Date(2026, 1, 2))], NOW);
    expect(picked?.entry.id).toBe('first');
    expect(picked?.why).toBe('Your earliest entry still here');
  });
});

describe('what Return is not', () => {
  const corpus = [
    ...filler,
    entry('year-ago', new Date(2025, 7, 10), 'I was not sure whether I wanted to stay.'),
    entry('loud', new Date(2024, 7, 10), 'GRIEF BELONGING MEANING PURPOSE IDENTITY'),
  ];

  it('never claims a strategy it has not implemented', () => {
    expect(pickReturn(corpus, NOW)?.strategy).toBe('temporal');
  });

  it('ignores the content entirely — same dates, same choice', () => {
    const scrambled = corpus.map((e) => ({ ...e, content: 'zzz '.repeat(20) }));
    expect(pickReturn(scrambled, NOW)?.entry.id).toBe(pickReturn(corpus, NOW)?.entry.id);
  });

  it('is stable — the same journal on the same day returns the same entry', () => {
    expect(pickReturn(corpus, NOW)?.entry.id).toBe(pickReturn(corpus, NOW)?.entry.id);
    expect(pickReturn([...corpus].reverse(), NOW)?.entry.id).toBe(
      pickReturn(corpus, NOW)?.entry.id,
    );
  });
});

describe('the passage shown', () => {
  it('is the member’s own words, cut at a sentence where it can be', () => {
    const text = 'I kept thinking I needed an answer. What I wanted was permission not to know yet.';
    expect(passageOf(text, 40)).toBe('I kept thinking I needed an answer.');
  });

  it('never exceeds the length it was given', () => {
    expect(passageOf('a'.repeat(500), 100).length).toBeLessThanOrEqual(101);
  });

  it('leaves short writing exactly as written', () => {
    expect(passageOf('Bought plums.')).toBe('Bought plums.');
  });
});
