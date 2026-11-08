/**
 * MAIA is told the chart's named patterns (facts only): an outside analysis
 * of a client chart turned on two Yods that MAIA was never told about.
 */
import type { BirthChart } from '../lib/astrology/proEphemerisCalculator';
import { chartFacts, chartPatterns } from '../lib/astrology/proAskMaiaSections';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const at = (lon: number, house: number) => ({ sign: SIGNS[Math.floor(lon / 30)], degree: lon % 30, house, retrograde: false });

/** A made-up chart: Sun 20° Leo and Saturn 20° Gemini in sextile, both quincunx Neptune 20° Capricorn. */
const chart = {
  sun: at(140, 11), moon: at(200, 1), saturn: at(80, 9), neptune: at(290, 4),
  ascendant: { sign: 'Libra', degree: 5 }, midheaven: { sign: 'Cancer', degree: 5 },
  houses: Array.from({ length: 12 }, (_, i) => (185 + i * 30) % 360),
  aspects: [
    { planet1: 'Sun', planet2: 'Saturn', type: 'sextile', orb: 0, exact: true },
    { planet1: 'Sun', planet2: 'Neptune', type: 'quincunx', orb: 0, exact: true },
    { planet1: 'Saturn', planet2: 'Neptune', type: 'quincunx', orb: 0, exact: true },
  ],
} as unknown as BirthChart;

describe('chart patterns for MAIA', () => {
  it('names a Yod with its focal planet, and no interpretation text', () => {
    const patterns = chartPatterns(chart);
    expect(patterns).toContainEqual(expect.stringMatching(/^Yod: .*Neptune.*Saturn.*Sun.*, focal Neptune$|^Yod: Neptune, Saturn, Sun, focal Neptune$/));
    expect(patterns.join(' ')).not.toMatch(/finger of god|destiny|fate/i);
  });

  it('includes the patterns in the facts MAIA reads', () => {
    expect(chartFacts(chart, 'Natal chart')).toContain('Patterns: Yod');
  });

  it('names none when there are none', () => {
    expect(chartPatterns({ ...chart, aspects: [] } as BirthChart)).toEqual([]);
  });
});
