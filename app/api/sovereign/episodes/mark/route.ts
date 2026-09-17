/**
 * Episodic Memory — Member-Marked Moment (write path).
 *
 * DOCTRINE (load-bearing):
 *   "MAIA may preserve what the member marked. MAIA may not add what the
 *    member did not author."  —  If the member did not mark it, it is not an
 *    episode.
 *
 * CANON DISCIPLINE
 *   - This is the ONLY path that writes a member-marked episodic memory.
 *   - marked_by_member is set TRUE only by this explicit member action. The
 *     system never auto-marks; no detector, summarizer, or background job may
 *     call this route or write this column on the member's behalf.
 *   - verbatim_text stores the member's exact words, byte-for-byte. The system
 *     performs NO paraphrase, summary, title-casing, trimming, or normalization
 *     of the stored value.
 *   - Every interpretive column — experience_title, experience_description,
 *     experience_context, significance, emotional_intensity, breakthrough_level,
 *     spiral_stage — is left NULL. archetypal_resonances and all vectors stay
 *     []. A column the system CAN leave null is a column it is FORBIDDEN from
 *     inventing. The live CHECK constraint
 *     episodic_member_marked_requires_verbatim enforces the
 *     verbatim<->marked biconditional at the database as a backstop.
 *
 * SANCTUARY GUARD (slice 2, 2026-07-13; server-side 2026-07-17)
 *   - The live gesture (member-facing "Keep this moment" affordance in
 *     components/OracleConversation.tsx) does NOT render at all when a
 *     Sanctuary session is active, and independently refuses client-side
 *     before calling this route.
 *   - GOVERNING RULE (ruled 2026-07-17): no durable episodic mark may be
 *     written without a resolvable source. For the present API the only valid
 *     source is an authenticated member-owned session. sourceSessionId is
 *     therefore REQUIRED, and its absence is a Sanctuary-boundary refusal
 *     (403, R18) — not ordinary field validation — because without provenance
 *     the container boundary cannot be enforced at all.
 *   - Server-side resolution (R18): POST resolves sourceSessionId against
 *     maia_sessions (mode/privacy_mode, written at session start) OR
 *     member_sessions (mode, written at finalization). The write proceeds
 *     ONLY when the session resolves as owned by the authenticated member and
 *     is not Sanctuary (allowlist, not blocklist). Sanctuary invariant 6 is
 *     absolute: the refusal holds even for an explicit member request.
 *     Mirrors the SessionSummaryStore precedent (summaryText forced null when
 *     isSanctuary) and the MemberLiveContext read-skips.
 *   - Ownership-scoped, oracle-free: nonexistent, malformed, and
 *     cross-member session ids all receive one identical governed denial —
 *     nothing reveals whether an inaccessible session exists or whose it is.
 *   - STATUS: the episodic-mark API now requires authoritative
 *     source-session provenance and refuses Sanctuary-origin writes before
 *     persistence. Repository-wide Sanctuary write-incapacity remains
 *     governed by the broader Sanctuary audit — episodic_memories has other
 *     writers (journal/quick, memory/ingest, sessionProcessor, summary
 *     worker, EpisodicMemoryService) outside this route's jurisdiction.
 *     Future evolution (typed source union) is preserved in
 *     docs/architecture/EPISODIC_MARK_PROVENANCE_CONTRACT_2026-07-17.md
 *   - Sovereign placement includes removal: the member who marked a moment
 *     may also unmark it. See DELETE below.
 *   - This route writes a new Moment as private/sealed by default. Ambient return
 *     is a separate member act handled by PATCH, which atomically writes both
 *     return_preference and member_explicit authority provenance.
 *   - members.episodic_recall_enabled remains a master suppression switch only;
 *     it cannot grant return authority to a Moment by itself.
 *
 * OWNERSHIP
 *   - Requires an authenticated member (getMemberIdFromRequest). The episode is
 *     written under that member's user_id. No member, no write (401).
 *
 * AUTHORITY
 *   - database/migrations/20260531000001_episodic_member_marked_provenance.sql
 *   - Mirrors the member-mark discipline of
 *     app/api/sovereign/atoms/[id]/breakthrough/route.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { memberRef } from '@/lib/privacy/memberRef';

interface MarkedEpisodeRow {
  id: number;
  episode_id: string;
  verbatim_text: string;
  marked_by_member: boolean;
  source_turn_id: string | null;
  source_session_id: string | null;
  return_preference: 'member_pulled' | 'contextual_doorway';
  return_authority: 'legacy_ambiguous' | 'default_private' | 'member_explicit';
  created_at: Date;
  was_created?: boolean;
}

function shape(row: MarkedEpisodeRow) {
  return {
    id: row.id,
    episodeId: row.episode_id,
    verbatimText: row.verbatim_text,
    markedByMember: row.marked_by_member,
    sourceTurnId: row.source_turn_id,
    sourceSessionId: row.source_session_id,
    returnPreference: row.return_preference,
    returnAuthority: row.return_authority,
    createdAt: row.created_at,
  };
}

/**
 * GET — the member's own marked moments, newest first ("Marked Moments" room,
 * authorized 2026-07-13 as the instrument the lived-week witness requires:
 * "do people naturally return to their marks?" needs a place to return to).
 *
 * Member-scoped by construction: memberId comes from the credential and is the
 * only key used — no parameter can name another member. Returns ONLY what the
 * member placed: episodeId (needed to unmark), verbatim text, date, source
 * pointers. Interpretive columns are NULL by CHECK constraint and are not
 * selected. This is a mirror of the member's placements, nothing more.
 *
 * 200 { moments: [...] }, 401 if no member.
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query<MarkedEpisodeRow>(
      `SELECT id, episode_id, verbatim_text, marked_by_member,
              source_turn_id, source_session_id, return_preference, return_authority, created_at
         FROM episodic_memories
        WHERE user_id = $1 AND marked_by_member = TRUE
        ORDER BY created_at DESC
        LIMIT 200`,
      [memberId],
    );

    // Discoverable log marker. Count only, never content.
    console.log(
      `[MAIA/sovereign] episodic moments listed { memberRef: ${memberRef(memberId)}, ` +
        `count: ${result.rows.length} }`,
    );

    return NextResponse.json({ moments: result.rows.map(shape) });
  } catch (err) {
    console.error('[episodes/mark] GET error:', err);
    return NextResponse.json({ error: 'Failed to load moments' }, { status: 500 });
  }
}

/**
 * POST — preserve a member-marked moment, verbatim.
 *
 * Body: { verbatimText: string; sourceSessionId: string; sourceTurnId: string }
 *   - verbatimText:    the member's exact words. Required, non-empty.
 *   - sourceSessionId: provenance — the session the mark came from. REQUIRED;
 *                      must resolve to a session owned by the authenticated
 *                      member (governing rule above).
 *   - sourceTurnId:    REQUIRED stable identity of the exact member message; the idempotency key for retries.
 *
 * 201 with the stored episode, 400 on empty/invalid verbatim, 401 if no
 * member, 403 (refusal R18) on missing/unresolvable provenance or a Sanctuary
 * source.
 */
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { verbatimText, sourceTurnId, sourceSessionId } = (body ?? {}) as {
      verbatimText?: unknown;
      sourceTurnId?: unknown;
      sourceSessionId?: unknown;
    };

    // The member must have authored words to preserve. An empty mark is not a
    // mark. We reject before the DB so the CHECK constraint is a backstop, not
    // the primary gate. We use trim ONLY to detect an all-whitespace submission;
    // we do NOT trim the stored value — verbatim means exact.
    if (typeof verbatimText !== 'string' || verbatimText.trim().length === 0) {
      return NextResponse.json(
        { error: 'verbatimText is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    // The turn pointer stays an opaque, optional reference — never coerced
    // into meaning. The SESSION pointer is no longer optional: see below.
    const turnId =
      typeof sourceTurnId === 'string' && sourceTurnId.length > 0 ? sourceTurnId : null;
    const sessionId =
      typeof sourceSessionId === 'string' && sourceSessionId.length > 0 ? sourceSessionId : null;

    // PROVENANCE REQUIREMENT (R18, ruled 2026-07-17) — no durable episodic
    // mark may be written without a resolvable source. For the present API the
    // only valid source is an authenticated member-owned session. A missing,
    // empty, or non-string sourceSessionId is a Sanctuary-boundary refusal,
    // not ordinary field validation: without provenance the server cannot
    // enforce the container boundary at all, so the write is refused rather
    // than admitted on trust.
    if (sessionId === null) {
      console.log(
        `[MAIA/sovereign] episodic mark refused (no provenance) { memberRef: ${memberRef(memberId)} }`,
      );
      return NextResponse.json(
        {
          error:
            'Episodic marks require source-session provenance. A durable mark must name the session it came from — without that, the boundaries that protect what is and is not remembered cannot be enforced.',
          refusal: 'R18',
        },
        { status: 403 },
      );
    }

    if (turnId === null) {
      return NextResponse.json(
        { error: 'sourceTurnId is required so retries cannot create duplicate durable Moments.' },
        { status: 400 },
      );
    }

    // SANCTUARY GUARD (R18) — resolve the source session's sanctuary state and
    // refuse BEFORE any write. Invariant 6 is absolute: nothing from a
    // Sanctuary session may be converted into long-term memory, including by
    // member request during the session. Both session tables are consulted so
    // the guard holds mid-session (maia_sessions, written at session start)
    // and after finalization (member_sessions). A resolution error propagates
    // to the catch (fail-closed: no refusal check, no write).
    //
    // OWNERSHIP SCOPING — the lookup is constrained to the authenticated
    // member wherever the schema carries ownership:
    //   - member_sessions.member_id is NOT NULL → strict member_id = $2.
    //   - maia_sessions.member_id is nullable (anonymous/guest sessions) →
    //     member_id = $2 OR member_id IS NULL. Unattributed sessions still
    //     refuse: for Sanctuary the guard must err toward refusal, and an
    //     unowned row cannot be tied to any other member, so including it
    //     leaks nothing about anyone.
    // Consequence (deliberate): the resolution is an ALLOWLIST, not a
    // blocklist. The write proceeds only when the named session resolves as
    // owned by the authenticated member AND is not Sanctuary. Another
    // member's session — sanctuary or not — resolves exactly like a
    // nonexistent or malformed one: the same governed denial, so cross-member
    // ids cannot flip the refusal outcome, cannot launder provenance through
    // someone else's session, and cannot be used as an existence oracle on
    // other members' sessions.
    const resolution = await query<{ owned: boolean; is_sanctuary: boolean }>(
      `SELECT
         EXISTS (SELECT 1 FROM maia_sessions
                  WHERE id = $1
                    AND (member_id = $2 OR member_id IS NULL))
         OR
         EXISTS (SELECT 1 FROM member_sessions
                  WHERE session_id = $1
                    AND member_id = $2::uuid)
         AS owned,
         EXISTS (SELECT 1 FROM maia_sessions
                  WHERE id = $1
                    AND (member_id = $2 OR member_id IS NULL)
                    AND (mode = 'sanctuary' OR privacy_mode = 'sanctuary'))
         OR
         EXISTS (SELECT 1 FROM member_sessions
                  WHERE session_id = $1
                    AND member_id = $2::uuid
                    AND mode = 'sanctuary')
         AS is_sanctuary`,
      [sessionId, memberId],
    );
    if (resolution.rows[0]?.is_sanctuary === true) {
      // The member's own Sanctuary session: name the boundary honestly.
      // Metadata only (session id, member prefix) — never content.
      console.log(
        `[MAIA/sovereign] episodic mark refused (sanctuary) { memberRef: ${memberRef(memberId)}, ` +
          `sessionId: ${sessionId} }`,
      );
      return NextResponse.json(
        {
          error:
            'Sanctuary sessions are not remembered. A moment from a Sanctuary session cannot be kept — this boundary is absolute and holds even at your request.',
          refusal: 'R18',
        },
        { status: 403 },
      );
    }
    if (resolution.rows[0]?.owned !== true) {
      // Nonexistent, malformed, or another member's session — one identical
      // denial for all three, revealing nothing about whether the session
      // exists or whose it is.
      console.log(
        `[MAIA/sovereign] episodic mark refused (unresolvable provenance) { memberRef: ${memberRef(memberId)} }`,
      );
      return NextResponse.json(
        {
          error:
            'This moment could not be traced to one of your sessions. Episodic marks require source-session provenance that resolves to a session of yours.',
          refusal: 'R18',
        },
        { status: 403 },
      );
    }

    // Exact member words, private by default. The database uniqueness boundary
    // makes the same source message idempotent under retry/double-event races.
    // Identical text from a different sourceTurnId is a different member act.
    const result = await query<MarkedEpisodeRow>(
      `INSERT INTO episodic_memories
         (user_id, episode_id, verbatim_text, marked_by_member, source_turn_id, source_session_id,
          posture_at_creation, return_preference, return_authority)
       VALUES ($1, $2, $3, TRUE, $4, $5, 'normal', 'member_pulled', 'default_private')
       ON CONFLICT (user_id, source_session_id, source_turn_id)
         WHERE marked_by_member = TRUE
           AND source_session_id IS NOT NULL
           AND source_turn_id IS NOT NULL
       DO UPDATE SET source_turn_id = EXCLUDED.source_turn_id
       RETURNING id, episode_id, verbatim_text, marked_by_member,
                 source_turn_id, source_session_id, return_preference, return_authority,
                 created_at, (xmax = 0) AS was_created`,
      [memberId, randomUUID(), verbatimText, turnId, sessionId],
    );

    const stored = result.rows[0];

    console.log(
      `[MAIA/sovereign] episodic moment ${stored.was_created ? 'marked' : 'already marked'} { memberRef: ${memberRef(memberId)}, ` +
        `episodeId: ${stored.episode_id}, verbatimChars: ${verbatimText.length}, ` +
        `hasTurn: true, hasSession: true }`,
    );

    return NextResponse.json(
      { episode: shape(stored), created: stored.was_created === true },
      { status: stored.was_created === true ? 201 : 200 },
    );
  } catch (err) {
    console.error('[episodes/mark] POST error:', err);
    return NextResponse.json({ error: 'Failed to mark episode' }, { status: 500 });
  }
}

/**
 * PATCH — set per-Moment return preference by explicit member act.
 *
 * Body: { episodeId: string; returnPreference: 'member_pulled' | 'contextual_doorway' }
 * The preference and member_explicit authority provenance are written atomically.
 * Keeping a Moment never calls this path.
 */
export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { episodeId, returnPreference } = (body ?? {}) as {
      episodeId?: unknown;
      returnPreference?: unknown;
    };

    if (typeof episodeId !== 'string' || episodeId.length === 0) {
      return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
    }
    if (returnPreference !== 'member_pulled' && returnPreference !== 'contextual_doorway') {
      return NextResponse.json(
        { error: "returnPreference must be 'member_pulled' or 'contextual_doorway'" },
        { status: 400 },
      );
    }

    const result = await query<MarkedEpisodeRow>(
      `UPDATE episodic_memories
          SET return_preference = $3,
              return_authority = 'member_explicit'
        WHERE episode_id = $1
          AND user_id = $2
          AND marked_by_member = TRUE
        RETURNING id, episode_id, verbatim_text, marked_by_member,
                  source_turn_id, source_session_id, return_preference, return_authority, created_at`,
      [episodeId, memberId, returnPreference],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ episode: shape(result.rows[0]) });
  } catch (err) {
    console.error('[episodes/mark] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update moment return preference' }, { status: 500 });
  }
}
/**
 * DELETE — unmark a member-marked moment. Sovereign placement includes
 * removal: the member who placed the mark is the only one who can lift it.
 *
 * Body or query param: { episodeId: string }
 *
 * Hard-deletes the row (not a soft flag) — member-scoped by construction via
 * `WHERE episode_id = $1 AND user_id = $2 AND marked_by_member = TRUE`, so a
 * member can only ever remove their own marked rows. Zero residue: nothing of
 * the moment remains once removed.
 *
 * 200 on success, 400 if episodeId missing, 401 if no member, 404 if no
 * matching owned row (we do not leak whether the id exists for someone else).
 */
export async function DELETE(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let episodeId: unknown = request.nextUrl.searchParams.get('episodeId');
    if (!episodeId) {
      try {
        const body = (await request.json()) as { episodeId?: unknown };
        episodeId = body?.episodeId;
      } catch {
        // No JSON body — episodeId may have arrived via query param only.
      }
    }

    if (typeof episodeId !== 'string' || episodeId.length === 0) {
      return NextResponse.json({ error: 'episodeId is required' }, { status: 400 });
    }

    const result = await query<{ episode_id: string }>(
      `DELETE FROM episodic_memories
       WHERE episode_id = $1 AND user_id = $2 AND marked_by_member = TRUE
       RETURNING episode_id`,
      [episodeId, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Discoverable log marker. Never content, never the verbatim text.
    console.log(
      `[MAIA/sovereign] episodic moment unmarked { memberRef: ${memberRef(memberId)}, ` +
        `episodeId: ${episodeId} }`,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[episodes/mark] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to unmark episode' }, { status: 500 });
  }
}
