/**
 * Astrology Context API
 *
 * GET - Retrieve MAIA-ready astrology context for a member
 *
 * Returns a distilled payload suitable for MAIA + Journey:
 * - Big Three (Sun, Moon, Rising)
 * - Elemental balance
 * - Consent status
 *
 * /api/astrology/context
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAstrologyContext } from '@/lib/astrology/astrologyService';

export const dynamic = 'force-dynamic';

function getMemberId(request: NextRequest): string | null {
  return request.headers.get('x-member-id') ||
    request.cookies.get('member_id')?.value ||
    null;
}

export async function GET(request: NextRequest) {
  try {
    const memberId = getMemberId(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const context = await getAstrologyContext(memberId);

    return NextResponse.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('[Astrology] Get context error:', error);
    return NextResponse.json(
      { error: 'Failed to get astrology context' },
      { status: 500 }
    );
  }
}
