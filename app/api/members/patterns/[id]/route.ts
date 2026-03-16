export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

type Params = { params: { id: string } };

/**
 * PUT /api/members/patterns/[id]
 *
 * Records a member's response to a pattern.
 * Status transitions: offered → confirmed | partial | rejected
 * Also allows retiring a pattern the member wants dismissed.
 *
 * Body: { response: 'confirmed' | 'partial' | 'rejected' | 'retired', text?: string }
 */
export async function PUT(request: NextRequest, { params }: Params) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });

  const memberId = await resolveMemberId(request);
  if (!memberId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid pattern ID' }, { status: 400 });
  }

  let body: { response?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { response, text } = body;
  const validResponses = ['confirmed', 'partial', 'rejected', 'retired'];
  if (!response || !validResponses.includes(response)) {
    return NextResponse.json(
      { error: `response must be one of: ${validResponses.join(', ')}` },
      { status: 400 }
    );
  }

  // Verify pattern belongs to this member
  try {
    const check = await query(
      `SELECT id, status FROM pattern_ledger WHERE id = $1 AND member_id = $2`,
      [id, memberId]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('[patterns] ownership check failed:', error);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const retiredAt = response === 'retired' ? 'NOW()' : 'NULL';
    const retirementReason = response === 'retired' ? "'member_rejected'" : 'NULL';

    const result = await query(
      `UPDATE pattern_ledger SET
        status = $1,
        member_response = $2,
        member_response_at = NOW(),
        retired_at = ${retiredAt},
        retirement_reason = ${retirementReason}
       WHERE id = $3 AND member_id = $4
       RETURNING id, statement, scope, status, confidence, member_response, updated_at`,
      [response, text ?? null, id, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
    }

    return NextResponse.json({ pattern: result.rows[0] });
  } catch (error) {
    console.error('[patterns] PUT failed:', error);
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
