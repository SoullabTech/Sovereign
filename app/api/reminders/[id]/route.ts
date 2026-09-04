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
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import { cancelIfNotDispatching } from '@/lib/reminders/dispatch';

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

  // Conditional on dispatch not having begun. The answer is TRUTHFUL:
  // 'already_sending' is not an error, it is the honest report that the send
  // has started and an email cannot be recalled. Reporting success there would
  // be a lie the member acts on.
  const result = await cancelIfNotDispatching({ id, memberId: member.id });

  if (result === 'not_found') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (result === 'already_sending') {
    return NextResponse.json(
      {
        cancelled: false,
        state: 'already_sending',
        message: 'This one is already on its way — it was sent before the cancellation reached us.',
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ cancelled: true, state: 'cancelled' });
}
