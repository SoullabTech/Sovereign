/**
 * DELETE /api/reminders/[id] — the member cancels a scheduled reminder.
 *
 * Cancellation is ordinary: immediate, idempotent, ownership-scoped, and it
 * requires no reason. A control that asks why is a retention mechanism.
 *
 * Spec: docs/specs/SELF-ADDRESSED-RETURN-01_TIER1_SPEC_2026-09-04.md §2
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'reminder id required' }, { status: 400 });
  }

  // Idempotent: cancelling an already-cancelled reminder succeeds quietly.
  // A delivered reminder cannot be un-delivered, so it is left untouched.
  await query(
    `UPDATE member_reminders
        SET cancelled_at = now()
      WHERE id = $1
        AND member_id = $2
        AND cancelled_at IS NULL
        AND delivered_at IS NULL`,
    [id, member.id],
  );

  return NextResponse.json({ cancelled: true });
}
