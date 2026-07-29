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

/**
 * CONTAINMENT (privacy incident, 2026-07-28) — see
 * docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md.
 *
 * This route deleted the `members` row while leaving the member's personal
 * content behind, then reported "Account and all associated data permanently
 * deleted". Two failures, one of which is worse than the other:
 *
 *   1. Content survives account closure. These tables key on `user_id TEXT`
 *      with no FK to `members`, so nothing cascades.
 *   2. The member was TOLD otherwise, at the one moment they were most
 *      entitled to accuracy.
 *
 * Deleting the `members` row first also destroys the evidence: the
 * `auth_sessions` FK is ON DELETE CASCADE, so the revocation records that
 * would identify an affected member are removed along with the account.
 *
 * Until truthful deletion semantics exist, this route REFUSES to complete
 * when governed content is present, rather than creating another
 * owner-orphaned record set. Refusing is reversible; orphaning is not.
 */
const GOVERNED_CONTENT: ReadonlyArray<{ table: string; column: string; label: string }> = [
  { table: 'conversation_turns', column: 'user_id', label: 'conversations' },
  { table: 'quick_journal_entries', column: 'user_id', label: 'journal entries' },
  { table: 'episodic_memories', column: 'user_id', label: 'remembered moments' },
  { table: 'reflection_capsules', column: 'user_id', label: 'reflections' },
];

/**
 * Posture while the retention lane is open.
 *
 * 'refuse'  — do not delete when governed content exists; direct the member to
 *             a supported path. Currently in force.
 * 'proceed' — delete what this route can and report ONLY that, never implying
 *             completeness.
 *
 * The choice between these is a founder/legal decision, not an engineering one.
 * It is a single constant so it can be changed without touching logic.
 */
const CONTAINMENT_POSTURE: 'refuse' | 'proceed' = 'refuse';

/** Count governed content for a member. Read-only; never mutates. */
async function governedContentFor(memberId: string): Promise<Array<{ label: string; rows: number }>> {
  const found: Array<{ label: string; rows: number }> = [];
  for (const { table, column, label } of GOVERNED_CONTENT) {
    try {
      const r = await query<{ n: string }>(
        `SELECT count(*)::text AS n FROM ${table} WHERE ${column} = $1`,
        [memberId],
      );
      const rows = Number(r.rows[0]?.n ?? 0);
      if (rows > 0) found.push({ label, rows });
    } catch {
      // Table absent in this environment — not evidence of absence of content,
      // so it is simply not counted.
    }
  }
  return found;
}

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

    // 3b. CONTAINMENT preflight — refuse rather than orphan.
    const governed = await governedContentFor(memberId);
    if (CONTAINMENT_POSTURE === 'refuse' && governed.length > 0) {
      return NextResponse.json(
        {
          error: 'deletion_incomplete_unavailable',
          message:
            'Account closure is temporarily unavailable for this account. Some of your ' +
            'content cannot yet be removed reliably, and we will not tell you it was ' +
            'deleted when it was not. Please contact support to request full deletion.',
          retained: governed,
        },
        { status: 409 },
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

    // The response states ONLY what this route actually removed. It previously
    // claimed "Account and all associated data permanently deleted" while
    // journal, conversation, episodic and capsule content survived. A promise
    // about the disposition of someone's personal material must be one the
    // system can keep.
    return NextResponse.json({
      success: true,
      removed: ['account', 'settings', 'sessions', 'credentials'],
      message:
        'Your account has been closed and your sign-in credentials revoked.',
    });
  } catch (error) {
    console.error('[Delete Account API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
