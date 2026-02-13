export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO FIELD NAME API
 *
 * Promote a raw offering (field_record) into a named process item.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_TYPES = ['challenge', 'change', 'decision', 'breakthrough', 'question', 'next_edge'] as const;
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, practitionerId } = identity;
    const body = await request.json();

    const {
      fieldRecordId,
      type,
      title,
      body: itemBody,
      element,
      tags = [],
    } = body;

    // Validation
    if (!fieldRecordId) {
      return NextResponse.json({ error: 'fieldRecordId is required' }, { status: 400 });
    }
    if (!(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }

    // Verify the field_record belongs to the member
    const recordResult = await db.query(
      `SELECT id FROM field_records WHERE id = $1 AND user_id = $2`,
      [fieldRecordId, memberId]
    );

    if (recordResult.rows.length === 0) {
      return NextResponse.json({ error: 'Field record not found or not owned by you' }, { status: 404 });
    }

    const itemId = randomUUID();
    const eventId = randomUUID();

    // Use transaction to create item + event atomically
    await db.transaction(async (client) => {
      // Create process item linked to field_record
      await client.query(
        `INSERT INTO process_items
          (id, member_id, practitioner_id, type, title, body, element, tags, source_table, source_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'field_records', $9)`,
        [
          itemId,
          memberId,
          practitionerId,
          type,
          title.trim(),
          itemBody?.trim() || null,
          element || null,
          tags,
          fieldRecordId,
        ]
      );

      // Create 'promoted' event
      await client.query(
        `INSERT INTO process_item_events
          (id, item_id, event_type, content, metadata)
         VALUES ($1, $2, 'promoted', $3, $4)`,
        [
          eventId,
          itemId,
          `Promoted from raw offering: ${title.trim()}`,
          JSON.stringify({ fieldRecordId }),
        ]
      );
    });

    // Fetch the created item
    const result = await db.query(
      `SELECT * FROM process_items WHERE id = $1`,
      [itemId]
    );

    const row = result.rows[0];
    return NextResponse.json({
      item: {
        id: row.id,
        memberId: row.member_id,
        practitionerId: row.practitioner_id,
        type: row.type,
        title: row.title,
        body: row.body,
        element: row.element,
        status: row.status,
        urgency: row.urgency,
        tags: row.tags || [],
        sourceTable: row.source_table,
        sourceId: row.source_id,
        parentId: row.parent_id,
        occurredAt: row.occurred_at,
        resolvedAt: row.resolved_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Field Name] POST error:', error);
    return NextResponse.json({ error: 'Failed to name item' }, { status: 500 });
  }
}
