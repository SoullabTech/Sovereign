/**
 * Kane commit-side: map a confirmed capture candidate into the payload for an
 * existing writer. This is the `kind → writer` bridge. It builds payloads only;
 * it never performs the write (the UI does that via apiFetch, on the member's
 * explicit confirmation — "MAIA proposes, the human commits").
 *
 * Slice 1 wires `calendar_event` → POST /api/studio/calendar/events.
 *
 * Note on reminders: a studio calendar event has NO reminder field, so an inferred
 * reminder is never silently applied here. Travel / "with whom" context is carried
 * transparently in the description; the member sees and can edit it before commit.
 */
import { DateTime } from 'luxon';
import type { CaptureCandidate } from './parseCapture';

export interface CalendarEventPayload {
  title: string;
  start: string; // ISO 8601 with offset
  end: string; // ISO 8601 with offset
  allDay: boolean;
  location?: string;
  description?: string;
}

export interface BuildCalendarOptions {
  timezone: string;
  defaultDurationMinutes?: number;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

/**
 * Build the `/api/studio/calendar/events` POST body from a calendar_event
 * candidate. Returns null if it is not a calendar_event or lacks a usable
 * date + start time — MAIA never commits an under-specified event.
 */
export function buildCalendarEventPayload(
  c: CaptureCandidate,
  opts: BuildCalendarOptions,
): CalendarEventPayload | null {
  if (c.kind !== 'calendar_event') return null;

  const zone = opts.timezone || 'UTC';
  const date = str(c.fields.date);
  const startTime = str(c.fields.startTime);
  if (!date || !startTime) return null;

  const startDT = DateTime.fromISO(`${date}T${startTime}`, { zone });
  if (!startDT.isValid) return null;

  const endTime = str(c.fields.endTime);
  let endDT = endTime ? DateTime.fromISO(`${date}T${endTime}`, { zone }) : null;
  if (!endDT || !endDT.isValid || endDT <= startDT) {
    endDT = startDT.plus({ minutes: opts.defaultDurationMinutes ?? 60 });
  }

  const startISO = startDT.toISO();
  const endISO = endDT.toISO();
  if (!startISO || !endISO) return null;

  const title = str(c.title) ?? 'Untitled event';

  const location =
    [str(c.fields.location), str(c.fields.city)].filter(Boolean).join(', ') || undefined;

  const descLines: string[] = [];
  const person = str(c.fields.person);
  const travel = str(c.fields.travelNote);
  if (person) descLines.push(`With ${person}`);
  if (travel) descLines.push(`Travel: ${travel}`);
  const description = descLines.length ? descLines.join('\n') : undefined;

  return {
    title,
    start: startISO,
    end: endISO,
    allDay: false,
    location,
    description,
  };
}
