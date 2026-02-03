/**
 * MICROSOFT CALENDAR DISCONNECT
 *
 * POST: Disconnect Microsoft calendar integration
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

    const success = await MicrosoftGraphService.disconnect(memberId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Microsoft Disconnect] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
