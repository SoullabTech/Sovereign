/**
 * MICROSOFT CALENDAR CONNECT
 *
 * POST: Generate OAuth authorization URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { MicrosoftGraphService } from '@/lib/calendar/MicrosoftGraphService';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = MicrosoftGraphService.getAuthUrl(memberId);

    if (!authUrl) {
      return NextResponse.json(
        { error: 'Microsoft integration not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('[Microsoft Connect] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
