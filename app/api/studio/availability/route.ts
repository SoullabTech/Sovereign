export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY CRUD
 *
 * GET  — fetch weekly rules + overrides + booking settings
 * PUT  — bulk update weekly rules + booking settings
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

async function getPractitionerIdForMember(memberId: string): Promise<string | null> {
  const result = await db.query(
    `SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'`,
    [memberId],
  );
  return result.rows[0]?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const [weeklyResult, overridesResult, settingsResult] = await Promise.all([
      db.query(
        `SELECT id, day_of_week, start_time::text, end_time::text, is_available
         FROM practitioner_availability
         WHERE practitioner_id = $1
         ORDER BY day_of_week, start_time`,
        [practitionerId],
      ),
      db.query(
        `SELECT id, override_date::text, is_available, start_time::text, end_time::text, reason
         FROM availability_overrides
         WHERE practitioner_id = $1
         ORDER BY override_date`,
        [practitionerId],
      ),
      db.query(
        `SELECT timezone, buffer_between_sessions, booking_advance_days,
                COALESCE(min_notice_hours, 2) as min_notice_hours,
                booking_enabled, cancellation_policy
         FROM practitioner_settings
         WHERE practitioner_id = $1`,
        [practitionerId],
      ),
    ]);

    return NextResponse.json({
      weeklyAvailability: weeklyResult.rows,
      overrides: overridesResult.rows,
      settings: settingsResult.rows[0] ?? {
        timezone: 'America/New_York',
        buffer_between_sessions: 15,
        booking_advance_days: 30,
        min_notice_hours: 2,
        booking_enabled: false,
        cancellation_policy: '',
      },
    });
  } catch (error) {
    console.error('[Studio Availability] GET error:', error);
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { weeklyAvailability, settings } = body;

    // Bulk replace weekly availability rules
    if (Array.isArray(weeklyAvailability)) {
      await db.query(
        `DELETE FROM practitioner_availability WHERE practitioner_id = $1`,
        [practitionerId],
      );

      if (weeklyAvailability.length > 0) {
        const values: string[] = [];
        const params: (string | number | boolean)[] = [practitionerId];
        let paramIdx = 2;

        for (const row of weeklyAvailability) {
          values.push(`($1, $${paramIdx}, $${paramIdx + 1}::time, $${paramIdx + 2}::time, $${paramIdx + 3})`);
          params.push(row.day_of_week, row.start_time, row.end_time, row.is_available ?? true);
          paramIdx += 4;
        }

        await db.query(
          `INSERT INTO practitioner_availability (practitioner_id, day_of_week, start_time, end_time, is_available)
           VALUES ${values.join(', ')}`,
          params,
        );
      }
    }

    // Update booking settings
    if (settings) {
      await db.query(
        `INSERT INTO practitioner_settings (practitioner_id, timezone, buffer_between_sessions, booking_advance_days, min_notice_hours, booking_enabled, cancellation_policy)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (practitioner_id) DO UPDATE SET
           timezone = EXCLUDED.timezone,
           buffer_between_sessions = EXCLUDED.buffer_between_sessions,
           booking_advance_days = EXCLUDED.booking_advance_days,
           min_notice_hours = EXCLUDED.min_notice_hours,
           booking_enabled = EXCLUDED.booking_enabled,
           cancellation_policy = EXCLUDED.cancellation_policy,
           updated_at = NOW()`,
        [
          practitionerId,
          settings.timezone ?? 'America/New_York',
          settings.buffer_between_sessions ?? 15,
          settings.booking_advance_days ?? 30,
          settings.min_notice_hours ?? 2,
          settings.booking_enabled ?? false,
          settings.cancellation_policy ?? '',
        ],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Availability] PUT error:', error);
    return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
  }
}
