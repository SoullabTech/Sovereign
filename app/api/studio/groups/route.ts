export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CLIENT GROUPS API
 *
 * CRUD operations for practitioner client groups
 * Supports cohorts, ongoing groups, programs, and categories
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const VALID_GROUP_TYPES = ['cohort', 'ongoing', 'program', 'category'] as const;
const VALID_STATUSES = ['active', 'archived', 'completed'] as const;

type GroupType = typeof VALID_GROUP_TYPES[number];
type GroupStatus = typeof VALID_STATUSES[number];

function isValidGroupType(t: string): t is GroupType {
  return VALID_GROUP_TYPES.includes(t as GroupType);
}

function isValidStatus(s: string): s is GroupStatus {
  return VALID_STATUSES.includes(s as GroupStatus);
}

async function getPractitionerId(): Promise<string | null> {
  // TODO: Link members to practitioners properly
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
    const groupType = searchParams.get('type');
    const status = searchParams.get('status');
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let sql = `
      SELECT
        g.id,
        g.practitioner_id,
        g.name,
        g.description,
        g.color,
        g.group_type,
        g.status,
        g.meeting_day,
        g.meeting_time,
        g.meeting_duration_minutes,
        g.meeting_location_type,
        g.meeting_link,
        g.start_date,
        g.end_date,
        g.total_sessions,
        g.max_members,
        g.notes,
        g.created_at,
        g.updated_at,
        (SELECT COUNT(*) FROM client_group_members cgm WHERE cgm.group_id = g.id AND cgm.status = 'active') as member_count
      FROM client_groups g
      WHERE g.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    // Type filter
    if (groupType && isValidGroupType(groupType)) {
      sql += ` AND g.group_type = $${params.length + 1}`;
      params.push(groupType);
    }

    // Status filter (default to active)
    if (status && isValidStatus(status)) {
      sql += ` AND g.status = $${params.length + 1}`;
      params.push(status);
    } else {
      sql += ` AND g.status = 'active'`;
    }

    sql += ` ORDER BY g.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const groups = await Promise.all(result.rows.map(async (row) => {
      const group: Record<string, unknown> = {
        id: row.id,
        practitionerId: row.practitioner_id,
        name: row.name,
        description: row.description,
        color: row.color,
        groupType: row.group_type,
        status: row.status,
        meetingDay: row.meeting_day,
        meetingTime: row.meeting_time,
        meetingDurationMinutes: row.meeting_duration_minutes,
        meetingLocationType: row.meeting_location_type,
        meetingLink: row.meeting_link,
        startDate: row.start_date,
        endDate: row.end_date,
        totalSessions: row.total_sessions,
        maxMembers: row.max_members,
        memberCount: parseInt(row.member_count),
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      // Optionally include members
      if (includeMembers) {
        const membersResult = await db.query(
          `SELECT
            cgm.id as membership_id,
            cgm.status as membership_status,
            cgm.role,
            cgm.joined_at,
            cgm.sessions_attended,
            c.id as client_id,
            c.name as client_name,
            c.email as client_email
          FROM client_group_members cgm
          JOIN practitioner_clients c ON cgm.client_id = c.id
          WHERE cgm.group_id = $1 AND cgm.status = 'active'
          ORDER BY c.name`,
          [row.id]
        );
        group.members = membersResult.rows.map(m => ({
          membershipId: m.membership_id,
          membershipStatus: m.membership_status,
          role: m.role,
          joinedAt: m.joined_at,
          sessionsAttended: m.sessions_attended,
          clientId: m.client_id,
          clientName: m.client_name,
          clientEmail: m.client_email,
        }));
      }

      return group;
    }));

    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('[Studio Groups] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
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
      name,
      description,
      color = '#6366f1',
      groupType = 'cohort',
      meetingDay,
      meetingTime,
      meetingDurationMinutes = 90,
      meetingLocationType,
      meetingLink,
      startDate,
      endDate,
      totalSessions,
      maxMembers,
      notes,
      clientIds = [],  // Initial members to add
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 });
    }

    if (!isValidGroupType(groupType)) {
      return NextResponse.json(
        { success: false, error: `Invalid group type. Must be one of: ${VALID_GROUP_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Create group
    const result = await db.query(
      `INSERT INTO client_groups
        (practitioner_id, name, description, color, group_type, meeting_day, meeting_time,
         meeting_duration_minutes, meeting_location_type, meeting_link, start_date, end_date,
         total_sessions, max_members, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        practitionerId,
        name.trim(),
        description?.trim() || null,
        color,
        groupType,
        meetingDay ?? null,
        meetingTime || null,
        meetingDurationMinutes,
        meetingLocationType || null,
        meetingLink?.trim() || null,
        startDate || null,
        endDate || null,
        totalSessions || null,
        maxMembers || null,
        notes?.trim() || null,
      ]
    );

    const group = result.rows[0];

    // Add initial members if provided
    if (clientIds.length > 0) {
      const memberValues = clientIds.map((_: string, i: number) =>
        `($1, $${i + 2})`
      ).join(', ');

      await db.query(
        `INSERT INTO client_group_members (group_id, client_id)
         VALUES ${memberValues}
         ON CONFLICT (group_id, client_id) DO NOTHING`,
        [group.id, ...clientIds]
      );
    }

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        practitionerId: group.practitioner_id,
        name: group.name,
        description: group.description,
        color: group.color,
        groupType: group.group_type,
        status: group.status,
        meetingDay: group.meeting_day,
        meetingTime: group.meeting_time,
        meetingDurationMinutes: group.meeting_duration_minutes,
        meetingLocationType: group.meeting_location_type,
        meetingLink: group.meeting_link,
        startDate: group.start_date,
        endDate: group.end_date,
        totalSessions: group.total_sessions,
        maxMembers: group.max_members,
        memberCount: clientIds.length,
        notes: group.notes,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Groups] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create group' },
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Group ID is required' }, { status: 400 });
    }

    const updateFields: string[] = [];
    const params: (string | number | null)[] = [id, practitionerId];

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      color: 'color',
      groupType: 'group_type',
      status: 'status',
      meetingDay: 'meeting_day',
      meetingTime: 'meeting_time',
      meetingDurationMinutes: 'meeting_duration_minutes',
      meetingLocationType: 'meeting_location_type',
      meetingLink: 'meeting_link',
      startDate: 'start_date',
      endDate: 'end_date',
      totalSessions: 'total_sessions',
      maxMembers: 'max_members',
      notes: 'notes',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (updates[jsKey] !== undefined) {
        if (jsKey === 'groupType' && !isValidGroupType(updates[jsKey])) {
          return NextResponse.json(
            { success: false, error: `Invalid group type. Must be one of: ${VALID_GROUP_TYPES.join(', ')}` },
            { status: 400 }
          );
        }
        if (jsKey === 'status' && !isValidStatus(updates[jsKey])) {
          return NextResponse.json(
            { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
            { status: 400 }
          );
        }
        updateFields.push(`${dbKey} = $${params.length + 1}`);
        params.push(updates[jsKey] ?? null);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE client_groups
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    const group = result.rows[0];
    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        practitionerId: group.practitioner_id,
        name: group.name,
        description: group.description,
        color: group.color,
        groupType: group.group_type,
        status: group.status,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Groups] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Group ID is required' }, { status: 400 });
    }

    // Soft delete by archiving
    const result = await db.query(
      `UPDATE client_groups
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Groups] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive group' },
      { status: 500 }
    );
  }
}
