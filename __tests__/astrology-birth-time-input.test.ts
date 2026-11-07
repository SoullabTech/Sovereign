/**
 * Founder walk 2026-11-07: Safari's time picker refused "02:43 PM" until its
 * AM/PM part was set separately. The typed field reads what people write.
 */
import { parseBirthTime, twelveHour } from '../lib/astrology/birthTimeInput';

describe('typed birth time', () => {
  it.each([
    ['14:43', '14:43'], ['02:43 PM', '14:43'], ['2:43pm', '14:43'], ['2:43 p.m.', '14:43'],
    ['2.43 PM', '14:43'], ['12:05 am', '00:05'], ['12:05 pm', '12:05'], ['00:00', '00:00'],
    ['7:58', '07:58'], [' 23:59 ', '23:59'], ['11:30 AM', '11:30'],
  ])('reads %s as %s', (typed, expected) => {
    expect(parseBirthTime(typed)).toBe(expected);
  });

  it.each(['', '2', '2:4', '24:00', '13:00 pm', '0:30 am', '12:60', 'noon', '2:43 xm', '14:43:10'])(
    'refuses %s', (typed) => {
      expect(parseBirthTime(typed)).toBeNull();
    },
  );

  it('confirms a reading in both clocks', () => {
    expect(twelveHour('14:43')).toBe('2:43 pm');
    expect(twelveHour('00:05')).toBe('12:05 am');
    expect(twelveHour('12:00')).toBe('12:00 pm');
  });
});
