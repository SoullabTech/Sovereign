export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY API
 *
 * GET  — List weekly availability windows + date overrides
 * POST — Upsert weekly availability windows (bulk replace)
 * PUT  — Add or update a date override
 * DELETE — Remove a date override
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

// ── GET — list availability ────────────────────────────────

export async function GET(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [windowsResult, overridesResult] = await Promise.all([
      db.query(
        `SELECT id, day_of_week, start_time, end_time, is_available
         FROM practitioner_availability
         WHERE practitioner_id = $1
         ORDER BY day_of_week, start_time`,
        [identity.practitionerId]
      ),
      db.query(
        // DB column is `is_available` (true = open, false = blocked); the API
        // contract exposes `is_blocked`, so invert on the way out. Format the
        // DATE as a plain YYYY-MM-DD string so the client parses it without a
        // timezone shift (pg returns DATE as a TZ-offset Date object otherwise).
        `SELECT id, to_char(override_date, 'YYYY-MM-DD') AS override_date, (NOT is_available) AS is_blocked, start_time, end_time, reason
         FROM availability_overrides
         WHERE practitioner_id = $1 AND override_date >= CURRENT_DATE
         ORDER BY override_date`,
        [identity.practitionerId]
      ),
    ]);

    return NextResponse.json({
      windows: windowsResult.rows,
      overrides: overridesResult.rows,
    });
  } catch (error) {
    console.error('[Studio Availability] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

// ── POST — bulk upsert weekly windows ──────────────────────

interface WindowInput {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function POST(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const windows: WindowInput[] = body.windows;

    if (!Array.isArray(windows)) {
      return NextResponse.json({ error: 'windows array required' }, { status: 400 });
    }

    // Validate
    for (const w of windows) {
      if (w.day_of_week < 0 || w.day_of_week > 6) {
        return NextResponse.json({ error: `Invalid day_of_week: ${w.day_of_week}` }, { status: 400 });
      }
      if (!w.start_time || !w.end_time) {
        return NextResponse.json({ error: 'start_time and end_time required' }, { status: 400 });
      }
    }

    // Delete existing windows and insert new ones
    await db.query(
      `DELETE FROM practitioner_availability WHERE practitioner_id = $1`,
      [identity.practitionerId]
    );

    for (const w of windows) {
      await db.query(
        `INSERT INTO practitioner_availability
         (practitioner_id, day_of_week, start_time, end_time, is_available)
         VALUES ($1, $2, $3, $4, $5)`,
        [identity.practitionerId, w.day_of_week, w.start_time, w.end_time, w.is_available]
      );
    }

    return NextResponse.json({ success: true, count: windows.length });
  } catch (error) {
    console.error('[Studio Availability] POST error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

// ── PUT — add/update date override ─────────────────────────

export async function PUT(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { override_date, is_blocked, start_time, end_time, reason } = body;

    if (!override_date) {
      return NextResponse.json({ error: 'override_date required' }, { status: 400 });
    }

    // DB column is `is_available` (true = open, false = blocked); the API
    // contract uses `is_blocked`, so invert before writing. The live unique
    // constraint is (practitioner_id, override_date).
    const isAvailable = !(is_blocked ?? true);
    const result = await db.query(
      `INSERT INTO availability_overrides
       (practitioner_id, override_date, is_available, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (practitioner_id, override_date)
       DO UPDATE SET is_available = $3, start_time = $4, end_time = $5, reason = $6
       RETURNING id`,
      [
        identity.practitionerId,
        override_date,
        isAvailable,
        start_time || null,
        end_time || null,
        reason || null,
      ]
    );

    return NextResponse.json({ success: true, id: result.rows[0]?.id });
  } catch (error) {
    console.error('[Studio Availability] PUT error:', error);
    return NextResponse.json({ error: 'Failed to add override' }, { status: 500 });
  }
}

// ── DELETE — remove date override ──────────────────────────

export async function DELETE(request: NextRequest) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const overrideId = searchParams.get('id');

    if (!overrideId) {
      return NextResponse.json({ error: 'Override id required' }, { status: 400 });
    }

    await db.query(
      `DELETE FROM availability_overrides WHERE id = $1 AND practitioner_id = $2`,
      [overrideId, identity.practitionerId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Availability] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove override' }, { status: 500 });
  }
}
