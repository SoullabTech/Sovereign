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
    // Published to the minute; the engine must land inside that minute's rounding, give or take 30 s.
    expect(Math.abs(lichun(2024).getTime() - Date.parse('2024-02-04T08:27:00Z'))).toBeLessThan(90_000);
    expect(Math.abs(lichun(2000).getTime() - Date.parse('2000-02-04T12:40:00Z'))).toBeLessThan(90_000);
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

  it('uses the local birth date and clock, not the UTC ones', () => {
    // Tokyo, 08:00 on 1 January 2000 is 23:00 on 31 December 1999 in UTC.
    const tokyo = calculateFourPillars(new Date('1999-12-31T23:00:00Z'), '2000-01-01', '08:00');
    expect(name(tokyo.pillars[2])).toBe('戊午'); // 1 January, not 31 December (丁巳)
    expect(name(tokyo.pillars[3])).toBe('丙辰'); // 08:00 local is the Chen hour
    // New York, 03:00 on 4 February 2024 is 08:00 UTC: before Lichun (08:27 UTC).
    const newYork = calculateFourPillars(new Date('2024-02-04T08:00:00Z'), '2024-02-04', '03:00');
    expect(name(newYork.pillars[0])).toBe('癸卯');
    expect(name(newYork.pillars[3]).endsWith('寅')).toBe(true); // 03:00 local is the Yin hour
  });

  it('names all hundred Ten Gods as an independently written table does', () => {
    // Elements: Wood, Fire, Earth, Metal, Water. Each stem pair shares an element, yang first.
    const element = (stem: number) => ['Wood', 'Fire', 'Earth', 'Metal', 'Water'][Math.floor(stem / 2)];
    const produces: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
    const controls: Record<string, string> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };
    const expected = (dm: number, s: number) => {
      const same = dm % 2 === s % 2;
      const [me, it] = [element(dm), element(s)];
      if (me === it) return same ? '比肩' : '劫财';
      if (produces[it] === me) return same ? '偏印' : '正印';
      if (produces[me] === it) return same ? '食神' : '伤官';
      if (controls[me] === it) return same ? '偏财' : '正财';
      if (controls[it] === me) return same ? '七杀' : '正官';
      throw new Error('no relation');
    };
    for (let dm = 0; dm < 10; dm++) {
      for (let s = 0; s < 10; s++) expect([dm, s, tenGod(dm, s).hanzi]).toEqual([dm, s, expected(dm, s)]);
    }
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
