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

  it('gives 3 September 2003 as 13 Aq’ab’al (Ak’b’al), 11 Mol, 12.19.10.10.3', () => {
    const t = traditionalMaya('2003-09-03');
    expect([t.number, t.kiche, t.yucatec]).toEqual([13, 'Aq’ab’al', 'Ak’b’al']);
    expect(t.haab).toEqual({ day: 11, month: 'Mol' });
    expect(t.longCount).toBe('12.19.10.10.3');
  });

  it('gives 3 February 2026 as 12 E (Eb’), 10 Pax, 13.0.13.5.12', () => {
    const t = traditionalMaya('2026-02-03');
    expect([t.number, t.kiche, t.yucatec]).toEqual([12, 'E', 'Eb’']);
    expect(t.haab).toEqual({ day: 10, month: 'Pax' });
    expect(t.longCount).toBe('13.0.13.5.12');
  });

  it('steps one day sign and one number each day, and one Haab day', () => {
    const a = traditionalMaya('2012-12-21');
    const b = traditionalMaya('2012-12-22');
    expect([b.number, b.yucatec]).toEqual([5, 'Imix']);
    expect(b.haab).toEqual({ day: 4, month: 'K’ank’in' });
    expect(b.dayCount - a.dayCount).toBe(1);
  });
});
