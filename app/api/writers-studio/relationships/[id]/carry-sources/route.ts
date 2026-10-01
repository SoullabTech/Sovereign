import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { listEligiblePriorMaiaEditorialCarrySources } from '@/lib/writers-studio/relationshipCarriage';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const receiverThreadId = req.nextUrl.searchParams.get('receiverThreadId');
  if (!receiverThreadId) {
    return NextResponse.json({ error: 'receiverThreadId_required' }, { status: 400 });
  }

  const out = await listEligiblePriorMaiaEditorialCarrySources({
    memberId,
    relationshipId: id,
    receiverThreadId,
  });
  if (!out.ok) {
    if (out.reason === 'relationship_not_found') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: out.reason }, { status: 409 });
  }
  return NextResponse.json({
    relationshipId: out.relationshipId,
    receiverThreadId: out.receiverThreadId,
    sources: out.sources,
  });
}
