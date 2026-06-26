export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Field Lab — Your Threads — revise / release a single authored thread.
 *
 * Both are member-side acts of authorship. Release does NOT delete: it marks the
 * thread released_at and appends a 'released' event; the thread stops appearing
 * as active and is never used as current self-understanding, but the history is
 * honored ("deletion must not become erasure of authorship").
 *
 * A member may only act on their own threads (ownership check). No practitioner
 * visibility, no inference, no scoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

async function logEvent(
  memberId: string,
  threadId: string,
  eventType: 'revised' | 'released',
  memberDecision: string,
) {
  // Best-effort ledger append — never breaks the member's authorship.
  try {
    await query(
      `INSERT INTO member_field_note_events (thread_id, member_id, event_type, member_decision, surface)
       VALUES ($1, $2, $3, $4, 'api/field-lab/field-note/[id]')`,
      [threadId, memberId, eventType, memberDecision],
    );
  } catch (err) {
    console.warn('[FieldLab/field-note/[id]] ledger append failed (non-fatal):', err);
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
    if (!(await isMemberTester(memberId))) {
      return NextResponse.json({ error: 'This is an experimental Field Lab surface.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const action = body?.action;

    // Ownership: a member may only act on their own threads.
    const owned = await query<{ id: string; released_at: string | null }>(
      `SELECT id, released_at FROM member_field_note_threads WHERE id = $1 AND member_id = $2 LIMIT 1`,
      [id, memberId],
    );
    const thread = owned.rows[0];
    if (!thread) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    if (action === 'revise') {
      const title = typeof body?.title === 'string' ? body.title.slice(0, 400).trim() : '';
      if (!title) {
        return NextResponse.json({ error: 'A new wording is required.' }, { status: 400 });
      }
      await query(
        `UPDATE member_field_note_threads
            SET title = $1, content = $1, member_decision = 'revise', member_decision_at = NOW()
          WHERE id = $2 AND member_id = $3`,
        [title, id, memberId],
      );
      await logEvent(memberId, id, 'revised', 'revise');
      return NextResponse.json({ ok: true, action: 'revise', title });
    }

    if (action === 'release') {
      if (thread.released_at) {
        return NextResponse.json({ ok: true, action: 'release', already: true });
      }
      await query(
        `UPDATE member_field_note_threads
            SET released_at = NOW()
          WHERE id = $1 AND member_id = $2 AND released_at IS NULL`,
        [id, memberId],
      );
      await logEvent(memberId, id, 'released', 'release');
      return NextResponse.json({ ok: true, action: 'release' });
    }

    return NextResponse.json({ error: 'Unknown action; expected "revise" or "release".' }, { status: 400 });
  } catch (err: any) {
    console.error('[FieldLab/field-note/[id]] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not update right now.' }, { status: 500 });
  }
}
