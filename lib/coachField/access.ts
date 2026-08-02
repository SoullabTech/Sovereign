/**
 * Coach Field — authorization core.
 *
 * Spec: docs/specs/developmental-environment/COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md
 * Rulings applied: Kelly 2026-08-02 (C3 → option ii · D-NW-2 → isolate · bounded history)
 *
 * EVERY read and write in this module family passes through one of the two resolvers
 * below. They are the only place a relationship is turned into permission, so the
 * tenancy boundary has exactly one implementation and cannot drift between callers.
 *
 * Constitutional lines enforced HERE, by construction:
 *
 *   1. No practitioner-keyed read of `field_program_positions` exists in this module
 *      family — not guarded, ABSENT. The C3 narrowing is implemented as a consent +
 *      snapshot record (`coach_position_shares`), never as a widened join. If you are
 *      about to add a query joining field_program_positions to a practitioner, stop:
 *      that is the repealed option (iii), not the ruled option (ii).
 *
 *   2. A terminated enrollment revokes PRESENT access immediately. Authorization reads
 *      `access_revoked_at`, never `status` alone (founder ruling 2026-08-02).
 *
 *   3. `coach_client_personal_notes` has no practitioner-facing resolver at all. The
 *      client's private notes are structurally unreachable from a practitioner session.
 */

import { query } from '@/lib/db/postgres';

export type RelationshipStatus = 'active' | 'paused' | 'completed' | 'former';

export interface RelationshipGrant {
  relationshipId: string;
  practitionerMemberId: string;
  clientMemberId: string;
  fieldSlug: string | null;
  status: RelationshipStatus;
  /** True only while the relationship can be actively worked in. */
  writable: boolean;
}

/**
 * Resolve a relationship FROM THE PRACTITIONER SIDE.
 *
 * `practitionerMemberId` must come from the session credential. There is deliberately
 * no parameter that lets a caller name a different practitioner: the tenancy key is
 * the credential, so a client id supplied by the request can only ever narrow the
 * result, never widen it.
 */
export async function resolveForPractitioner(
  practitionerMemberId: string,
  relationshipId: string,
): Promise<RelationshipGrant | null> {
  const { rows } = await query<any>(
    `SELECT id, practitioner_member_id, client_member_id, field_slug, status
       FROM coach_client_relationships
      WHERE id = $1 AND practitioner_member_id = $2`,
    [relationshipId, practitionerMemberId],
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    relationshipId: r.id,
    practitionerMemberId: r.practitioner_member_id,
    clientMemberId: r.client_member_id,
    fieldSlug: r.field_slug,
    status: r.status,
    writable: r.status === 'active' || r.status === 'paused',
  };
}

/**
 * Resolve a relationship FROM THE CLIENT SIDE.
 *
 * Same shape, opposite tenancy key. A client may read their own side of a relationship
 * regardless of status — a completed engagement's records remain theirs to see — but
 * `writable` still reflects whether the process is live.
 */
export async function resolveForClient(
  clientMemberId: string,
  relationshipId: string,
): Promise<RelationshipGrant | null> {
  const { rows } = await query<any>(
    `SELECT id, practitioner_member_id, client_member_id, field_slug, status
       FROM coach_client_relationships
      WHERE id = $1 AND client_member_id = $2`,
    [relationshipId, clientMemberId],
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    relationshipId: r.id,
    practitionerMemberId: r.practitioner_member_id,
    clientMemberId: r.client_member_id,
    fieldSlug: r.field_slug,
    status: r.status,
    writable: r.status === 'active',
  };
}

/** Every relationship a client holds. The client's own view of who they work with. */
export async function listClientRelationships(clientMemberId: string) {
  const { rows } = await query<any>(
    `SELECT r.id                      AS relationship_id,
            r.practitioner_member_id,
            r.field_slug,
            r.status,
            r.began_on,
            m.name                    AS practitioner_name
       FROM coach_client_relationships r
       JOIN members m ON m.id = r.practitioner_member_id
      WHERE r.client_member_id = $1
      ORDER BY (r.status = 'active') DESC, r.began_on DESC`,
    [clientMemberId],
  );
  return rows;
}

/**
 * Is a process presently accessible to the client?
 *
 * Reads `access_revoked_at`, NOT status — a withdrawn or completed enrollment whose
 * access was revoked must disappear from the client's live surfaces immediately, even
 * if a status column elsewhere still reads 'completed'. Process rows with no enrollment
 * (individual coaching with no named program) are accessible while the process is live.
 */
export async function isProcessAccessibleToClient(
  clientMemberId: string,
  processId: string,
): Promise<boolean> {
  const { rows } = await query<{ ok: boolean }>(
    `SELECT TRUE AS ok
       FROM coach_client_processes p
       JOIN coach_client_relationships r ON r.id = p.relationship_id
       LEFT JOIN coach_program_enrollments e
              ON e.process_id = p.id AND e.access_revoked_at IS NULL
      WHERE p.id = $1
        AND r.client_member_id = $2
        AND p.status <> 'former'
        AND (
          p.program_definition_id IS NULL   -- engagement with no program: no enrollment gate
          OR e.id IS NOT NULL               -- enrolled and not revoked
        )
      LIMIT 1`,
    [processId, clientMemberId],
  );
  return rows.length > 0;
}

/**
 * Guard for practitioner writes. Throws a typed error rather than returning null so a
 * caller cannot forget to check.
 */
export class CoachFieldAccessError extends Error {
  readonly status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = 'CoachFieldAccessError';
    this.status = status;
  }
}

export async function requirePractitionerWrite(
  practitionerMemberId: string,
  relationshipId: string,
): Promise<RelationshipGrant> {
  const grant = await resolveForPractitioner(practitionerMemberId, relationshipId);
  if (!grant) throw new CoachFieldAccessError('No such client relationship.', 404);
  if (!grant.writable) {
    throw new CoachFieldAccessError('This relationship is closed and cannot be edited.', 409);
  }
  return grant;
}
