// frontend — lib/utils/getBrowserTimezone.ts
// Returns the browser's IANA timezone (e.g., "America/New_York")
// Falls back to UTC on server-side or if detection fails

export function getBrowserTimezone(): string {
  if (typeof window === 'undefined') return 'UTC';
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
