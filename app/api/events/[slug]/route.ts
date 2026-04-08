export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PUBLIC EVENT API
 *
 * GET /api/events/[slug]
 *
 * Returns public event details if:
 *   - visibility = 'public', OR
 *   - visibility = 'invite_only' (still accessible via direct link)
 *
 * Does NOT return 'private' events to unauthenticated requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug } from '@/lib/events/eventService';
import db from '@/lib/db/postgres';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ event: null });
  }

  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.visibility === 'private') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.status === 'draft' || event.status === 'archived') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fetch practitioner display info for the landing page
    const practResult = await db.query<{
      name: string;
      business_name: string | null;
      tagline: string | null;
      photo_url: string | null;
      slug: string;
    }>(
      `SELECT name, business_name, tagline, photo_url, slug
       FROM practitioners
       WHERE id = $1`,
      [event.practitioner_id]
    );
    const practitioner = practResult.rows[0] ?? null;

    return NextResponse.json({
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        location_type: event.location_type,
        location_details: event.location_details,
        start_date: event.start_date,
        end_date: event.end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        timezone: event.timezone,
        capacity: event.capacity,
        price_cents: event.price_cents,
        currency: event.currency,
        requires_application: event.requires_application,
      },
      practitioner,
    });
  } catch (error) {
    console.error('Public event fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
