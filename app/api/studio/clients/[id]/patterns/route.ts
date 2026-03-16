export const dynamic = 'force-dynamic';

/**
 * Studio Pattern Ledger — Practitioner access to client patterns
 *
 * GET  /api/studio/clients/[id]/patterns  — list patterns for a client
 * POST /api/studio/clients/[id]/patterns  — create a pattern (practitioner-observed)
 *
 * Practitioners can observe and record patterns; they cannot override
 * the member's response to a pattern. The member's authority is final.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: clientId } = await params;
  const { practitionerId } = identity;

  // Verify client belongs to this practitioner
  const clientCheck = await db.query(
    `SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (clientCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Resolve linked member_id (if client is a registered member)
  const memberLink = await db.query(
    `SELECT member_id FROM practitioner_clients WHERE id = $1`,
    [clientId]
  );
  const memberId = memberLink.rows[0]?.member_id ?? null;

  if (!memberId) {
    // Client is not a registered MAIA member — no pattern ledger yet
    return NextResponse.json({
      patterns: [],
      note: 'Client does not have a linked MAIA account. Patterns will appear once they sign up.',
    });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200);

  const allowedStatuses = ['emerging', 'offered', 'confirmed', 'partial', 'rejected', 'retired'];
  const statuses = statusParam
    ? statusParam.split(',').filter(s => allowedStatuses.includes(s))
    : ['emerging', 'offered', 'confirmed', 'partial'];

  if (statuses.length === 0) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  try {
    const placeholders = statuses.map((_, i) => `$${i + 2}`).join(', ');
    const result = await db.query(
      `SELECT
        id, statement, scope, confidence, status,
        member_response, member_response_at, times_offered,
        first_seen_at, last_evidence_at, evidence_refs,
        created_at, updated_at
      FROM pattern_ledger
      WHERE member_id = $1
        AND status IN (${placeholders})
      ORDER BY confidence DESC, last_evidence_at DESC
      LIMIT $${statuses.length + 2}`,
      [memberId, ...statuses, limit]
    );

    return NextResponse.json({ patterns: result.rows, member_id: memberId });
  } catch (error) {
    console.error('[studio/patterns] GET failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: clientId } = await params;
  const { practitionerId } = identity;

  // Verify client belongs to this practitioner
  const clientCheck = await db.query(
    `SELECT id, member_id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2`,
    [clientId, practitionerId]
  );
  if (clientCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const memberId = clientCheck.rows[0].member_id;
  if (!memberId) {
    return NextResponse.json(
      { error: 'Client does not have a linked MAIA account. Cannot add patterns.' },
      { status: 422 }
    );
  }

  let body: { statement?: string; scope?: string; confidence?: number; evidence_refs?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { statement, scope, confidence = 0.5, evidence_refs = [] } = body;

  const validScopes = ['relationship', 'work', 'somatic', 'spiritual', 'recurring_trigger', 'theme'];

  if (!statement || typeof statement !== 'string' || statement.trim().length === 0) {
    return NextResponse.json({ error: 'statement is required' }, { status: 400 });
  }
  if (!scope || !validScopes.includes(scope)) {
    return NextResponse.json({ error: `scope must be one of: ${validScopes.join(', ')}` }, { status: 400 });
  }
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    return NextResponse.json({ error: 'confidence must be 0–1' }, { status: 400 });
  }

  try {
    const result = await db.query(
      `INSERT INTO pattern_ledger
        (member_id, statement, scope, confidence, evidence_refs, status)
       VALUES ($1, $2, $3, $4, $5, 'emerging')
       RETURNING id, statement, scope, confidence, status, created_at`,
      [memberId, statement.trim(), scope, confidence, JSON.stringify(evidence_refs)]
    );

    return NextResponse.json({ pattern: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[studio/patterns] POST failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}
