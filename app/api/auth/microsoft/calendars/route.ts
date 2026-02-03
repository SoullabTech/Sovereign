/**
 * MICROSOFT CALENDARS LIST
 *
 * GET: List member's Microsoft calendars
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { MicrosoftGraphService } from '@/lib/calendar/MicrosoftGraphService';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await MicrosoftGraphService.isConnected(memberId);
    if (!connected) {
      return NextResponse.json(
        { error: 'Microsoft calendar not connected' },
        { status: 400 }
      );
    }

    const calendars = await MicrosoftGraphService.listCalendars(memberId);

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('[Microsoft Calendars] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
