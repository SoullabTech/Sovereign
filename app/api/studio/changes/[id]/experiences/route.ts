export const dynamic = 'force-dynamic';

/**
 * CHANGE EXPERIENCES API
 *
 * GET  - List experiences for a change
 * POST - Create a new experience entry
 *
 * Experiences are the connective tissue between council consultations:
 * field events, reflections, breakthroughs, setbacks, dreams, synchronicities
 * logged by the practitioner or member.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_EXPERIENCE_TYPES = ['field_event', 'reflection', 'breakthrough', 'setback', 'dream', 'synchronicity'] as const;
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
    const { id: changeId } = await params;

    // Verify change belongs to practitioner
    const changeCheck = await db.query(
      `SELECT id FROM studio_changes WHERE id = $1 AND practitioner_id = $2`,
      [changeId, practitionerId]
    );
    if (changeCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT id, change_id, occurred_at, experience_type, content, element, hexagram_resonance, tags, created_at
       FROM change_experiences
       WHERE change_id = $1
       ORDER BY occurred_at DESC`,
      [changeId]
    );

    const experiences = result.rows.map(row => ({
      id: row.id,
      changeId: row.change_id,
      occurredAt: row.occurred_at?.toISOString(),
      experienceType: row.experience_type,
      content: row.content,
      element: row.element,
      hexagramResonance: row.hexagram_resonance,
      tags: row.tags || [],
      createdAt: row.created_at?.toISOString(),
    }));

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('[Change Experiences] GET error:', error);
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
    const { id: changeId } = await params;

    // Verify change belongs to practitioner
    const changeCheck = await db.query(
      `SELECT id FROM studio_changes WHERE id = $1 AND practitioner_id = $2`,
      [changeId, practitionerId]
    );
    if (changeCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Change not found' }, { status: 404 });
    }

    const body = await request.json();
    const { experienceType, content, element, hexagramResonance, tags, occurredAt } = body;

    if (!experienceType || !(VALID_EXPERIENCE_TYPES as readonly string[]).includes(experienceType)) {
      return NextResponse.json({ error: 'Invalid experience type' }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }
    if (hexagramResonance && (hexagramResonance < 1 || hexagramResonance > 64)) {
      return NextResponse.json({ error: 'Hexagram resonance must be between 1 and 64' }, { status: 400 });
    }

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO change_experiences
        (id, change_id, owner_id, occurred_at, experience_type, content, element, hexagram_resonance, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        changeId,
        practitionerId,
        occurredAt ? new Date(occurredAt) : new Date(),
        experienceType,
        content.trim(),
        element || null,
        hexagramResonance || null,
        tags || [],
      ]
    );

    const row = result.rows[0];
    return NextResponse.json({
      experience: {
        id: row.id,
        changeId: row.change_id,
        occurredAt: row.occurred_at?.toISOString(),
        experienceType: row.experience_type,
        content: row.content,
        element: row.element,
        hexagramResonance: row.hexagram_resonance,
        tags: row.tags || [],
        createdAt: row.created_at?.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Change Experiences] POST error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
