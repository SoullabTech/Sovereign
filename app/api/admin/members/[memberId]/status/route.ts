/**
 * Admin — Member lifecycle status change (Disable / Archive / Reactivate)
 *
 * POST /api/admin/members/[memberId]/status
 *   body: { status: 'active' | 'disabled' | 'archived', reason?: string }
 *
 * - active   → reactivate
 * - disabled → block sign-in, keep visible, preserve data
 * - archived → block sign-in, hide from active surfaces, preserve data
 *
 * Disable / archive also revoke the member's live sessions immediately.
 * Admin-gated via requireAdmin (x-admin-secret). Every change is audited.
 *
 * This route NEVER deletes member data. Hard delete is a separate Phase 2 surface
 * (DELETE /api/admin/members/[memberId]).
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { setMemberStatus, isMemberStatus, type MemberStatus } from '@/lib/members/lifecycle';
import { logAuthEvent, type AuthAction } from '@/lib/security/authAudit';

const STATUS_ACTION: Record<MemberStatus, AuthAction> = {
  active: 'member_reactivated',
  disabled: 'member_disabled',
  archived: 'member_archived',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const { memberId } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body?.status;
    const reason = typeof body?.reason === 'string' ? body.reason : null;

    if (!isMemberStatus(status)) {
      return NextResponse.json(
        { error: "status must be one of 'active', 'disabled', 'archived'" },
        { status: 400 }
      );
    }

    // The admin gate is a shared secret with no member identity. If the acting
    // admin is also a signed-in member, the UI may pass x-actor-id for the trail.
    const actorId = request.headers.get('x-actor-id');

    const result = await setMemberStatus(memberId, status, actorId, reason);

    if (!result.ok) {
      if (result.notFound) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update member status' }, { status: 500 });
    }

    await logAuthEvent(
      {
        action: STATUS_ACTION[status],
        memberId,
        result: 'success',
        metadata: {
          previousStatus: result.previousStatus,
          newStatus: result.status,
          reason: reason ?? undefined,
          revokedSessions: result.revokedSessions,
          actor: actorId || 'admin-secret',
        },
      },
      request
    );

    console.log(
      `[admin/members] status ${result.previousStatus} → ${result.status} ` +
        `(member ${memberId.slice(0, 8)}…, revoked ${result.revokedSessions} session(s))`
    );

    return NextResponse.json({
      ok: true,
      memberId,
      previousStatus: result.previousStatus,
      status: result.status,
      noop: result.noop,
      revokedSessions: result.revokedSessions,
      username: result.username,
    });
  } catch (error) {
    console.error('[admin/members] Status change error:', error);
    return NextResponse.json({ error: 'Failed to update member status' }, { status: 500 });
  }
}
