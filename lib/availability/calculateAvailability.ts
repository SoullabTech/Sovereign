/**
 * SHARED AVAILABILITY ENGINE
 *
 * Single source of truth for slot generation.
 * Used by both Studio and Portal availability routes.
 *
 * Slot generation pipeline:
 *   1. Generate raw slots → weekly schedule × service duration
 *   2. Filter → overrides, min notice, max horizon
 *   3. Remove conflicts → existing sessions + buffers + Google Calendar busy
 *   4. Return → timezone-normalized ISO timestamps
 *
 * Timezone rules:
 *   - Storage = UTC
 *   - Calculation = practitioner timezone
 *   - Display = client timezone (handled by frontend)
 */

import db from '@/lib/db/postgres';

// ============================================================================
// Types
// ============================================================================

export type WeeklyAvailabilityRow = {
  id: string;
  practitioner_id: string;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  start_time: string;  // "10:00:00"
  end_time: string;    // "15:00:00"
  is_available: boolean;
};

export type AvailabilityOverrideRow = {
  id: string;
  practitioner_id: string;
  override_date: string; // "2026-03-27"
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

export type SessionConflictRow = {
  id: string;
  scheduled_start: string; // ISO UTC
  scheduled_end: string;   // ISO UTC
  status: string;
};

export type BookingSettings = {
  timezone: string;
  buffer_between_sessions: number; // minutes
  booking_advance_days: number;    // max horizon in days
  min_notice_hours: number;
  booking_enabled: boolean;
};

export type GoogleBusyBlock = {
  start: string; // ISO UTC
  end: string;   // ISO UTC
};

export type AvailabilitySlot = {
  start: string;       // ISO UTC
  end: string;         // ISO UTC
  displayDate: string; // YYYY-MM-DD in practitioner timezone
  displayTime: string; // HH:mm in practitioner timezone
};

export type CalculateAvailabilityInput = {
  practitionerId: string;
  serviceDurationMinutes: number;
  rangeStart: string; // YYYY-MM-DD
  rangeEnd: string;   // YYYY-MM-DD
  settings: BookingSettings;
  weeklyAvailability: WeeklyAvailabilityRow[];
  overrides: AvailabilityOverrideRow[];
  existingSessions: SessionConflictRow[];
  googleBusyBlocks?: GoogleBusyBlock[];
  now?: Date;
};

// ============================================================================
// Helpers
// ============================================================================

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
  return hours * 60 + minutes;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Format a UTC Date into practitioner-local components.
 */
function formatInTimeZone(date: Date, timeZone: string): {
  ymd: string;
  hm: string;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const partsArray = formatter.formatToParts(date);
  const parts: Record<string, string> = {};
  for (const p of partsArray) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }

  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  // Intl can return "24" for midnight in some locales — normalize to "00"
  const hh = parts.hour === '24' ? '00' : parts.hour;
  const hm = `${hh}:${parts.minute}`;

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  return { ymd, hm, weekday: weekdayMap[parts.weekday] ?? 0 };
}

/**
 * Convert a local date+time in a timezone to a UTC Date.
 * E.g. "2026-03-27" + "10:00" + "America/Chicago" → UTC Date
 */
function zonedDateTimeToUtc(dateYmd: string, timeHm: string, timeZone: string): Date {
  const [year, month, day] = dateYmd.split('-').map(Number);
  const [hour, minute] = timeHm.split(':').map(Number);

  // Create an approximate UTC date
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // Format that UTC instant in the target timezone to find the offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const fParts = formatter.formatToParts(approxUtc);
  const map: Record<string, string> = {};
  for (const p of fParts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  const asIfLocalInZone = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );

  const desiredLocal = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMs = asIfLocalInZone - desiredLocal;

  return new Date(approxUtc.getTime() - offsetMs);
}

/**
 * Enumerate all YYYY-MM-DD strings between start and end (inclusive).
 */
