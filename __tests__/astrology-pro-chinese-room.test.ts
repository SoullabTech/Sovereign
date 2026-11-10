/**
 * The Pro Chinese room: the full zodiac reading and the ten-year Da Yun cycles,
 * computed on the server with no birth detail in the payload.
 *
 * Facts used (independent of the code under test): 3 Sep 2003 08:15 in
 * New Haven is a Gui-Wei (yin) year, Geng-Shen month (the Sun is before Bailu,
 * which starts the You month), so tradition runs the cycle backward for a man
 * and forward for a woman; the first luck pillar is the month pillar's neighbour:
 * forward Xin-You, backward Ji-Wei. Three days from birth to the neighbouring
 * Jie make one year.
 */
import * as Astronomy from 'astronomy-engine';
import { calculateProOtherSystems } from '@/lib/astrology/proOtherSystems';
import { buildChineseReading } from '@/lib/astrology/chineseReading';
import { rehydrateDaYunProfile } from '@/lib/astrology/daYunProfileView';

const BIRTH = {
  date: '2003-09-03', time: '08:15',
  location: { lat: 41.3083, lng: -72.9279, timezone: 'America/New_York' },
};
const UTC = '2003-09-03T12:15:00.000Z';
const DAY = 86_400_000;

describe('Pro Chinese room data', () => {
  let chinese: any;
  beforeAll(async () => { chinese = (await calculateProOtherSystems(BIRTH, UTC, 'lahiri')).chinese; });

  it('carries the full zodiac reading for the Chinese year, the same as the Free page builds', () => {
    expect(chinese.reading).toEqual(JSON.parse(JSON.stringify(buildChineseReading(2003))));
    expect(chinese.reading.zodiacAnimal.name).toBe('Sheep');
    expect(chinese.reading.holisticProfile).not.toBeNull();
  });

  it('carries Da Yun for both directions, with the first luck pillar as the neighbour of the month pillar', () => {
    expect(chinese.daYun.forward.cycleDirection).toBe('forward');
    expect(chinese.daYun.backward.cycleDirection).toBe('backward');
    expect(chinese.daYun.forward.periods).toHaveLength(10);
    expect(chinese.daYun.forward.periods[0]).toMatchObject({ heavenlyStem: 'Xin', earthlyBranch: 'You' });
    expect(chinese.daYun.backward.periods[0]).toMatchObject({ heavenlyStem: 'Ji', earthlyBranch: 'Wei' });
  });

  it('starts at three days per year from the neighbouring Jie', () => {
    const born = new Date(UTC);
    const next = Astronomy.SearchSunLongitude(165, born, 40)!.date;     // Bailu
    const previous = Astronomy.SearchSunLongitude(135, new Date(born.getTime() - 40 * DAY), 40)!.date; // Liqiu
    const forward = (next.getTime() - born.getTime()) / DAY / 3;
    const backward = (born.getTime() - previous.getTime()) / DAY / 3;
    expect(Math.abs(chinese.daYun.forward.daYunStartAgeExact - forward)).toBeLessThan(1 / 24 + 1e-9);
    expect(Math.abs(chinese.daYun.backward.daYunStartAgeExact - backward)).toBeLessThan(1 / 24 + 1e-9);
  });

  it('holds no birth detail: no date, time, gender, place or zone anywhere in it', () => {
    const text = JSON.stringify({ reading: chinese.reading, daYun: chinese.daYun });
    for (const secret of ['birthDate', 'birthTime', '"gender"', '2003-09-03', '08:15', '12:15', 'America/New_York', '41.3083', '-72.9279']) {
      expect(text).not.toContain(secret);
    }
  });

  it('can be rehydrated after a JSON round trip so the view finds the current period by identity', () => {
    const over = rehydrateDaYunProfile(JSON.parse(JSON.stringify(chinese.daYun.forward)));
    const i = over.periods.findIndex((p) => p.isActive);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(over.currentPeriod).toBe(over.periods[i]);
    expect(over.nextPeriod).toBe(over.periods[i + 1] ?? null);
  });
});
