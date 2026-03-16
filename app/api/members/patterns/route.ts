export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * GET /api/members/patterns
 *
 * Returns active patterns for the authenticated member.
 * Excludes retired and rejected patterns by default.
 *
 * Query params:
 *   status=emerging,offered,confirmed,partial  (comma-separated, default: all active)
 *   limit=20 (default)
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });

  const memberId = await resolveMemberId(request);
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 100);

  const allowedStatuses = ['emerging', 'offered', 'confirmed', 'partial', 'rejected', 'retired'];
  const requestedStatuses = statusParam
    ? statusParam.split(',').filter(s => allowedStatuses.includes(s))
    : ['emerging', 'offered', 'confirmed', 'partial'];

  if (requestedStatuses.length === 0) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  try {
    const placeholders = requestedStatuses.map((_, i) => `$${i + 2}`).join(', ');
    const result = await query(
      `SELECT
        id, statement, scope, confidence, status,
        member_response, member_response_at, times_offered,
        first_seen_at, last_evidence_at, last_offered_at,
        evidence_refs, created_at, updated_at
      FROM pattern_ledger
      WHERE member_id = $1
        AND status IN (${placeholders})
      ORDER BY confidence DESC, last_evidence_at DESC
      LIMIT $${requestedStatuses.length + 2}`,
      [memberId, ...requestedStatuses, limit]
    );

    return NextResponse.json({ patterns: result.rows });
  } catch (error) {
    console.error('[patterns] GET failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}

/**
 * POST /api/members/patterns
 *
 * Creates a new pattern. Used by practitioners and (eventually) the oracle.
 * Members cannot self-author patterns — patterns are observed, not declared.
 *
 * Body:
 *   { statement, scope, confidence?, evidence_refs? }
 *
 * Requires practitioner session or internal oracle context.
 * For now, accepts any authenticated member who is a practitioner for this member,
 * or the system (x-oracle-internal header with shared secret).
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });

  // Internal oracle context (server-to-server)
  const oracleHeader = request.headers.get('x-oracle-internal');
  const isOracleInternal = oracleHeader === process.env.ORACLE_INTERNAL_SECRET;

  // Determine target member — oracle passes x-target-member-id, practitioners use body
  let targetMemberId: string | null = null;

  if (isOracleInternal) {
    targetMemberId = request.headers.get('x-target-member-id');
  } else {
    // Practitioner creating pattern for their client
    // (handled via studio route — this POST is oracle-only for now)
    return NextResponse.json(
      { error: 'Use /api/studio/clients/[id]/patterns for practitioner-authored patterns' },
      { status: 403 }
    );
  }

  if (!targetMemberId || !/^[0-9a-f-]{36}$/i.test(targetMemberId)) {
    return NextResponse.json({ error: 'Invalid target member' }, { status: 400 });
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
    const result = await query(
      `INSERT INTO pattern_ledger
        (member_id, statement, scope, confidence, evidence_refs, status)
       VALUES ($1, $2, $3, $4, $5, 'emerging')
       RETURNING id, statement, scope, confidence, status, created_at`,
      [targetMemberId, statement.trim(), scope, confidence, JSON.stringify(evidence_refs)]
    );

    return NextResponse.json({ pattern: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[patterns] POST failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}

// ── Auth helper ────────────────────────────────────────────────────────

async function resolveMemberId(request: NextRequest): Promise<string | null> {
  const session = await getCurrentSession();
  if (session?.memberId) return session.memberId;

  const header = request.headers.get('x-member-id');
  if (header && /^[0-9a-f-]{36}$/i.test(header)) return header;

  return null;
}
