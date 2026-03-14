export const dynamic = 'force-dynamic';

/**
 * Field Signals API
 *
 * GET  — list signals for a decision or change
 * POST — create a new field signal
 *
 * Query params for GET: decisionId | changeId | clientId (any combination)
 * Body for POST: FieldSignal fields (without id/createdAt)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import type { FieldSignal } from '@/lib/studio/practitioner/types';

function rowToSignal(row: Record<string, unknown>): FieldSignal {
  return {
    id: row.id as string,
    decisionId: row.decision_id as string | null,
    changeId: row.change_id as string | null,
    studioSessionId: row.studio_session_id as string | null,
    clientId: row.client_id as string | null,
    practitionerId: row.practitioner_id as string,
    source: row.source as FieldSignal['source'],
    type: row.signal_type as FieldSignal['type'],
    title: row.title as string,
    content: row.content as string,
    intensity: row.intensity != null ? Number(row.intensity) : null,
    tags: (row.tags as string[]) || [],
    timestamp: row.signal_timestamp as string,
    createdAt: row.created_at as string,
  };
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const decisionId = searchParams.get('decisionId');
    const changeId = searchParams.get('changeId');
    const clientId = searchParams.get('clientId');

    const conditions: string[] = ['practitioner_id = $1'];
    const values: unknown[] = [practitionerId];
    let idx = 2;

    if (decisionId) { conditions.push(`decision_id = $${idx++}`); values.push(decisionId); }
    if (changeId)   { conditions.push(`change_id = $${idx++}`);   values.push(changeId); }
    if (clientId)   { conditions.push(`client_id = $${idx++}`);   values.push(clientId); }

    const result = await db.query(
      `SELECT * FROM studio_field_signals WHERE ${conditions.join(' AND ')} ORDER BY signal_timestamp DESC`,
      values
    );

    return NextResponse.json({ signals: result.rows.map(rowToSignal) });
  } catch (error) {
    console.error('[Field Signals] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      decisionId = null,
      changeId = null,
      studioSessionId = null,
      clientId = null,
      source,
      type,
      title,
      content,
      intensity = null,
      tags = [],
      timestamp,
    } = body;

    if (!source || !type || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'source, type, title, and content are required' }, { status: 400 });
    }

    const VALID_SOURCES = ['client', 'practitioner', 'maia'];
    const VALID_TYPES = ['somatic', 'relational', 'behavioral', 'emotional', 'symbolic', 'cognitive'];
    if (!VALID_SOURCES.includes(source)) return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    if (!VALID_TYPES.includes(type))    return NextResponse.json({ error: 'Invalid signal type' }, { status: 400 });

    const result = await db.query(
      `INSERT INTO studio_field_signals
        (decision_id, change_id, studio_session_id, client_id, practitioner_id,
         source, signal_type, title, content, intensity, tags, signal_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12::timestamptz, NOW()))
       RETURNING *`,
      [decisionId, changeId, studioSessionId, clientId, practitionerId,
       source, type, title.trim(), content.trim(), intensity, tags,
       timestamp || null]
    );

    return NextResponse.json({ signal: rowToSignal(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[Field Signals] POST error:', error);
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 });
  }
}
