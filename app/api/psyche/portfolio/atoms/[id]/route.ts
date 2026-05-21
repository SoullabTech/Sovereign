/**
 * GET /api/psyche/portfolio/atoms/[id]
 *
 * Read a single kept atom.
 *
 * Per portfolio service discipline: reads may query, writes must gesture.
 * This route is READ-ONLY. No PATCH, no DELETE, no generic mutation.
 * To modify an atom, use POST /api/psyche/portfolio/atoms/[id]/gesture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getAtom } from '@/lib/psyche/portfolio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Atom id required' }, { status: 400 });
  }

  try {
    const atom = await getAtom(memberId, id);
    if (!atom) {
      return NextResponse.json({ error: 'Atom not found' }, { status: 404 });
    }
    return NextResponse.json({ atom });
  } catch (err) {
    console.error('[GET /api/psyche/portfolio/atoms/[id]]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
