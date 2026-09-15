/**
 * RETURN-RELATIONSHIP · PHASE B — the relationships already open on a passage.
 *
 *   GET  ?sectionId=<uuid>
 *
 * ⭐ Same posture as every other editorial route: ⛔ off by default and 404 —
 * not 403 — ⛔ verified identity only, ⛔ the caller names a section and nothing
 * else.
 *
 * ⛔ THIS ROUTE CHOOSES NOTHING. It returns every relationship on that passage,
 * in a presentation order that marks none of them. The decision — resume the
 * one, or let the writer pick among several — is
 * `observationDialogueResume.resumeDecision`, and it is made where the writer
 * is.
 *
 * ⛔ AND A FAILURE HERE IS NEVER "THERE ARE NONE". The surface treats an
 * unavailable discovery as unavailable, because rounding it to none does not
 * merely mislead — the next question would open a second relationship beside
 * the one it was about to resume.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { editorialRelationshipsForSection } from '@/lib/manuscript/editorialRuntime/relationships';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

export async function GET(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const sectionId = request.nextUrl.searchParams.get('sectionId');
  if (!sectionId) {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 });
  }

  const relationships = await editorialRelationshipsForSection(identity, sectionId);
  /* ⭐ Whole, and unranked. ⛔ No `mostRecent`, no `suggested`, no `default`. */
  return NextResponse.json({ relationships });
}
