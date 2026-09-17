// Production requires force-dynamic for per-user database access.
export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { clearSessionCookie } from '@/lib/auth/serverSessions';
import { executeAccountErasure } from '@/lib/erasure/accountErasureExecutor';

/**
 * POST /api/members/delete-account
 *
 * P5-D canonical account-erasure entry point.
 *
 * Authority remains exactly where the containment route put it: the account is
 * selected only from the verified server session. `confirmUsername` is a human
 * destructive-action confirmation, never authorization. After those gates the
 * route delegates to the governed erasure executor; it does not own a second
 * table list, deletion sequence, or success claim.
 */
export async function POST(request: NextRequest) {
  let executorInvoked = false;
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const { memberId: claimedMemberId, confirmUsername } = body ?? {};

    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // A body-supplied id never selects the subject. Keep the old mismatch
    // refusal so a stale/malicious client cannot make ambiguity look harmless.
    if (
      typeof claimedMemberId === 'string' &&
      claimedMemberId.length > 0 &&
      claimedMemberId !== memberId
    ) {
      return NextResponse.json(
        { error: 'You may only delete your own account' },
        { status: 403 },
      );
    }

    const memberResult = await query<{ username: string }>(
      `SELECT username FROM members WHERE id = $1`,
      [memberId],
    );
    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    if (confirmUsername !== memberResult.rows[0].username) {
      return NextResponse.json(
        { error: 'Username confirmation does not match' },
        { status: 400 },
      );
    }

    // Server-minted correlation only. It is not authority and contains no
    // credential/member content.
    executorInvoked = true;
    const result = await executeAccountErasure(memberId, `account-erasure:${randomUUID()}`);

    if (result.state === 'completed') {
      // Presentation cleanup only. Credential revocation/identity end already
      // committed in the governed database transaction.
      await clearSessionCookie().catch(() => {});
    }

    return NextResponse.json(
      {
        state: result.state,
        accountChanged: result.accountChanged,
        actRef: result.actRef,
        message: result.message,
        blocked: result.blocked,
      },
      { status: result.httpStatus },
    );
  } catch (error) {
    console.error('[Delete Account API] Governed erasure request failed', {
      errorType: error instanceof Error ? error.name : typeof error,
    });
    return NextResponse.json(
      executorInvoked
        ? {
            state: 'unknown',
            accountChanged: null,
            message:
              'MAIA could not determine the durable result of this deletion request. ' +
              'Do not assume it completed or failed; sign in again or contact support before retrying.',
            blocked: [],
          }
        : {
            state: 'failed',
            accountChanged: false,
            message: 'Account deletion could not be started safely. Nothing was changed by this request.',
            blocked: [],
          },
      { status: 500 },
    );
  }
}
