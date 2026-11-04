/**
 * Birth inputs for a Pro chart subject, read on the server only.
 *
 * "own"  → the verified member's own birth details, under the same rules as
 *          the my-chart route: astrology consent must be opted in, the birth
 *          revision must be verifiable, and every field must be complete.
 * <uuid> → one of the member's saved charts, owner-scoped.
 *
 * Birth values are never logged or returned to the browser by this module.
 */
import { query } from '@/lib/db/postgres';
import { isSavedChartId, readSavedChartBirth, type SavedChartBirth } from './proSavedCharts';

export type SubjectBirth =
  | { ok: true; birth: SavedChartBirth; revision: string }
  | { ok: false; status: number; error: string };

interface OwnBirthRow {
  birth_date: string | null;
  birth_time: string | null;
  birth_location_lat: string | null;
  birth_location_lng: string | null;
  birth_timezone: string | null;
  astrology_consent: string | null;
  astrology_birth_revision: string | null;
}

function verifiedRevision(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value) &&
    value.length <= 19 && BigInt(value) <= BigInt('9223372036854775807');
}

async function loadOwnBirth(memberId: string): Promise<SubjectBirth> {
  const result = await query<OwnBirthRow>(
    ['SELECT birth_date::text AS birth_date, birth_time::text AS birth_time,',
      'birth_location_lat::text AS birth_location_lat, birth_location_lng::text AS birth_location_lng,',
      'birth_timezone, astrology_consent, astrology_birth_revision::text AS astrology_birth_revision',
      'FROM members WHERE id = $1 LIMIT 1'].join(' '),
    [memberId],
  );
  const row = result.rows[0];
  if (!row) return { ok: false, status: 404, error: 'member_not_found' };
  if (row.astrology_consent !== 'opted_in') return { ok: false, status: 403, error: 'astrology_consent_required' };
  if (!verifiedRevision(row.astrology_birth_revision)) {
    return { ok: false, status: 503, error: 'chart_source_revision_unavailable' };
  }
  const date = typeof row.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.birth_date) ? row.birth_date : null;
  const clock = typeof row.birth_time === 'string' ? row.birth_time.trim().match(/^(\d{2}:\d{2})(?::00(?:\.0+)?)?$/) : null;
  const lat = row.birth_location_lat === null ? NaN : Number(row.birth_location_lat);
  const lng = row.birth_location_lng === null ? NaN : Number(row.birth_location_lng);
  if (!date || !clock || !Number.isFinite(lat) || !Number.isFinite(lng) || !row.birth_timezone) {
    return { ok: false, status: 422, error: 'complete_birth_details_required' };
  }
  return {
    ok: true,
    birth: { date, time: clock[1], location: { lat, lng, timezone: row.birth_timezone } },
    revision: 'own:' + row.astrology_birth_revision,
  };
}

export async function loadSubjectBirth(memberId: string, subject: unknown): Promise<SubjectBirth> {
  if (subject === 'own') return loadOwnBirth(memberId);
  if (!isSavedChartId(subject)) return { ok: false, status: 400, error: 'subject_invalid' };
  const birth = await readSavedChartBirth(memberId, subject);
  return birth
    ? { ok: true, birth, revision: 'saved:' + subject }
    : { ok: false, status: 404, error: 'saved_chart_not_found' };
}
