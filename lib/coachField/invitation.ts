/**
 * Coach Field — invitation lifecycle.
 *
 * A relationship may exist before the person does. `practitioner_clients.member_id`
 * is nullable ONLY for that window, and write-once after it (enforced in the
 * database by practitioner_client_link_guard, not merely here).
 *
 * A pending relationship may carry the practitioner, an invitation address, an
 * intended program, an intended cohort and a proposed starting stage. It may NOT
 * carry access to member-private data — there is no member yet, and once there is,
 * access still depends on what that member chose to share.
 *
 * Acceptance is one transaction, in the ruled order:
 *   1 validate the invitation
 *   2 identify the exact pending relationship
 *   3 lock it
 *   4 verify it is not already linked inconsistently
 *   5 set member_id
 *   6 set linked_at
 *   7 activate the relationship (and any pending enrollment)
 *   8 preserve the invitation provenance
 *   9 create no duplicate relationship
 */

import { transaction } from '@/lib/db/postgres';
import {
  asMemberId,
  asRelationshipId,
  resolvePractitionerRecordFromMember,
  type MemberId,
  type RelationshipId,
} from './identity';

export class InvitationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'InvitationError';
    this.code = code;
  }
}

export interface AcceptanceResult {
  relationshipId: RelationshipId;
  memberId: MemberId;
  activatedEnrollments: number;
  alreadyLinked: boolean;
}

/**
 * Claim an invitation for an authenticated member.
 *
 * `codeHash` is the hashed invitation code; the raw code never reaches this layer.
 * `acceptingMemberId` must come from the session credential — never from the
 * invitation payload, or an attacker could name the member the link binds to.
 */
export async function acceptInvitation(input: {
  codeHash: string;
  acceptingMemberId: MemberId;
}): Promise<AcceptanceResult> {
  return transaction(async (client) => {
    // 1 — validate the invitation
    const { rows: invites } = await client.query(
      `SELECT id, client_id, status, expires_at, claimed_at, claimed_by_member_id
         FROM client_invites
        WHERE code_hash = $1`,
      [input.codeHash]
    );
    if (invites.length === 0) throw new InvitationError('not_found', 'This invitation is not valid.');
    const invite = invites[0];

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      throw new InvitationError('expired', 'This invitation has expired.');
    }
    if (invite.claimed_by_member_id && invite.claimed_by_member_id !== input.acceptingMemberId) {
      // Someone else already claimed it. Say so without naming them.
      throw new InvitationError('already_claimed', 'This invitation has already been claimed.');
    }

    // 2 + 3 — identify the exact relationship and LOCK it before reading its state.
    // FOR UPDATE is what makes step 4 meaningful: without the lock, two concurrent
    // acceptances could both observe member_id IS NULL and both proceed.
    const { rows: locked } = await client.query(
      `SELECT id, member_id, relationship_status
         FROM practitioner_clients
        WHERE id = $1
          FOR UPDATE`,
      [invite.client_id]
    );
    if (locked.length === 0) {
      throw new InvitationError('relationship_missing', 'This invitation no longer refers to a relationship.');
    }
    const rel = locked[0];

    // 4 — verify it is not already linked inconsistently
    let alreadyLinked = false;
    if (rel.member_id) {
      if (rel.member_id !== input.acceptingMemberId) {
        throw new InvitationError(
          'linked_elsewhere',
          'This relationship is already linked to a different member. A linked relationship cannot ' +
            'be re-pointed; the practitioner must issue a new invitation.'
        );
      }
      alreadyLinked = true; // idempotent re-acceptance by the same person
    }

    // 9 — no duplicate relationship: if this member already holds an ACTIVE
    // relationship with this practitioner, activating a second one would violate
    // uniq_practitioner_client_active. Surface it as a claim on the existing one.
    if (!alreadyLinked) {
      const { rows: existing } = await client.query(
        `SELECT existing.id
           FROM practitioner_clients existing
           JOIN practitioner_clients pending ON pending.practitioner_id = existing.practitioner_id
          WHERE pending.id = $1
            AND existing.id <> pending.id
            AND existing.member_id = $2
            AND existing.relationship_status = 'active'`,
        [rel.id, input.acceptingMemberId]
      );
      if (existing.length > 0) {
        throw new InvitationError(
          'duplicate_relationship',
          'You already have an active relationship with this practitioner. The invitation does not ' +
            'need to be claimed again.'
        );
      }
    }

    // 5 + 6 + 7 — link and activate. linked_at is set by the database trigger on
    // the NULL -> value transition; it is set here too so the intent is visible in
    // the query rather than only in a trigger.
    await client.query(
      `UPDATE practitioner_clients
          SET member_id = COALESCE(member_id, $2),
              linked_at = COALESCE(linked_at, NOW()),
              relationship_status = CASE WHEN relationship_status = 'pending'
                                         THEN 'active' ELSE relationship_status END
        WHERE id = $1`,
      [rel.id, input.acceptingMemberId]
    );

    // 7 (cont.) — a pending enrollment created with the invitation becomes real.
    const { rowCount: activatedEnrollments } = await client.query(
      `UPDATE coach_program_enrollments e
          SET status = 'enrolled',
              started_at = COALESCE(e.started_at, NOW())
         FROM coach_client_processes p
        WHERE e.process_id = p.id
          AND p.relationship_id = $1
          AND e.status = 'pending'`,
      [rel.id]
    );

    // 8 — preserve provenance. This is what later makes verified_invitation an
    // admissible linkage basis for reconciliation; without it an invitation proves
    // intent but not identity.
    await client.query(
      `UPDATE client_invites
          SET status = 'claimed',
              claimed_at = COALESCE(claimed_at, NOW()),
              claimed_by_member_id = COALESCE(claimed_by_member_id, $2)
        WHERE id = $1`,
      [invite.id, input.acceptingMemberId]
    );

    return {
      relationshipId: asRelationshipId(rel.id),
      memberId: asMemberId(input.acceptingMemberId),
      activatedEnrollments: activatedEnrollments ?? 0,
      alreadyLinked,
    };
  });
}

