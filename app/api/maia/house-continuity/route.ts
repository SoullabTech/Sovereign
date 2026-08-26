/**
 * House continuity — what the member's own world can honestly show them.
 *
 * MLX-06 Unit 1. Read-only, member-scoped. Composes surfaces that already
 * exist (maia_sessions, member_memory_atoms); adds no capability.
 *
 * TWO-CHANNEL RULE (MLX-01 §6.2). This endpoint feeds the MEMBER-VIEW channel
 * only. A member may see all of their own material here; it does NOT widen
 * what MAIA receives. `return_preference` and `surface_preference` govern the
 * MAIA-prompt channel and are deliberately NOT consulted or modified here —
 * a private atom is private FROM MAIA, not from its author.
 *
 * WHAT THIS DELIBERATELY FILTERS, and why:
 *
 *   memory_scope = 'personal'
 *     Atoms carry a strict containment hierarchy (personal | colab | client |
 *     encounter). Client- and encounter-scoped atoms belong to a practitioner
 *     context, never to the practitioner's own personal House.
 *
 *   status = 'active'
 *     'archived' is defined in schema as "removed from active recall".
 *     'protected' (incl. the sacred_protected register) is voice-ineligible
 *     and non-circulating; it is not ambient material.
 *
 *   privacy_mode <> 'sanctuary'
 *     Sanctuary sessions do not enter long-term memory or continuity, by
 *     invariant. They may not be offered back as somewhere to continue.
 *
 * NOTE: the pre-existing /home gathering strip filters none of the three.
 * That is recorded as a finding, not fixed here — /home is out of scope for
 * this unit.
 *
 * "Recent" is NOT returned. See the report: no place-visit substrate exists
 * (`maia_last_place` is absent from this lineage), so a Recent composed from
 * sessions would only restate Continue. Reported rather than fabricated.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

export const dynamic = 'force-dynamic';

export interface HouseContinuity {
  /** The single most recent non-sanctuary conversation, if one exists. */
  continue: {
    sessionId: string;
    startedAt: string;
    lastActivityAt: string;
    /** Turns exchanged. A count, never a characterization of the conversation. */
    exchanges: number;
  } | null;
  /** What the member deliberately kept. Titles only — their own words. */
  kept: { id: string; title: string; isBreakthrough: boolean; createdAt: string }[];
  /** Total active personal atoms, for "3 things you've chosen not to lose". */
  keptTotal: number;
}

const EMPTY: HouseContinuity = { continue: null, kept: [], keptTotal: 0 };

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const memberId = session.memberId;

    const [sessionR, atomR, countR] = await Promise.all([
      query(
        `SELECT id, started_at, last_activity_at, message_count
           FROM maia_sessions
          WHERE member_id = $1
            AND privacy_mode <> 'sanctuary'
          ORDER BY last_activity_at DESC
          LIMIT 1`,
        [memberId],
      ),
      query(
        `SELECT id, title, is_breakthrough, created_at
           FROM member_memory_atoms
          WHERE member_id = $1
            AND memory_scope = 'personal'
            AND status = 'active'
          ORDER BY created_at DESC
          LIMIT 3`,
        [memberId],
      ),
      query(
        `SELECT count(*)::int AS n
           FROM member_memory_atoms
          WHERE member_id = $1
            AND memory_scope = 'personal'
            AND status = 'active'`,
        [memberId],
      ),
    ]);

    const s = sessionR.rows[0];
    const payload: HouseContinuity = {
      continue: s
        ? {
            sessionId: String(s.id),
            startedAt: String(s.started_at),
            lastActivityAt: String(s.last_activity_at),
            exchanges: Number(s.message_count ?? 0),
          }
        : null,
      kept: atomR.rows.map((r) => ({
        id: String(r.id),
        title: String(r.title),
        isBreakthrough: Boolean(r.is_breakthrough),
        createdAt: String(r.created_at),
      })),
      keptTotal: countR.rows[0]?.n ?? 0,
    };

    // Counts and flags only — never titles or bodies (free-text PHI doctrine).
    console.log('[MAIA/house] continuity', {
      memberIdPrefix: memberId.slice(0, 8),
      hasContinue: payload.continue !== null,
      keptShown: payload.kept.length,
      keptTotal: payload.keptTotal,
    });

    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error('[MAIA/house] continuity error:', error);
    // The House must still open if continuity cannot be read.
    return NextResponse.json({ success: true, ...EMPTY });
  }
}
