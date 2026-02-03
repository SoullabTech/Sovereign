/**
 * CLIENT SIGN OUT API
 *
 * Clears the client portal session cookie.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { clearClientSession } from '@/lib/auth/clientSession';

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const res = NextResponse.json({
    ok: true,
    message: 'Signed out successfully',
  });

  clearClientSession(res);

  return res;
}
