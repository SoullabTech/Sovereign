/**
 * D5 — THE ONE NARROW, FOUNDER-RULED EXCEPTION (2026-11-08): a writer's DISMISSAL of an observation may be carried to MAIA's
 * conversations (the Work conversation and the passage desk) so that she does not offer it again unprompted.
 *
 * Narrowness is structural, and `standingOutsideCognition.test.ts` enforces each part:
 *   · READ-ONLY — no INSERT/UPDATE/DELETE.
 *   · ONLY `dismiss` — `keep` is not a refusal and `unresolved` is explicitly open; neither is selected.
 *   · ONE importer — `lib/writersStudio/decisionRecord.ts`.
 *   · No other standing module is imported (not the store, no values from the contract).
 * The text carried is MAIA's own earlier observation (named as hers), never the writer's words, never restated as true: setting an
 * observation aside does not mean it is false. ⛔ This module is not a precedent for any other standing value.
 *
 * Founder ruling 2026-11-09 ("Yes, as recommended", G6 × D5): the same narrow read also tells the carried-readings loader WHICH
 * observations in the readings it is about to carry were dismissed, so they are left out there and reach MAIA only through the
 * read above, as set aside. Still read-only, still only `dismiss`, still one importer; bounded to the readings being carried.
 */
import { query } from '@/lib/db/postgres';

const isUndefinedTable = (e: unknown) => (e as { code?: string })?.code === '42P01';

export async function loadDismissedObservations(memberId: string, manuscriptId: string): Promise<string[]> {
  try {
    const r = await query<{ observation: string }>(
      `SELECT o->>'observation' AS observation
         FROM (SELECT DISTINCT ON (reading_id, observation_key) reading_id, observation_key, standing, event_index
                 FROM developmental_observation_standing_events
                WHERE member_id = $1
                ORDER BY reading_id, observation_key, event_index DESC) s
         JOIN developmental_readings r ON r.id = s.reading_id AND r.member_id = $1 AND r.manuscript_id = $2
         CROSS JOIN LATERAL jsonb_array_elements(r.observations) o
        WHERE s.standing = 'dismiss' AND o->>'key' = s.observation_key
        ORDER BY r.frozen_at DESC, s.observation_key
        LIMIT 12`, [memberId, manuscriptId]);
    return r.rows.map((x) => x.observation)
      .filter((x): x is string => typeof x === 'string' && x.length > 0).map((x) => x.slice(0, 300));
  } catch (e) {
    if (isUndefinedTable(e)) return [];
    throw e;
  }
}

/** `${readingId}:${observationKey}` for every observation in these readings whose current standing is a dismissal. */
export async function loadDismissedKeysIn(memberId: string, readingIds: readonly string[]): Promise<string[]> {
  if (readingIds.length === 0) return [];
  try {
    const r = await query<{ reading_id: string; observation_key: string }>(
      `SELECT s.reading_id, s.observation_key
         FROM (SELECT DISTINCT ON (reading_id, observation_key) reading_id, observation_key, standing, event_index
                 FROM developmental_observation_standing_events
                WHERE member_id = $1 AND reading_id = ANY($2::uuid[])
                ORDER BY reading_id, observation_key, event_index DESC) s
        WHERE s.standing = 'dismiss'`, [memberId, [...readingIds]]);
    return r.rows.map((x) => `${x.reading_id}:${x.observation_key}`);
  } catch (e) {
    if (isUndefinedTable(e)) return [];
    throw e;
  }
}
