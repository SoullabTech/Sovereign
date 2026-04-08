/**
 * TIMEZONE-AWARE DATETIME PARSING (Soullab business timezone)
 *
 * Soullab is based in Connecticut — America/New_York (EST/EDT) is the canonical
 * operating zone. All practitioner availability windows, booking slot labels,
 * and stored session times are interpreted against this zone.
 *
 * This module exists because `new Date(`${date}T${time}`)` silently uses the
 * server's local timezone (UTC in Docker), which would store a 9:00 AM EDT
 * booking as 9:00 AM UTC (= 5:00 AM EDT).
 */
import { DateTime } from 'luxon';

/**
 * Canonical operating timezone for Soullab.
 * Handles both EST (UTC-5, winter) and EDT (UTC-4, summer) automatically.
 */
export const BUSINESS_TIMEZONE = 'America/New_York';

/**
 * Short label for display (e.g. "EDT" in summer, "EST" in winter).
 */
export function getBusinessTimezoneLabel(at: Date = new Date()): string {
  return (
    DateTime.fromJSDate(at).setZone(BUSINESS_TIMEZONE).offsetNameShort ?? 'ET'
  );
}

/**
 * Parse a wall-clock date + time string in a specific IANA timezone.
 * Defaults to BUSINESS_TIMEZONE (America/New_York) when the caller does not
 * provide one or provides an invalid zone.
 *
 * @param date       YYYY-MM-DD
 * @param time       HH:MM (24-hour)
 * @param timezone   IANA zone name. Defaults to BUSINESS_TIMEZONE.
 * @returns          A JavaScript Date (UTC instant) representing that
 *                   wall-clock time in the given zone.
 * @throws           If the combined date/time is not a valid moment.
 */
export function parseLocalDateTimeInTimezone(
  date: string,
  time: string,
  timezone: string | undefined = BUSINESS_TIMEZONE
): Date {
  const zone =
    timezone && DateTime.now().setZone(timezone).isValid
      ? timezone
      : BUSINESS_TIMEZONE;

  const dt = DateTime.fromISO(`${date}T${time}`, { zone });
  if (!dt.isValid) {
    throw new Error(
      `Invalid date/time: ${date}T${time} in ${zone} (${dt.invalidReason})`
    );
  }
  return dt.toJSDate();
}

/**
 * Format a UTC instant as a wall-clock string in BUSINESS_TIMEZONE.
 *
 * @param instant  Date (UTC instant, e.g. from sessions.scheduled_start)
 * @param fmt      Luxon format string, defaults to full human-readable form
 *                 with timezone label.
 */
export function formatInBusinessTimezone(
  instant: Date,
  fmt = "EEEE, LLLL d, yyyy 'at' h:mm a ZZZZ"
): string {
  return DateTime.fromJSDate(instant).setZone(BUSINESS_TIMEZONE).toFormat(fmt);
}
