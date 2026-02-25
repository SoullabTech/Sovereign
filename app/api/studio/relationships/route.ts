export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO RELATIONSHIPS API
 *
 * List and create relationship records (person profiles).
 * Part of the Parent Flow MVP — relational sandbox in Personal mode.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_ROLES = ['child', 'partner', 'parent', 'friend', 'cofounder', 'sibling', 'other'] as const;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const result = await db.query(
      `SELECT
        r.id,
        r.practitioner_id,
        r.person_name,
        r.role,
        r.birth_date,
        r.birth_time,
        r.birth_location_name,
        r.age_years,
        r.notes,
        r.status,
        r.created_at,
        r.updated_at,
        (SELECT COUNT(*)::int FROM relationship_checkins c WHERE c.relationship_id = r.id) as checkin_count,
        (SELECT MAX(c.created_at) FROM relationship_checkins c WHERE c.relationship_id = r.id) as last_checkin_at
      FROM studio_relationships r
      WHERE r.practitioner_id = $1 AND r.status = $2
      ORDER BY r.created_at DESC`,
      [practitionerId, status]
    );

    const relationships = result.rows.map(row => ({
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
      checkinCount: row.checkin_count || 0,
      lastCheckinAt: row.last_checkin_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ relationships });
  } catch (error) {
    console.error('[Studio Relationships] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const body = await request.json();

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
    } = body;

    if (!personName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!role || !(VALID_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
    }

    // Auto-calculate age from birth date if not provided
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

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO studio_relationships
        (id, practitioner_id, person_name, role, birth_date, birth_time,
         birth_location_name, birth_location_lat, birth_location_lng, birth_timezone,
         age_years, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        id,
        practitionerId,
        personName.trim(),
        role,
        birthDate || null,
        birthTime || null,
        birthLocationName || null,
        birthLocationLat || null,
        birthLocationLng || null,
        birthTimezone || null,
        computedAge,
        notes?.trim() || null,
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
        checkinCount: 0,
        lastCheckinAt: null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Relationships] POST error:', error);
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
  }
}
