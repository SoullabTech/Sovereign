export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO FIELD API
 *
 * List and create process items for the practitioner's Field.
 * Also surfaces active Changes and Decisions not yet linked as process items.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { randomUUID } from 'crypto';

const VALID_TYPES = ['challenge', 'change', 'decision', 'breakthrough', 'question', 'next_edge'] as const;
const VALID_STATUSES = ['alive', 'resolved', 'released', 'archived'] as const;
const VALID_URGENCIES = ['none', 'low', 'medium', 'high', 'acute'] as const;
const VALID_ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = identity;
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const status = searchParams.get('status') || 'alive';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Query process items
    let itemsSql = `
      SELECT
        id,
        member_id,
        practitioner_id,
        type,
        title,
        body,
        element,
        status,
        urgency,
        tags,
        source_table,
        source_id,
        parent_id,
        occurred_at,
        resolved_at,
        created_at,
        updated_at
      FROM process_items
      WHERE member_id = $1
    `;
    const itemsParams: any[] = [memberId];

    if (typeFilter && (VALID_TYPES as readonly string[]).includes(typeFilter)) {
      itemsSql += ` AND type = $${itemsParams.length + 1}`;
      itemsParams.push(typeFilter);
    }

    if ((VALID_STATUSES as readonly string[]).includes(status)) {
      itemsSql += ` AND status = $${itemsParams.length + 1}`;
      itemsParams.push(status);
    }

    itemsSql += ` ORDER BY created_at DESC LIMIT $${itemsParams.length + 1}`;
    itemsParams.push(limit);

    const itemsResult = await db.query(itemsSql, itemsParams);

    const items = itemsResult.rows.map(row => ({
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
    }));

    // Also query unlinked changes (active states, not already in process_items)
    const changesResult = await db.query(
      `SELECT
        c.id,
        c.title,
        c.description,
        c.change_type,
        c.urgency,
        c.status,
        c.hexagram_number,
        c.hexagram_name,
        c.created_at
      FROM studio_changes c
      WHERE c.member_id = $1
        AND c.status IN ('naming', 'casting', 'consulting', 'active', 'integrating')
        AND NOT EXISTS (
          SELECT 1 FROM process_items pi
          WHERE pi.source_table = 'studio_changes'
            AND pi.source_id = c.id
        )
      ORDER BY c.created_at DESC
      LIMIT 20`,
      [memberId]
    );

    const changes = changesResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      changeType: row.change_type,
      urgency: row.urgency,
      status: row.status,
      hexagramNumber: row.hexagram_number,
      hexagramName: row.hexagram_name,
      createdAt: row.created_at,
    }));

    // Also query unlinked decisions (active states, not already in process_items)
    const decisionsResult = await db.query(
      `SELECT
        d.id,
        d.title,
        d.context,
        d.time_pressure,
        d.status,
        d.created_at
      FROM studio_decisions d
      WHERE d.practitioner_id = $1
        AND d.status IN ('draft', 'consulting', 'complete')
        AND NOT EXISTS (
          SELECT 1 FROM process_items pi
          WHERE pi.source_table = 'studio_decisions'
            AND pi.source_id = d.id
        )
      ORDER BY d.created_at DESC
      LIMIT 20`,
      [identity.practitionerId]
    );

    const decisions = decisionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      context: row.context,
      timePressure: row.time_pressure,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ items, changes, decisions });
  } catch (error) {
    console.error('[Studio Field] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch field items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId, practitionerId } = identity;
    const body = await request.json();

    const {
      type,
      title,
      body: itemBody,
      element,
      urgency = 'none',
      tags = [],
      parentId,
      occurredAt,
    } = body;

    // Validation
    if (!(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (element && !(VALID_ELEMENTS as readonly string[]).includes(element)) {
      return NextResponse.json({ error: 'Invalid element' }, { status: 400 });
    }
    if (!(VALID_URGENCIES as readonly string[]).includes(urgency)) {
      return NextResponse.json({ error: 'Invalid urgency' }, { status: 400 });
    }

    // Verify parent ownership if parentId provided
    if (parentId) {
      const parentResult = await db.query(
        `SELECT member_id FROM process_items WHERE id = $1`,
        [parentId]
      );
      if (parentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Parent item not found' }, { status: 400 });
      }
      if (parentResult.rows[0].member_id !== memberId) {
        return NextResponse.json({ error: 'Parent item not owned by you' }, { status: 403 });
      }
    }

    const id = randomUUID();
    const eventId = randomUUID();

    // Use transaction to create item + event atomically
    await db.transaction(async (client) => {
      // Create process item
      await client.query(
        `INSERT INTO process_items
          (id, member_id, practitioner_id, type, title, body, element, urgency, tags, parent_id, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          id,
          memberId,
          practitionerId,
          type,
          title.trim(),
          itemBody?.trim() || null,
          element || null,
          urgency,
          tags,
          parentId || null,
          occurredAt || null,
        ]
      );

      // Create 'created' event
      await client.query(
        `INSERT INTO process_item_events
          (id, item_id, event_type, content)
         VALUES ($1, $2, 'created', $3)`,
        [eventId, id, `Created ${type}: ${title.trim()}`]
      );
    });

    // Fetch the created item
    const result = await db.query(
      `SELECT * FROM process_items WHERE id = $1`,
      [id]
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
    console.error('[Studio Field] POST error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
