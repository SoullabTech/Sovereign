export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Now What? — Client Home read.
 *
 * ONE member-scoped composition call behind the home route. It creates no new
 * storage: every row here is material the member already authored through the
 * session room (`member_field_note_threads`) or a position they already
 * declared (`field_program_positions`). No migration, no new table — per the
 * Slice 0 constraint that the Home is a composition of authored acts, never a
 * new substrate.
 *
 * WHAT THIS ROUTE MAY NOT DO (the boundary that makes the room trustworthy):
 *   - No synthesis. Threads are grouped by the tag the MEMBER's own gesture
 *     wrote (`spiralogic_phase`), never by inference over their content. There
 *     is no "theme detected", no cross-thread pattern claim, no third voice.
 *   - No scoring, ranking, percentage, streak, or completion count of any kind.
 *   - No recency judgment. Rows come back in order of the member's keeping
 *     gesture (E-2′). The client is free to describe time; it may never present
 *     "latest" as "most important", and must never label a band "recent".
 *   - No practitioner read. This route is member-scoped only. The coach-facing
 *     surface is a separate route with a separate query; a thread reaches it
 *     ONLY via `can_be_shown_to_practitioner`, which is set by an explicit
 *     per-thread member gesture and defaults false.
 *
 * `shared` is returned so the member can SEE their own sharing boundary from
 * their own side. It is the member's view of what they chose to make
 * available — not a practitioner payload.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

/**
 * The tags a member's own gesture can write onto a thread, and the section of
 * the Home each one belongs to. Anything not listed here is reflective
 * material and lands in Reflections — the default, not a fallback.
 */
const KIND_OF_TAG: Record<string, 'decision' | 'commitment' | 'question'> = {
  decision: 'decision',
  // 'practice' is the existing tag for the one thing a member commits to live
  // at the end of a session ("Now what will you actually live?"). That IS a
  // leadership commitment; it does not need a second name in storage.
  practice: 'commitment',
  question: 'question',
};

interface ThreadRow {
  id: string;
  title: string;
  content: string | null;
  authorship: string;
  member_decision: string | null;
  spiralogic_phase: string | null;
  can_be_shown_to_practitioner: boolean;
  source_session_ref: string | null;
  field_context: string | null;
  created_at: string;
  member_decision_at: string | null;
}

export interface HomeThread {
  id: string;
  title: string;
  content: string | null;
  /** Provenance, always carried: whose act made this exist. */
  authorship: string;
  keptAt: string;
  sharedWithCoach: boolean;
  sessionRef: string | null;
}

const toThread = (r: ThreadRow): HomeThread => ({
  id: r.id,
  title: r.title,
  content: r.content,
  authorship: r.authorship,
  // The member's keeping gesture is the anchor, not row creation. Falls back to
  // created_at only when a row predates decision timestamping.
  keptAt: r.member_decision_at ?? r.created_at,
  sharedWithCoach: r.can_be_shown_to_practitioner === true,
  sessionRef: r.source_session_ref,
});

