export const dynamic = 'force-dynamic';

/**
 * MEMBER CHANGE EXPERIENCES API
 *
 * GET  - List experiences for a member's change
 * POST - Create a new experience entry
 *
 * The member can log experiences (reflections, dreams, synchronicities,
 * breakthroughs, setbacks, field events) at any time — without needing
 * MAIA to weigh in. The chain belongs to them.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { randomUUID } from 'crypto';

const VALID_EXPERIENCE_TYPES = ['field_event', 'reflection', 'breakthrough', 'setback', 'dream', 'synchronicity'] as const;
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: changeId } = await params;

    // Verify change belongs to member
    const changeCheck = await db.query(
      `SELECT id FROM studio_changes WHERE id = $1 AND member_id = $2`,
      [changeId, memberId]
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
    console.error('[Member Change Experiences] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: changeId } = await params;

    // Verify change belongs to member
    const changeCheck = await db.query(
      `SELECT id FROM studio_changes WHERE id = $1 AND member_id = $2`,
      [changeId, memberId]
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
        memberId,
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
    console.error('[Member Change Experiences] POST error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
