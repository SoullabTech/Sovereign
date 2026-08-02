// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Start writing — begin an expression that does not exist yet.
 *
 * THE ONE THING THIS ROUTE IS FOR: a member who has declared a Living Work and
 * has nothing written asks for a blank page. Before this existed, the Studio's
 * only door was "Import Manuscript" — so a writer who had named what they were
 * working on could do everything except write it. The room was usable only by
 * people who had already finished something somewhere else.
 *
 * WHY IT IS A SEPARATE ROUTE from POST /manuscripts. That route requires a
 * title and refuses an empty body ("no non-empty sections", "text is empty").
 * Those refusals are correct — they exist to reject junk imports — and
 * loosening them to serve a different gesture would weaken the import boundary
 * to buy something import does not need. Two gestures, two doors.
 *
 * WHAT IT REFUSES, and why each refusal is the point rather than an omission:
 *
 *   - **No invented title.** The manuscript is created with `title = NULL`. The
 *     route does not borrow the Living Work's name, does not generate
 *     "Untitled", does not use a date or a counter, and does not demand a name
 *     before the writer has written a word. The work's name and the
 *     expression's title are SEPARATE declarations (ledger D-16) and this route
 *     may only perform the one the member actually made — which is neither.
 *
 *   - **No source.** A blank page was not brought in from anywhere, so no
 *     `manuscript_sections` rows are written. Source means "what you brought
 *     in, unchanged"; fabricating an empty section to satisfy the draft
 *     initializer would assert a provenance that does not exist. The draft is
 *     therefore created here directly rather than through
 *     POST /manuscripts/[id]/draft, whose whole job is deriving a draft FROM a
 *     source. `base_source_hash` is the hash of no sections — which is the
 *     truthful statement that this draft descends from nothing.
 *
 *   - **No attachment.** Nothing is written to `living_work_expressions`. The
 *     member began writing; they did not declare that this expression belongs
 *     to that work. Attachment is its own act and its own slice.
 *
 *   - **No implicit creation.** This route runs only on an explicit member
 *     gesture. Declaring a work creates nothing. Arriving at the Studio creates
 *     nothing. The writer chooses Start writing, and that choice — nothing
 *     earlier — creates the place to write.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { computeSourceHash } from '@/lib/manuscript/render/renderMemberBook';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // A blank page has no source, so the hash is the hash of no sections.
    const baseSourceHash = computeSourceHash([]);

    const created = await transaction(async (client) => {
      /**
       * DUPLICATE GUARD — proven necessary, not assumed.
       *
       * Two POSTs fired in parallel created two manuscripts (verified
       * 2026-08-02). A disabled button does not prevent that: a double tap, a
       * network retry, or a slow redirect can each issue a second request.
       *
       * The platform's existing idempotency convention (last_idempotency_key
       * on the target row, see manuscripts/[id]/draft) is built for UPDATES —
       * it needs a row that already exists to carry the key. There is no such
       * row when the act IS the creation, so it does not transfer.
       *
       * What does transfer is the meaning of the gesture: "Start writing"
       * asks for a blank page. If the member already has a blank page they
       * have not written in, handing them that one IS the correct answer —
       * not a workaround for a race. So this is find-or-create, and the
       * idempotency falls out of the semantics rather than being bolted on.
       *
       * Once they write a single character it is no longer blank, and the
       * next Start writing correctly makes a new one.
       *
       * The advisory lock is transaction-scoped and keyed to this member, so
       * two concurrent starts serialize instead of racing the SELECT. It is
       * held in the database rather than the UI because the UI is exactly the
       * layer that cannot make this promise.
       */
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [memberId]);

      const untouched = await client.query<{ id: string; draft_id: string }>(
        `SELECT m.id, d.id AS draft_id
           FROM member_manuscripts m
           JOIN manuscript_working_drafts d ON d.manuscript_id = m.id
          WHERE m.member_id = $1
            AND m.provenance = 'member_written'
            AND m.title IS NULL
            AND d.content = ''
            AND d.revision_count = 1
          ORDER BY m.created_at ASC
          LIMIT 1`,
        [memberId]
      );
      if (untouched.rows.length > 0) {
        return {
          manuscriptId: untouched.rows[0].id,
          draftId: untouched.rows[0].draft_id,
          reused: true,
        };
      }

      const ms = await client.query<{ id: string }>(
        `INSERT INTO member_manuscripts (member_id, title, provenance)
         VALUES ($1, NULL, 'member_written')
         RETURNING id`,
        [memberId]
      );
      const manuscriptId = ms.rows[0].id;

      const draft = await client.query<{ id: string }>(
        `INSERT INTO manuscript_working_drafts
           (manuscript_id, member_id, content, base_source_hash, revision_count)
         VALUES ($1, $2, '', $3, 1)
         RETURNING id`,
        [manuscriptId, memberId, baseSourceHash]
      );

      // The first revision is the empty page itself, so the writer can always
      // get back to "before I started" by the same gesture that reverses
      // everything else.
      await client.query(
        `INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
         VALUES ($1, 1, '', $2, 'Started writing')`,
        [draft.rows[0].id, memberId]
      );

      return { manuscriptId, draftId: draft.rows[0].id, reused: false };
    });

    // 200 when an existing untouched blank page was handed back, 201 when one
    // was actually created. The distinction is not cosmetic: a caller retrying
    // after a timeout must be able to tell "my request landed twice" from "my
    // request landed once", and the status is where that is said.
    return NextResponse.json(
      { id: created.manuscriptId, draftId: created.draftId, title: null },
      { status: created.reused ? 200 : 201 }
    );
  } catch (error) {
    console.error('[manuscripts/blank] create failed', error);
    return NextResponse.json({ error: 'Could not start writing' }, { status: 500 });
  }
}
