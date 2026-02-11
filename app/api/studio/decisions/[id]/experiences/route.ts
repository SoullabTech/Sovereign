export const dynamic = 'force-dynamic';

/**
 * DECISION EXPERIENCES API
 *
 * GET  - List experiences for a decision
 * POST - Create a new experience entry
 *
 * Experiences are the connective tissue between council consultations:
 * field events, reflections, breakthroughs, setbacks logged by the practitioner.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_EXPERIENCE_TYPES = ['field_event', 'reflection', 'breakthrough', 'setback'] as const;
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

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
    const { id: decisionId } = await params;

    // Verify decision belongs to practitioner
    const decisionCheck = await db.query(
      `SELECT id FROM studio_decisions WHERE id = $1 AND practitioner_id = $2`,
      [decisionId, practitionerId]
    );
    if (decisionCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT id, decision_id, occurred_at, experience_type, content, element, tags, created_at
       FROM decision_experiences
       WHERE decision_id = $1
       ORDER BY occurred_at DESC`,
      [decisionId]
    );

    const experiences = result.rows.map(row => ({
      id: row.id,
      decisionId: row.decision_id,
      occurredAt: row.occurred_at?.toISOString(),
      experienceType: row.experience_type,
      content: row.content,
      element: row.element,
      tags: row.tags || [],
      createdAt: row.created_at?.toISOString(),
    }));

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('[Decision Experiences] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: decisionId } = await params;

    // Verify decision belongs to practitioner
    const decisionCheck = await db.query(
      `SELECT id FROM studio_decisions WHERE id = $1 AND practitioner_id = $2`,
      [decisionId, practitionerId]
    );
    if (decisionCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
    }

    const body = await request.json();
    const { experienceType, content, element, tags, occurredAt } = body;

    if (!experienceType || !(VALID_EXPERIENCE_TYPES as readonly string[]).includes(experienceType)) {
      return NextResponse.json({ error: 'Invalid experience type' }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO decision_experiences
        (id, decision_id, practitioner_id, occurred_at, experience_type, content, element, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        decisionId,
        practitionerId,
        occurredAt ? new Date(occurredAt) : new Date(),
        experienceType,
        content.trim(),
        element || null,
        tags || [],
      ]
    );

    const row = result.rows[0];
    return NextResponse.json({
      experience: {
        id: row.id,
        decisionId: row.decision_id,
        occurredAt: row.occurred_at?.toISOString(),
        experienceType: row.experience_type,
        content: row.content,
        element: row.element,
        tags: row.tags || [],
        createdAt: row.created_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Decision Experiences] POST error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
