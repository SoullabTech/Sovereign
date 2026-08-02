import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getAuthoredField } from '@/lib/practiceField/programAuthoringService';

/**
 * GET /api/studio/now-what/shared — the receiving surface for the share
 * gesture (Kelly directive 2026-07-30: the Admin field's support loop).
 *
 * Until this route, `can_be_shown_to_practitioner` was a promise with no
 * fulfillment: members saw "shared with your practitioner"; the practitioner
 * had nowhere to see it. This closes that loop — and ONLY that loop.
 *
 * Constitutional scoping (entry ≠ visibility; sovereign placement):
 *  - Returns ONLY threads the member explicitly flagged, item by item
 *    (`can_be_shown_to_practitioner = TRUE`) — the gesture IS the consent.
 *  - Scoped to the requesting practitioner's OWN authored field
 *    (`getAuthoredField` — 403 for anyone else). No cross-field reads.
 *  - No aggregation, no counts-by-member, no activity data, no unshared
 *    anything. The practitioner sees what was handed to him — nothing about
 *    what wasn't.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const field = await getAuthoredField(memberId);
    if (!field) {
      return NextResponse.json(
        { error: 'This desk belongs to the field holder.' },
        { status: 403 }
      );
    }

    const result = await query(
      `SELECT t.id, t.title, t.content, t.spiralogic_phase, t.created_at,
              COALESCE(NULLIF(TRIM(m.name), ''), 'A member') AS member_name
       FROM member_field_note_threads t
       JOIN members m ON m.id = t.member_id
       WHERE t.field_context = $1
         AND t.can_be_shown_to_practitioner = TRUE
       ORDER BY t.created_at DESC
       LIMIT 200`,
      [field.fieldSlug]
    );

    return NextResponse.json({
      fieldSlug: field.fieldSlug,
      items: result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        kind: r.spiralogic_phase,
        sharedBy: r.member_name,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    console.error('[studio/now-what/shared]', e);
    return NextResponse.json({ error: 'Could not open the desk right now.' }, { status: 500 });
  }
}
