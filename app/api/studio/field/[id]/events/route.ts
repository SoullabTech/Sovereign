export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO FIELD ITEM EVENTS API
 *
 * Log events on a process item.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_EVENT_TYPES = [
  'created',
  'updated',
  'reflected',
  'consulted',
  'resolved',
  'released',
  'reopened',
  'promoted',
  'linked',
] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = identity;
    const { id } = params;
    const body = await request.json();

    // Verify ownership
    const itemResult = await db.query(
      `SELECT id FROM process_items WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const { eventType, content, metadata = {} } = body;

    // Validation
    if (!(VALID_EVENT_TYPES as readonly string[]).includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    const eventId = randomUUID();
    const result = await db.query(
      `INSERT INTO process_item_events
        (id, item_id, event_type, content, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [eventId, id, eventType, content?.trim() || null, metadata]
    );

    const row = result.rows[0];
    return NextResponse.json({
      event: {
        id: row.id,
        itemId: row.item_id,
        eventType: row.event_type,
        content: row.content,
        metadata: row.metadata || {},
        createdAt: row.created_at,
      },
    });
  } catch (error) {
    console.error('[Studio Field Events] POST error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
