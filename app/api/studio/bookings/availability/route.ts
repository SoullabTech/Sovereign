export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY API
 *
 * Returns available time slots for booking.
 * Uses the consolidated slot calculator.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { getAvailableSlotsRange } from '@/lib/scheduling/slotCalculator';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const durationMinutes = parseInt(searchParams.get('duration') || '60');
    const serviceId = searchParams.get('serviceId') || undefined;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to dates are required' },
        { status: 400 }
      );
    }

    const slotsByDate = await getAvailableSlotsRange({
      practitionerId,
      from,
      to,
      serviceId,
      durationMinutes: serviceId ? undefined : durationMinutes,
    });

    // Flatten to the format the studio calendar expects
    const slots = Object.entries(slotsByDate).flatMap(([, daySlots]) =>
      daySlots.map((s) => ({
        startAt: s.startISO || s.start,
        endAt: s.endISO || s.end,
        available: true,
      }))
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[Studio Availability] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
