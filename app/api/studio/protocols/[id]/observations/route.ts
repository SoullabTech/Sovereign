export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PROTOCOL OBSERVATIONS API — /api/studio/protocols/[id]/observations
 *
 * GET  — list observations; optional ?week= and ?source= filters
 * POST — add manual or practitioner observation (source='manual' or 'practitioner' only)
 *        MAIA auto-logs 'maia' source observations directly from the oracle route.
 *
 * Ownership invariant: protocol.practitioner_id must equal currentPractitioner.id.
 * Returns 404 when protocol not found or not owned.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const MANUAL_SOURCES = ['manual', 'practitioner'] as const;
type ManualSource = typeof MANUAL_SOURCES[number];

function isManualSource(s: string): s is ManualSource {
  return MANUAL_SOURCES.includes(s as ManualSource);
}

async function verifyProtocolOwnership(
  protocolId: string,
  practitionerId: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT id FROM studio_pattern_protocols WHERE id = $1 AND practitioner_id = $2`,
    [protocolId, practitionerId]
  );
  return result.rows.length > 0;
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

    const owned = await verifyProtocolOwnership(params.id, identity.practitionerId);
    if (!owned) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const weekFilter = searchParams.get('week');
    const sourceFilter = searchParams.get('source');

    let sql = `
      SELECT
        id,
        protocol_id,
        member_id,
        week_number,
        observation_text,
        somatic_signals,
        emotional_tone,
        context_description,
        behavior_occurred,
        pause_attempted,
        tags,
        source,
        session_id,
        created_at
      FROM protocol_observations
      WHERE protocol_id = $1
    `;
    const queryParams: (string | number)[] = [params.id];

    if (weekFilter) {
      const weekNum = parseInt(weekFilter, 10);
      if (!isNaN(weekNum) && weekNum >= 1 && weekNum <= 6) {
        queryParams.push(weekNum);
        sql += ` AND week_number = $${queryParams.length}`;
      }
    }

    if (sourceFilter) {
      queryParams.push(sourceFilter);
      sql += ` AND source = $${queryParams.length}`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await db.query(sql, queryParams);

    const observations = result.rows.map((row) => ({
      id: row.id,
      protocolId: row.protocol_id,
      memberId: row.member_id,
      weekNumber: row.week_number,
      observationText: row.observation_text,
      somaticSignals: row.somatic_signals,
      emotionalTone: row.emotional_tone,
      contextDescription: row.context_description,
      behaviorOccurred: row.behavior_occurred,
      pauseAttempted: row.pause_attempted,
      tags: row.tags || [],
      source: row.source,
      sessionId: row.session_id,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ observations });
  } catch (error) {
    console.error('[Protocol Observations] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch observations' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify ownership and get protocol (need current_week and member_id)
    const protocolResult = await db.query(
      `SELECT id, current_week, member_id FROM studio_pattern_protocols
       WHERE id = $1 AND practitioner_id = $2`,
      [params.id, identity.practitionerId]
    );
    if (protocolResult.rows.length === 0) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }
    const protocol = protocolResult.rows[0];

    const body = await request.json();
    const {
      source = 'manual',
      observationText,
      somaticSignals,
      emotionalTone,
      contextDescription,
      behaviorOccurred,
      pauseAttempted,
      tags = [],
      weekNumber,
    } = body;

    // Only manual/practitioner sources allowed via API — maia inserts directly from oracle
    if (!isManualSource(source)) {
      return NextResponse.json(
        { error: 'source must be "manual" or "practitioner". MAIA observations are logged automatically.' },
        { status: 400 }
      );
    }

    // Use explicit weekNumber if provided, otherwise use protocol's current week
    const week = weekNumber
      ? Math.max(1, Math.min(6, parseInt(weekNumber, 10)))
      : protocol.current_week;

    if (isNaN(week)) {
      return NextResponse.json({ error: 'Invalid weekNumber' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO protocol_observations
        (protocol_id, member_id, week_number, observation_text, somatic_signals,
         emotional_tone, context_description, behavior_occurred, pause_attempted,
         tags, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        params.id,
        protocol.member_id || null,
        week,
        observationText?.trim() || null,
        somaticSignals?.trim() || null,
        emotionalTone?.trim() || null,
        contextDescription?.trim() || null,
        behaviorOccurred ?? null,
        pauseAttempted ?? null,
        JSON.stringify(tags),
        source,
      ]
    );

    const obs = result.rows[0];
    return NextResponse.json(
      {
        observation: {
          id: obs.id,
          protocolId: obs.protocol_id,
          memberId: obs.member_id,
          weekNumber: obs.week_number,
          observationText: obs.observation_text,
          somaticSignals: obs.somatic_signals,
          emotionalTone: obs.emotional_tone,
          contextDescription: obs.context_description,
          behaviorOccurred: obs.behavior_occurred,
          pauseAttempted: obs.pause_attempted,
          tags: obs.tags || [],
          source: obs.source,
          sessionId: obs.session_id,
          createdAt: obs.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Protocol Observations] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create observation' },
      { status: 500 }
    );
  }
}
