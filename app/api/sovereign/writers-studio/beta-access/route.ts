import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';

export const dynamic = 'force-dynamic';
const privateHeaders = {
  'Cache-Control': 'private, no-store',
  Vary: 'Cookie, x-session-token',
};

export async function GET(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json(
        { error: 'unauthenticated' },
        { status: 401, headers: privateHeaders },
      );
    }
    return NextResponse.json(
      await writersStudioBetaAccess(memberId),
      { headers: privateHeaders },
    );
  } catch {
    return NextResponse.json(
      { error: 'beta_access_unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
