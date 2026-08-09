/**
 * Governance hold — impose and release, under platform governance authority.
 *
 *   POST   /api/admin/practice-field/[id]/governance-hold   — impose a governance_hold
 *   DELETE /api/admin/practice-field/[id]/governance-hold   — release a governance_hold
 *
 * Authority: founder | cto, via the existing `checkAdminAuth` gate. No new role invented.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⛔ R-GC2a — GOVERNANCE-HOLD JURISDICTION (ratified 2026-08-09). READ BEFORE EXTENDING.
 *
 *   "Platform governance authority extends to the imposition and release of a
 *    governance_hold wherever AIN constitutional or stewardship controls apply, including
 *    artifacts within a Practice Field. This authority governs ONLY the containment state
 *    and its governance provenance. It confers NO authority over the artifact's relational
 *    content, epistemic status, authorship, adoption, publication, or underlying
 *    practitioner/member relationship."
 *
 * The distinction is between the CONTROL PLANE and the RELATIONAL PLANE. An owner acting
 * here may say exactly one thing:
 *
 *      "AIN's governance restraint on this record is released."
 *
 * They may NOT, by virtue of this role, say any of:
 *
 *      "This practitioner reflection is valid."
 *      "This relational interpretation is correct."
 *      "This should be adopted."          "This may be published."
 *      "This member account is false."
 *
 * Those remain under whatever authority governs the relational artifact itself. This is
 * why the route writes ONLY containment columns and its event record — never
 * welcome_message, how_we_work_together, how_maia_supports, professional_practice,
 * resources, maia_guidance, active_field_content, status, or status_reason. It mirrors the
 * self-limit the admin-role route already states: "this route writes members.admin_role and
 * nothing else — it never touches relationship data."
 *
 * ⚠️ Releasing a governance hold does NOT make the field live. It restores the field to
 * ordinary readiness governance: `effective_live` still requires status = 'live' (GC-2).
 * Release removes a prohibition; it does not confer an endorsement.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Precedent: CONTAINMENT_RELEASE_AUTHORITY_PRECEDENT_2026-08-09.md — AIN already runs
 * asymmetric reversal on shared state (auth_sessions.revoked, four writers, three
 * authorities). This is the same shape, made explicit.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { checkAdminAuth, adminUnauthorized, type AdminRole } from '@/lib/admin/adminAuth';

type RouteParams = { params: Promise<{ id: string }> };

/** Owners — the same boundary the admin-role grant route uses. Not a new role. */
const OWNER_ROLES: AdminRole[] = ['founder', 'cto'];

/**
 * The ONLY columns this route may write on practice_fields.
 *
 * Enforced by invariant K5: R-GC2a is a jurisdictional limit, so the limit is asserted
 * against the source rather than left to reviewer vigilance.
 */
async function loadField(fieldId: string) {
  const result = await query(
    `SELECT id, practitioner_member_id, containment_status, containment_kind,
            containment_reason, containment_reference
       FROM practice_fields WHERE id = $1`,
    [fieldId],
  );
  return result.rows[0] ?? null;
}

/** Impose a governance hold. */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await checkAdminAuth(req, OWNER_ROLES);
  if (!auth.authed) return adminUnauthorized();

  const field = await loadField(id);
  if (!field) return NextResponse.json({ error: 'Practice Field not found' }, { status: 404 });
  if (field.containment_status === 'contained') {
    return NextResponse.json(
      { already_contained: true, field_id: id, containment_kind: field.containment_kind },
      { status: 409 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : null;
  if (!reason) {
    return NextResponse.json({ error: 'A governance hold requires a stated reason.' }, { status: 400 });
  }

  await transaction(async (tx) => {
    await tx.query(
      `UPDATE practice_fields SET
         containment_status    = 'contained',
         containment_kind      = 'governance_hold',
         containment_reason    = $2,
         contained_at          = NOW(),
         contained_by          = $3,
         containment_reference = $4,
         released_at           = NULL,
         released_by           = NULL
       WHERE id = $1`,
      [id, reason, auth.memberId ?? null, reference],
    );
    await tx.query(
      `INSERT INTO practice_field_containment_events (
         practice_field_id, event, prior_status, prior_kind, resulting_status, resulting_kind,
         authority_basis, actor_member_id, actor_admin_role, note)
       VALUES ($1,'imposed',$2,$3,'contained','governance_hold','platform_governance',$4,$5,$6)`,
      [id, field.containment_status, field.containment_kind, auth.memberId ?? null, auth.role, reason],
    );
  });

  console.info('[PracticeField/governance-hold] imposed', JSON.stringify({
    fieldId: id, role: auth.role, via: auth.via,
  }));
  return NextResponse.json({ contained: true, containment_kind: 'governance_hold', field_id: id });
}

/**
 * Release a governance hold.
 *
 * This is the act R-GC2a authorizes, and the whole of it. `containment_reason` and
 * `contained_at` are preserved: the release records that a hold was lifted, it does not
 * pretend the hold never existed.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await checkAdminAuth(req, OWNER_ROLES);
  if (!auth.authed) return adminUnauthorized();

  const field = await loadField(id);
  if (!field) return NextResponse.json({ error: 'Practice Field not found' }, { status: 404 });
  if (field.containment_status !== 'contained') {
    return NextResponse.json({ error: 'This Practice Field is not contained.' }, { status: 409 });
  }
  // A voluntary hold is the holder's own act. Platform governance does not lift it for
  // them — that would be governance reaching into a practitioner's own decision about
  // their own field, which R-GC2a does not authorize.
  if (field.containment_kind !== 'governance_hold') {
    return NextResponse.json(
      {
        error:
          'This is a voluntary hold placed by the field holder. Platform governance does not release it; the holder does.',
        containment_kind: field.containment_kind,
      },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === 'string' ? body.note.trim() : null;

  await transaction(async (tx) => {
    await tx.query(
      `UPDATE practice_fields SET
         containment_status = 'none',
         containment_kind   = NULL,
         released_at        = NOW(),
         released_by        = $2
       WHERE id = $1`,
      [id, auth.memberId ?? null],
    );
    await tx.query(
      `INSERT INTO practice_field_containment_events (
         practice_field_id, event, prior_status, prior_kind, resulting_status, resulting_kind,
         authority_basis, actor_member_id, actor_admin_role, note)
       VALUES ($1,'released','contained','governance_hold','none',NULL,'platform_governance',$2,$3,$4)`,
      [id, auth.memberId ?? null, auth.role, note],
    );
  });

  console.info('[PracticeField/governance-hold] released', JSON.stringify({
    fieldId: id, role: auth.role, via: auth.via,
  }));
  // Deliberately NOT "now live": release restores ordinary readiness governance (GC-2).
  return NextResponse.json({ released: true, field_id: id, still_requires_readiness: true });
}
