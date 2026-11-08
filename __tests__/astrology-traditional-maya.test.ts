/**
 * The traditional Maya count against documented dates (GMT 584283).
 */
import { traditionalMaya } from '../lib/astrology/proTraditionalMaya';

describe('traditional Maya count', () => {
  it('makes 21 December 2012 the end of the 13th b’ak’tun: 13.0.0.0.0, 4 Ajaw 3 K’ank’in', () => {
    const t = traditionalMaya('2012-12-21');
    expect(t.longCount).toBe('13.0.0.0.0');
    expect([t.number, t.yucatec, t.kiche]).toEqual([4, 'Ajaw', 'Ajpu']);
    expect(t.haab).toEqual({ day: 3, month: 'K’ank’in' });
  });

  it('makes 20 December 2012 the day before: 12.19.19.17.19, 3 Kawak 2 K’ank’in', () => {
    const t = traditionalMaya('2012-12-20');
    expect(t.longCount).toBe('12.19.19.17.19');
    expect([t.number, t.yucatec, t.kiche]).toEqual([3, 'Kawak', 'Kawoq']);
    expect(t.haab).toEqual({ day: 2, month: 'K’ank’in' });
  });

  it('repeats the 260-day count after 260 days, the Haab after 365, and both after a Calendar Round', () => {
    const base = traditionalMaya('2012-12-21');
    const after = (days: number) => traditionalMaya(new Date(Date.UTC(2012, 11, 21 + days)).toISOString().slice(0, 10));
    expect([after(260).number, after(260).yucatec]).toEqual([base.number, base.yucatec]);
    expect(after(365).haab).toEqual(base.haab);
    const round = after(18980); // 52 Haab years
    expect([round.number, round.yucatec, round.haab]).toEqual([base.number, base.yucatec, base.haab]);
  });

  it('steps one day sign and one number each day, and one Haab day', () => {
    const a = traditionalMaya('2012-12-21');
    const b = traditionalMaya('2012-12-22');
    expect([b.number, b.yucatec]).toEqual([5, 'Imix']);
    expect(b.haab).toEqual({ day: 4, month: 'K’ank’in' });
    expect(b.dayCount - a.dayCount).toBe(1);
  });
});