/**
 * Create a pending relationship for someone who may not have an account yet.
 *
 * Takes the ACTOR, never a practice id. An earlier draft accepted
 * `practitionerRecordId: string`, which made the caller responsible for supplying an
 * authority-bearing identifier — the exact mistake Invariant 2 exists to prevent, in
 * the module that declares it. No route reached it, but a service contract is part of
 * the architecture: a foundation that says identity must derive from the actor must
 * not expose a service that accepts identity as an argument.
 *
 * The practice is resolved server-side from the credential. A member who holds no
 * practice record cannot create a relationship under anyone's practice.
 *
 * Returns the existing pending row when one already matches — re-inviting the same
 * person to the same thing must find that invitation, not mint a second one. The
 * partial unique index enforces this even if a caller forgets.
 */
export async function createPendingRelationship(input: {
  actorMemberId: MemberId;
  invitationEmail: string;
  displayName: string;
  intendedScope?: string | null;
}): Promise<{ relationshipId: RelationshipId; created: boolean }> {
  const practitionerRecordId = await resolvePractitionerRecordFromMember(input.actorMemberId);
  if (!practitionerRecordId) {
    throw new InvitationError(
      'not_a_practitioner',
      'Only a member who holds a practice record may open a client relationship.'
    );
  }

  return transaction(async (client) => {
    const scope = input.intendedScope ?? null;
    const { rows: found } = await client.query(
      `SELECT id FROM practitioner_clients
        WHERE practitioner_id = $1
          AND normalized_invitation_email = lower(btrim($2))
          AND COALESCE(intended_scope, 'general') = COALESCE($3, 'general')
          AND relationship_status = 'pending'`,
      [practitionerRecordId, input.invitationEmail, scope]
    );
    if (found.length > 0) {
      return { relationshipId: asRelationshipId(found[0].id), created: false };
    }

    // `name` and `email` are legacy NOT NULL columns on this table. They are
    // relationship-scoped intake data, not identity — see the M1 migration comment.
    const { rows } = await client.query(
      `INSERT INTO practitioner_clients
         (practitioner_id, name, email, invitation_email, intended_scope, relationship_status)
       -- $3 fills both the legacy varchar column and the new text one; the casts are
       -- required because Postgres cannot deduce one type for a parameter used twice.
       VALUES ($1, $2, $3::varchar, $3::text, $4, 'pending')
       RETURNING id`,
      [practitionerRecordId, input.displayName, input.invitationEmail, scope]
    );
    return { relationshipId: asRelationshipId(rows[0].id), created: true };
  });
}
