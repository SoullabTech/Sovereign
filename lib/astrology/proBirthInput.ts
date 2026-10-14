/**
 * ASTRO-PRO-03 — explicit, fail-closed member birth data preparation.
 * Input is already received from the authenticated member profile.
 * Neither this function nor its callers use browser caches or persist data.
 */
export interface VerifiedChartBirthInput {
  date: string;
  time: string;
  location: { lat: number; lng: number; timezone: string };
  houseSystem: 'porphyry';
}

export function resolveProBirthInput(value: unknown): VerifiedChartBirthInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const b = value as Record<string, unknown>;
  const sourceDate = typeof b.date === 'string' ? b.date : '';
  const date = sourceDate.split('T')[0];
  const time = typeof b.time === 'string' ? b.time.substring(0, 5) : '';
  const loc = b.location;
  if (!loc || typeof loc !== 'object' || Array.isArray(loc)) return null;
  const l = loc as Record<string, unknown>;

  const rawLat = l.lat;
  const rawLng = l.lng ?? l.lon;
  // Number(null) === 0, so missing coordinates must not become a fictitious 0°,0°.
  if (rawLat == null || rawLng == null ||
      String(rawLat).trim() === '' || String(rawLng).trim() === '') return null;
  const lat = typeof rawLat === 'number' ? rawLat : Number(rawLat);
  const lng = typeof rawLng === 'number' ? rawLng : Number(rawLng);
  const timezone = typeof l.timezone === 'string' ? l.timezone : '';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  // Date.UTC(year < 100) maps to 1900+year; setUTCFullYear avoids that alias.
  const calendarDate = new Date(0);
  calendarDate.setUTCHours(0, 0, 0, 0);
  calendarDate.setUTCFullYear(year, month - 1, day);
  if (calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day ||
      hour > 23 || minute > 59) return null;

  if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lng) || lng < -180 || lng > 180) return null;
  if (!timezone) return null;
  try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return null; }

  return { date, time, location: { lat, lng, timezone }, houseSystem: 'porphyry' };
}
