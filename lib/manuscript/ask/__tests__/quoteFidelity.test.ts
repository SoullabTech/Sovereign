import { checkQuoteFidelity, quotedSpans, QUOTE_FLOOR } from '../quoteFidelity';

const page = 'The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke.';
describe('A2 · quote fidelity', () => {
  it('passes a faithful quote, ignoring case, curly quotes and spacing', () => {
    expect(checkQuoteFidelity('She writes “the salt on the  rails caught the first LIGHT” well.', [page]).ok).toBe(true);
  });
  it('fails an invented quote', () => {
    const r = checkQuoteFidelity('You wrote "the tide retreated like a held breath at dawn".', [page]);
    expect(r.ok).toBe(false); expect(r.ungrounded).toHaveLength(1);
  });
  it('fails a near-miss (one word changed)', () => {
    expect(checkQuoteFidelity('"the salt on the rails caught the final light before anyone spoke"', [page]).ok).toBe(false);
  });
  it('short quoted terms are below the floor and ignored', () => {
    expect('harbour'.length).toBeLessThan(QUOTE_FLOOR);
    expect(checkQuoteFidelity('The word "harbour" recurs.', [page]).ok).toBe(true);
  });
  it('quotes from the conversation itself are grounded (writer or MAIA earlier words)', () => {
    expect(checkQuoteFidelity('Earlier you said "I keep returning to the sea in every chapter".',
      ['I keep returning to the sea in every chapter']).ok).toBe(true);
  });
  it('an ellipsis splits a quote into fragments, each of which must be grounded', () => {
    expect(checkQuoteFidelity('"The harbour woke slowly ... before anyone spoke"', [page]).ok).toBe(true);
    expect(checkQuoteFidelity('"The harbour woke slowly ... and then nothing remained at all"', [page]).ok).toBe(false);
  });
  it('with no sources at all, any long quote is ungrounded', () => {
    expect(checkQuoteFidelity('"the salt on the rails caught the first light"', []).ok).toBe(false);
  });
  it('extracts straight and curly spans', () => {
    expect(quotedSpans('a "one" b “two” c')).toEqual(['one', 'two']);
  });
});

describe('A2 · hardening after independent review', () => {
  it('checks guillemet and block-quote spans', () => {
    expect(checkQuoteFidelity('«the tide retreated like a held breath at dawn»', ['x']).ok).toBe(false);
    expect(checkQuoteFidelity('> the tide retreated like a held breath at dawn\n', ['x']).ok).toBe(false);
  });
  it('normalises fullwidth/zero-width characters and markdown emphasis in sources', () => {
    expect(checkQuoteFidelity('"the salt on the rails caught the first light"',
      ['the **salt** on the rails caught the first\u200B light']).ok).toBe(true);
  });
});
