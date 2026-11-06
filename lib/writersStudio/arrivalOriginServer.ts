/**
 * Server side of the arrival framing (see `arrivalOrigin.ts`): resolve a client's
 * reference to the observation in the member's own frozen reading.
 *
 * ⛔ Every lookup is scoped by member. A reading of someone else's Work, a reading of a
 * different Work from the thread's, and an unknown observation key all resolve to null,
 * and are indistinguishable from one another.
 */

import { query } from '@/lib/db/postgres';
import { loadLiveWork } from '@/lib/manuscript/development/capture';
import { assessReading } from '@/lib/manuscript/developmentalReading/assess';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import { arrivalOriginFromReading, type ArrivalOrigin, type ArrivalOriginRef } from './arrivalOrigin';

/** Current section labels, member-scoped in the query. The same query the reading route
 *  uses; kept here because the reading unit's import surface is guarded. */
async function currentSections(manuscriptId: string, memberId: string) {
  const r = await query<{ id: string; heading: string | null }>(
    `SELECT s.id, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
      ORDER BY s.position ASC`,
    [manuscriptId, memberId]);
  return r.rows;
}

export async function resolveArrivalOrigin(input: {
  memberId: string;
  threadId: string;
  ref: ArrivalOriginRef;
}): Promise<ArrivalOrigin | null> {
  const thread = await query<{ manuscript_id: string }>(
    'SELECT manuscript_id FROM ask_threads WHERE id = $1 AND member_id = $2',
    [input.threadId, input.memberId]);
  const manuscriptId = thread.rows[0]?.manuscript_id;
  if (!manuscriptId) return null;

  const reading = await loadReading(input.ref.readingId, input.memberId);
  if (!reading || reading.manuscriptId !== manuscriptId) return null;

  const [now, sections] = await Promise.all([
    loadLiveWork(manuscriptId, input.memberId),
    currentSections(manuscriptId, input.memberId),
  ]);
  return arrivalOriginFromReading(
    input.ref.source, reading, assessReading(reading, now), sections, input.ref.observationKey);
}
