import { keepRefusal } from '@/lib/sanctuary/studioPosture';
import { saveLetter } from '@/lib/writersStudio/letter/letterStore';
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { synthesizeAttentionMap } from '@/lib/writersStudio/studio/synthesizeAttentionMap';
import { composeOpening, openingFields } from '@/lib/writersStudio/studio/letterOpening';

export const dynamic = 'force-dynamic';

const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string' && x.length > 0);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: manuscriptId } = await params;

  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  if (!strings(body.readingIds) || typeof body.request !== 'string') {
    return NextResponse.json({ error: 'readingIds_and_request_required' }, { status: 400 });
  }
  const synthesis = await synthesizeAttentionMap(memberId, manuscriptId, body.readingIds, body.request);
  if (!synthesis.ok) {
    return NextResponse.json(
      synthesis.detail !== undefined ? { error: synthesis.error, detail: synthesis.detail } : { error: synthesis.error },
      { status: synthesis.status },
    );
  }
  const { deepMode, revisionNumber, readingIds } = synthesis;
  const map = { ...synthesis.map };

  /* WS-RELATIONAL-ARCHITECTURE step 2: a whole-book editorial pass is kept as MAIA's letter for this Work, so it is there when the
     writer comes back, on any device. Only this route writes a letter, and only from the map it just built. It is kept only when the
     writer asked for it to be kept (keepAsLetter) AND the keep gate allows it: in Sanctuary, or with the posture unreadable, the pass
     is still returned and simply not kept. */
  let letterId: string | null = null;
  let letterKept: 'kept' | 'not_asked' | 'sanctuary_not_kept' | 'posture_undeclared' = 'not_asked';
  if (deepMode && body.keepAsLetter === true) {
    const refused = await keepRefusal(memberId, body);
    if (refused) letterKept = refused.body.refusal;
    else {
      const opening = await composeOpening(memberId, manuscriptId, readingIds);
      letterId = await saveLetter(memberId, manuscriptId, revisionNumber, { ...map, ...openingFields(opening) });
      Object.assign(map, openingFields(opening));
      letterKept = 'kept';
    }
  }

  return NextResponse.json({
    map,
    letterId,
    letterKept,
    provenance: { ...synthesis.provenance, readingIds },
  });
}
