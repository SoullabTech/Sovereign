/**
 * CALENDAR EXPORT HELPERS (Client-side only)
 *
 * Generates Google Calendar URLs and .ics files from booking data.
 * No server round-trip — works entirely from the confirmation UI.
 */

// ── Shared input type ────────────────────────────────────────────────────────

export interface CalendarExportOptions {
  title: string;
  /** UTC ISO 8601 string (e.g. "2026-04-11T14:00:00.000Z") */
  startUtcIso: string;
  /** UTC ISO 8601 string */
  endUtcIso: string;
  description?: string;
  location?: string;
}

// ── Google Calendar ──────────────────────────────────────────────────────────

/**
 * Build a pre-filled Google Calendar "create event" URL.
 * Opens in a new tab — no API key or OAuth needed.
 */
export function buildGoogleCalendarUrl(opts: CalendarExportOptions): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    dates: `${toGoogleDateFormat(opts.startUtcIso)}/${toGoogleDateFormat(opts.endUtcIso)}`,
  });

  if (opts.description) params.set('details', opts.description);
  if (opts.location) params.set('location', opts.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Google Calendar expects dates as YYYYMMDDTHHmmssZ (no dashes, no colons). */
function toGoogleDateFormat(utcIso: string): string {
  return new Date(utcIso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

// ── ICS (.ics) file ──────────────────────────────────────────────────────────

/**
 * Generate a valid iCalendar string.
 * Works with Proton Calendar, Apple Calendar, Outlook, and any RFC 5545 client.
 */
export function buildIcsString(opts: CalendarExportOptions): string {
  const now = toIcsDateFormat(new Date().toISOString());
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@soullab.life`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soullab//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDateFormat(opts.startUtcIso)}`,
    `DTEND:${toIcsDateFormat(opts.endUtcIso)}`,
    `SUMMARY:${escapeIcsText(opts.title)}`,
  ];

  if (opts.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(opts.description)}`);
  }
  if (opts.location) {
    lines.push(`LOCATION:${escapeIcsText(opts.location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  // ICS spec requires CRLF line endings
  return lines.join('\r\n');
}

/** ICS format: YYYYMMDDTHHMMSSZ (UTC, no separators). */
function toIcsDateFormat(utcIso: string): string {
  return new Date(utcIso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/**
 * Escape text for ICS fields per RFC 5545.
 * Backslashes, commas, semicolons, and newlines must be escaped.
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// ── Download trigger ─────────────────────────────────────────────────────────

/**
 * Trigger a browser download of an .ics file.
 * Creates a temporary Blob URL and clicks a hidden anchor.
 */
export function downloadIcsFile(icsString: string, filename = 'booking.ics'): void {
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Convenience: build options from booking data ─────────────────────────────

/**
 * Build CalendarExportOptions from the raw booking fields available in the
 * inline confirmation modal. Converts date+time in BUSINESS_TIMEZONE to UTC.
 */
export function buildExportOptionsFromBooking(opts: {
  serviceName: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  durationMinutes: number;
  practitionerName?: string;
  manageUrl?: string;
}): CalendarExportOptions {
  // Import dynamically avoided — just compute UTC inline using the same
  // approach as the server: treat date+time as America/New_York wall-clock.
  // The booking page already guarantees times are in BUSINESS_TIMEZONE.
  const startDate = new Date(
    new Date(`${opts.date}T${opts.time}:00`).toLocaleString('en-US', { timeZone: 'America/New_York' })
  );

  // Simpler: use Intl to find the offset, then construct UTC directly.
  // For client-side without Luxon, we parse via a known-good method:
  const startUtc = dateInNewYorkToUtcIso(opts.date, opts.time);
  const endUtc = new Date(new Date(startUtc).getTime() + opts.durationMinutes * 60_000).toISOString();

  const descParts: string[] = [];
  if (opts.practitionerName) descParts.push(`With ${opts.practitionerName}`);
  descParts.push(`${opts.serviceName} (${opts.durationMinutes} min)`);
  if (opts.manageUrl) descParts.push(`Manage: ${opts.manageUrl}`);

  return {
    title: opts.serviceName,
    startUtcIso: startUtc,
    endUtcIso: endUtc,
    description: descParts.join('\n'),
  };
}

/**
 * Convert a wall-clock date+time in America/New_York to a UTC ISO string.
 * Uses Intl.DateTimeFormat to determine the correct offset (handles DST).
 * Client-side only — no Luxon dependency needed.
 */
function dateInNewYorkToUtcIso(date: string, time: string): string {
  // Create a date object that we'll use to probe the NY offset
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);

  // Build a formatter that shows us the offset for NY at this date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset',
  });

  // Format a probe date to extract the offset string (e.g. "GMT-4" or "GMT-5")
  const probeDate = new Date(Date.UTC(y, m - 1, d, h + 5, min)); // rough probe
  const parts = formatter.formatToParts(probeDate);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  const offsetStr = tzPart?.value || 'GMT-5';

  // Parse offset hours from "GMT-4" or "GMT-5"
  const offsetMatch = offsetStr.match(/GMT([+-]?\d+)/);
  const offsetHours = offsetMatch ? parseInt(offsetMatch[1], 10) : -5;

  // Construct the correct UTC time
  const utcDate = new Date(Date.UTC(y, m - 1, d, h - offsetHours, min, 0));
  return utcDate.toISOString();
}
