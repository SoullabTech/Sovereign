/**
 * Progressions and solar arcs as facts for MAIA, from a made-up chart.
 */
import { calculateBirthChart } from '../lib/astrology/proEphemerisCalculator';
import { progressedFacts, progressedMoment, progressionsOverPeriod } from '../lib/astrology/proProgressionFacts';

const birth = { date: '1990-06-15', time: '14:30', location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry' as const };
const birthUtc = new Date('1990-06-15T18:30:00Z');
const place = { lat: 40.7128, lng: -74.006 };

describe('progression facts', () => {
  it('moves about a degree a year: a solar arc near 36° at 36 years', async () => {
    const natal = await calculateBirthChart(birth);
    const m = await progressedMoment(natal, birthUtc, new Date('2026-06-15T12:00:00Z'), place, 'porphyry');
    expect(m.arc).toBeGreaterThan(33);
    expect(m.arc).toBeLessThan(38);
    expect(m.arcToNatal.every((c) => c.inner !== `solar arc ${c.outer}`)).toBe(true);
    const facts = progressedFacts(m);
    expect(facts).toContain('Secondary progressions for 2026-06-15');
    expect(facts).toContain(`Solar arc ${m.arc.toFixed(1)}°`);
  });

  it('lists contacts over a period once each, in order, within the window', async () => {
    const natal = await calculateBirthChart(birth);
    const text = await progressionsOverPeriod(natal, birthUtc, new Date('2023-01-01T12:00:00Z'), new Date('2026-01-01T12:00:00Z'), place, 'porphyry');
    expect(text).toContain('from 2023-01 to 2026-01');
    const months = [...text.matchAll(/closest about (\d{4}-\d{2})/g)].map((m) => m[1]);
    expect(months).toEqual([...months].sort());
    expect(months.every((m) => m >= '2023-01' && m <= '2026-01')).toBe(true);
    const contacts = [...text.matchAll(/(?:; |: )((?:progressed|solar arc) [^:;]+?): closest/g)].map((m) => m[1]);
    expect(new Set(contacts).size).toBe(contacts.length);
  }, 30_000);
});
