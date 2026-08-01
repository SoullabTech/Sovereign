// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Living Works — declaration (Phase 2, Slice 2).
 *
 * GET  — the member's declared works. Member-scoped by credential.
 * POST — the member declares that a work exists. Optionally names it.
 *
 * THE ONE THING THIS ROUTE IS FOR: a Living Work comes into existence ONLY
 * here, and only because a member said so. There is no other creation path in
 * the codebase — not on signup, not on import, not on first save, not as a
 * side effect of any other act (`CREATION_REQUIRES_A_MEMBER_ACT`).
 *
 * WHAT IT REFUSES, and why each refusal is structural rather than intended:
 *
 *   - **No inferred identity.** The body accepts `title` and nothing else. A
 *     type, stage, status, theme, summary or purpose sent by a client is
 *     ignored, not stored — see NEVER_AUTHORED_BY_THE_SYSTEM.
 *   - **No invented name.** An absent title is stored as NULL. The route never
 *     substitutes "Untitled", a date, a counter, or the member's first
 *     manuscript title. Identity and recognition are different moments
 *     (ledger D-16); this route is the identity half only.
 *   - **No attachment.** Nothing is linked to the new work. Manuscripts are
 *     untouched and do not learn they belong to anything.
 *   - **No sanitizing of the member's words.** A given title is stored as
 *     typed apart from the blank check the schema enforces.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { refuseTitle } from '@/lib/livingWork/domain';

const MAX_TITLE_CHARS = 300;

interface WorkRow {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

const shape = (r: WorkRow) => ({
  id: r.id,
  title: r.title,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await query<WorkRow>(
      `SELECT id, title, created_at, updated_at
         FROM living_works
        WHERE member_id = $1
        ORDER BY updated_at DESC`,
      [memberId]
    );
    return NextResponse.json({ works: rows.rows.map(shape) });
  } catch (error) {
    console.error('[living-works] list failed', error);
    return NextResponse.json({ error: 'Could not read your works' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as { title?: unknown };

    /* An absent title and an empty one are different acts. Absent means "I am
       not ready to name this" and is legitimate. Empty means a name was
       submitted with nothing in it, which is a mistake worth reporting rather
       than silently storing as unnamed. */
    let title: string | null = null;
    if (body.title !== undefined && body.title !== null) {
      if (typeof body.title !== 'string') {
        return NextResponse.json({ error: 'title must be text' }, { status: 400 });
      }
      if (body.title.length > MAX_TITLE_CHARS) {
        return NextResponse.json(
          { error: `title is longer than ${MAX_TITLE_CHARS} characters` },
          { status: 400 }
        );
      }
      if (refuseTitle(body.title) === 'blank_title') {
        return NextResponse.json({ error: 'blank_title' }, { status: 400 });
      }
      title = body.title;
    }

    const created = await query<WorkRow>(
      `INSERT INTO living_works (member_id, title)
       VALUES ($1, $2)
       RETURNING id, title, created_at, updated_at`,
      [memberId, title]
    );
    return NextResponse.json({ work: shape(created.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[living-works] declare failed', error);
    return NextResponse.json({ error: 'Could not begin your work' }, { status: 500 });
  }
}
