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
 * SANCTUARY GUARD (slice 2, 2026-07-13)
 *   - The live gesture (member-facing "Keep this moment" affordance in
 *     components/OracleConversation.tsx) does NOT render at all when a
 *     Sanctuary session is active, and independently refuses client-side
 *     before calling this route — defense-in-depth, per CLAUDE.md's absolute
 *     Sanctuary boundary. This route itself still performs no sanctuary
 *     awareness of its own (it has no session-state input); the guard lives
 *     entirely at the call site, same as every other Sanctuary-scoped write
 *     in this codebase.
 *   - Sovereign placement includes removal: the member who marked a moment
 *     may also unmark it. See DELETE below.
 *   - This is the write path only. It does NOT govern recall. Whether marked
 *     moments resurface in the prompt is a separate consent gated by
 *     members.episodic_recall_enabled (read-path). Marking and recalling are
 *     distinct consents; this route deliberately does not consult the recall gate.
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

interface MarkedEpisodeRow {
  id: number;
  episode_id: string;
  verbatim_text: string;
  marked_by_member: boolean;
  source_turn_id: string | null;
  source_session_id: string | null;
  created_at: Date;
}

function shape(row: MarkedEpisodeRow) {
  return {
    id: row.id,
    episodeId: row.episode_id,
    verbatimText: row.verbatim_text,
    markedByMember: row.marked_by_member,
    sourceTurnId: row.source_turn_id,
    sourceSessionId: row.source_session_id,
    createdAt: row.created_at,
  };
}

/**
 * POST — preserve a member-marked moment, verbatim.
 *
 * Body: { verbatimText: string; sourceTurnId?: string; sourceSessionId?: string }
 *   - verbatimText:   the member's exact words. Required, non-empty.
 *   - sourceTurnId:   provenance pointer to the marked turn (optional).
 *   - sourceSessionId: provenance pointer to the marked session (optional).
 *
 * 201 with the stored episode, 400 on empty/invalid verbatim, 401 if no member.
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

    // Provenance pointers are opaque, optional references to the marked
    // turn/session. We never coerce them into meaning.
    const turnId =
      typeof sourceTurnId === 'string' && sourceTurnId.length > 0 ? sourceTurnId : null;
    const sessionId =
      typeof sourceSessionId === 'string' && sourceSessionId.length > 0 ? sourceSessionId : null;

    // Six columns. Nothing interpretive. Every omitted interpretive column stays
    // NULL (the meaning the system refuses to author); every omitted vector
    // defaults to []. verbatim_text is inserted raw (no trim/normalize).
    const result = await query<MarkedEpisodeRow>(
      `INSERT INTO episodic_memories
         (user_id, episode_id, verbatim_text, marked_by_member, source_turn_id, source_session_id)
       VALUES ($1, $2, $3, TRUE, $4, $5)
       RETURNING id, episode_id, verbatim_text, marked_by_member,
                 source_turn_id, source_session_id, created_at`,
      [memberId, randomUUID(), verbatimText, turnId, sessionId],
    );

    // Discoverable log marker. Member data minimized: prefix + counts only,
    // never the verbatim content.
    console.log(
      `[MAIA/sovereign] episodic moment marked { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `episodeId: ${result.rows[0].episode_id}, verbatimChars: ${verbatimText.length}, ` +
        `hasTurn: ${turnId !== null}, hasSession: ${sessionId !== null} }`,
    );

    return NextResponse.json({ episode: shape(result.rows[0]) }, { status: 201 });
  } catch (err) {
    console.error('[episodes/mark] POST error:', err);
    return NextResponse.json({ error: 'Failed to mark episode' }, { status: 500 });
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
      `[MAIA/sovereign] episodic moment unmarked { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `episodeId: ${episodeId} }`,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[episodes/mark] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to unmark episode' }, { status: 500 });
  }
}
