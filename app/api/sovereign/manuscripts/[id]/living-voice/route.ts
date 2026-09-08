// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * LIVING VOICE — one creative encounter with one passage the writer offered.
 *
 * POST { passage, lens, sectionId? }
 *
 * ── LV-H, AT THE DOOR ──────────────────────────────────────────────────────
 *
 *   This is not MAIA gaining permission to read the Work.
 *   It is the writer offering MAIA one passage for one creative encounter.
 *
 * The passage arrives in the request because the writer performed an explicit
 * act — selection alone reaches nothing (LV-A). This route is that act's only
 * expression, and it does exactly four things: authorize the member, check the
 * bound, situate the anchor, and ask.
 *
 * ⛔ IT WRITES NOTHING. There is no table, no insert, no update, no log of the
 * prose, and no accumulation across turns. LV-H's non-durability is not a
 * policy this route follows — it is the absence of anywhere to put the passage.
 *
 * ⛔ IT READS NO MANUSCRIPT PROSE. The manuscript is touched once, to confirm
 * the member owns it and to read a section's HEADING for the anchor. The
 * passage is the writer's, not the server's: the server never fetches the text
 * it is reasoning about, which is what keeps this from being a reading path.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  checkPassage,
  livingVoiceEncounter,
  passageRefusalCopy,
  LENSES,
  type LivingVoiceLens,
} from '@/lib/writersStudio/livingVoice';

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: manuscriptId } = await ctx.params;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { passage, lens, sectionId } = (payload ?? {}) as Record<string, unknown>;

    if (typeof lens !== 'string' || !LENSES.includes(lens as LivingVoiceLens)) {
      return NextResponse.json({ error: 'Choose a lens.' }, { status: 400 });
    }
    if (typeof passage !== 'string') {
      return NextResponse.json({ error: 'Choose a passage first.' }, { status: 400 });
    }

    /* LV-I — refused, never truncated. Silent truncation would be the system
       deciding which part of the writer's selection mattered. */
    const bounded = checkPassage(passage);
    if (!bounded.ok) {
      return NextResponse.json(
        { error: passageRefusalCopy(bounded.refusal), codePoints: bounded.codePoints },
        { status: 400 },
      );
    }

    const owns = await query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 LIMIT 1`,
      [manuscriptId, memberId],
    );
    if (owns.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    /* The anchor, and ONLY the anchor: a heading the writer titled. Not the
       section's body — reading that would enlarge the offer into a scope the
       writer did not make (LV-H). */
    let sectionHeading: string | null = null;
    if (typeof sectionId === 'string' && sectionId.length > 0) {
      const section = await query<{ heading: string | null }>(
        `SELECT heading FROM manuscript_sections WHERE id = $1 AND manuscript_id = $2 LIMIT 1`,
        [sectionId, manuscriptId],
      );
      sectionHeading = section.rows[0]?.heading ?? null;
    }

    const outcome = await livingVoiceEncounter({
      passage: bounded.passage,
      lens: lens as LivingVoiceLens,
      sectionHeading,
    });

    /* THE SEAM COULD NOT RUN. Reported as unavailability, never as silence: a
       writer told "nothing to add" about a passage MAIA never saw would have
       witnessed a refusal that did not happen. The reason is not disclosed to
       them — it is not theirs to debug — but the fact that nothing was looked
       at is. */
    if (outcome.kind === 'unavailable') {
      return NextResponse.json(
        { error: 'Could not look at that just now' },
        { status: 503 },
      );
    }

    /* Silence is lawful and unremarkable. The encounter happened; MAIA had
       nothing that held to its own rules. Not an error, not a retry. */
    return NextResponse.json({
      response: outcome.kind === 'response' ? outcome.text : null,
    });
  } catch (error) {
    /* The passage is never in the log line. */
    console.error('[living-voice] encounter failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Could not look at that just now' }, { status: 500 });
  }
}
