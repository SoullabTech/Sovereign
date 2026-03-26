export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL AVAILABILITY API
 *
 * Returns available time slots for public booking.
 * Delegates to shared calculateAvailability engine.
 *
 * Query params:
 *   date    — YYYY-MM-DD (single day mode, backward compat)
 *   service — service UUID (optional, used for duration lookup)
 *   start   — YYYY-MM-DD range start (range mode)
 *   end     — YYYY-MM-DD range end (range mode)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import {
  calculateAvailability,
  loadAvailabilityInputs,
  type GoogleBusyBlock,
} from '@/lib/availability/calculateAvailability';
import { getEventsInRange } from '@/lib/calendar/GoogleCalendarService';

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

    // Support both single-date (backward compat) and range modes
    const dateStr = searchParams.get('date');
    const rangeStart = searchParams.get('start') || dateStr;
    const rangeEnd = searchParams.get('end') || dateStr;
    const serviceId = searchParams.get('service');

    if (!rangeStart) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Get practitioner
    const practitionerResult = await db.query(
      `SELECT id, member_id FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug],
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitionerId = practitionerResult.rows[0].id;
    const memberId = practitionerResult.rows[0].member_id;

    // Get service duration
    let duration = 60;
    if (serviceId) {
      const serviceResult = await db.query(
        `SELECT duration_minutes FROM services WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
        [serviceId, practitionerId],
      );
      if (serviceResult.rows.length > 0) {
        duration = serviceResult.rows[0].duration_minutes;
      }
    }

    // Load all availability data from shared engine
    const loaded = await loadAvailabilityInputs({
      practitionerId,
      rangeStart: rangeStart!,
      rangeEnd: rangeEnd || rangeStart!,
    });

    // Fetch Google Calendar busy blocks (graceful skip if not connected)
    let googleBusyBlocks: GoogleBusyBlock[] = [];
    if (memberId) {
      try {
        const events = await getEventsInRange(
          memberId,
          new Date(`${rangeStart}T00:00:00.000Z`),
          new Date(`${rangeEnd || rangeStart}T23:59:59.999Z`),
        );
        googleBusyBlocks = events.map(e => ({
          start: new Date(e.start.dateTime || e.start.date || '').toISOString(),
          end: new Date(e.end.dateTime || e.end.date || '').toISOString(),
        }));
      } catch {
        // Google Calendar not connected — continue without
      }
    }

    const slots = calculateAvailability({
      practitionerId,
      serviceDurationMinutes: duration,
      rangeStart: rangeStart!,
      rangeEnd: rangeEnd || rangeStart!,
      settings: loaded.settings,
      weeklyAvailability: loaded.weeklyAvailability,
      overrides: loaded.overrides,
      existingSessions: loaded.existingSessions,
      googleBusyBlocks,
    });

    // Map to portal API contract (backward compatible with existing frontend)
    // Old format: { start: "10:00", end: "11:00", available: true }
    // New format adds ISO timestamps for timezone-aware clients
    const mappedSlots = slots.map(s => ({
      start: s.displayTime,
      end: (() => {
        // Calculate end display time
        const endDate = new Date(s.end);
        const fmt = new Intl.DateTimeFormat('en-CA', {
          timeZone: loaded.settings.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const parts = fmt.formatToParts(endDate);
        const hourPart = parts.find(p => p.type === 'hour')?.value ?? '00';
        const minutePart = parts.find(p => p.type === 'minute')?.value ?? '00';
        return `${hourPart === '24' ? '00' : hourPart}:${minutePart}`;
      })(),
      available: true,
      // Enhanced fields for new clients
      startUtc: s.start,
      endUtc: s.end,
      displayDate: s.displayDate,
    }));

    return NextResponse.json({
      slots: mappedSlots,
      timezone: loaded.settings.timezone,
    });
  } catch (error) {
    console.error('Portal availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
