export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CLIENTS API
 *
 * CRUD operations for practitioner clients.
 * Resolves practitioner from the authenticated member via getCurrentPractitioner.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

// Must match the practitioner_clients.status CHECK constraint in the DB
// (migration 20260114000001_practitioner_themes.sql). The form default is 'invited'.
const VALID_STATUSES = ['invited', 'active', 'paused', 'completed', 'archived'] as const;
type ClientStatus = typeof VALID_STATUSES[number];

function isValidStatus(s: string): s is ClientStatus {
  return VALID_STATUSES.includes(s as ClientStatus);
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const clientType = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200);

    // Query clients with computed session data from practitioner_sessions
    let sql = `
      SELECT
        c.id,
        c.practitioner_id,
        c.email,
        c.name,
        c.status,
        c.tier,
        c.tags,
        c.key_placements,
        c.total_revenue,
        c.birth_date,
        c.birth_time,
        c.birth_location,
        c.internal_notes,
        c.chart_image_url,
        c.leadership_profile,
        c.client_types,
        c.relationship_roles,
        c.created_at,
        c.updated_at,
        c.last_session_at,
        -- Compute next scheduled session
        (
          SELECT MIN(s.scheduled_at)
          FROM practitioner_sessions s
          WHERE s.client_id = c.id
            AND s.status IN ('scheduled', 'confirmed')
            AND s.scheduled_at > NOW()
        ) as next_session_at,
        -- Count total sessions
        (
          SELECT COUNT(*)
          FROM practitioner_sessions s
          WHERE s.client_id = c.id
            AND s.status = 'completed'
        ) as total_sessions
      FROM practitioner_clients c
      WHERE c.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    // Status filter (map 'active' to DB values)
    if (status && isValidStatus(status)) {
      sql += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    // Client type filter (e.g., ?type=leadership) — work/domain
    if (clientType) {
      sql += ` AND $${params.length + 1} = ANY(c.client_types)`;
      params.push(clientType);
    }

    // Relationship role filter (e.g., ?role=guest) — relationship nature, distinct from type
    const role = searchParams.get('role');
    if (role) {
      sql += ` AND $${params.length + 1} = ANY(c.relationship_roles)`;
      params.push(role);
    }

    // Search filter
    if (search) {
      sql += ` AND (c.name ILIKE $${params.length + 1} OR c.email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY c.last_session_at DESC NULLS LAST, c.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const clients = result.rows.map(row => ({
      id: row.id,
      practitionerId: row.practitioner_id,
      email: row.email,
      name: row.name,
      status: row.status,
      tier: row.tier,
      tags: row.tags || [],
      keyPlacements: row.key_placements,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthLocation: row.birth_location,
      internalNotes: row.internal_notes,
      chartImageUrl: row.chart_image_url,
      leadershipProfile: row.leadership_profile,
      clientTypes: row.client_types || [],
      relationshipRoles: row.relationship_roles || ['client'],
      lastSessionAt: row.last_session_at,
      nextSessionAt: row.next_session_at,
      totalSessions: parseInt(row.total_sessions) || 0,
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
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;

    const body = await request.json();
    const {
      name,
      email,
      phone,
      status = 'active',
      tier = 'free',
      tags = [],
      birthDate,
      birthTime,
      birthLocation,
      internalNotes,
      leadershipProfile,
      clientTypes = [],
      relationshipRoles = ['client'],
    } = body;

    // Relationship roles (additive, distinct from client_types). Computed up front so
    // validation can branch on whether this is a guest.
    const normalizedRoles = (Array.isArray(relationshipRoles) ? relationshipRoles : [])
      .map((r: unknown) => String(r).trim().toLowerCase())
      .filter(Boolean);
    const rolesToInsert = normalizedRoles.length > 0 ? normalizedRoles : ['client'];
    const isGuest = rolesToInsert.includes('guest');

    // Ordinary clients still require name + email. A guest (event/session participant)
    // is lighter: name-only OR email-only is allowed (at least one identifier), and a
    // guest never creates a member record. Non-guest validation is unchanged.
    if (isGuest) {
      if (!name?.trim() && !email?.trim()) {
        return NextResponse.json({ error: 'A guest needs at least a name or an email' }, { status: 400 });
      }
    } else {
      if (!name?.trim()) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      if (!email?.trim()) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Email uniqueness — only when an email is provided (a guest may have none).
    if (email?.trim()) {
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
    }

    const clientId = randomUUID();
    const result = await db.query(
      `INSERT INTO practitioner_clients
        (id, practitioner_id, name, email, phone, status, tier, tags, birth_date, birth_time, birth_location, internal_notes, leadership_profile, client_types, relationship_roles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        clientId,
        practitionerId,
        name?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        status,
        tier,
        JSON.stringify(tags),
        birthDate || null,
        birthTime || null,
        birthLocation?.trim() || null,
        internalNotes?.trim() || null,
        leadershipProfile ? JSON.stringify(leadershipProfile) : null,
        clientTypes,
        rolesToInsert,
      ]
    );

    const client = result.rows[0];
    return NextResponse.json({
      client: {
        id: client.id,
        practitionerId: client.practitioner_id,
        email: client.email,
        name: client.name,
        status: client.status,
        tier: client.tier,
        tags: client.tags || [],
        birthDate: client.birth_date,
        birthTime: client.birth_time,
        birthLocation: client.birth_location,
        internalNotes: client.internal_notes,
        leadershipProfile: client.leadership_profile,
        clientTypes: client.client_types || [],
        relationshipRoles: client.relationship_roles || ['client'],
        lastSessionAt: client.last_session_at,
        nextSessionAt: null,
        totalSessions: 0,
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
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;

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

    if (updates.phone !== undefined) {
      updateFields.push(`phone = $${params.length + 1}`);
      params.push(updates.phone?.trim() || null);
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
      params.push(JSON.stringify(updates.tags));
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

    if (updates.internalNotes !== undefined) {
      updateFields.push(`internal_notes = $${params.length + 1}`);
      params.push(updates.internalNotes?.trim() || null);
    }

    if (updates.leadershipProfile !== undefined) {
      updateFields.push(`leadership_profile = $${params.length + 1}`);
      params.push(updates.leadershipProfile ? JSON.stringify(updates.leadershipProfile) : null);
    }

    if (updates.clientTypes !== undefined) {
      updateFields.push(`client_types = $${params.length + 1}`);
      params.push(updates.clientTypes);
    }

    // Relationship roles (e.g. promote a guest to client, or add a role)
    if (updates.relationshipRoles !== undefined) {
      const roles = (Array.isArray(updates.relationshipRoles) ? updates.relationshipRoles : [])
        .map((r: unknown) => String(r).trim().toLowerCase())
        .filter(Boolean);
      updateFields.push(`relationship_roles = $${params.length + 1}`);
      params.push(roles.length > 0 ? roles : ['client']);
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
        status: client.status,
        tier: client.tier,
        tags: client.tags || [],
        birthDate: client.birth_date,
        birthTime: client.birth_time,
        birthLocation: client.birth_location,
        internalNotes: client.internal_notes,
        leadershipProfile: client.leadership_profile,
        clientTypes: client.client_types || [],
        relationshipRoles: client.relationship_roles || ['client'],
        lastSessionAt: client.last_session_at,
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
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;

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
