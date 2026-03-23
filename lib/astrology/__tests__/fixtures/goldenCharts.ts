/**
 * Golden chart test fixtures.
 *
 * Expected values must come from a trusted reference source (Astro.com, TimePassages, etc.)
 * Mark fields as TODO when not yet verified against a reference.
 *
 * Severity key:
 *   critical — Sun, Moon, Ascendant, date, timezone (wrong = distrust the whole report)
 *   major    — aspects, transits, return timing
 *   minor    — display formatting
 */

export interface GoldenChart {
  label: string;
  notes?: string;
  input: {
    birthDate: string;
    birthTime?: string;
    timezone?: string;
    lat?: number;
    lng?: number;
    placeName?: string;
  };
  expected: {
    // CRITICAL fields
    displayDateLong: string;
    sunSign: string;
    // Fill from reference source:
    moonSign: string;
    ascendant?: string;        // omit if birth time unknown
    // MAJOR fields (TODO until verified)
    mercurySign?: string;
    venusSign?: string;
    marsSign?: string;
  };
  category: 'stable' | 'sign-boundary' | 'time-boundary' | 'unknown-time' | 'location-boundary' | 'leap-year';
}

export const goldenCharts: GoldenChart[] = [
  // ── Case 1: Kelly — primary reference chart (exposed visible failure) ────────
  {
    label: 'Kelly',
    notes: 'Primary reference. Exposed Sun sign / date parsing bug.',
    input: {
      birthDate: '1966-12-09',
      birthTime: '07:00',
      timezone: 'America/Chicago',
      lat: 30.4515,
      lng: -91.1871,
      placeName: 'Baton Rouge, Louisiana',
    },
    expected: {
      displayDateLong: 'Friday, December 9, 1966',
      sunSign: 'Sagittarius',
      moonSign: 'TODO — verify against Astro.com',
      ascendant: 'TODO — verify against Astro.com',
    },
    category: 'stable',
  },

  // ── Case 2: Aries/Pisces sign boundary (March 20 — last day of Pisces) ───────
  {
    label: 'Sign boundary — last day Pisces',
    input: {
      birthDate: '1990-03-20',
      birthTime: '12:00',
      timezone: 'America/New_York',
      lat: 40.7128,
      lng: -74.0060,
      placeName: 'New York, NY',
    },
    expected: {
      displayDateLong: 'Tuesday, March 20, 1990',
      sunSign: 'Pisces',
      moonSign: 'TODO',
    },
    category: 'sign-boundary',
  },

  // ── Case 3: Aries (day after sign boundary) ──────────────────────────────────
  {
    label: 'Sign boundary — first day Aries',
    input: {
      birthDate: '1990-03-21',
      birthTime: '12:00',
      timezone: 'America/New_York',
      lat: 40.7128,
      lng: -74.0060,
      placeName: 'New York, NY',
    },
    expected: {
      displayDateLong: 'Wednesday, March 21, 1990',
      sunSign: 'Aries',
      moonSign: 'TODO',
    },
    category: 'sign-boundary',
  },

  // ── Case 4: Capricorn/Sagittarius boundary (Dec 21 last Sag vs Dec 22 Cap) ───
  {
    label: 'Sign boundary — last day Sagittarius',
    input: {
      birthDate: '2000-12-21',
      birthTime: '12:00',
    },
    expected: {
      displayDateLong: 'Thursday, December 21, 2000',
      sunSign: 'Sagittarius',
      moonSign: 'TODO',
    },
    category: 'sign-boundary',
  },

  // ── Case 5: Late-night birth (catch date rollover) ───────────────────────────
  {
    label: 'Late-night birth — 11:30 PM',
    input: {
      birthDate: '1985-06-15',
      birthTime: '23:30',
      timezone: 'America/Los_Angeles',
      lat: 34.0522,
      lng: -118.2437,
      placeName: 'Los Angeles, CA',
    },
    expected: {
      displayDateLong: 'Saturday, June 15, 1985',
      sunSign: 'Gemini',
      moonSign: 'TODO',
    },
    category: 'time-boundary',
  },

  // ── Case 6: Midnight birth ───────────────────────────────────────────────────
  {
    label: 'Midnight birth — 00:00',
    input: {
      birthDate: '1975-08-01',
      birthTime: '00:00',
      timezone: 'Europe/London',
      lat: 51.5074,
      lng: -0.1278,
      placeName: 'London, UK',
    },
    expected: {
      displayDateLong: 'Friday, August 1, 1975',
      sunSign: 'Leo',
      moonSign: 'TODO',
    },
    category: 'time-boundary',
  },

  // ── Case 7: Unknown birth time ───────────────────────────────────────────────
  {
    label: 'Unknown birth time',
    input: {
      birthDate: '1982-11-05',
      // no birthTime
      placeName: 'Chicago, IL',
    },
    expected: {
      displayDateLong: 'Friday, November 5, 1982',
      sunSign: 'Scorpio',
      moonSign: 'TODO',
      // ascendant omitted — not calculable without time
    },
    category: 'unknown-time',
  },

  // ── Case 8: Southern hemisphere (Australia) ──────────────────────────────────
  {
    label: 'Southern hemisphere — Sydney',
    input: {
      birthDate: '1995-07-04',
      birthTime: '14:00',
      timezone: 'Australia/Sydney',
      lat: -33.8688,
      lng: 151.2093,
      placeName: 'Sydney, Australia',
    },
    expected: {
      displayDateLong: 'Tuesday, July 4, 1995',
      sunSign: 'Cancer',
      moonSign: 'TODO',
    },
    category: 'location-boundary',
  },

  // ── Case 9: Leap year ────────────────────────────────────────────────────────
  {
    label: 'Leap year — Feb 29',
    input: {
      birthDate: '1980-02-29',
      birthTime: '09:00',
      timezone: 'America/Chicago',
    },
    expected: {
      displayDateLong: 'Friday, February 29, 1980',
      sunSign: 'Pisces',
      moonSign: 'TODO',
    },
    category: 'leap-year',
  },

  // ── Case 10: Capricorn wrap (Dec 22 — first day Capricorn) ───────────────────
  {
    label: 'Capricorn — year boundary',
    input: {
      birthDate: '1978-01-10',
      birthTime: '12:00',
    },
    expected: {
      displayDateLong: 'Tuesday, January 10, 1978',
      sunSign: 'Capricorn',
      moonSign: 'TODO',
    },
    category: 'sign-boundary',
  },

  // ── Case 11: Aquarius (Jan 20) ───────────────────────────────────────────────
  {
    label: 'Aquarius — Jan 20',
    input: {
      birthDate: '1988-01-20',
      birthTime: '15:00',
    },
    expected: {
      displayDateLong: 'Wednesday, January 20, 1988',
      sunSign: 'Aquarius',
      moonSign: 'TODO',
    },
    category: 'sign-boundary',
  },

  // ── Case 12: DST transition (spring forward, US 1992) ────────────────────────
  {
    label: 'DST transition — spring forward',
    notes: 'April 5 1992 — US clocks moved forward at 2:00 AM',
    input: {
      birthDate: '1992-04-05',
      birthTime: '02:30',
      timezone: 'America/New_York',
      lat: 40.7128,
      lng: -74.0060,
    },
    expected: {
      displayDateLong: 'Sunday, April 5, 1992',
      sunSign: 'Aries',
      moonSign: 'TODO',
    },
    category: 'time-boundary',
  },
];
