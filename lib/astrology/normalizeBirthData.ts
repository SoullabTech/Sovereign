/**
 * normalizeBirthData
 *
 * The ONE function that turns raw birth input into calculation-ready data.
 * All astrology code must pass through here — never call new Date("YYYY-MM-DD") elsewhere.
 *
 * Rules:
 * - Parse date manually: split on "-", never new Date(string)
 * - Keep local date and local time separate until explicit timezone conversion
 * - Preserve the source date exactly for display
 * - Create UTC timestamp only once, intentionally, for calculation
 */

export interface RawBirthData {
  birthDate: string;      // "1966-12-09"
  birthTime?: string;     // "14:30" or "07:00"
  timezone?: string;      // "America/Chicago"
  lat?: number;
  lng?: number;
  placeName?: string;
}

export interface NormalizedBirthData {
  birthDate: string;              // preserved local calendar date "1966-12-09"
  birthTime: string | null;       // preserved local clock time "07:00" or null
  timezone: string | null;        // verified timezone or null
  lat: number | null;
  lng: number | null;
  placeName: string | null;

  localDateParts: {
    year: number;
    month: number;   // 1-12
    day: number;
    hour: number;    // 0-23
    minute: number;  // 0-59
  };

  // UTC ISO string for calculation — constructed intentionally from local parts
  // null only if timezone is unknown AND time is unknown
  utcIsoForCalculation: string | null;

  // Display string: "Friday, December 9, 1966"
  displayDateLong: string;
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/**
 * Approximate UTC offset in hours for a given timezone string.
 * Uses Intl.DateTimeFormat if available; falls back to longitude-based estimate.
 * This is good enough for chart calculations — for display, always use localDateParts.
 */
function approxUtcOffset(timezone: string | null | undefined, lng: number | null): number {
  if (timezone) {
    try {
      const ref = new Date(2000, 0, 1, 12, 0, 0); // Jan 1 2000 noon UTC reference
      const tzParts = Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
        .formatToParts(ref);
      const tzName = tzParts.find(p => p.type === 'timeZoneName')?.value ?? '';
      const match = tzName.match(/GMT([+-]\d+(?::\d+)?)?/);
      if (match) {
        if (!match[1]) return 0; // GMT = UTC+0
        const [hStr, mStr] = match[1].replace('+','').split(':');
        const sign = match[1].startsWith('-') ? -1 : 1;
        return sign * (Math.abs(parseInt(hStr, 10)) + (mStr ? parseInt(mStr, 10) / 60 : 0));
      }
    } catch {
      // fall through to longitude estimate
    }
  }
  // Longitude-based estimate: 15° per hour
  if (lng != null) return Math.round(lng / 15);
  return 0;
}

export function normalizeBirthData(raw: RawBirthData): NormalizedBirthData {
  // --- Parse date manually (NEVER use new Date(string) for birth dates) ---
  const dateParts = raw.birthDate.split('-').map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) {
    throw new Error(`normalizeBirthData: invalid birthDate format "${raw.birthDate}" — expected YYYY-MM-DD`);
  }
  const [year, month, day] = dateParts;

  // --- Parse time ---
  let hour = 12; // noon default when time unknown
  let minute = 0;
  const birthTime = raw.birthTime?.trim() || null;
  if (birthTime) {
    const timeParts = birthTime.split(':').map(Number);
    if (timeParts.length >= 2 && !timeParts.some(isNaN)) {
      [hour, minute] = timeParts;
    }
  }

  // --- Display date: use manual construction (no Date object parsing) ---
  // Day of week: Zeller's congruence (Gregorian)
  const m = month < 3 ? month + 12 : month;
  const y = month < 3 ? year - 1 : year;
  const k = y % 100;
  const j = Math.floor(y / 100);
  const h = (day + Math.floor(13 * (m + 1) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7;
  // Zeller: h=0→Sat, 1→Sun, 2→Mon, ... 6→Fri
  const dowIndex = ((h + 6) % 7); // convert to 0=Sun,...,6=Sat
  const displayDateLong = `${DAYS[dowIndex]}, ${MONTHS[month - 1]} ${day}, ${year}`;

  // --- Build UTC ISO for calculation ---
  // Strategy: apply timezone offset to convert local time to UTC
  const utcOffset = approxUtcOffset(raw.timezone, raw.lng ?? null);
  let utcIsoForCalculation: string | null = null;

  if (birthTime || raw.timezone || raw.lat != null) {
    // Build a UTC time from local parts + offset
    // Local datetime → UTC: subtract offset
    const localMinutes = hour * 60 + minute;
    const utcMinutes = localMinutes - utcOffset * 60;

    // Handle day rollover
    let utcDay = day;
    let utcMonth = month;
    let utcYear = year;
    const utcHour = Math.floor(((utcMinutes % 1440) + 1440) % 1440 / 60);
    const utcMin = ((utcMinutes % 1440) + 1440) % 1440 % 60;

    if (utcMinutes < 0) {
      // Rolled back to previous day
      const prevDate = new Date(Date.UTC(year, month - 1, day - 1));
      utcDay = prevDate.getUTCDate();
      utcMonth = prevDate.getUTCMonth() + 1;
      utcYear = prevDate.getUTCFullYear();
    } else if (utcMinutes >= 1440) {
      // Rolled forward to next day
      const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
      utcDay = nextDate.getUTCDate();
      utcMonth = nextDate.getUTCMonth() + 1;
      utcYear = nextDate.getUTCFullYear();
    }

    utcIsoForCalculation = `${String(utcYear).padStart(4,'0')}-${String(utcMonth).padStart(2,'0')}-${String(utcDay).padStart(2,'0')}T${String(utcHour).padStart(2,'0')}:${String(utcMin).padStart(2,'0')}:00Z`;
  }

  return {
    birthDate: raw.birthDate,
    birthTime,
    timezone: raw.timezone ?? null,
    lat: raw.lat ?? null,
    lng: raw.lng ?? null,
    placeName: raw.placeName ?? null,
    localDateParts: { year, month, day, hour, minute },
    utcIsoForCalculation,
    displayDateLong,
  };
}
