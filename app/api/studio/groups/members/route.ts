export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO GROUP MEMBERS API
 *
 * Manage client membership within groups
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const VALID_MEMBER_STATUSES = ['active', 'completed', 'dropped', 'waitlist'] as const;
const VALID_ROLES = ['member', 'facilitator', 'observer'] as const;

type MemberStatus = typeof VALID_MEMBER_STATUSES[number];
type MemberRole = typeof VALID_ROLES[number];

function isValidMemberStatus(s: string): s is MemberStatus {
  return VALID_MEMBER_STATUSES.includes(s as MemberStatus);
}

function isValidRole(r: string): r is MemberRole {
  return VALID_ROLES.includes(r as MemberRole);
}

async function getPractitionerId(): Promise<string | null> {
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const clientId = searchParams.get('clientId');

    if (!groupId && !clientId) {
      return NextResponse.json(
        { success: false, error: 'Either groupId or clientId is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT
        cgm.id as membership_id,
        cgm.group_id,
        cgm.client_id,
        cgm.status,
        cgm.role,
        cgm.joined_at,
        cgm.completed_at,
        cgm.sessions_attended,
        cgm.notes,
        c.name as client_name,
        c.email as client_email,
        g.name as group_name,
        g.group_type
      FROM client_group_members cgm
      JOIN practitioner_clients c ON cgm.client_id = c.id
      JOIN client_groups g ON cgm.group_id = g.id
      WHERE g.practitioner_id = $1
    `;
    const params: string[] = [practitionerId];

    if (groupId) {
      sql += ` AND cgm.group_id = $${params.length + 1}`;
      params.push(groupId);
    }

    if (clientId) {
      sql += ` AND cgm.client_id = $${params.length + 1}`;
      params.push(clientId);
    }

    sql += ` ORDER BY c.name`;

    const result = await db.query(sql, params);

    const members = result.rows.map(row => ({
      membershipId: row.membership_id,
      groupId: row.group_id,
      clientId: row.client_id,
      status: row.status,
      role: row.role,
      joinedAt: row.joined_at,
      completedAt: row.completed_at,
      sessionsAttended: row.sessions_attended,
      notes: row.notes,
      clientName: row.client_name,
      clientEmail: row.client_email,
      groupName: row.group_name,
      groupType: row.group_type,
    }));

    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error('[Studio Group Members] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      groupId,
      clientId,
      clientIds,  // Support batch add
      role = 'member',
      status = 'active',
      notes,
    } = body;

    if (!groupId) {
      return NextResponse.json({ success: false, error: 'Group ID is required' }, { status: 400 });
    }

    // Verify group belongs to practitioner
    const groupCheck = await db.query(
      'SELECT id FROM client_groups WHERE id = $1 AND practitioner_id = $2',
      [groupId, practitionerId]
    );
    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    // Handle single or batch add
    const idsToAdd = clientIds || (clientId ? [clientId] : []);

    if (idsToAdd.length === 0) {
      return NextResponse.json({ success: false, error: 'Client ID(s) required' }, { status: 400 });
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!isValidMemberStatus(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_MEMBER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert members (upsert to handle duplicates)
    const insertValues = idsToAdd.map((_: string, i: number) =>
      `($1, $${i + 2}, $${idsToAdd.length + 2}, $${idsToAdd.length + 3}, $${idsToAdd.length + 4})`
    ).join(', ');

    const result = await db.query(
      `INSERT INTO client_group_members (group_id, client_id, role, status, notes)
       VALUES ${insertValues}
       ON CONFLICT (group_id, client_id)
       DO UPDATE SET status = EXCLUDED.status, role = EXCLUDED.role, notes = EXCLUDED.notes
       RETURNING *`,
      [groupId, ...idsToAdd, role, status, notes || null]
    );

    return NextResponse.json({
      success: true,
      added: result.rows.length,
      members: result.rows.map(row => ({
        membershipId: row.id,
        groupId: row.group_id,
        clientId: row.client_id,
        status: row.status,
        role: row.role,
        joinedAt: row.joined_at,
      })),
    });
  } catch (error) {
    console.error('[Studio Group Members] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add group member(s)' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { membershipId, groupId, clientId, ...updates } = body;

    // Allow update by membershipId OR (groupId + clientId)
    if (!membershipId && !(groupId && clientId)) {
      return NextResponse.json(
        { success: false, error: 'membershipId or (groupId + clientId) required' },
        { status: 400 }
      );
    }

    const updateFields: string[] = [];
    const params: (string | number | null)[] = [];

    if (updates.status !== undefined) {
      if (!isValidMemberStatus(updates.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${VALID_MEMBER_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`status = $${params.length + 1}`);
      params.push(updates.status);

      // Auto-set completed_at
      if (updates.status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      }
    }

    if (updates.role !== undefined) {
      if (!isValidRole(updates.role)) {
        return NextResponse.json(
          { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`role = $${params.length + 1}`);
      params.push(updates.role);
    }

    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${params.length + 1}`);
      params.push(updates.notes || null);
    }

    if (updates.sessionsAttended !== undefined) {
      updateFields.push(`sessions_attended = $${params.length + 1}`);
      params.push(updates.sessionsAttended);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    let whereClause: string;
    if (membershipId) {
      params.push(membershipId);
      whereClause = `id = $${params.length}`;
    } else {
      params.push(groupId, clientId);
      whereClause = `group_id = $${params.length - 1} AND client_id = $${params.length}`;
    }

    // Add practitioner check via join
    const result = await db.query(
      `UPDATE client_group_members cgm
       SET ${updateFields.join(', ')}
       FROM client_groups g
       WHERE ${whereClause}
         AND cgm.group_id = g.id
         AND g.practitioner_id = $${params.length + 1}
       RETURNING cgm.*`,
      [...params, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Membership not found' }, { status: 404 });
    }

    const membership = result.rows[0];
    return NextResponse.json({
      success: true,
      membership: {
        membershipId: membership.id,
        groupId: membership.group_id,
        clientId: membership.client_id,
        status: membership.status,
        role: membership.role,
        joinedAt: membership.joined_at,
        completedAt: membership.completed_at,
        sessionsAttended: membership.sessions_attended,
        notes: membership.notes,
      },
    });
  } catch (error) {
    console.error('[Studio Group Members] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update membership' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const membershipId = searchParams.get('membershipId');
    const groupId = searchParams.get('groupId');
    const clientId = searchParams.get('clientId');

    if (!membershipId && !(groupId && clientId)) {
      return NextResponse.json(
        { success: false, error: 'membershipId or (groupId + clientId) required' },
        { status: 400 }
      );
    }

    let whereClause: string;
    const params: string[] = [practitionerId];

    if (membershipId) {
      params.push(membershipId);
      whereClause = `cgm.id = $2`;
    } else {
      params.push(groupId!, clientId!);
      whereClause = `cgm.group_id = $2 AND cgm.client_id = $3`;
    }

    const result = await db.query(
      `DELETE FROM client_group_members cgm
       USING client_groups g
       WHERE ${whereClause}
         AND cgm.group_id = g.id
         AND g.practitioner_id = $1
       RETURNING cgm.id`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Group Members] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
