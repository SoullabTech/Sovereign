/**
 * Relationships API — List & Create
 *
 * GET  — List member's relationships (with field state joined)
 * POST — Create a new relationship
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insertOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT
        r.id, r.name, r.realm, r.bond_type, r.note, r.origin, r.created_at, r.updated_at,
        fs.field_tone, fs.active_signals, fs.dominant_pattern, fs.last_checkin_at
      FROM member_relationships r
      LEFT JOIN relationship_field_state fs ON fs.relationship_id = r.id
      WHERE r.member_id = $1 AND r.archived_at IS NULL
      ORDER BY COALESCE(fs.last_checkin_at, r.updated_at) DESC`,
      [session.memberId]
    );

    return NextResponse.json({
      success: true,
      relationships: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        realm: row.realm,
        bondType: row.bond_type,
        note: row.note,
        // 'system' rows are containers the system created for what it could
        // not resolve. They are not people and must not render among them.
        origin: row.origin || 'member',
        fieldTone: row.field_tone,
        activeSignals: row.active_signals,
        dominantPattern: row.dominant_pattern,
        lastCheckinAt: row.last_checkin_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('[relationships] GET error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, realm, bondType, note } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const validRealms = ['outer', 'inner', 'transpersonal'];
    const safeRealm = validRealms.includes(realm) ? realm : 'outer';

    const row = await insertOne('member_relationships', {
      member_id: session.memberId,
      name: name.trim(),
      realm: safeRealm,
      bond_type: bondType || null,
      note: note || null,
    });

    return NextResponse.json({
      success: true,
      relationship: {
        id: row.id,
        name: row.name,
        realm: row.realm,
        bondType: row.bond_type,
        note: row.note,
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[relationships] POST error:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
