/**
 * Julian Day Number of a Gregorian calendar date.
 *
 * Its own module so that code which only needs the day count (the traditional
 * Maya calendar, used by the Free Mayan page in the browser) does not import the
 * astronomy engine along with the Four Pillars.
 */
/** Julian Day Number of a Gregorian calendar date. */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}
