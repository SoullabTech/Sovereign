export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * EVENT REGISTRATION API
 *
 * POST /api/events/[slug]/register
 *
 * Register an attendee for an event.
 * - Signed-in members: member_id is attached automatically.
 * - Anonymous: email-only capture; member_id = NULL.
 *
 * Body: { email: string, fullName?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, registerAttendee } from '@/lib/events/eventService';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

interface RegisterBody {
  email: string;
  fullName?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ success: false });
  }

  try {
    const { slug } = await params;
    const body: RegisterBody = await request.json();
    const { email, fullName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(slug);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status !== 'open') {
      return NextResponse.json(
        { error: 'This event is not currently accepting registrations' },
        { status: 400 }
      );
    }

    if (event.visibility === 'private') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Attach member_id if the caller is signed in
    const memberId = await getMemberIdFromRequest(request);

    const attendee = await registerAttendee({
      eventId: event.id,
      memberId,
      email,
      fullName: fullName ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        attendee: {
          id: attendee.id,
          event_id: attendee.event_id,
          member_id: attendee.member_id,
          email: attendee.email,
          status: attendee.status,
        },
        needsAccount: !memberId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Event registration error:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