export async function GET(request: NextRequest) {
  try {
    // 401-first: identity before any read.
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? (await getMemberIdFromRequest(request));
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const fieldContext = request.nextUrl.searchParams.get('fieldContext') || null;

    // Ordered by the member's own keeping gesture (E-2′), newest keep first.
    // `discard` never reaches the Home; released threads are already excluded.
    const res = await query<ThreadRow>(
      `SELECT id, title, content, authorship, member_decision, spiralogic_phase,
              can_be_shown_to_practitioner, source_session_ref, field_context,
              created_at, member_decision_at
         FROM member_field_note_threads
        WHERE member_id = $1
          AND released_at IS NULL
          AND (member_decision IS NULL OR member_decision <> 'discard')
          AND ($2::text IS NULL OR field_context = $2)
        ORDER BY COALESCE(member_decision_at, created_at) DESC
        LIMIT 300`,
      [memberId, fieldContext],
    );

    const decisions: HomeThread[] = [];
    const commitments: HomeThread[] = [];
    const questions: HomeThread[] = [];
    const reflections: HomeThread[] = [];
    const shared: HomeThread[] = [];

    for (const row of res.rows) {
      const t = toThread(row);
      if (t.sharedWithCoach) shared.push(t);
      switch (KIND_OF_TAG[row.spiralogic_phase ?? '']) {
        case 'decision': decisions.push(t); break;
        case 'commitment': commitments.push(t); break;
        case 'question': questions.push(t); break;
        // Everything a member kept that they did not type as a decision,
        // commitment or question is reflective material. Default, not leftover.
        default: reflections.push(t);
      }
    }

    /*
     * Sessions — derived strictly from the sessions this member's own kept
     * material came out of. A session appears here because the member carried
     * something out of it, never because the system logged an activity. There
     * is no attendance record, no duration, no engagement measure.
     */
    const sessionMap = new Map<string, { ref: string; at: string; carried: number }>();
    for (const row of res.rows) {
      if (!row.source_session_ref) continue;
      const at = row.member_decision_at ?? row.created_at;
      const existing = sessionMap.get(row.source_session_ref);
      if (existing) {
        existing.carried += 1;
        if (at > existing.at) existing.at = at;
      } else {
        sessionMap.set(row.source_session_ref, { ref: row.source_session_ref, at, carried: 1 });
      }
    }
    const sessions = [...sessionMap.values()].sort((a, b) => (a.at < b.at ? 1 : -1));

    /*
     * Journey — the member's declared position in a program. Member-declared or
     * absent: this is read straight from what they (or their coach, labelled as
     * such) stated. Nothing is inferred, and a program the member never entered
     * never appears. Non-fatal: a journey read failure must not cost them their
     * own material.
     */
    let journey: {
      programSlug: string;
      programTitle: string | null;
      focalPoint: string;
      statedBy: string;
      confirmedAt: string | null;
    }[] = [];
    if (fieldContext) {
      try {
        const pos = await query<{
          program_slug: string;
          title: string | null;
          focal_point: string;
          stated_by: string;
          member_confirmed_at: string | null;
        }>(
          `SELECT p.program_slug, fp.title, p.focal_point, p.stated_by, p.member_confirmed_at
             FROM field_program_positions p
             LEFT JOIN field_programs fp
               ON fp.field_slug = p.field_slug AND fp.program_slug = p.program_slug
            WHERE p.member_id = $1 AND p.field_slug = $2
            ORDER BY p.updated_at DESC`,
          [memberId, fieldContext],
        );
        journey = pos.rows.map((r) => ({
          programSlug: r.program_slug,
          programTitle: r.title,
          focalPoint: r.focal_point,
          statedBy: r.stated_by,
          confirmedAt: r.member_confirmed_at,
        }));
      } catch (err) {
        console.warn('[NowWhat/home] journey read failed (non-fatal):', err);
      }
    }

    /*
     * Lessons — the practitioner's authored preparation and practice for the
     * focal point THIS MEMBER HAS DECLARED (Phase 2, MY_WORK_FIELD_UX_SPEC_V1 §9).
     *
     * SELECTION RULE, and it is load-bearing: a lesson is reached through the
     * member's own position row, joined on (field_slug, program_slug,
     * focal_point). It is NOT reached by asking "is this member enrolled" —
     * participation has no object yet and this read deliberately does not
     * invent one. No declared position ⇒ no lessons ⇒ the Prepare and offered-
     * Practice layers simply do not render. Position stays orientation;
     * participation stays unruled.
     *
     * What comes back is PRACTITIONER-AUTHORED and must render as offered,
     * never in the member's voice (R4 · R7 · Activation Model §7.3) — so
     * statedBy travels with it and the UI attributes from that.
     *
     * material_ids is deliberately not read: Library is not in Phase 2.
     * Non-fatal, like the journey read — a lesson failure must not cost the
     * member their own material.
     */
    let lessons: {
      programSlug: string;
      programTitle: string | null;
      focalPoint: string;
      purpose: string | null;
      practice: string | null;
      reflectionPrompt: string | null;
      statedBy: string;
    }[] = [];
    if (fieldContext && journey.length > 0) {
      try {
        const les = await query<{
          program_slug: string;
          title: string | null;
          focal_point: string;
          purpose: string | null;
          practice: string | null;
          reflection_prompt: string | null;
          stated_by: string;
        }>(
          `SELECT l.program_slug, fp.title, l.focal_point, l.purpose,
                  l.practice, l.reflection_prompt, p.stated_by
             FROM field_program_lessons l
             JOIN field_program_positions p
               ON p.field_slug   = l.field_slug
              AND p.program_slug = l.program_slug
              AND p.focal_point  = l.focal_point
             LEFT JOIN field_programs fp
               ON fp.field_slug = l.field_slug AND fp.program_slug = l.program_slug
            WHERE p.member_id = $1 AND p.field_slug = $2`,
          [memberId, fieldContext],
        );
        lessons = les.rows.map((r) => ({
          programSlug: r.program_slug,
          programTitle: r.title,
          focalPoint: r.focal_point,
          purpose: r.purpose,
          practice: r.practice,
          reflectionPrompt: r.reflection_prompt,
          statedBy: r.stated_by,
        }));
      } catch (err) {
        console.warn('[NowWhat/home] lesson read failed (non-fatal):', err);
      }
    }

    console.info(
      '[NowWhat/home] read',
      JSON.stringify({
        memberIdPrefix: memberId.slice(0, 8),
        fieldContext,
        decisions: decisions.length,
        commitments: commitments.length,
        questions: questions.length,
        reflections: reflections.length,
        shared: shared.length,
        sessions: sessions.length,
        lessons: lessons.length,
      }),
    );

    return NextResponse.json({
      journey,
      decisions,
      commitments,
      questions,
      reflections,
      shared,
      sessions,
      lessons,
    });
  } catch (err: any) {
    console.error('[NowWhat/home] GET error:', err?.message || err);
    return NextResponse.json(
      { error: 'Could not open your space right now.' },
      { status: 500 },
    );
  }
}
