export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

/**
 * PATCH /api/members/patterns/:id/label
 * Update a pattern's member_label. Uses explicit sourceType to target the correct table.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { label, sourceType } = body as { label?: string; sourceType?: 'maia' | 'practitioner' };

    if (!sourceType || !['maia', 'practitioner'].includes(sourceType)) {
      return NextResponse.json({ error: 'sourceType required (maia | practitioner)' }, { status: 400 });
    }

    // Trim and normalize — empty string reverts to null (shows original theme)
    const normalizedLabel = typeof label === 'string' ? label.trim() || null : null;

    const table = sourceType === 'maia' ? 'pattern_ledger' : 'member_patterns';
    const result = await query(
      `UPDATE ${table}
       SET member_label = $1, updated_at = NOW()
       WHERE id = $2 AND member_id = $3
       RETURNING id, member_label AS "memberLabel"`,
      [normalizedLabel, id, session.memberId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...result.rows[0] }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/members/patterns/:id/label failed:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}
