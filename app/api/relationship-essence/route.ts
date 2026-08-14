export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

export const revalidate = false;

/**
 * Authenticated subject binding — founder ruling, 2026-08-14.
 *
 * > No member-specific relational representation may be returned without
 * > authenticated subject binding. Possession or derivation of an identifier
 * > is not authority to retrieve the person it names.
 *
 * Before this ruling this handler performed NO authentication of any kind and
 * selected on a caller-supplied `soulSignature`. Because signatures are
 * derived as `'soul_' + user_id` (RelationshipAnamnesisPostgres.ts:46), anyone
 * holding any member's `user_id` could read that member's name, inferred
 * `presence_quality`, archetypal list and encounter history with a single
 * unauthenticated GET. Established by runtime witness at `22200f967`
 * (`RF_RELATIONAL_SURFACE_AND_IDENTITY_RUNTIME_TRACE_2026-08-14.md`), which
 * retrieved a real member's legal name.
 *
 * The subject is now bound to the authenticated session. A caller-supplied
 * `soulSignature` can never widen that binding — it is accepted only as a
 * redundant assertion about the caller's OWN record, and a mismatch is refused.
 */
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  // Fail closed: no session, no relational representation.
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestedSignature: string | null = null;
  try {
    requestedSignature = request.nextUrl.searchParams.get('soulSignature');
  } catch {
    // During static export, searchParams may not be available
  }

  try {
    // Subject binding: the authenticated member, never the query parameter.
    const result = await query(
      `SELECT soul_signature, user_id, user_name, presence_quality,
              archetypal_resonances, spiral_position, relationship_field,
              first_encounter, last_encounter, encounter_count, morphic_resonance
       FROM relationship_essences
       WHERE user_id = $1
       LIMIT 1`,
      [session.memberId]
    );

    // A supplied signature may only ever name the caller's own record.
    if (
      requestedSignature &&
      result.rows.length > 0 &&
      (result.rows[0] as { soul_signature?: string }).soul_signature !== requestedSignature
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('[relationship-essence] DB error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
