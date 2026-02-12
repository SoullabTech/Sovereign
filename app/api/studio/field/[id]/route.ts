export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO FIELD ITEM API
 *
 * Get and update a single process item.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_STATUSES = ['alive', 'resolved', 'released', 'archived'] as const;
const VALID_URGENCIES = ['none', 'low', 'medium', 'high', 'acute'] as const;
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function GET(
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

    // Get the item
    const itemResult = await db.query(
      `SELECT * FROM process_items WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const row = itemResult.rows[0];
    const item = {
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
    };

    // Get events
    const eventsResult = await db.query(
      `SELECT id, item_id, event_type, content, metadata, created_at
       FROM process_item_events
       WHERE item_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    const events = eventsResult.rows.map(e => ({
      id: e.id,
      itemId: e.item_id,
      eventType: e.event_type,
      content: e.content,
      metadata: e.metadata || {},
      createdAt: e.created_at,
    }));

    return NextResponse.json({ item, events });
  } catch (error) {
    console.error('[Studio Field Item] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
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
    const existingResult = await db.query(
      `SELECT status FROM process_items WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const previousStatus = existingResult.rows[0].status;

    // Extract fields
    const {
      title,
      body: itemBody,
      element,
      status,
      urgency,
      tags,
      resolvedAt,
    } = body;

    // Validation
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }
    if (status && !(VALID_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (urgency && !(VALID_URGENCIES as readonly string[]).includes(urgency)) {
      return NextResponse.json({ error: 'Invalid urgency' }, { status: 400 });
    }

    // Build update fields
    const updates: string[] = [];
    const values: any[] = [id, memberId];
    let paramCount = 2;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title.trim());
    }
    if (itemBody !== undefined) {
      paramCount++;
      updates.push(`body = $${paramCount}`);
      values.push(itemBody?.trim() || null);
    }
    if (element !== undefined) {
      paramCount++;
      updates.push(`element = $${paramCount}`);
      values.push(element || null);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }
    if (urgency !== undefined) {
      paramCount++;
      updates.push(`urgency = $${paramCount}`);
      values.push(urgency);
    }
    if (tags !== undefined) {
      paramCount++;
      updates.push(`tags = $${paramCount}`);
      values.push(tags);
    }
    if (resolvedAt !== undefined) {
      paramCount++;
      updates.push(`resolved_at = $${paramCount}`);
      values.push(resolvedAt);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Update item
    const updateSql = `
      UPDATE process_items
      SET ${updates.join(', ')}
      WHERE id = $1 AND member_id = $2
      RETURNING *
    `;

    const result = await db.query(updateSql, values);
    const row = result.rows[0];

    // Create event for status change
    if (status && status !== previousStatus) {
      let eventType = 'updated';
      if (status === 'resolved') {
        eventType = 'resolved';
      } else if (status === 'released') {
        eventType = 'released';
      } else if (status === 'alive' && previousStatus !== 'alive') {
        eventType = 'reopened';
      }

      const eventId = randomUUID();
      await db.query(
        `INSERT INTO process_item_events
          (id, item_id, event_type, content)
         VALUES ($1, $2, $3, $4)`,
        [eventId, id, eventType, `Status changed: ${previousStatus} → ${status}`]
      );
    }

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
    console.error('[Studio Field Item] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
