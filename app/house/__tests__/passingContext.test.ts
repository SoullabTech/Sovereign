import { selectPassingQuote } from '../passingContext';
import { PASSING_QUOTES } from '../passingQuotes';

const now = new Date('2026-09-25T14:00:00Z');
const first = () => ({ ...PASSING_QUOTES[0] });

describe('House Passing through — public, sourced, bounded and non-personal', () => {
  it('offers one reviewed public quotation', () => {
    expect(selectPassingQuote(PASSING_QUOTES, now)?.id).toBe(PASSING_QUOTES[0].id);
  });
  it('is stable within the shared UTC day', () => {
    expect(selectPassingQuote(PASSING_QUOTES, now)).toEqual(selectPassingQuote(PASSING_QUOTES, new Date('2026-09-25T23:59:59Z')));
  });
  it('can change on a later day without a member profile', () => {
    expect(selectPassingQuote(PASSING_QUOTES, new Date('2026-09-26T01:00:00Z'))?.id).not.toBe(PASSING_QUOTES[0].id);
  });
  it('does not invent an item when none exists', () => {
    expect(selectPassingQuote([], now)).toBeNull();
  });
  it('honors an explicitly disabled field', () => {
    expect(selectPassingQuote(PASSING_QUOTES, now, false)).toBeNull();
  });
  it('rejects missing provenance', () => {
    expect(selectPassingQuote([{ ...first(), sourceUrl: '' }], now)).toBeNull();
  });
  it('withholds a quotation after its editorial display window', () => {
    expect(selectPassingQuote(PASSING_QUOTES, new Date('2026-12-25T00:00:00Z'))).toBeNull();
  });
  it('rejects an item before its display window', () => {
    expect(selectPassingQuote([{ ...first(), displayFrom: '2026-09-26' }], now)).toBeNull();
  });
  it('rejects unverified or future-dated verification', () => {
    expect(selectPassingQuote([{ ...first(), verifiedOn: '' }], now)).toBeNull();
    expect(selectPassingQuote([{ ...first(), verifiedOn: '2026-10-01' }], now)).toBeNull();
  });
  it('refuses private or member-specific material at this public-source seam', () => {
    expect(selectPassingQuote([{ ...first(), audience: 'member' }], now)).toBeNull();
    expect(selectPassingQuote([{ ...first(), memberId: 'foreign-member' }], now)).toBeNull();
  });
  it('refuses source protocols and hosts not admitted to this reviewed shelf', () => {
    for (const sourceUrl of ['javascript:alert(1)', 'http://poets.org/poem', 'https://poets.org.evil.test/poem']) {
      expect(selectPassingQuote([{ ...first(), sourceUrl }], now)).toBeNull();
    }
  });
  it('rejects malformed dates and invalid clocks', () => {
    expect(selectPassingQuote([{ ...first(), displayFrom: '2026-02-30' }], now)).toBeNull();
    expect(selectPassingQuote(PASSING_QUOTES, new Date('invalid'))).toBeNull();
  });
  it('refuses ambiguous duplicate source identities', () => {
    expect(selectPassingQuote([first(), { ...first(), text: 'Different words' }], now)).toBeNull();
  });
  it('does not admit other source classes before their own readers exist', () => {
    expect(selectPassingQuote([{ ...first(), kind: 'sky-event' }], now)).toBeNull();
  });
  it('returns a public, content-only object and does not mutate the shelf', () => {
    const before = JSON.stringify(PASSING_QUOTES);
    const selected = selectPassingQuote(PASSING_QUOTES, now);
    expect(selected?.audience).toBe('public');
    expect(JSON.stringify(PASSING_QUOTES)).toBe(before);
  });
});