function enumerateDates(startYmd: string, endYmd: string): string[] {
  const out: string[] = [];
  const current = new Date(`${startYmd}T00:00:00.000Z`);
  const end = new Date(`${endYmd}T00:00:00.000Z`);

  while (current <= end) {
    out.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return out;
}

// ============================================================================
// Core Engine
// ============================================================================

/**
 * Calculate available time slots for a service.
 *
 * This is the ONLY function that generates availability slots.
 * Both Studio and Portal routes must call this — no duplication.
 */
export function calculateAvailability(input: CalculateAvailabilityInput): AvailabilitySlot[] {
  const {
    serviceDurationMinutes,
    rangeStart,
    rangeEnd,
    settings,
    weeklyAvailability,
    overrides,
    existingSessions,
    googleBusyBlocks = [],
    now = new Date(),
  } = input;

  if (!settings.booking_enabled) return [];

  const horizonLimit = addMinutes(now, settings.booking_advance_days * 24 * 60);
  const noticeCutoff = addMinutes(now, settings.min_notice_hours * 60);

  // Index overrides by date for O(1) lookup
  const overrideMap = new Map(overrides.map(o => [o.override_date, o]));

  // Pre-parse session blocks
  const sessionBlocks = existingSessions
    .filter(s => s.status !== 'cancelled' && s.status !== 'no_show')
    .map(s => ({
      start: new Date(s.scheduled_start),
      end: new Date(s.scheduled_end),
    }));

  // Pre-parse Google busy blocks
  const googleBlocks = googleBusyBlocks.map(g => ({
    start: new Date(g.start),
    end: new Date(g.end),
  }));

  const slots: AvailabilitySlot[] = [];
  const allDates = enumerateDates(rangeStart, rangeEnd);

  for (const dateYmd of allDates) {
    // Determine what day of week this is in the practitioner's timezone
    const midnightUtc = zonedDateTimeToUtc(dateYmd, '00:00', settings.timezone);
    const localMeta = formatInTimeZone(midnightUtc, settings.timezone);
    const weekday = localMeta.weekday;

    // Check for date-specific override
    const override = overrideMap.get(dateYmd);

    let windows: Array<{ start_time: string; end_time: string }> = [];

    if (override) {
      // Override controls this date entirely
      if (!override.is_available || !override.start_time || !override.end_time) {
        continue; // Day is blocked
      }
      windows = [{ start_time: override.start_time, end_time: override.end_time }];
    } else {
      // Use weekly availability rules
      windows = weeklyAvailability
        .filter(row => row.day_of_week === weekday && row.is_available)
        .map(row => ({ start_time: row.start_time, end_time: row.end_time }));
    }

    // Generate slots within each availability window
    for (const window of windows) {
      const windowStartMinutes = parseTimeToMinutes(window.start_time);
      const windowEndMinutes = parseTimeToMinutes(window.end_time);

      let cursorMinutes = windowStartMinutes;

      while (cursorMinutes + serviceDurationMinutes <= windowEndMinutes) {
        const hh = String(Math.floor(cursorMinutes / 60)).padStart(2, '0');
        const mm = String(cursorMinutes % 60).padStart(2, '0');

        const slotStart = zonedDateTimeToUtc(dateYmd, `${hh}:${mm}`, settings.timezone);
        const slotEnd = addMinutes(slotStart, serviceDurationMinutes);

        // Filter: minimum notice
        if (slotStart < noticeCutoff) {
          cursorMinutes += 15;
          continue;
        }

        // Filter: max booking horizon
        if (slotStart > horizonLimit) {
          cursorMinutes += 15;
          continue;
        }

        // Conflict check with buffers
        const bufferedStart = addMinutes(slotStart, -settings.buffer_between_sessions);
        const bufferedEnd = addMinutes(slotEnd, settings.buffer_between_sessions);

        // Check: existing sessions
        const conflictsWithSession = sessionBlocks.some(block =>
          overlaps(bufferedStart, bufferedEnd, block.start, block.end),
        );

        if (conflictsWithSession) {
          cursorMinutes += 15;
          continue;
        }

        // Check: Google Calendar busy events
        const conflictsWithGoogle = googleBlocks.some(block =>
          overlaps(bufferedStart, bufferedEnd, block.start, block.end),
        );

        if (conflictsWithGoogle) {
          cursorMinutes += 15;
          continue;
        }

        // Slot is valid — add it
        const display = formatInTimeZone(slotStart, settings.timezone);

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          displayDate: display.ymd,
          displayTime: display.hm,
        });

        cursorMinutes += 15;
      }
    }
  }

  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

