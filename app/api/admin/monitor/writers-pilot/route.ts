/**
 * GET /api/admin/monitor/writers-pilot — who has made it into the Writer's Studio
 * pilot and who is engaging. Admin-gated, read-only.
 *
 * COUNTS AND TIMESTAMPS ONLY. No manuscript text, revision content, reading
 * observation, or Ask turn body is selected here; the aggregates below touch
 * ids, authorship and timestamps. Activity shown is what the database already
 * records (saved revisions, frozen readings, authored Ask turns). Browsing and
 * time-on-page are not recorded, so absence here is not disengagement.
 *
 * Cohort = members with an active beta_tester pipeline contact, plus members who
 * redeemed a pilot invite (so someone who has signed up but not yet been given
 * access is visible), plus pilot invites nobody has redeemed yet.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import {
  buildPilotRoster,
  ENGAGING_WINDOW_DAYS,
  PILOT_INVITE_NOTE,
  type PilotInviteRow,
  type PilotMemberRow,
} from '@/lib/admin/writersPilotRoster';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await checkAdminAuth(request)).authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const members = await query<PilotMemberRow>(
      `WITH cohort AS (
         SELECT member_id AS id FROM ops_contacts
          WHERE contact_type = 'beta_tester' AND pipeline_stage = 'active'
            AND deleted_at IS NULL AND member_id IS NOT NULL
         UNION
         SELECT redeemed_by AS id FROM invites
          WHERE personal_note = $1 AND status = 'redeemed' AND redeemed_by IS NOT NULL
       )
       SELECT
         m.id,
         COALESCE(NULLIF(m.preferred_name, ''), NULLIF(m.name, ''), NULLIF(m.username, '')) AS name,
         m.username, m.created_at, m.last_sign_in,
         EXISTS (
           SELECT 1 FROM ops_contacts c
            WHERE c.member_id = m.id AND c.deleted_at IS NULL
              AND c.contact_type = 'beta_tester' AND c.pipeline_stage = 'active'
         ) AS studio_access,
         (SELECT COUNT(*) FROM member_manuscripts mm WHERE mm.member_id = m.id) AS works,
         (SELECT COUNT(*) FROM working_draft_revisions r WHERE r.saved_by = m.id) AS revisions,
         (SELECT COUNT(*) FROM working_draft_revisions r
           WHERE r.saved_by = m.id AND r.created_at > NOW() - make_interval(days => $2::int)) AS revisions_7d,
         (SELECT MAX(r.created_at) FROM working_draft_revisions r WHERE r.saved_by = m.id) AS last_revision_at,
         (SELECT COUNT(*) FROM developmental_readings d WHERE d.member_id = m.id) AS readings,
         (SELECT MAX(d.frozen_at) FROM developmental_readings d WHERE d.member_id = m.id) AS last_reading_at,
         (SELECT COUNT(*) FROM ask_turns t JOIN ask_threads th ON th.id = t.thread_id
           WHERE th.member_id = m.id AND t.speaker = 'author') AS asks,
         (SELECT MAX(t.created_at) FROM ask_turns t JOIN ask_threads th ON th.id = t.thread_id
           WHERE th.member_id = m.id AND t.speaker = 'author') AS last_ask_at
       FROM members m
       WHERE m.id IN (SELECT id FROM cohort)`,
      [PILOT_INVITE_NOTE, ENGAGING_WINDOW_DAYS],
    );

    const invites = await query<PilotInviteRow>(
      `SELECT id, intended_name, intended_email, status, expires_at, created_at
         FROM invites
        WHERE personal_note = $1 AND redeemed_by IS NULL AND status IN ('pending', 'expired')`,
      [PILOT_INVITE_NOTE],
    );

    const { entries, summary } = buildPilotRoster(members.rows, invites.rows);
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      engagingWindowDays: ENGAGING_WINDOW_DAYS,
      summary,
      entries,
      basis: {
        measures: 'saved revisions, frozen readings and authored Ask turns, counted; times of last sign-in and last activity',
        doesNotMeasure: 'what anyone wrote, what MAIA said, browsing, time on page, or whether someone is satisfied',
        absence: 'no recorded activity is not the same as disengaged',
      },
    });
  } catch (err) {
    console.error('[admin/monitor/writers-pilot] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
