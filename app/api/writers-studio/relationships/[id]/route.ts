import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { readEditorialRelationshipCustody } from '@/lib/writers-studio/relationshipCustody';

export const dynamic = 'force-dynamic';

const enabled = () =>
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'
  || process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const relationship = await readEditorialRelationshipCustody(memberId, id);
  if (!relationship) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  // This is an ACTIVE relationship door, never an implicit archive/share grant.
  // The private custody service retains historical metadata; the mounted client
  // treats 2xx as usable, so an inactive parent must fail closed at HTTP level.
  if (!relationship.active) {
    return NextResponse.json(
      { error: 'relationship_inactive', active: false },
      { status: 409, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json(relationship);
}
