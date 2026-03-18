/**
 * Canonical Astronomical Event Types & 2026 Event Table
 *
 * AUTHORITY HIERARCHY — confidence field enforces epistemic discipline:
 *   'known'     — verified against NASA Eclipse Page / astronomical almanac
 *   'derived'   — calculated from ephemeris or synodic cycle (±1 day accuracy)
 *   'uncertain' — do NOT state without explicit re-verification
 *
 * GUARDRAIL: MAIA may only reference events present in this table.
 * Base model priors must NOT fill astronomical gaps.
 *
 * To extend to future years, run: scripts/generate-astro-events.ts
 */

export type ConfidenceLevel = 'known' | 'derived' | 'uncertain';

export type AstroEventType =
  | 'new_moon'
  | 'full_moon'
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'retrograde_start'
  | 'retrograde_end'
  | 'station_direct'
  | 'ingress';

export interface AstroEvent {
  type: AstroEventType;
  date: string; // YYYY-MM-DD (UTC)
  sign?: string;
  degree?: number;
  planet?: string; // for retrograde / ingress events
  eclipseType?: 'total' | 'partial' | 'annular' | 'penumbral';
  confidence: ConfidenceLevel;
  source: 'event_table' | 'calculated';
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2026 ASTRONOMICAL EVENT TABLE
// Eclipse dates: NASA Eclipse Page (https://eclipse.gsfc.nasa.gov)
// Lunation dates: calculated from synodic period (29.53059d) anchored to
//   confirmed New Moon 2026-03-19 and Total Lunar Eclipse 2026-03-03
// ─────────────────────────────────────────────────────────────────────────────
export const ASTRO_EVENTS_2026: AstroEvent[] = [

  // ── ECLIPSES ─────────────────────────────────────────────────────────────
  {
    type: 'lunar_eclipse',
    eclipseType: 'total',
    date: '2026-03-03',
    sign: 'Virgo',
    degree: 13,
    confidence: 'known',
    source: 'event_table',
    description: 'Total Lunar Eclipse — 13° Virgo',
  },
  {
    type: 'solar_eclipse',
    eclipseType: 'total',
    date: '2026-08-12',
    sign: 'Leo',
    confidence: 'known',
    source: 'event_table',
    description: 'Total Solar Eclipse — Leo',
  },

  // ── FULL MOONS ────────────────────────────────────────────────────────────
  { type: 'full_moon', date: '2026-01-03', sign: 'Cancer',      confidence: 'derived', source: 'calculated', description: 'Full Moon — Cancer' },
  { type: 'full_moon', date: '2026-02-01', sign: 'Leo',         confidence: 'derived', source: 'calculated', description: 'Full Moon — Leo' },
  { type: 'full_moon', date: '2026-03-03', sign: 'Virgo',       degree: 13, confidence: 'known',   source: 'event_table', description: 'Full Moon — 13° Virgo (Total Lunar Eclipse)' },
  { type: 'full_moon', date: '2026-04-02', sign: 'Libra',       confidence: 'derived', source: 'calculated', description: 'Full Moon — Libra' },
  { type: 'full_moon', date: '2026-05-01', sign: 'Scorpio',     confidence: 'derived', source: 'calculated', description: 'Full Moon — Scorpio' },
  { type: 'full_moon', date: '2026-05-31', sign: 'Sagittarius', confidence: 'derived', source: 'calculated', description: 'Full Moon — Sagittarius' },
  { type: 'full_moon', date: '2026-06-29', sign: 'Capricorn',   confidence: 'derived', source: 'calculated', description: 'Full Moon — Capricorn' },
  { type: 'full_moon', date: '2026-07-29', sign: 'Aquarius',    confidence: 'derived', source: 'calculated', description: 'Full Moon — Aquarius' },
  { type: 'full_moon', date: '2026-08-27', sign: 'Pisces',      confidence: 'derived', source: 'calculated', description: 'Full Moon — Pisces' },
  { type: 'full_moon', date: '2026-09-25', sign: 'Aries',       confidence: 'derived', source: 'calculated', description: 'Full Moon — Aries' },
  { type: 'full_moon', date: '2026-10-25', sign: 'Taurus',      confidence: 'derived', source: 'calculated', description: 'Full Moon — Taurus' },
  { type: 'full_moon', date: '2026-11-23', sign: 'Gemini',      confidence: 'derived', source: 'calculated', description: 'Full Moon — Gemini' },
  { type: 'full_moon', date: '2026-12-23', sign: 'Cancer',      confidence: 'derived', source: 'calculated', description: 'Full Moon — Cancer' },

  // ── NEW MOONS ─────────────────────────────────────────────────────────────
  { type: 'new_moon', date: '2026-01-18', sign: 'Capricorn',   confidence: 'derived', source: 'calculated', description: 'New Moon — Capricorn' },
  { type: 'new_moon', date: '2026-02-17', sign: 'Aquarius',    confidence: 'derived', source: 'calculated', description: 'New Moon — Aquarius' },
  { type: 'new_moon', date: '2026-03-19', sign: 'Pisces',      confidence: 'known',   source: 'event_table', description: 'New Moon — Pisces' },
  { type: 'new_moon', date: '2026-04-17', sign: 'Aries',       confidence: 'derived', source: 'calculated', description: 'New Moon — Aries' },
  { type: 'new_moon', date: '2026-05-17', sign: 'Taurus',      confidence: 'derived', source: 'calculated', description: 'New Moon — Taurus' },
  { type: 'new_moon', date: '2026-06-15', sign: 'Gemini',      confidence: 'derived', source: 'calculated', description: 'New Moon — Gemini' },
  { type: 'new_moon', date: '2026-07-15', sign: 'Cancer',      confidence: 'derived', source: 'calculated', description: 'New Moon — Cancer' },
  { type: 'new_moon', date: '2026-08-12', sign: 'Leo',         confidence: 'known',   source: 'event_table', description: 'New Moon — Leo (Total Solar Eclipse)' },
  { type: 'new_moon', date: '2026-09-11', sign: 'Virgo',       confidence: 'derived', source: 'calculated', description: 'New Moon — Virgo' },
  { type: 'new_moon', date: '2026-10-11', sign: 'Libra',       confidence: 'derived', source: 'calculated', description: 'New Moon — Libra' },
  { type: 'new_moon', date: '2026-11-09', sign: 'Scorpio',     confidence: 'derived', source: 'calculated', description: 'New Moon — Scorpio' },
  { type: 'new_moon', date: '2026-12-09', sign: 'Sagittarius', confidence: 'derived', source: 'calculated', description: 'New Moon — Sagittarius' },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUERY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return events within the next N days (default 30), sorted ascending.
 * Includes events starting from yesterday to catch active windows.
 */
export function getUpcomingEvents(
  events: AstroEvent[],
  withinDays: number = 30,
  fromDate: Date = new Date()
): AstroEvent[] {
  const from = fromDate.getTime() - 86_400_000; // include yesterday
  const until = from + (withinDays + 1) * 86_400_000;

  return events
    .filter(e => {
      const t = new Date(e.date + 'T12:00:00Z').getTime();
      return t >= from && t <= until;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Return events within ±windowDays of a date (for "active now" detection).
 */
export function getActiveEvents(
  events: AstroEvent[],
  windowDays: number = 3,
  fromDate: Date = new Date()
): AstroEvent[] {
  const center = fromDate.getTime();
  const window = windowDays * 86_400_000;

  return events.filter(e => {
    const t = new Date(e.date + 'T12:00:00Z').getTime();
    return Math.abs(t - center) <= window;
  });
}

/**
 * Confidence label for display in prompt context.
 */
export function confidenceLabel(c: ConfidenceLevel): string {
  switch (c) {
    case 'known':     return '(verified)';
    case 'derived':   return '(calculated, ±1 day)';
    case 'uncertain': return '(unverified — do not state)';
  }
}
