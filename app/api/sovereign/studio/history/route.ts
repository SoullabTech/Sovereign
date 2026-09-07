// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Writer's Studio — HISTORY. The member's own acts, in the order they happened.
 *
 * GET — recorded acts across everything this member has written, newest first.
 *
 * ── The founder's constraint, and what it excludes ────────────────────────
 * "Only acts we can genuinely establish appear. No inferred 'you were
 * restructuring' and no invented process state." (2026-09-07)
 *
 *   A date may gather acts. It may not explain what those acts amounted to.
 *
 * Grouping is presentation and happens in the client. This route emits FACTS —
 * what happened and when. It does not phrase them, rank them, or summarize a
 * day. There is no headline column here because there is nothing a headline
 * could be derived from that would not be interpretation.
 *
 * ── ⛔ Why "Returned to X" is NOT built from `updated_at` ──────────────────
 * The founder's sketch opens with `returned to Elemental Alchemy`. The obvious
 * source is `manuscript_working_drafts.updated_at`, and it must be refused:
 * that column holds CURRENT STATE, not an act. There is exactly one row per
 * manuscript, so it can yield exactly one "returned to" entry — and the next
 * time the member writes, that entry SILENTLY RELOCATES to the new date. Last
 * week's history would change because of something done today.
 *
 *   A history entry that moves is not a history.
 *
 * The intent is served instead by `working_draft_revisions`, which is
 * append-only, immutable by trigger, member-authored, and fixed in time. A
 * writing act appears where it actually happened and stays there.
 *
 * ── ⛔ Why revision 1 is excluded ──────────────────────────────────────────
 * The first revision of every draft is written by the SYSTEM at draft
 * creation, noted 'Initialized verbatim from source' (see the draft route's
 * creation path). Showing it as a member act would attribute the system's own
 * initialization to the writer. The act it corresponds to — writing arriving —
 * is already recorded truthfully, and better, by source custody.
 *
 * Member-scoped by credential. No parameter here can name another member.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * The exact note the draft-creation path writes on the system's own first
 * revision. Matched literally, and only together with revision_number = 1, so
 * this can never swallow a member's checkpoint: excluding by revision number
 * alone would silently drop a real act on any draft created before the
 * initializing revision existed.
 */
const SYSTEM_INITIAL_REVISION_NOTE = 'Initialized verbatim from source';

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 300;

/** What the member did. The words for these live in the client, not here. */
export type StudioActKind =
  | 'work_begun'
  | 'writing_arrived'
  | 'expression_declared'
  | 'material_declared'
  | 'version_kept'
  | 'line_marked';

interface ActRow {
  id: string;
  kind: StudioActKind;
  at: string;
  work_title: string | null;
  manuscript_title: string | null;
  manuscript_id: string | null;
  /** A recorded particular — a heading, a filename, a revision number. Never a summary. */
  detail: string | null;
  /** The member's OWN sentence about the act, when they wrote one. */
  note: string | null;
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const asked = Number(request.nextUrl.searchParams.get('limit'));
    const limit =
      Number.isFinite(asked) && asked > 0 ? Math.min(Math.floor(asked), MAX_LIMIT) : DEFAULT_LIMIT;

    const result = await query<ActRow>(
      `
      WITH work_of AS (
        /* The Work's member-authored title outranks a manuscript title derived
           from an upload filename (founder ruling 2026-09-07: a source filename
           is provenance, not a Work name).

           ⛔ Where TWO works claim the same manuscript the system does not
           pick one. The ontology deliberately left exclusivity un-ruled, so
           choosing here would decide a constitutional question by accident. */
        SELECT e.expression_id AS manuscript_id,
               CASE WHEN count(*) = 1 THEN min(w.title) END AS work_title
          FROM living_work_expressions e
          JOIN living_works w ON w.id = e.living_work_id
         WHERE e.expression_type = 'manuscript' AND w.member_id = $1
         GROUP BY e.expression_id
      ),
      acts AS (
        SELECT w.id, 'work_begun'::text AS kind, w.created_at AS at,
               w.title AS work_title, NULL::text AS manuscript_title,
               NULL::uuid AS manuscript_id, NULL::text AS detail, NULL::text AS note
          FROM living_works w
         WHERE w.member_id = $1

        UNION ALL
        SELECT a.id, 'writing_arrived', a.created_at,
               k.work_title, m.title, a.manuscript_id,
               /* The filename appears HERE, where custody is the point, and
                  nowhere else. This is the one act it belongs to. */
               a.original_filename, NULL
          FROM manuscript_source_arrivals a
          LEFT JOIN member_manuscripts m ON m.id = a.manuscript_id
          LEFT JOIN work_of k ON k.manuscript_id = a.manuscript_id
         WHERE a.member_id = $1 AND a.manuscript_id IS NOT NULL

        UNION ALL
        SELECT e.id, 'expression_declared', e.declared_at,
               w.title, m.title, e.expression_id, e.expression_type, NULL
          FROM living_work_expressions e
          JOIN living_works w ON w.id = e.living_work_id
          LEFT JOIN member_manuscripts m
                 ON m.id = e.expression_id AND e.expression_type = 'manuscript'
         WHERE e.declared_by = $1

        UNION ALL
        SELECT mt.id, 'material_declared', mt.declared_at,
               w.title, NULL, NULL,
               mt.material_type,
               /* The member's own sentence about why it belongs. */
               mt.relationship_sentence
          FROM living_work_materials mt
          JOIN living_works w ON w.id = mt.living_work_id
         WHERE mt.declared_by = $1

        UNION ALL
        SELECT r.id, 'version_kept', r.created_at,
               k.work_title, m.title, m.id,
               r.revision_number::text, r.note
          FROM working_draft_revisions r
          JOIN manuscript_working_drafts d ON d.id = r.draft_id
          JOIN member_manuscripts m ON m.id = d.manuscript_id
          LEFT JOIN work_of k ON k.manuscript_id = m.id
         WHERE r.saved_by = $1
           AND NOT (r.revision_number = 1 AND r.note IS NOT DISTINCT FROM $3)

        UNION ALL
        SELECT kp.id, 'line_marked', kp.created_at,
               k.work_title, m.title, m.id,
               s.heading, NULL
          FROM manuscript_keeps kp
          JOIN member_manuscripts m ON m.id = kp.manuscript_id
          JOIN manuscript_sections s ON s.id = kp.section_id
          LEFT JOIN work_of k ON k.manuscript_id = m.id
         WHERE kp.member_id = $1
      )
      SELECT * FROM acts ORDER BY at DESC LIMIT $2
      `,
      [memberId, limit, SYSTEM_INITIAL_REVISION_NOTE],
    );

    return NextResponse.json({
      acts: result.rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        at: r.at,
        workTitle: r.work_title,
        manuscriptTitle: r.manuscript_title,
        manuscriptId: r.manuscript_id,
        detail: r.detail,
        note: r.note,
      })),
    });
  } catch (error) {
    console.error('[sovereign/studio/history] list failed', error);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
