// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { addMemberAnnotation } from '@/lib/consciousness/interpretiveLedger';
import { query } from '@/lib/db/postgres';
import type { AnnotationType } from '@/lib/types/interpretive-ledger';

// Helper: canon headers for this data endpoint (not AI response — just correlation ID)
function canonHeaders(correlationId: string) {
  return makeCanonHeaders({ requestId: correlationId, pipeline: 'direct' });
}

/**
 * POST /api/members/ledger/annotate
 *
 * The member's response layer on top of the interpretive ledger.
 *
 * This is where the member consciously meets what the Cognitive OS has been holding.
 * Annotation is not editing — the system's observation record is not changed.
 * The member's response is recorded alongside it, and the system adjusts its
 * routing influence accordingly.
 *
 * Design principle:
 *   MAIA does not complete the synthesis. It presents material in a way the member
 *   can consciously participate in. This endpoint is that participation.
 *
 * Request body:
 *   entry_id  string (required) — the ledger entry being responded to
 *   action    string (required) — one of the allowed AnnotationType values
 *   note      string (optional) — member's text for resonates, does_not_resonate, not_now, clear_influence
 *   context   string (optional) — member's extended text, primary field for add_context
 *
 * Actions and their effects:
 *   resonates          → records response + increases routing influence slightly
 *   does_not_resonate  → records response + reduces routing influence (no epistemic penalty)
 *   not_now            → records response + suppresses surfacing (timing only, no influence change)
 *   add_context        → records member's text (pure annotation, no ledger mutation)
 *   clear_influence    → records response + sets routing influence to near-zero
 *
 * Invariants:
 *   - The system's observation record (evidence, interpretation) is never mutated
 *   - A decline is not treated as evidence for the interpretation
 *   - Auth: session cookie only — server determines identity
 */
export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID();

  // ── Auth ──────────────────────────────────────────────────────────────────
  const session = await getCurrentSession();
  if (!session?.memberId) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in to annotate your ledger.' },
      { status: 401, headers: canonHeaders(correlationId) },
    );
  }
  const memberId = session.memberId;

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400, headers: canonHeaders(correlationId) });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400, headers: canonHeaders(correlationId) },
    );
  }

  const { entry_id, action, note, context } = body as Record<string, unknown>;

  // ── Validate ───────────────────────────────────────────────────────────────
  const ALLOWED_ACTIONS: AnnotationType[] = [
    'resonates',
    'does_not_resonate',
    'not_now',
    'add_context',
    'clear_influence',
    // GATE 1 (founder ruling 2026-08-09): the authority-conferring member acts.
    'confirm',
    'qualify',
  ];

  if (typeof entry_id !== 'string' || !entry_id.trim()) {
    return NextResponse.json(
      { error: 'entry_id is required.' },
      { status: 400, headers: canonHeaders(correlationId) },
    );
  }

  if (!ALLOWED_ACTIONS.includes(action as AnnotationType)) {
    return NextResponse.json(
      {
        error: `action must be one of: ${ALLOWED_ACTIONS.join(', ')}`,
        allowed_actions: ALLOWED_ACTIONS,
      },
      { status: 400, headers: canonHeaders(correlationId) },
    );
  }

  // note is for resonates / does_not_resonate / not_now / clear_influence / confirm
  // context is the primary field for add_context and qualify
  const annotationText =
    (typeof context === 'string' ? context.trim() : '') ||
    (typeof note === 'string' ? note.trim() : '');

  // GATE 1 (F1): a qualification's governing text is the member's OWN words —
  // the system never authors it on their behalf. Refuse a text-less qualify.
  if (action === 'qualify' && !annotationText) {
    return NextResponse.json(
      { error: "qualify requires the member's qualifying words (context or note)." },
      { status: 400, headers: canonHeaders(correlationId) },
    );
  }

  // ── Ownership check ────────────────────────────────────────────────────────
  // Verify the entry exists, belongs to this member, and is active.
  // Returns nothing useful if not found — treated as 404.
  let ownershipCheck: { routing_influence_weight: string; surfacing_status: string } | undefined;
  try {
    const result = await query<{
      routing_influence_weight: string;
      surfacing_status: string;
    }>(
      `SELECT routing_influence_weight, surfacing_status
       FROM interpretive_ledger
       WHERE id = $1 AND member_id = $2 AND status = 'active'`,
      [entry_id, memberId],
    );
    ownershipCheck = result.rows[0];
  } catch (err) {
    console.error('[LedgerAnnotate] Ownership check failed:', err);
    return NextResponse.json(
      { error: 'Failed to verify ledger entry.' },
      { status: 500, headers: canonHeaders(correlationId) },
    );
  }

  if (!ownershipCheck) {
    return NextResponse.json(
      { error: 'Ledger entry not found or not accessible.' },
      { status: 404, headers: canonHeaders(correlationId) },
    );
  }

  // ── Apply annotation ───────────────────────────────────────────────────────
  try {
    await addMemberAnnotation(entry_id, memberId, annotationText, action as AnnotationType);
  } catch (err) {
    console.error('[LedgerAnnotate] addMemberAnnotation failed:', err);
    return NextResponse.json(
      { error: 'Failed to record annotation.' },
      { status: 500, headers: canonHeaders(correlationId) },
    );
  }

  // ── Return updated state ───────────────────────────────────────────────────
  const updated = await query<{
    routing_influence_weight: string;
    surfacing_status: string;
  }>(
    `SELECT routing_influence_weight, surfacing_status
     FROM interpretive_ledger
     WHERE id = $1`,
    [entry_id],
  ).catch(() => ({ rows: [] as { routing_influence_weight: string; surfacing_status: string }[] }));

  const updatedEntry = updated.rows[0];

  return NextResponse.json(
    {
      ok: true,
      entry_id,
      action,
      annotation_text: annotationText || null,
      // What the OS updated in response to the member's annotation
      effect: updatedEntry
        ? {
            routing_influence_weight: Number(updatedEntry.routing_influence_weight),
            surfacing_status: updatedEntry.surfacing_status,
          }
        : null,
      _meta: {
        correlationId,
        sovereignty_note:
          'Your response is recorded alongside the system observation. ' +
          'Neither overwrites the other. The evidence that produced this interpretation ' +
          'remains intact. You can inspect everything this system holds about you at ' +
          'GET /api/members/ledger.',
      },
    },
    { status: 200, headers: canonHeaders(correlationId) },
  );
}
