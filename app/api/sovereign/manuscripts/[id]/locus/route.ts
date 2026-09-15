/**
 * RETURN-LOCUS-01 · WHERE THIS WORK WAS LAST TOUCHED.
 *
 * GET → { kind: 'distinct', sectionId, at } | { kind: 'undifferentiated', at, among } | { kind: 'none' }
 *
 * ⭐ A read, and only a read. It writes nothing, records no navigation, and
 * creates no memory of the member — the facts it returns were already durable
 * before this route existed.
 *
 * ⛔ THE DISCRIMINATION IS NOT MADE HERE. `readSectionActivity` owns the tie
 * rule; this route is a door to it. A second place deciding what counts as a
 * place is exactly how the rule would drift into ranking.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readSectionActivity } from '@/lib/writersStudio/sectionActivity';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const { id } = await params;
  /* ⛔ Member scope lives in the read's own SQL, so an unknown manuscript and
     another member's are one answer — `{ kind: 'none' }`, which is also the
     truthful answer for a Work that simply has no sections yet. */
  return NextResponse.json(await readSectionActivity(memberId, id));
}
