export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO PROTOCOLS [id] API — /api/studio/protocols/[id]
 *
 * GET   — full protocol detail
 * PUT   — update pattern fields, notes, micro_intervention; re-validates member_id if changed
 * PATCH — { action: 'advance_week' } or { action: 'set_status', status: string }
 *
 * Ownership invariant: protocol.practitioner_id must equal currentPractitioner.id.
 * Returns 404 (not 403) when not found or not owned — don't leak existence.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const VALID_STATUSES = ['draft', 'active', 'paused', 'completed'] as const;
type ProtocolStatus = typeof VALID_STATUSES[number];

function isValidStatus(s: string): s is ProtocolStatus {
  return VALID_STATUSES.includes(s as ProtocolStatus);
}

// Fetch + ownership check — returns null if not found or not owned
async function fetchOwnedProtocol(protocolId: string, practitionerId: string) {
  const result = await db.query(
    `SELECT * FROM studio_pattern_protocols WHERE id = $1 AND practitioner_id = $2`,
    [protocolId, practitionerId]
  );
  return result.rows[0] ?? null;
}

function formatProtocol(row: Record<string, unknown>) {
  return {
    id: row.id,
    practitionerId: row.practitioner_id,
    clientId: row.client_id,
    memberId: row.member_id,
    protocolType: row.protocol_type,
    patternName: row.pattern_name,
    patternDescription: row.pattern_description,
    trigger: row.trigger,
    behavior: row.behavior,
    immediateReward: row.immediate_reward,
    longTermCost: row.long_term_cost,
    status: row.status,
    currentWeek: row.current_week,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    councilGuides: row.council_guides,
    microIntervention: row.micro_intervention,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const protocol = await fetchOwnedProtocol(params.id, identity.practitionerId);
    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    return NextResponse.json({ protocol: formatProtocol(protocol) });
  } catch (error) {
    console.error('[Studio Protocol] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch protocol' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const existing = await fetchOwnedProtocol(params.id, identity.practitionerId);
    if (!existing) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      memberId,
      patternName,
      patternDescription,
      trigger,
      behavior,
      immediateReward,
      longTermCost,
      microIntervention,
      notes,
      councilGuides,
    } = body;

    // If member_id is being changed, re-validate it belongs to the client
    if (memberId !== undefined && memberId !== null && memberId !== existing.member_id) {
      const memberCheck = await db.query(
        `SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2 AND member_id = $3`,
        [existing.client_id, identity.practitionerId, memberId]
      );
      if (memberCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'member_id does not belong to this client' },
          { status: 400 }
        );
      }
    }

    const setClauses: string[] = [];
    const values: unknown[] = [params.id, identity.practitionerId];
    let idx = 3;

    if (memberId !== undefined) {
      setClauses.push(`member_id = $${idx++}`);
      values.push(memberId || null);
    }
    if (patternName !== undefined) {
      setClauses.push(`pattern_name = $${idx++}`);
      values.push(patternName.trim());
    }
    if (patternDescription !== undefined) {
      setClauses.push(`pattern_description = $${idx++}`);
      values.push(patternDescription?.trim() || null);
    }
    if (trigger !== undefined) {
      setClauses.push(`trigger = $${idx++}`);
      values.push(trigger?.trim() || null);
    }
    if (behavior !== undefined) {
      setClauses.push(`behavior = $${idx++}`);
      values.push(behavior?.trim() || null);
    }
    if (immediateReward !== undefined) {
      setClauses.push(`immediate_reward = $${idx++}`);
      values.push(immediateReward?.trim() || null);
    }
    if (longTermCost !== undefined) {
      setClauses.push(`long_term_cost = $${idx++}`);
      values.push(longTermCost?.trim() || null);
    }
    if (microIntervention !== undefined) {
      setClauses.push(`micro_intervention = $${idx++}`);
      values.push(microIntervention ? JSON.stringify(microIntervention) : null);
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${idx++}`);
      values.push(notes?.trim() || null);
    }
    if (councilGuides !== undefined) {
      setClauses.push(`council_guides = $${idx++}`);
      values.push(JSON.stringify(councilGuides));
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const result = await db.query(
      `UPDATE studio_pattern_protocols
       SET ${setClauses.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      values
    );

    return NextResponse.json({ protocol: formatProtocol(result.rows[0]) });
  } catch (error) {
    console.error('[Studio Protocol] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update protocol' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const existing = await fetchOwnedProtocol(params.id, identity.practitionerId);
    if (!existing) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'advance_week') {
      if (existing.current_week >= 6) {
        return NextResponse.json(
          { error: 'Protocol is already at week 6 (final week)' },
          { status: 400 }
        );
      }

      const result = await db.query(
        `UPDATE studio_pattern_protocols
         SET current_week = current_week + 1
         WHERE id = $1 AND practitioner_id = $2
         RETURNING *`,
        [params.id, identity.practitionerId]
      );

      return NextResponse.json({ protocol: formatProtocol(result.rows[0]) });
    }

    if (action === 'set_status') {
      const { status } = body;
      if (!status || !isValidStatus(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      const updates: string[] = ['status = $3'];
      const values: unknown[] = [params.id, identity.practitionerId, status];

      // Set timestamps based on status transition
      if (status === 'active' && !existing.started_at) {
        updates.push('started_at = NOW()');
      }
      if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }

      const result = await db.query(
        `UPDATE studio_pattern_protocols
         SET ${updates.join(', ')}
         WHERE id = $1 AND practitioner_id = $2
         RETURNING *`,
        values
      );

      return NextResponse.json({ protocol: formatProtocol(result.rows[0]) });
    }

    return NextResponse.json(
      { error: 'Unknown action. Valid actions: advance_week, set_status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Studio Protocol] PATCH error:', error);
    // Handle unique index violation on active protocol per member
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
    return NextResponse.json({ error: 'Failed to update protocol' }, { status: 500 });
  }
}
