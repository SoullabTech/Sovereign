export const dynamic = 'force-dynamic';
export const revalidate = false;

/**
 * POST /api/sovereignty/delete-my-memory
 *
 * F5 REPAIR — MEMBER-VISIBLE TRUTH (founder act, 2026-09-20).
 * Scope: truthfulness only. This change removes a false statement. It does NOT
 * implement erasure, and nothing here should be read as doing so.
 *
 * BEFORE: the handler called an Express-era service
 * (`services/user-sovereignty/delete-memory-api.js`) whose deletions target
 * `elemental_evolution`, `wisdom_moments`, `ain_consciousness_memory`,
 * `elemental_personalities` and `maia_adaptations`. Those five tables are
 * created only under `db/migrations/`, which the deployed runner does not read
 * (`scripts/run-sql-migrations.sh` reads `database/migrations`). None of the
 * live memory substrate — `developmental_memories`, `member_sessions`,
 * `conversation_memory_uses`, `member_spiral_state`, `agent_runs`,
 * `member_daily_anchors` — was ever referenced.
 *
 * Worse than the incompleteness: when the require or the service call threw,
 * the catch branch returned
 *   { success: true, message: 'Memory deletion request processed successfully',
 *     details: '... your request has been queued' }
 * Nothing was queued by that branch. A member who asked to be forgotten was
 * told it had happened, at the one moment they were most entitled to accuracy.
 *
 * AFTER: the route refuses, truthfully, and says plainly that nothing changed.
 * This mirrors the containment posture already ratified for
 * `app/api/members/delete-account` (CONTAINMENT_POSTURE = 'refuse'): refusing
 * is reversible, and a false completion claim is not.
 *
 * Standing this repair does NOT alter:
 *   F5 ERASURE CONFORMANCE — FAIL / STOP.
 *   docs/programme/F5_ERASURE_TRACE_ADJUDICATION_2026-09-17.md
 *   docs/programme/F5-A_ERASURE_ARCHITECTURE_CENSUS_2026-09-17.md
 *
 * The governing requirement this satisfies, from that adjudication §4:
 *
 *   > An erasure refusal is not complete merely because the server knows why
 *   > it refused. The member must receive the governed reason and an
 *   > unambiguous statement of whether anything changed.
 *
 * This route is additionally NON-AUTHORITATIVE on identity: it never resolved a
 * session, taking `userId` from the request body. That defect is NOT repaired
 * here — it is out of the authorized scope — but it is a further reason the
 * route must not perform or claim deletion while it stands.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // No body is read, and no deletion is attempted. Reading a confirmation
  // phrase here would imply the phrase authorizes something; it does not.
  return NextResponse.json(
    {
      success: false,
      error: 'erasure_unavailable',
      // The one fact that matters most to someone who just asked to be
      // forgotten, stated first and without hedging.
      accountChanged: false,
      deleted: false,
      message:
        "We can't complete memory deletion automatically yet. Nothing has been " +
        'changed or removed. Please contact support so your request can be ' +
        'handled properly.',
      nextStep: 'contact_support',
    },
    { status: 503 },
  );
}
