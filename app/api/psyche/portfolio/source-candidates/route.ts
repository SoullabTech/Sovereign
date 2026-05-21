/**
 * GET /api/psyche/portfolio/source-candidates
 *
 * Read candidates from a source surface that the member could choose to keep.
 *
 * Query parameter:
 *   ?sourceType=idea | idea_block | journal | dream | reflection |
 *               decision | change | session_excerpt
 *
 * 'spontaneous' is not valid here — spontaneous atoms are created directly
 * via POST /api/psyche/portfolio/keep, since they have no pre-existing source.
 *
 * Each candidate includes `alreadyKept` so the UI can mark what's already
 * in the portfolio.
 *
 * Phase 1 bridges `idea` and `idea_block` live. Others return empty arrays
 * until their source tables exist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listSourceCandidates } from '@/lib/psyche/portfolio';
import type { MemoryAtomSourceType } from '@/lib/psyche/types';

const VALID_CANDIDATE_SOURCE_TYPES = new Set<MemoryAtomSourceType>([
  'idea', 'idea_block', 'journal', 'dream', 'reflection',
  'decision', 'change', 'session_excerpt',
  // 'spontaneous' deliberately excluded — has no candidate surface
]);

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const sourceType = request.nextUrl.searchParams.get('sourceType');
  if (!sourceType || !VALID_CANDIDATE_SOURCE_TYPES.has(sourceType as MemoryAtomSourceType)) {
    return NextResponse.json({
      error: 'Valid sourceType required (idea | idea_block | journal | dream | reflection | decision | change | session_excerpt)',
    }, { status: 400 });
  }

  try {
    const candidates = await listSourceCandidates(memberId, sourceType as MemoryAtomSourceType);
    return NextResponse.json({ candidates });
  } catch (err) {
    console.error('[GET /api/psyche/portfolio/source-candidates]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
