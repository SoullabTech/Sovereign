export const dynamic = 'force-dynamic';

/**
 * STUDIO RELATIONSHIP DETAIL API
 *
 * Get and update a single relationship record.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const VALID_ROLES = ['child', 'partner', 'parent', 'friend', 'cofounder', 'sibling', 'other'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id } = await params;

    const result = await db.query(
      `SELECT
        r.*,
        (SELECT COUNT(*)::int FROM relationship_checkins c WHERE c.relationship_id = r.id) as checkin_count,
        (SELECT MAX(c.created_at) FROM relationship_checkins c WHERE c.relationship_id = r.id) as last_checkin_at
      FROM studio_relationships r
      WHERE r.id = $1 AND r.practitioner_id = $2`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      relationship: {
        id: row.id,
        practitionerId: row.practitioner_id,
        personName: row.person_name,
        role: row.role,
        birthDate: row.birth_date,
        birthTime: row.birth_time,
        birthLocationName: row.birth_location_name,
        birthLocationLat: row.birth_location_lat,
        birthLocationLng: row.birth_location_lng,
        birthTimezone: row.birth_timezone,
        ageYears: row.age_years,
        notes: row.notes,
        status: row.status,
        checkinCount: row.checkin_count || 0,
        lastCheckinAt: row.last_checkin_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Relationship] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch relationship' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await db.query(
      'SELECT id FROM studio_relationships WHERE id = $1 AND practitioner_id = $2',
      [id, practitionerId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const {
      personName,
      role,
      birthDate,
      birthTime,
      birthLocationName,
      birthLocationLat,
      birthLocationLng,
      birthTimezone,
      ageYears,
      notes,
      status,
    } = body;

    if (role && !(VALID_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Auto-calculate age
    let computedAge = ageYears ?? null;
    if (birthDate && !computedAge) {
      const birth = new Date(birthDate);
      const now = new Date();
      computedAge = now.getFullYear() - birth.getFullYear();
      if (now.getMonth() < birth.getMonth() ||
          (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        computedAge--;
      }
    }

    const result = await db.query(
      `UPDATE studio_relationships SET
        person_name = COALESCE($1, person_name),
        role = COALESCE($2, role),
        birth_date = $3,
        birth_time = $4,
        birth_location_name = $5,
        birth_location_lat = $6,
        birth_location_lng = $7,
        birth_timezone = $8,
        age_years = $9,
        notes = $10,
        status = COALESCE($11, status),
        updated_at = NOW()
      WHERE id = $12 AND practitioner_id = $13
      RETURNING *`,
      [
        personName?.trim() || null,
        role || null,
        birthDate || null,
        birthTime || null,
        birthLocationName || null,
        birthLocationLat || null,
        birthLocationLng || null,
        birthTimezone || null,
        computedAge,
        notes?.trim() ?? null,
        status || null,
        id,
        practitionerId,
      ]
    );

    const row = result.rows[0];
    return NextResponse.json({
      relationship: {
        id: row.id,
        practitionerId: row.practitioner_id,
        personName: row.person_name,
        role: row.role,
        birthDate: row.birth_date,
        birthTime: row.birth_time,
        birthLocationName: row.birth_location_name,
        ageYears: row.age_years,
        notes: row.notes,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Relationship] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update relationship' }, { status: 500 });
  }
}
