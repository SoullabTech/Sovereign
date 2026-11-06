import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { HOUSE_PLACES, type HousePlaceId } from '@/lib/house/catalog';
import { defaultHousePreferences, type HousePreferenceSnapshot } from '@/lib/house/preferences';
import { housePreferenceTag } from '@/lib/house/preferencesStore';
import { cabinStore } from '@/lib/cabin/request';

/** Loaders shared by the House home (/house, /home) and All places (/house/places). */
export async function memberForHouse() {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      const member = store.ensureLocalMember();
      return {
        id: member.id,
        name: member.preferredName || member.name || 'there',
      };
    } finally {
      store.close();
    }
  }

  let memberId: string;
  try { memberId = await requireMemberId(); }
  catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return null;
    throw error;
  }
  const result = await query('SELECT id, name FROM members WHERE id = $1', [memberId]);
  return (result.rows[0] as { id: string; name: string } | undefined) ?? null;
}

export async function livingWorksForHouse(memberId: string) {
  if (process.env.MAIA_CABIN_MODE === 'offline') {
    const store = cabinStore();
    try {
      return store.listWorks(memberId)
        .slice(0, 2)
        .map((work) => ({ id: work.id, title: work.title }));
    } finally {
      store.close();
    }
  }

  const r = await query(
    `SELECT id, title FROM living_works
     WHERE member_id = $1
     ORDER BY updated_at DESC
     LIMIT 2`,
    [memberId],
  );
  return r.rows as { id: string; title: string | null }[];
}

export function cabinHousePreferences(memberId: string): HousePreferenceSnapshot {
  const eligibleIds = HOUSE_PLACES.map((place) => place.id) as HousePlaceId[];
  const store = cabinStore();
  try {
    const saved = store.readHousePreferences(memberId);
    const preferences = saved
      ? {
          version: 1 as const,
          center: saved.center as HousePlaceId[],
          shortcuts: saved.shortcuts as HousePlaceId[],
          passingThrough: saved.passingThrough,
        }
      : defaultHousePreferences(eligibleIds);

    const revision = saved?.revision ?? 0;
    return {
      preferences,
      revision,
      eligibleIds,
      tag: housePreferenceTag(memberId, revision),
    };
  } finally {
    store.close();
  }
}
