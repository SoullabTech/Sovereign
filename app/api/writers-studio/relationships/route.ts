import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { createEditorialRelationshipCustody, listEditorialRelationshipCustody } from '@/lib/writers-studio/relationshipCustody';

export const dynamic = 'force-dynamic';

const enabled = () =>
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'
  || process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1';

export async function POST(req: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  const keys = Object.keys(body).sort().join(',');
  if (keys !== 'livingWorkId,manuscriptId') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const livingWorkId = typeof body.livingWorkId === 'string' && body.livingWorkId.length > 0
    ? body.livingWorkId : null;
  const manuscriptId = typeof body.manuscriptId === 'string' && body.manuscriptId.length > 0
    ? body.manuscriptId : null;

  if (!livingWorkId || !manuscriptId) {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const created = await createEditorialRelationshipCustody({
    memberId, livingWorkId, manuscriptId,
  });
  if (!created.ok) {
    const status = created.reason === 'work_not_owned' || created.reason === 'manuscript_not_owned'
      ? 404 : 409;
    return NextResponse.json({ error: created.reason }, { status });
  }
  return NextResponse.json({ relationship: created.relationship }, { status: 201 });
}


export async function GET(req: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const livingWorkId = req.nextUrl.searchParams.get('livingWorkId');
  const manuscriptId = req.nextUrl.searchParams.get('manuscriptId');
  if (!livingWorkId || !manuscriptId) {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const relationships = await listEditorialRelationshipCustody({
    memberId, livingWorkId, manuscriptId,
  });
  return NextResponse.json({ relationships });
}
