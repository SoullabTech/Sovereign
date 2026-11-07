/**
 * Traditional Maya calendar count (Goodman–Martínez–Thompson correlation,
 * constant 584283) — the Long Count, 260-day Tzolk'in and 365-day Haab.
 *
 * This is a DIFFERENT system from the Dreamspell (Argüelles) count in
 * `mayanAstrology.ts`. The two disagree on the day sign, the number and the
 * year-bearer calendar for almost every date; never present one as the other.
 *
 * Reference check: 3 Sep 2003 = 13 Akbal, 11 Mol, 12.19.10.10.3.
 */

export const GMT_CORRELATION = 584283;

/** Yucatec day names in Tzolk'in order, with the K'iche' (Chol Q'ij) equivalents. */
export const TZOLKIN_DAYS: ReadonlyArray<{ yucatec: string; kiche: string }> = [
  { yucatec: 'Imix', kiche: "Imox" },
  { yucatec: 'Ik', kiche: "Iq'" },
  { yucatec: 'Akbal', kiche: "Aq'ab'al" },
  { yucatec: 'Kan', kiche: "K'at" },
  { yucatec: 'Chicchan', kiche: 'Kan' },
  { yucatec: 'Cimi', kiche: 'Kame' },
  { yucatec: 'Manik', kiche: 'Kej' },
  { yucatec: 'Lamat', kiche: "Q'anil" },
  { yucatec: 'Muluc', kiche: 'Toj' },
  { yucatec: 'Oc', kiche: "Tz'i'" },
  { yucatec: 'Chuen', kiche: "B'atz'" },
  { yucatec: 'Eb', kiche: "E" },
  { yucatec: 'Ben', kiche: "Aj" },
  { yucatec: 'Ix', kiche: "I'x" },
  { yucatec: 'Men', kiche: "Tz'ikin" },
  { yucatec: 'Cib', kiche: 'Ajmaq' },
  { yucatec: 'Caban', kiche: "No'j" },
  { yucatec: 'Etznab', kiche: 'Tijax' },
  { yucatec: 'Cauac', kiche: 'Kawoq' },
  { yucatec: 'Ahau', kiche: 'Ajpu' },
];

export const HAAB_MONTH_NAMES: ReadonlyArray<string> = [
  'Pop', 'Wo', 'Sip', 'Zotz', 'Sek', 'Xul', 'Yaxkin', 'Mol', 'Chen', 'Yax',
  'Sak', 'Keh', 'Mak', 'Kankin', 'Muwan', 'Pax', 'Kayab', 'Kumku', 'Wayeb',
];

export interface TraditionalMayaDate {
  /** Days since the Long Count epoch (0.0.0.0.0) under GMT 584283. */
  longCountDays: number;
  longCount: string; // baktun.katun.tun.uinal.kin
  tzolkin: { number: number; yucatec: string; kiche: string; text: string };
  haab: { day: number; month: string; text: string };
  correlation: typeof GMT_CORRELATION;
}

/** Julian Day Number (at noon) of a proleptic Gregorian calendar date. */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) -
    Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
}

/** Traditional count for a civil date (Gregorian year, month 1-12, day). */
export function traditionalMayaDate(year: number, month: number, day: number): TraditionalMayaDate {
  const days = julianDayNumber(year, month, day) - GMT_CORRELATION;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const baktun = Math.floor(days / 144000);
  const katun = mod(Math.floor(days / 7200), 20);
  const tun = mod(Math.floor(days / 360), 20);
  const uinal = mod(Math.floor(days / 20), 18);
  const kin = mod(days, 20);

  // 0.0.0.0.0 fell on 4 Ahau: number 4, sign index 19.
  const number = mod(days + 3, 13) + 1;
  const sign = TZOLKIN_DAYS[mod(days + 19, 20)];

  // 0.0.0.0.0 fell on 8 Cumku (Haab position 348).
  const haabPos = mod(days + 348, 365);
  const monthIndex = Math.floor(haabPos / 20);
  const haabDay = haabPos % 20;
  const monthName = HAAB_MONTH_NAMES[monthIndex];

  return {
    longCountDays: days,
    longCount: [baktun, katun, tun, uinal, kin].join('.'),
    tzolkin: { number, yucatec: sign.yucatec, kiche: sign.kiche, text: `${number} ${sign.yucatec}` },
    haab: {
      day: haabDay,
      month: monthName,
      text: monthIndex === 18 ? `${haabDay} Wayeb` : `${haabDay} ${monthName}`,
    },
    correlation: GMT_CORRELATION,
  };
}

/** Same, from a YYYY-MM-DD civil date string (no timezone reinterpretation). */
export function traditionalMayaDateFromIso(iso: string): TraditionalMayaDate {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) throw new Error('traditionalMayaDateFromIso expects YYYY-MM-DD');
  return traditionalMayaDate(Number(m[1]), Number(m[2]), Number(m[3]));
}
