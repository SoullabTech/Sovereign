/**
 * CONSOLIDATED SLOT CALCULATOR
 *
 * Single source of truth for available time slot computation.
 * Replaces the 3 duplicated implementations in:
 *   - lib/portal/bookingTools.ts (checkAvailability)
 *   - app/api/studio/bookings/availability/route.ts
 *   - app/api/portal/[slug]/availability/route.ts
 *
 * Algorithm:
 * 1. Load service duration
 * 2. Load practitioner_availability for the day
 * 3. Load availability_overrides for the date
 * 4. Generate candidate slots from windows
 * 5. Load existing sessions + calendar_events as busy blocks
 * 6. Subtract conflicts
 * 7. Return available slots
 */

import db from '@/lib/db/postgres';
import type { TimeSlot, BusyBlock } from './types';

interface SlotCalcParams {
  practitionerId: string;
  date: string;               // YYYY-MM-DD
  serviceId?: string;          // if provided, uses service duration
  durationMinutes?: number;    // fallback if no serviceId
  slotIntervalMinutes?: number; // defaults to 30
}

/**
 * Get available time slots for a single date.
 */
export async function getAvailableSlots(params: SlotCalcParams): Promise<TimeSlot[]> {
  const {
    practitionerId,
    date,
    serviceId,
    slotIntervalMinutes = 30,
  } = params;

  // Validate date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [];
  }

  const requestedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (requestedDate < today) {
    return [];
  }

  // 1. Get duration from service or fallback
  let duration = params.durationMinutes ?? 60;
  if (serviceId) {
    const serviceResult = await db.query(
      `SELECT duration_minutes FROM services WHERE id = $1 AND practitioner_id = $2`,
      [serviceId, practitionerId]
    );
    if (serviceResult.rows.length > 0) {
      duration = serviceResult.rows[0].duration_minutes;
    }
  }

  const dayOfWeek = requestedDate.getDay();

  // 2. Check for whole-day override block first
  const wholeDayBlock = await db.query(
    `SELECT id FROM availability_overrides
     WHERE practitioner_id = $1 AND override_date = $2 AND is_blocked = true AND start_time IS NULL`,
    [practitionerId, date]
  );
  if (wholeDayBlock.rows.length > 0) {
    return []; // entire day is blocked
  }

  // 3. Load availability windows for this day
  const windowsResult = await db.query(
    `SELECT start_time, end_time
     FROM practitioner_availability
     WHERE practitioner_id = $1 AND day_of_week = $2 AND is_available = true
     ORDER BY start_time`,
    [practitionerId, dayOfWeek]
  );

  // 4. Load extra availability overrides (is_blocked = false)
  const extraResult = await db.query(
    `SELECT start_time, end_time
     FROM availability_overrides
     WHERE practitioner_id = $1 AND override_date = $2 AND is_blocked = false
       AND start_time IS NOT NULL AND end_time IS NOT NULL`,
    [practitionerId, date]
  );

  // 5. Load time-specific blocks
  const blocksResult = await db.query(
    `SELECT start_time, end_time
     FROM availability_overrides
     WHERE practitioner_id = $1 AND override_date = $2 AND is_blocked = true
       AND start_time IS NOT NULL AND end_time IS NOT NULL`,
    [practitionerId, date]
  );

  // Combine windows: regular availability + extra overrides
  const windows = [
    ...windowsResult.rows.map((r) => ({ start: r.start_time, end: r.end_time })),
    ...extraResult.rows.map((r) => ({ start: r.start_time, end: r.end_time })),
  ];

  if (windows.length === 0) {
    return [];
  }

  // Parse time-specific blocks
  const timeBlocks = blocksResult.rows.map((r) => {
    const [bsh, bsm] = r.start_time.split(':').map(Number);
    const [beh, bem] = r.end_time.split(':').map(Number);
    return { start: bsh * 60 + bsm, end: beh * 60 + bem };
  });

  // 6. Load busy blocks: existing sessions + calendar_events
  const busyBlocks = await loadBusyBlocks(practitionerId, date);
  const now = new Date();

  // 7. Generate candidate slots and filter
  const slots: TimeSlot[] = [];

  for (const window of windows) {
    const [startHour, startMin] = window.start.split(':').map(Number);
    const [endHour, endMin] = window.end.split(':').map(Number);

    let currentTime = startHour * 60 + startMin;
    const windowEnd = endHour * 60 + endMin;

    while (currentTime + duration <= windowEnd) {
      const slotEndMinutes = currentTime + duration;

      // Check time-specific blocks
      const isTimeBlocked = timeBlocks.some(
        (b) => currentTime < b.end && slotEndMinutes > b.start
      );

      if (!isTimeBlocked) {
        const startStr = minutesToHHMM(currentTime);
        const endStr = minutesToHHMM(slotEndMinutes);
        const slotStartDate = new Date(`${date}T${startStr}`);
        const slotEndDate = new Date(`${date}T${endStr}`);

        // Skip past slots
        if (slotStartDate > now) {
          // Check busy block conflicts
          const hasConflict = busyBlocks.some(
            (busy) => slotStartDate < busy.end && slotEndDate > busy.start
          );

          if (!hasConflict) {
            slots.push({
              start: startStr,
              end: endStr,
              startISO: slotStartDate.toISOString(),
              endISO: slotEndDate.toISOString(),
            });
          }
        }
      }

      currentTime += slotIntervalMinutes;
    }
  }

  return slots;
}

/**
 * Get available slots across a date range (for studio calendar view).
 */
export async function getAvailableSlotsRange(params: {
  practitionerId: string;
  from: string;  // YYYY-MM-DD
  to: string;    // YYYY-MM-DD
  serviceId?: string;
  durationMinutes?: number;
}): Promise<Record<string, TimeSlot[]>> {
  const result: Record<string, TimeSlot[]> = {};
  const current = new Date(params.from);
  const end = new Date(params.to);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const slots = await getAvailableSlots({
      practitionerId: params.practitionerId,
      date: dateStr,
      serviceId: params.serviceId,
      durationMinutes: params.durationMinutes,
    });
    if (slots.length > 0) {
      result[dateStr] = slots;
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

// ── Internal helpers ─────────────────────────────────────

async function loadBusyBlocks(practitionerId: string, date: string): Promise<BusyBlock[]> {
  // Fetch sessions and calendar_events in parallel
  const [sessionsResult, calendarResult] = await Promise.all([
    db.query(
      `SELECT scheduled_start, scheduled_end
       FROM sessions
       WHERE practitioner_id = $1
       AND DATE(scheduled_start) = $2
       AND status NOT IN ('cancelled', 'no_show')`,
      [practitionerId, date]
    ),
    // calendar_events belong to the practitioner's member_id
    db.query(
      `SELECT ce.start_time, ce.end_time
       FROM calendar_events ce
       JOIN practitioners p ON ce.member_id = p.member_id
       WHERE p.id = $1
       AND DATE(ce.start_time) = $2
       AND ce.deleted_at IS NULL`,
      [practitionerId, date]
    ),
  ]);

  const blocks: BusyBlock[] = [
    ...sessionsResult.rows.map((r) => ({
      start: new Date(r.scheduled_start),
      end: new Date(r.scheduled_end),
    })),
    ...calendarResult.rows.map((r) => ({
      start: new Date(r.start_time),
      end: new Date(r.end_time),
    })),
  ];

  return blocks;
}

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
