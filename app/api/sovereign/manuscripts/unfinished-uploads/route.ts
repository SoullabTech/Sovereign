// Production web requires force-dynamic for runtime database access / auth.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * What is held for the signed-in member that is not part of a Work (D3).
 *
 * GET → { items: [{ id, kind: 'incomplete' | 'unclaimed', createdAt, filename, bytes }] }
 *
 * An upload that never finished, or an original that was recorded but never attached to a Work, leaves an encrypted
 * file and its key in the member's custody with nothing on screen that says so. This is the read half of the door that
 * lets the member see it and remove it (the write half is ./discard).
 *
 * Content-free by construction: no extracted text, no key material, no storage path. The only member-authored string
 * is the filename of an original the member themselves uploaded.
 *
 * Deliberately NOT gated on the release manifest, the pilot roster or Sanctuary posture. Those gates control whether a
 * member may PUT something into custody. They must never stand between a member and seeing, or removing, what is
 * already held for them: a member who has left the pilot, or who is in Sanctuary, keeps this door. Identity is the one
 * requirement, and the ordinary middleware path (this route is NOT excluded from the matcher) has already verified it.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listMemberUnfinishedUploads } from '@/lib/manuscript/source/discardIncompleteLanding';
import { memberRef } from '@/lib/privacy/memberRef';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const items = await listMemberUnfinishedUploads(memberId);
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    // Name and member reference only: never the error object, which can carry SQL text and parameters.
    console.error('[MAIA/press] unfinished uploads list failed', {
      memberRef: memberRef(memberId),
      name: error instanceof Error ? error.name : 'unknown',
    });
    return NextResponse.json({ error: 'unfinished_uploads_unavailable' }, { status: 500 });
  }
}
