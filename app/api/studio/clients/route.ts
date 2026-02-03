export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CLIENTS API
 *
 * CRUD operations for practitioner clients
 * Currently uses hardcoded 'stellium' practitioner (TODO: link members to practitioners)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['active', 'inactive', 'archived', 'waitlist'] as const;
type ClientStatus = typeof VALID_STATUSES[number];

function isValidStatus(s: string): s is ClientStatus {
  return VALID_STATUSES.includes(s as ClientStatus);
}

async function getPractitionerId(): Promise<string | null> {
  // TODO: Link members to practitioners properly
  // For now, use hardcoded 'stellium' practitioner
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    let sql = `
      SELECT
        c.id,
        c.practitioner_id,
        c.email,
        c.name,
        c.preferred_name,
        c.status,
        c.tier,
        c.tags,
        c.first_session,
        c.last_session,
        c.total_sessions,
        c.key_placements,
        c.total_revenue,
        c.birth_date,
        c.birth_time,
        c.birth_location,
        c.birth_timezone,
        c.has_chart,
        c.created_at,
        c.updated_at,
        c.next_session
      FROM practitioner_clients c
      WHERE c.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    // Status filter
    if (status && isValidStatus(status)) {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    // Search filter
    if (search) {
      sql += ` AND (c.name ILIKE $${params.length + 1} OR c.email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY c.last_session DESC NULLS LAST, c.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const clients = result.rows.map(row => ({
      id: row.id,
      practitionerId: row.practitioner_id,
      email: row.email,
      name: row.name,
      preferredName: row.preferred_name,
      status: row.status,
      tier: row.tier,
      tags: row.tags || [],
      firstSession: row.first_session,
      lastSession: row.last_session,
      totalSessions: row.total_sessions,
      keyPlacements: row.key_placements,
      totalRevenue: row.total_revenue,
      nextSession: row.next_session,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthLocation: row.birth_location,
      birthTimezone: row.birth_timezone,
      hasChart: row.has_chart,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('[Studio Clients] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      preferredName,
      status = 'active',
      tier = 'free',
      tags = [],
      birthDate,
      birthTime,
      birthLocation,
      birthTimezone,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for existing client with same email
    const existingCheck = await db.query(
      'SELECT id FROM practitioner_clients WHERE practitioner_id = $1 AND email = $2',
      [practitionerId, email.trim().toLowerCase()]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 }
      );
    }

    const clientId = randomUUID();
    const result = await db.query(
      `INSERT INTO practitioner_clients
        (id, practitioner_id, name, email, phone, preferred_name, status, tier, tags, birth_date, birth_time, birth_location, birth_timezone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        clientId,
        practitionerId,
        name.trim(),
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        preferredName?.trim() || null,
        status,
        tier,
        tags,
        birthDate || null,
        birthTime || null,
        birthLocation?.trim() || null,
        birthTimezone || null,
      ]
    );

    const client = result.rows[0];
    return NextResponse.json({
      client: {
        id: client.id,
        practitionerId: client.practitioner_id,
        email: client.email,
        name: client.name,
        preferredName: client.preferred_name,
        status: client.status,
        tier: client.tier,
        tags: client.tags || [],
        firstSession: client.first_session,
        lastSession: client.last_session,
        totalSessions: client.total_sessions,
        birthDate: client.birth_date,
        birthTime: client.birth_time,
        birthLocation: client.birth_location,
        birthTimezone: client.birth_timezone,
        hasChart: client.has_chart,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Clients] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Build dynamic update
    const updateFields: string[] = [];
    const params: (string | null | number | object)[] = [id, practitionerId];

    if (updates.name !== undefined) {
      updateFields.push(`name = $${params.length + 1}`);
      params.push(updates.name.trim());
    }

    if (updates.email !== undefined) {
      updateFields.push(`email = $${params.length + 1}`);
      params.push(updates.email.trim().toLowerCase());
    }

    if (updates.status !== undefined) {
      if (!isValidStatus(updates.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`status = $${params.length + 1}`);
      params.push(updates.status);
    }

    if (updates.tier !== undefined) {
      updateFields.push(`tier = $${params.length + 1}`);
      params.push(updates.tier);
    }

    if (updates.tags !== undefined) {
      updateFields.push(`tags = $${params.length + 1}`);
      params.push(updates.tags);
    }

    if (updates.preferredName !== undefined) {
      updateFields.push(`preferred_name = $${params.length + 1}`);
      params.push(updates.preferredName?.trim() || null);
    }

    if (updates.birthDate !== undefined) {
      updateFields.push(`birth_date = $${params.length + 1}`);
      params.push(updates.birthDate || null);
    }

    if (updates.birthTime !== undefined) {
      updateFields.push(`birth_time = $${params.length + 1}`);
      params.push(updates.birthTime || null);
    }

    if (updates.birthLocation !== undefined) {
      updateFields.push(`birth_location = $${params.length + 1}`);
      params.push(updates.birthLocation?.trim() || null);
    }

    if (updates.birthTimezone !== undefined) {
      updateFields.push(`birth_timezone = $${params.length + 1}`);
      params.push(updates.birthTimezone || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE practitioner_clients
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = result.rows[0];
    return NextResponse.json({
      client: {
        id: client.id,
        practitionerId: client.practitioner_id,
        email: client.email,
        name: client.name,
        preferredName: client.preferred_name,
        status: client.status,
        tier: client.tier,
        tags: client.tags || [],
        firstSession: client.first_session,
        lastSession: client.last_session,
        totalSessions: client.total_sessions,
        birthDate: client.birth_date,
        birthTime: client.birth_time,
        birthLocation: client.birth_location,
        birthTimezone: client.birth_timezone,
        hasChart: client.has_chart,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Clients] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Soft delete by archiving rather than hard delete
    const result = await db.query(
      `UPDATE practitioner_clients
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Clients] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to archive client' },
      { status: 500 }
    );
  }
}
