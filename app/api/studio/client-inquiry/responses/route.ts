export const dynamic = 'force-dynamic';

/**
 * Client Inquiry Responses API
 *
 * GET  — fetch responses for a decision or change
 * POST — save a completed inquiry response
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { getPromptSet } from '@/lib/studio/practitioner/promptSets';
import type { ClientInquiryResponse } from '@/lib/studio/practitioner/types';

function rowToResponse(row: Record<string, unknown>): ClientInquiryResponse {
  return {
    id: row.id as string,
    decisionId: row.decision_id as string | null,
    changeId: row.change_id as string | null,
    studioSessionId: row.studio_session_id as string | null,
    clientId: row.client_id as string | null,
    promptSetId: row.prompt_set_id as string,
    promptSetTitle: row.prompt_set_title as string,
    responses: (row.responses as ClientInquiryResponse['responses']) || [],
    summaryText: row.summary_text as string | null,
    tags: (row.tags as string[]) || [],
    completedAt: row.completed_at as string,
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

    const conditions: string[] = ['practitioner_id = $1'];
    const values: unknown[] = [practitionerId];
    let idx = 2;

    if (decisionId) { conditions.push(`decision_id = $${idx++}`); values.push(decisionId); }
    if (changeId)   { conditions.push(`change_id = $${idx++}`);   values.push(changeId); }

    const result = await db.query(
      `SELECT * FROM studio_inquiry_responses WHERE ${conditions.join(' AND ')} ORDER BY completed_at DESC`,
      values
    );

    return NextResponse.json({ responses: result.rows.map(rowToResponse) });
  } catch (error) {
    console.error('[Client Inquiry] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
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
      promptSetId,
      responses = [],
      summaryText = null,
      tags = [],
      completedAt,
    } = body;

    if (!promptSetId || !Array.isArray(responses)) {
      return NextResponse.json({ error: 'promptSetId and responses are required' }, { status: 400 });
    }

    // Resolve prompt set title
    const promptSet = getPromptSet(promptSetId);
    const promptSetTitle = promptSet?.title ?? promptSetId;

    const result = await db.query(
      `INSERT INTO studio_inquiry_responses
        (decision_id, change_id, studio_session_id, client_id, practitioner_id,
         prompt_set_id, prompt_set_title, responses, summary_text, tags, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()))
       RETURNING *`,
      [decisionId, changeId, studioSessionId, clientId, practitionerId,
       promptSetId, promptSetTitle, JSON.stringify(responses), summaryText, tags,
       completedAt || null]
    );

    return NextResponse.json({ response: rowToResponse(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[Client Inquiry] POST error:', error);
    return NextResponse.json({ error: 'Failed to save inquiry response' }, { status: 500 });
  }
}
