/**
 * BUILD-07D — DEVELOP SURFACE · one frozen reading, by identity.
 *
 * Returns the reading exactly as stored (07C: never corrected in place), the
 * three-state assessment of where each observation stands against the Work
 * as it is NOW (07C `assessReading` over 07A `loadLiveWork` — nothing is
 * re-anchored), and the current sections' ids and headings so the surface can
 * label evidence. The reading's own identity and observation keys are the
 * only identities in the payload; the surface mints none.
 *
 * GET only. There is no PUT, PATCH or DELETE on a reading, here or anywhere.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { loadLiveWork } from '@/lib/manuscript/development/capture';
import { assessReading } from '@/lib/manuscript/developmentalReading/assess';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Current sections with the member's own headings, for labels. Ownership is IN the query. */
async function currentSections(manuscriptId: string, memberId: string) {
  const r = await query<{ id: string; position: number; heading: string | null }>(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
      ORDER BY s.position ASC`,
    [manuscriptId, memberId]);
  return r.rows;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; readingId: string }> },
) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  const { id: manuscriptId, readingId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!UUID.test(readingId)) return NextResponse.json({ refusal: 'not_found' }, { status: 404 });

  /* Scoped by member in the store; a reading of someone else's Work is
     indistinguishable from one that does not exist. The manuscript in the
     path must be the reading's own — a reading is not addressable under a
     different Work. */
  const reading = await loadReading(readingId, memberId);
  if (!reading || reading.manuscriptId !== manuscriptId) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const [now, sections] = await Promise.all([
    loadLiveWork(manuscriptId, memberId),
    currentSections(manuscriptId, memberId),
  ]);
  const assessment = assessReading(reading, now);

  return NextResponse.json({ reading, assessment, sections });
}