// ============================================================================
// Data Loader (fetches all inputs from PostgreSQL)
// ============================================================================

/**
 * Load all data needed by calculateAvailability from the database.
 * Callers just need to provide practitionerId and date range.
 */
export async function loadAvailabilityInputs(params: {
  practitionerId: string;
  rangeStart: string; // YYYY-MM-DD
  rangeEnd: string;   // YYYY-MM-DD
}): Promise<{
  settings: BookingSettings;
  weeklyAvailability: WeeklyAvailabilityRow[];
  overrides: AvailabilityOverrideRow[];
  existingSessions: SessionConflictRow[];
}> {
  const { practitionerId, rangeStart, rangeEnd } = params;

  // Settings query: min_notice_hours may not exist if migration hasn't run yet.
  // Use a safe sub-select that returns 2 as default if the column is missing.
  let settingsResult;
  try {
    settingsResult = await db.query(
      `SELECT timezone, buffer_between_sessions, booking_advance_days,
              COALESCE(min_notice_hours, 2) as min_notice_hours, booking_enabled
       FROM practitioner_settings
       WHERE practitioner_id = $1`,
      [practitionerId],
    );
  } catch {
    // Fallback if min_notice_hours column doesn't exist yet
    settingsResult = await db.query(
      `SELECT timezone, buffer_between_sessions, booking_advance_days,
              2 as min_notice_hours, booking_enabled
       FROM practitioner_settings
       WHERE practitioner_id = $1`,
      [practitionerId],
    );
  }

  // Overrides table may not exist yet if migration hasn't run
  let overridesResult;
  try {
    overridesResult = await db.query(
      `SELECT id, practitioner_id, override_date::text, is_available,
              start_time::text, end_time::text, reason
       FROM availability_overrides
       WHERE practitioner_id = $1
         AND override_date >= $2::date
         AND override_date <= $3::date
       ORDER BY override_date`,
      [practitionerId, rangeStart, rangeEnd],
    );
  } catch {
    overridesResult = { rows: [] };
  }

  const [weeklyResult, sessionsResult] = await Promise.all([
    db.query(
      `SELECT id, practitioner_id, day_of_week, start_time::text, end_time::text, is_available
       FROM practitioner_availability
       WHERE practitioner_id = $1
       ORDER BY day_of_week, start_time`,
      [practitionerId],
    ),
    db.query(
      `SELECT id, scheduled_start, scheduled_end, status
       FROM sessions
       WHERE practitioner_id = $1
         AND status NOT IN ('cancelled', 'no_show')
         AND scheduled_start >= $2::date
         AND scheduled_start < ($3::date + interval '1 day')`,
      [practitionerId, rangeStart, rangeEnd],
    ),
  ]);

  // Default settings if none configured
  const settings: BookingSettings = settingsResult.rows.length > 0
    ? {
        timezone: settingsResult.rows[0].timezone || 'America/New_York',
        buffer_between_sessions: settingsResult.rows[0].buffer_between_sessions ?? 15,
        booking_advance_days: settingsResult.rows[0].booking_advance_days ?? 30,
        min_notice_hours: settingsResult.rows[0].min_notice_hours ?? 2,
        booking_enabled: settingsResult.rows[0].booking_enabled ?? false,
      }
    : {
        timezone: 'America/New_York',
        buffer_between_sessions: 15,
        booking_advance_days: 30,
        min_notice_hours: 2,
        booking_enabled: false,
      };

  return {
    settings,
    weeklyAvailability: weeklyResult.rows,
    overrides: overridesResult.rows,
    existingSessions: sessionsResult.rows,
  };
}
