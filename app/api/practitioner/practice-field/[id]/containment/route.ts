/**
 * Governance containment — the ONLY writer of the containment columns.
 *
 *   POST   /api/practitioner/practice-field/[id]/containment   — impose
 *   DELETE /api/practitioner/practice-field/[id]/containment   — release
 *
 * Design + durable record: docs/design/practitioner-portal/GOVERNANCE_CONTAINMENT_2026-08-09.md
 *
 * GC-3 — containment transitions are explicit, ATTRIBUTED acts. No computation, migration,
 * or content edit may set or clear containment. Founder ruling 2026-08-09:
 *
 *   "Future containment and release operations must require an authenticated, attributable
 *    actor; no new anonymous governance acts are permitted."
 *
 * The database permits `contained_by IS NULL` so the one 2026-08-03 legacy containment —
 * whose author is unrecoverable from evidence — can be recorded honestly rather than
 * fabricated. This route does NOT inherit that latitude: every act it writes is attributed.
 * The historical unknown is representable; new unknowns are not creatable.
 *
 * Release preserves `containment_reason` and `contained_at` as history rather than blanking
 * them. A hold that can only be imposed and never lifted is not governance, and a release
 * that erases what was held is not a record.
 *
 * ⛔ GC-4 — THIS IS THE HOLDER PATH ONLY.
 *
 * It imposes and releases `authority_basis = 'holder'` containments: "I am withholding my
 * own field." It CANNOT mint a governance containment, and it REFUSES to release one (403).
 * Holding the field is necessary but not sufficient — release authority follows the kind of
 * containment, never the actor's relationship to the resource.
 *
 * NO GOVERNANCE RELEASE PATH EXISTS YET, DELIBERATELY. Building one requires settling who
 * holds that authority, and the existing admin model documents its jurisdiction as "platform
 * stewardship ONLY … never relationship data" — a Practice Field sits near that line. That
 * question is open (CONTAINMENT_RELEASE_AUTHORITY_PRECEDENT_2026-08-09.md §3.2). Until it is
 * ruled, a governance containment is releasable only by a deliberate, audited act outside
 * this API. The absence is the safe state: it fails closed.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { holderReleaseCheck } from '@/lib/types/practiceField';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Containment is a governance act over a practitioner's own field. The actor must be
 * authenticated and must hold the field; a field holder may contain their own field, and
 * only they may release it. Widening this to a separate governance role is a later ruling —
 * it is deliberately NOT inferred here.
 */
async function requireFieldHolder(req: NextRequest, fieldId: string) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) {
    return { failure: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }
  const result = await query(
    `SELECT id, practitioner_member_id, containment_status, authority_basis,
            containment_reason, contained_at
       FROM practice_fields WHERE id = $1`,
    [fieldId],
  );
  if (!result.rows.length) {
    return { failure: NextResponse.json({ error: 'Practice Field not found' }, { status: 404 }) };
  }
  const field = result.rows[0];
  if (field.practitioner_member_id !== memberId) {
    return { failure: NextResponse.json({ error: 'Not authorized for this Practice Field' }, { status: 403 }) };
  }
  return { memberId, field };
}

/** Impose a containment. */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireFieldHolder(req, id);
  if ('failure' in auth) return auth.failure;

  if (auth.field.containment_status === 'contained') {
    return NextResponse.json(
      { already_contained: true, field_id: id, containment_reason: auth.field.containment_reason },
      { status: 409 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : null;

  // A containment without a stated reason is an unexplained prohibition — refuse it.
  if (!reason) {
    return NextResponse.json({ error: 'A containment requires a stated reason.' }, { status: 400 });
  }

  // This route imposes HOLDER containments only — "I am withholding my own field."
  // A governance containment is a prohibition placed by another authority; it is not
  // creatable here, and this route has no way to mint one (GC-4).
  await query(
    `UPDATE practice_fields SET
       containment_status    = 'contained',
       authority_basis       = 'holder',
       containment_reason    = $2,
       contained_at          = NOW(),
       contained_by          = $3,
       containment_reference = $4,
       released_at           = NULL,
       released_by           = NULL
     WHERE id = $1`,
    [id, reason, auth.memberId, reference],
  );

  console.info('[PracticeField/containment] imposed', JSON.stringify({
    fieldId: id, byPrefix: auth.memberId.slice(0, 8),
  }));

  return NextResponse.json({ contained: true, field_id: id });
}

/** Release a containment. The reason and original date are preserved as history. */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireFieldHolder(req, id);
  if ('failure' in auth) return auth.failure;

  // GC-4 — the decision is made by holderReleaseCheck, not re-derived here. Holding the
  // field is necessary but NOT sufficient: a holder may lift what they imposed and may not
  // lift what an outside authority imposed on them.
  const check = holderReleaseCheck(auth.field, auth.memberId);
  if (!check.allowed) {
    if (check.refusal === 'not_contained') {
      return NextResponse.json({ error: 'This Practice Field is not contained.' }, { status: 409 });
    }
    if (check.refusal === 'governance_authority') {
      return NextResponse.json(
        {
          error:
            'This is a governance containment. It cannot be released by the field holder — a separately authorized governance release act is required.',
          authority_basis: 'governance',
          containment_reason: auth.field.containment_reason,
          containment_reference: auth.field.containment_reference,
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: 'Not authorized for this Practice Field' }, { status: 403 });
  }

  // containment_reason and contained_at are deliberately NOT cleared: the release records
  // that a hold was lifted, it does not pretend the hold never existed.
  await query(
    `UPDATE practice_fields SET
       containment_status = 'none',
       authority_basis    = NULL,
       released_at        = NOW(),
       released_by        = $2
     WHERE id = $1`,
    [id, auth.memberId],
  );

  console.info('[PracticeField/containment] released', JSON.stringify({
    fieldId: id, byPrefix: auth.memberId.slice(0, 8),
  }));

  return NextResponse.json({ released: true, field_id: id });
}
