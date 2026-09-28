import { createHash } from 'node:crypto';
import { HOUSE_PLACES, type HousePlaceId } from './catalog';
import { defaultHousePreferences, parseHousePreferences,
  type HousePreferences, type HousePreferenceSnapshot } from './preferences';

export type HouseQuery = (sql: string, values: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

export function housePreferenceTag(memberId: string, revision: number): string {
  const scope = createHash('sha256').update('house-preferences-v1:' + memberId).digest('hex').slice(0, 32);
  return `"hp1-${scope}-${revision}"`;
}

export async function eligibleHousePlaces(_memberId: string, _query: HouseQuery): Promise<HousePlaceId[]> {
  // Every House place is member-facing. Professional Practitioner Studio remains
  // a separate workspace at /studio; the persisted studio slot now names
  // Vision Studio and therefore must not be practitioner-gated.
  return HOUSE_PLACES.map(place => place.id);
}

function snapshot(memberId: string, eligibleIds: HousePlaceId[], row?: Record<string, unknown>): HousePreferenceSnapshot {
  const revision = row ? Number(row.revision) : 0;
  if (!Number.isSafeInteger(revision) || revision < 0 || (row && revision === 0)) throw new Error('INVALID_STORED_HOUSE_REVISION');
  const defaults = defaultHousePreferences(eligibleIds);
  const preferences = row ? parseHousePreferences({
    version: row.version,
    // NULL means "use the current House default", never "freeze the historical five".
    center: Array.isArray(row.center_ids) ? row.center_ids : defaults.center,
    shortcuts: row.shortcut_ids,
    passingThrough: row.passing_through === true ? 'shared' : row.passing_through === false ? 'quiet' : null,
  }) : defaults;
  return { preferences, revision, eligibleIds, tag: housePreferenceTag(memberId, revision) };
}

export async function readHousePreferences(memberId: string, query: HouseQuery): Promise<HousePreferenceSnapshot> {
  const eligible = await eligibleHousePlaces(memberId, query);
  try {
    const result = await query(
      'SELECT version, center_ids, shortcut_ids, passing_through, revision FROM house_member_preferences WHERE member_id = $1',
      [memberId],
    );
    return snapshot(memberId, eligible, result.rows[0]);
  } catch (error) {
    // Compatibility bridge for deployments where the House reader arrives before
    // its preference table. Missing storage means "no saved preference yet" —
    // never invent persisted state, and never swallow unrelated database faults.
    if (typeof error === 'object' && error !== null && 'code' in error
      && (error as { code?: unknown }).code === '42P01') {
      return snapshot(memberId, eligible);
    }
    throw error;
  }
}

export type SaveHouseResult =
  | { kind: 'saved'; snapshot: HousePreferenceSnapshot }
  | { kind: 'conflict' }
  | { kind: 'ineligible' };

export async function saveHousePreferences(
  memberId: string,
  prefs: HousePreferences,
  expectedRevision: number,
  query: HouseQuery,
): Promise<SaveHouseResult> {
  const value = parseHousePreferences(prefs);
  const eligible = await eligibleHousePlaces(memberId, query);
  if ([...value.center, ...value.shortcuts].some(id => !eligible.includes(id))) return { kind: 'ineligible' };
  if (value.center.length > 5) return { kind: 'ineligible' };
  const params = [memberId, value.center, value.shortcuts, value.passingThrough === 'shared', expectedRevision];
  const result = expectedRevision === 0
    ? await query(`INSERT INTO house_member_preferences (member_id, center_ids, shortcut_ids, passing_through)
        SELECT $1, $2::text[], $3::text[], $4 WHERE $5::integer = 0
        ON CONFLICT (member_id) DO NOTHING
        RETURNING version, center_ids, shortcut_ids, passing_through, revision`, params)
    : await query(`UPDATE house_member_preferences
        SET center_ids = $2::text[], shortcut_ids = $3::text[], passing_through = $4,
            revision = revision + 1, updated_at = NOW()
        WHERE member_id = $1 AND revision = $5
        RETURNING version, center_ids, shortcut_ids, passing_through, revision`, params);
  return result.rows[0]
    ? { kind: 'saved', snapshot: snapshot(memberId, eligible, result.rows[0]) }
    : { kind: 'conflict' };
}
