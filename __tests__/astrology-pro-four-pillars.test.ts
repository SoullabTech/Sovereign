/**
 * ASTRO-PRO-FOUR-PILLARS-01 — Four Pillars against documented calendar facts:
 *   - 1 October 1949 is a jia-zi (甲子) day; 1 January 2000 is a wu-wu (戊午) day;
 *   - Lichun 2024 fell at 16:27 Beijing time on 4 February (08:27 UTC), and
 *     Jingzhe 2024 at 10:23 Beijing time on 5 March (02:23 UTC) — Hong Kong
 *     Observatory solar-term tables.
 * Times below are UTC with a UTC local clock, so the local date and the
 * instant agree.
 */
import {
  calculateFourPillars, cycleIndex, dayCycleIndex, lichun, tenGod,
} from '../lib/astrology/proFourPillars';

const at = (iso: string) => {
  const instant = new Date(iso);
  return calculateFourPillars(instant, iso.slice(0, 10), iso.slice(11, 16));
};
const name = (p: { stem: { hanzi: string }; branch: { hanzi: string } }) => p.stem.hanzi + p.branch.hanzi;

describe('Four Pillars', () => {
  it('counts days on the documented 60-day cycle', () => {
    expect(dayCycleIndex(1949, 10, 1)).toBe(0); // 甲子
    expect(dayCycleIndex(2000, 1, 1)).toBe(54); // 戊午
    expect(cycleIndex(4, 6)).toBe(54);
  });

  it('finds the solar terms at their published times', () => {
    expect(Math.abs(lichun(2024).getTime() - Date.parse('2024-02-04T08:27:00Z'))).toBeLessThan(5 * 60_000);
    // A birth just before and just after Jingzhe changes the month pillar.
    expect(name(at('2024-03-05T02:10:00Z').pillars[1])).toBe('丙寅');
    expect(name(at('2024-03-05T02:40:00Z').pillars[1])).toBe('丁卯');
  });

  it('turns the year at Lichun, not on 1 January or at Chinese New Year', () => {
    expect(name(at('2024-02-04T08:00:00Z').pillars[0])).toBe('癸卯');
    expect(name(at('2024-02-04T09:00:00Z').pillars[0])).toBe('甲辰');
    expect(name(at('2024-01-20T12:00:00Z').pillars[0])).toBe('癸卯');
  });

  it('gives the hour its branch and its stem by the Five Rats rule', () => {
    const chart = at('1949-10-01T08:00:00Z'); // a jia day
    expect(name(chart.pillars[2])).toBe('甲子');
    expect(name(chart.pillars[3])).toBe('戊辰');
    expect(name(at('1949-10-01T00:30:00Z').pillars[3])).toBe('甲子');
  });

  it('keeps the day at midnight unless the astrologer starts it at the Zi hour', () => {
    const instant = new Date('1949-09-30T23:30:00Z');
    const midnight = calculateFourPillars(instant, '1949-09-30', '23:30', 'midnight');
    const zi = calculateFourPillars(instant, '1949-09-30', '23:30', 'zi-hour');
    expect(name(midnight.pillars[2])).toBe('癸亥');
    expect(name(zi.pillars[2])).toBe('甲子');
    expect(name(midnight.pillars[3])).toBe('甲子'); // the late Zi hour takes the next day's stem
    expect(name(zi.pillars[3])).toBe('甲子');
  });

  it('names the Ten Gods relative to the Day Master', () => {
    const jia = 0;
    expect(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].map((_, s) => tenGod(jia, s).hanzi))
      .toEqual(['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印']);
    expect(at('1949-10-01T08:00:00Z').pillars[2].stem.tenGod).toBeNull();
  });

  it('runs the luck pillars on from the month pillar, in both directions', () => {
    const chart = at('1990-06-15T18:30:00Z');
    const month = chart.pillars[1];
    const monthIndex = cycleIndex(month.stem.index, month.branch.index);
    const first = (d: 'forward' | 'backward') => chart.luck[d].pillars[0];
    expect(cycleIndex(first('forward').stem.index, first('forward').branch.index)).toBe((monthIndex + 1) % 60);
    expect(cycleIndex(first('backward').stem.index, first('backward').branch.index)).toBe((monthIndex + 59) % 60);
    // The two start ages together span one solar month: about 29.5 to 31.5 days, so 9.8 to 10.5 years.
    const years = (d: 'forward' | 'backward') => chart.luck[d].startAge.years + chart.luck[d].startAge.months / 12;
    expect(years('forward') + years('backward')).toBeGreaterThan(9.7);
    expect(years('forward') + years('backward')).toBeLessThan(10.6);
    expect(chart.luck.forward.pillars).toHaveLength(8);
    expect(chart.luck.forward.pillars[1].fromAge - chart.luck.forward.pillars[0].fromAge).toBeCloseTo(10);
  });

  it('counts the eight characters by element', () => {
    const { elements } = at('1990-06-15T18:30:00Z');
    expect(Object.values(elements).reduce((a, b) => a + b, 0)).toBe(8);
  });
});
