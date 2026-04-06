export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL AVAILABILITY API
 *
 * Returns available time slots for booking.
 * Uses the consolidated slot calculator.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getAvailableSlots } from '@/lib/scheduling/slotCalculator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ slots: [] });
  }
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('service') || undefined;

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Get practitioner
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitionerId = practitionerResult.rows[0].id;

    const slots = await getAvailableSlots({
      practitionerId,
      date: dateStr,
      serviceId,
    });

    return NextResponse.json({
      slots: slots.map((s) => ({ start: s.start, end: s.end, available: true })),
    });
  } catch (error) {
    console.error('Portal availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
