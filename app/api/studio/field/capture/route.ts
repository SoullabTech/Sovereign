export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO FIELD CAPTURE API
 *
 * Create a raw offering (field_record) — the raw observations before naming.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = identity;
    const body = await request.json();

    const {
      observation,
      tags = [],
      element,
    } = body;

    // Validation
    if (!observation?.trim()) {
      return NextResponse.json({ error: 'Observation is required' }, { status: 400 });
    }
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }

    // Create observation JSONB structure
    const observationData = {
      content: observation.trim(),
      element: element || null,
      capturedAt: new Date().toISOString(),
    };

    const id = randomUUID();
    const result = await db.query(
      `INSERT INTO field_records
        (id, user_id, observation, tags, completion_stage)
       VALUES ($1, $2, $3, $4, 1)
       RETURNING id, observation, tags, created_at`,
      [id, memberId, JSON.stringify(observationData), JSON.stringify(tags)]
    );

    const row = result.rows[0];
    return NextResponse.json({
      record: {
        id: row.id,
        observation: row.observation,
        tags: row.tags || [],
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[Studio Field Capture] POST error:', error);
    return NextResponse.json({ error: 'Failed to capture offering' }, { status: 500 });
  }
}
