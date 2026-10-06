import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  currentCompletionDimensions,
  recordCompletionDimension,
} from '@/lib/writersStudio/workCompletionServer';
import type { CompletionDimensionId } from '@/lib/writersStudio/workCompletion';

export const dynamic = 'force-dynamic';

const IDS = new Set<CompletionDimensionId>([
  'editorial-integrity',
  'continuity',
  'recovery',
  'source-provenance',
  'permissions-rights',
  'page-proof',
  'front-back-matter',
  'publication-target',
]);
const STANDINGS = new Set(['clear','open','blocked']);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: manuscriptId } = await params;
  return NextResponse.json({
    dimensions: await currentCompletionDimensions(memberId, manuscriptId),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: manuscriptId } = await params;
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['dimension','standing','note']);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const dimension = typeof body.dimension === 'string' ? body.dimension as CompletionDimensionId : null;
  const standing = typeof body.standing === 'string' ? body.standing : null;
  const note = body.note == null ? null : typeof body.note === 'string' ? body.note : null;
  if (!dimension || !IDS.has(dimension) || !standing || !STANDINGS.has(standing)
    || (note !== null && note.length > 2000)) {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

  const result = await recordCompletionDimension({
    memberId, manuscriptId, dimension,
    standing: standing as 'clear' | 'open' | 'blocked',
    note,
  });
  if (!result.ok) {
    if (result.reason === 'not_found') return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
    return NextResponse.json({ refusal: 'completion_substrate_not_ready' }, { status: 503 });
  }
  return NextResponse.json({ dimension: result.dimension });
}
