/**
 * Transit report parser — DATA-only extraction + Design Law validation.
 *
 * The two constitutional properties under test:
 *  1. Copyright boundary: interpretive prose is never extracted — only transit
 *     facts (bodies, aspects, natal points, dates, house ingresses) survive.
 *  2. No manufactured transits: a Year Ahead phase can only cite a transit that
 *     exists in the parsed data (validateCitedTransits throws otherwise).
 */

import {
  describeTransit,
  deriveTimeframe,
  parseTransitReport,
  transitDataText,
} from '../transitReportParser';
import { validateCitedTransits } from '../generateYearAhead';
import type { YearAheadPhase } from '@/lib/soulPortrait/schema';

// Synthetic report in the Astrograph shape. The prose lines are stand-ins for
// the copyrighted interpretation and MUST never appear in parser output.
const REPORT = `
Transiting Pluto in opposition with natal Jupiter
March 4, 2026 until January 10, 2027
This transit is exact on April 2, 2026, again (R) September 8, 2026, and again on February 1, 2027

INTERPRETIVE-PROSE-SENTINEL: a profound transformation of your guiding philosophy is at hand.
More sentinel prose that must be discarded unread, mentioning May 5, 2026 in passing.

Transiting Jupiter enters your Twelfth House
June 14, 2026

Sentinel prose about the twelfth house and the mystical inward turn of the year.

Transiting Saturn in trine with your Sun
August 1, 2026 until October 20, 2026
exact September 3, 2026

Transiting Neptune in square with natal Mercury
`;

describe('parseTransitReport', () => {
  const { transits, warnings } = parseTransitReport(REPORT);

  it('extracts every transit header (aspects + house ingresses)', () => {
    expect(transits).toHaveLength(4);
    expect(transits[0]).toMatchObject({
      id: 1,
      kind: 'aspect',
      body: 'Pluto',
      aspect: 'opposition',
      natalPoint: 'Jupiter',
      beginDate: 'March 4, 2026',
      endDate: 'January 10, 2027',
    });
    expect(transits[1]).toMatchObject({ id: 2, kind: 'ingress', body: 'Jupiter', house: 12, beginDate: 'June 14, 2026' });
    expect(transits[2]).toMatchObject({ id: 3, kind: 'aspect', body: 'Saturn', aspect: 'trine', natalPoint: 'Sun' });
  });

  it('captures exact dates including retrograde passes', () => {
    expect(transits[0].exactDates).toEqual([
      { date: 'April 2, 2026', retrograde: false },
      { date: 'September 8, 2026', retrograde: true },
      { date: 'February 1, 2027', retrograde: false },
    ]);
    expect(transits[2].exactDates).toEqual([{ date: 'September 3, 2026', retrograde: false }]);
  });

  it('warns on a header with no dates instead of failing', () => {
    expect(transits[3]).toMatchObject({ body: 'Neptune', aspect: 'square', natalPoint: 'Mercury' });
    expect(warnings.some((w) => w.includes('Neptune'))).toBe(true);
  });

  it('COPYRIGHT BOUNDARY: no interpretive prose survives into any output', () => {
    const everything = JSON.stringify({ transits, warnings }) + transitDataText(transits);
    expect(everything).not.toMatch(/SENTINEL|profound|philosophy|mystical|discarded/i);
    // An in-prose date never attaches to a transit (collection closes at first prose line).
    expect(everything).not.toContain('May 5, 2026');
  });

  it('returns zero transits for pure prose (generator then refuses)', () => {
    const r = parseTransitReport('A lovely year awaits, full of growth on March 3, 2026 and beyond.');
    expect(r.transits).toHaveLength(0);
  });

  it('derives the year timeframe from the parsed dates', () => {
    expect(deriveTimeframe(transits)).toBe('March 2026 – February 2027');
  });
});

