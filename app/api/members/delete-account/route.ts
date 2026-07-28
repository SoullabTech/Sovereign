// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';


import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { clearSessionCookie } from '@/lib/auth/serverSessions';

/**
 * POST /api/members/delete-account
 * Permanently delete the AUTHENTICATED member's account and associated data.
 *
 * The caller may confirm deletion; the caller may not select whose account is
 * deleted.
 *
 * BEFORE (2026-07-28): the target was taken from a body-supplied `memberId`,
 * with no session resolution at all. The only barrier was `confirmUsername`
 * having to match that member's username — a display identifier, not a secret,
 * and member UUIDs are already exposed to clients. Any caller who knew a
 * username and id could permanently destroy that account and its data.
 *
 * AFTER: the target IS the member resolved from the verified session. A
 * body-supplied `memberId` no longer selects anything; it is accepted only so a
 * disagreement can be refused before any deletion runs. `confirmUsername`
 * remains, but purely as a destructive-action confirmation — it is compared
 * against the authoritative username of the SESSION-derived member.
 *
 * Deletion is transactional, and the member's sessions are revoked inside the
 * same transaction, so a failure part-way cannot leave a half-deleted account
 * with live credentials.
 */

/** Tables cleaned opportunistically — may not exist in every environment. */
const OPTIONAL_CLEANUP: ReadonlyArray<{ table: string; column: string }> = [
  { table: 'developmental_memories', column: 'user_id' },
  { table: 'google_calendar_credentials', column: 'user_id' },
  { table: 'memory_links', column: 'user_id' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const { memberId: claimedMemberId, confirmUsername } = body ?? {};

    // 1. The actor comes from a verified session — never from the request body.
    //    getMemberIdFromRequest resolves an auth_sessions-backed credential and
    //    already rejects a mismatched x-member-id claim as impersonation.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. A body-supplied id is not an input. If one is present and disagrees
    //    with the session, refuse — before any lookup or deletion runs.
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

    // 3. Confirmation is compared against the SESSION-derived member's
    //    authoritative username. This is a destructive-action confirmation, not
    //    an authorization control — authorization was settled in step 1.
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

    // 4. All-or-nothing. A partial failure must not leave an account that is
    //    half-deleted but still signed in.
    await transaction(async (tx) => {
      // Revoke credentials first: if anything below fails and rolls back, the
      // account is intact AND still usable. If it succeeds, no live session
      // outlives the member row.
      await tx.query(
        `UPDATE auth_sessions
            SET revoked = TRUE, revoked_at = NOW(), revoked_reason = 'account_deleted'
          WHERE member_id = $1 AND revoked = FALSE`,
        [memberId],
      );

      await tx.query(`DELETE FROM member_settings WHERE member_id = $1`, [memberId]);
      await tx.query(`DELETE FROM member_sessions WHERE member_id = $1`, [memberId]);

      // Best-effort tables, each in its own savepoint: a table missing in this
      // environment must not abort the whole transaction (the previous code
      // tolerated this with .catch(); inside a transaction a raw failure would
      // poison it).
      for (const { table, column } of OPTIONAL_CLEANUP) {
        await tx.query('SAVEPOINT optional_cleanup');
        try {
          await tx.query(`DELETE FROM ${table} WHERE ${column} = $1`, [memberId]);
          await tx.query('RELEASE SAVEPOINT optional_cleanup');
        } catch {
          await tx.query('ROLLBACK TO SAVEPOINT optional_cleanup');
        }
      }

      await tx.query(`DELETE FROM members WHERE id = $1`, [memberId]);
    });

    // Cookie removal is presentation cleanup; the credential was already
    // revoked inside the transaction above.
    await clearSessionCookie().catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data permanently deleted',
    });
  } catch (error) {
    console.error('[Delete Account API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
