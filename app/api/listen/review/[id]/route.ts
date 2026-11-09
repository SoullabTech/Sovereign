// DELETE /api/listen/review/[id] — a reviewer deletes one of their own reviews. Hard delete.
// Another member's review id is indistinguishable from a missing one (404).
import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireListenReviewer } from '@/lib/listening/listenReviewerGate';
import { isUuid } from '@/lib/listening/soundStudioReview';

export const dynamic = 'force-dynamic';
const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const gate = await requireListenReviewer();
  if (!gate.ok) return new NextResponse(null, { status: gate.status, headers: NO_STORE });
  const { id } = await context.params;
  if (!isUuid(id)) return new NextResponse(null, { status: 404, headers: NO_STORE });
  const result = await query(
    'DELETE FROM sound_studio_reviews WHERE id = $1 AND member_id = $2',
    [id, gate.memberId],
  );
  if (!result.rowCount) return new NextResponse(null, { status: 404, headers: NO_STORE });
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}
