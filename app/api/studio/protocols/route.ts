export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO PROTOCOLS API — /api/studio/protocols
 *
 * GET  — list protocols for current practitioner; optional ?client_id= filter
 * POST — create protocol; validates member_id belongs to client_id if provided
 *
 * Ownership invariant: every query is scoped to practitioner_id.
 * Returns 404 (not 403) if not found or not owned — don't leak existence.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const statusFilter = searchParams.get('status');

    let sql = `
      SELECT
        p.id,
        p.practitioner_id,
        p.client_id,
        p.member_id,
        p.protocol_type,
        p.pattern_name,
        p.pattern_description,
        p.status,
        p.current_week,
        p.started_at,
        p.completed_at,
        p.council_guides,
        p.notes,
        p.created_at,
        p.updated_at,
        (
          SELECT MAX(o.created_at)
          FROM protocol_observations o
          WHERE o.protocol_id = p.id
        ) AS last_observation_at
      FROM studio_pattern_protocols p
      WHERE p.practitioner_id = $1
    `;

    const params: (string | number)[] = [practitionerId];

    if (clientId) {
      params.push(clientId);
      sql += ` AND p.client_id = $${params.length}`;
    }

    if (statusFilter) {
      params.push(statusFilter);
      sql += ` AND p.status = $${params.length}`;
    }

    sql += ` ORDER BY p.updated_at DESC`;

    const result = await db.query(sql, params);

    const protocols = result.rows.map((row) => ({
      id: row.id,
      practitionerId: row.practitioner_id,
      clientId: row.client_id,
      memberId: row.member_id,
      protocolType: row.protocol_type,
      patternName: row.pattern_name,
      patternDescription: row.pattern_description,
      status: row.status,
      currentWeek: row.current_week,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      councilGuides: row.council_guides,
      notes: row.notes,
      lastObservationAt: row.last_observation_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ protocols });
  } catch (error) {
    console.error('[Studio Protocols] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch protocols' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      clientId,
      memberId,
      protocolType = 'pattern_inquiry',
      patternName,
      patternDescription,
      trigger,
      behavior,
      immediateReward,
      longTermCost,
      councilGuides = ['strategist', 'body_listener', 'pattern_seer', 'symbolist'],
      notes,
    } = body;

    // Required fields
    if (!clientId?.trim()) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }
    if (!patternName?.trim()) {
      return NextResponse.json({ error: 'patternName is required' }, { status: 400 });
    }

    // Verify client belongs to this practitioner
    const clientCheck = await db.query(
      `SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
      [clientId, practitionerId]
    );
    if (clientCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // If member_id provided, verify it belongs to the client
    if (memberId) {
      const memberCheck = await db.query(
        `SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2 AND member_id = $3`,
        [clientId, practitionerId, memberId]
      );
      if (memberCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'member_id does not belong to this client' },
          { status: 400 }
        );
      }
    }

    const result = await db.query(
      `INSERT INTO studio_pattern_protocols
        (practitioner_id, client_id, member_id, protocol_type, pattern_name,
         pattern_description, trigger, behavior, immediate_reward, long_term_cost,
         council_guides, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        practitionerId,
        clientId,
        memberId || null,
        protocolType,
        patternName.trim(),
        patternDescription?.trim() || null,
        trigger?.trim() || null,
        behavior?.trim() || null,
        immediateReward?.trim() || null,
        longTermCost?.trim() || null,
        JSON.stringify(councilGuides),
        notes?.trim() || null,
      ]
    );

    const protocol = result.rows[0];

    return NextResponse.json(
      {
        protocol: {
          id: protocol.id,
          practitionerId: protocol.practitioner_id,
          clientId: protocol.client_id,
          memberId: protocol.member_id,
          protocolType: protocol.protocol_type,
          patternName: protocol.pattern_name,
          patternDescription: protocol.pattern_description,
          trigger: protocol.trigger,
          behavior: protocol.behavior,
          immediateReward: protocol.immediate_reward,
          longTermCost: protocol.long_term_cost,
          status: protocol.status,
          currentWeek: protocol.current_week,
          councilGuides: protocol.council_guides,
          notes: protocol.notes,
          createdAt: protocol.created_at,
          updatedAt: protocol.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Studio Protocols] POST error:', error);
    // Handle unique index violation (one active protocol per member)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505' &&
      'constraint' in error &&
      String((error as { constraint: string }).constraint).includes('one_active_per_member')
    ) {
      return NextResponse.json(
        { error: 'This member already has an active protocol. Pause or complete the existing one first.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create protocol' },
      { status: 500 }
    );
  }
}
