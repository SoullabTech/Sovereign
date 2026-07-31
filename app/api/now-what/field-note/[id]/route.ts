export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Now What? — withdraw practitioner visibility from a single kept thread.
 *
 * THE DEFECT THIS CLOSES
 * ----------------------
 * /now-what/field and /now-what/questions both render "· shared with your
 * practitioner" on threads whose can_be_shown_to_practitioner is TRUE. Until
 * this route existed, that was a disclosure with no corresponding member
 * authority: the sharing decision was made once, inside the session that
 * created the thread, and could never be revisited. The environment told a
 * member who could see their thread and gave them no way to change it.
 *
 * The invariant this route serves (Lane V, ruled 2026-07-30):
 *   Withdrawing practitioner visibility changes only WHO MAY SEE the thread.
 *   It must not delete, release, archive, reorder, or otherwise alter the
 *   member's relationship to their own thread.
 *
 * WITHDRAW IS NOT RELEASE
 * -----------------------
 * Three distinct concepts share adjacent vocabulary in this codebase. Do not
 * collapse them:
 *
 *   1. Release thread (Field Lab, member_field_note_threads.released_at) —
 *      the member lets the thread go. It leaves the member's OWN active field
 *      as well as the practitioner's. History honored, not erased.
 *   2. Release artifact (released_artifacts) — consented, non-reconstructable
 *      letting-go of a journal entry. A different table entirely.
 *   3. Withdraw practitioner visibility (THIS ROUTE) — the thread stays fully
 *      present in the member's own field; only practitioner access ends.
 *
 * Reusing Field Lab's release for withdrawal would delete the thread from the
 * member's own field in order to take it back from the practitioner — the
 * inverse of the capability. Hence a Now What?-owned route, not a reuse.
 *
 * LEDGER VOCABULARY IS SHARED INFRASTRUCTURE
 * ------------------------------------------
 * Any new event type requires a forward-only migration and verification that
 * existing member_field_note_events readers and writers remain compatible.
 * `practitioner_visibility_withdrawn` was added by
 * 20260730000002_practitioner_visibility_withdrawn_event.sql, which only widens
 * the accepted set — every previously valid event_type stays valid.
 *
 * Two adjacent event types are deliberately NOT reused here:
 *   'released'        — a different act; it removes the thread from the member's
 *                       own field too.
 *   'consent_changed' — a different subject (the thread's consent_state does not
 *                       move), and unsafe: scripts/repro/consent_gate_proof.mjs
 *                       DELETEs rows of that event_type as test cleanup.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const SURFACE = 'api/now-what/field-note/[id]';

/**
 * Append-only authorship ledger. Best-effort: a ledger failure must never undo
 * or block the member's withdrawal, which has already been persisted.
 *
 * Do not substitute a different event_type if this ever rejects. An inaccurate
 * ledger is worse than a missing row — its whole value is that what it says
 * happened is what happened.
 */
async function logWithdrawal(memberId: string, threadId: string): Promise<void> {
  try {
    await query(
      `INSERT INTO member_field_note_events (thread_id, member_id, event_type, surface)
       VALUES ($1, $2, 'practitioner_visibility_withdrawn', $3)`,
      [threadId, memberId, SURFACE],
    );
  } catch (err) {
    console.warn('[NowWhat/field-note/[id]] ledger append failed (non-fatal):', err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (body?.action !== 'withdraw_practitioner_visibility') {
      return NextResponse.json(
        { error: 'Unsupported action.' },
        { status: 400 },
      );
    }

    // Ownership. The member_id predicate is the authorization: a thread that is
    // not this member's is indistinguishable from one that does not exist, so a
    // member cannot probe for others' threads.
    const owned = await query<{ id: string; can_be_shown_to_practitioner: boolean }>(
      `SELECT id, can_be_shown_to_practitioner
         FROM member_field_note_threads
        WHERE id = $1 AND member_id = $2
        LIMIT 1`,
      [id, memberId],
    );
    const thread = owned.rows[0];
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
    }

    // Idempotent: withdrawing something already withdrawn is a success, not an
    // error. The member's intent ("my practitioner should not see this") is
    // already satisfied.
    if (!thread.can_be_shown_to_practitioner) {
      return NextResponse.json({
        ok: true,
        id,
        can_be_shown_to_practitioner: false,
        changed: false,
      });
    }

    // The whole mutation. Nothing else on the row is touched: not released_at,
    // not member_decision, not consent_state, not created_at. The member's own
    // field reads ORDER BY created_at DESC, so position is unchanged too.
    await query(
      `UPDATE member_field_note_threads
          SET can_be_shown_to_practitioner = FALSE
        WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );

    await logWithdrawal(memberId, id);

    return NextResponse.json({
      ok: true,
      id,
      can_be_shown_to_practitioner: false,
      changed: true,
    });
  } catch (err) {
    console.error('[NowWhat/field-note/[id]] PATCH failed:', err);
    return NextResponse.json({ error: 'Could not complete that just now.' }, { status: 500 });
  }
}
