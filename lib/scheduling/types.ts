/**
 * SCHEDULING TYPES
 *
 * Shared types for slot calculation, availability, and booking.
 */

export interface TimeSlot {
  /** HH:MM format */
  start: string;
  /** HH:MM format */
  end: string;
  /** ISO 8601 start (when date context is known) */
  startISO?: string;
  /** ISO 8601 end (when date context is known) */
  endISO?: string;
}

export interface AvailabilityWindow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityOverride {
  override_date: string;
  is_blocked: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface BusyBlock {
  start: Date;
  end: Date;
}