describe('describeTransit (deterministic phase transit strings)', () => {
  it('renders the established portrait phrasing', () => {
    const { transits } = parseTransitReport(REPORT);
    expect(describeTransit(transits[0])).toBe('Pluto opposite your Jupiter');
    expect(describeTransit(transits[1])).toBe('Jupiter entering your Twelfth House');
    expect(describeTransit(transits[2])).toBe('Saturn in trine with your Sun');
  });

  it('renders a return when a body conjoins its own natal place', () => {
    const { transits } = parseTransitReport(
      'Transiting Jupiter in conjunction with natal Jupiter\nMay 1, 2026 until June 1, 2026',
    );
    expect(describeTransit(transits[0])).toBe('Jupiter returning to your Jupiter');
  });
});

describe('parser completeness (plausible-tier gaps: G1/G2/G3/D1)', () => {
  it('G1: recognizes sesquiquadrate headers (incl. alias spellings)', () => {
    const { transits } = parseTransitReport(
      'Transiting Mars in sesquiquadrate with natal Sun\nMarch 4, 2026 until May 10, 2026\n' +
        'Transiting Venus in sesqui-square with natal Moon\nexact April 2, 2026',
    );
    expect(transits).toHaveLength(2);
    expect(transits[0]).toMatchObject({ body: 'Mars', aspect: 'sesquiquadrate', natalPoint: 'Sun' });
    expect(transits[1]).toMatchObject({ body: 'Venus', aspect: 'sesquiquadrate', natalPoint: 'Moon' });
    expect(describeTransit(transits[0])).toBe('Mars in sesquiquadrate with your Sun');
  });

  it('G2: tolerates a trailing colon on an aspect header', () => {
    const { transits } = parseTransitReport(
      'Transiting Mercury in trine with natal Jupiter:\nJune 1, 2026 until July 4, 2026',
    );
    expect(transits).toHaveLength(1);
    expect(transits[0]).toMatchObject({
      body: 'Mercury',
      aspect: 'trine',
      natalPoint: 'Jupiter',
      beginDate: 'June 1, 2026',
      endDate: 'July 4, 2026',
    });
  });

  it('G3: tolerates a parenthesized date range inline on the header, and attaches it', () => {
    const { transits, warnings } = parseTransitReport(
      'Transiting Pluto in opposition with natal Jupiter (May 1, 2026 - December 3, 2026)',
    );
    expect(transits).toHaveLength(1);
    expect(transits[0]).toMatchObject({
      body: 'Pluto',
      aspect: 'opposition',
      natalPoint: 'Jupiter',
      beginDate: 'May 1, 2026',
      endDate: 'December 3, 2026',
    });
    expect(warnings).toHaveLength(0);
  });

  it('D1: exact-date lines with abbreviated month names attach', () => {
    const { transits } = parseTransitReport(
      'Transiting Saturn in square with natal Moon\n' +
        'This transit is exact on Apr 2, 2026, again (R) Sept. 8, 2026',
    );
    expect(transits[0].exactDates).toEqual([
      { date: 'Apr 2, 2026', retrograde: false },
      { date: 'Sept. 8, 2026', retrograde: true },
    ]);
  });

  it('NEGATIVE SENTINEL: the widened anchor still rejects trailing prose (copyright boundary)', () => {
    const r = parseTransitReport(
      'Transiting Pluto in opposition with natal Jupiter brings a profound reckoning with belief.\n' +
        'Transiting Pluto in opposition with natal Jupiter (a time of profound challenge)\n' +
        'April 2, 2026 until May 3, 2026',
    );
    expect(r.transits).toHaveLength(0);
    expect(JSON.stringify(r)).not.toMatch(/profound|reckoning|challenge/i);
  });
});

describe('validateCitedTransits (Design Law: no manufactured transits)', () => {
  const { transits } = parseTransitReport(REPORT);
  const phase = (cited: string[]): YearAheadPhase => ({
    element: 'earth',
    title: 'T',
    transits: cited,
    body: 'B',
  });

  it('passes when every cited transit exists in the parsed data', () => {
    expect(() =>
      validateCitedTransits([phase(['Pluto opposite your Jupiter', 'Saturn in trine with your Sun'])], transits),
    ).not.toThrow();
  });

  it('throws on a transit that is not in the report', () => {
    expect(() => validateCitedTransits([phase(['Uranus opposite your Moon'])], transits)).toThrow(
      /year_ahead_manufactured_transit/,
    );
  });
});
