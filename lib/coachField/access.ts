/**
 * Coach Field — authorization core.
 *
 * Spec: docs/specs/developmental-environment/COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md
 * Rulings applied: Kelly 2026-08-02 (C3 → option ii · D-NW-2 → isolate · bounded history
 *                  · `practitioner_clients.id` is THE canonical relationship key)
 *
 * THE CANONICAL RELATIONSHIP IS `practitioner_clients.id`. There is no second relationship
 * identity anywhere in the coach field. Every process record hangs off that key.
 *
 * The identity chain, verified against the RUNNING database rather than the repo (three
 * competing DDLs make the repo unreliable about this table's shape):
 *
 *   practitioner side:  members.id ← practitioners.member_id
 *                       practitioners.id ← practitioner_clients.practitioner_id
 *   client side:        members.id ← practitioner_clients.member_id   (NULLABLE)
 *
 * `member_id` being nullable is load-bearing, not an oversight: a relationship invited but
 * not yet claimed is a REAL relationship with a real history. Larry can work it — write
 * notes, plan a program, schedule a first session — before the client ever creates an
 * account. Only the CLIENT-side resolvers require a member link, because only they need one.
 *
 * EVERY read and write in this module family passes through a resolver below, so the
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

/** The legacy status vocabulary, adopted as-is. Additive normalization adds no values. */
export type RelationshipStatus = 'invited' | 'active' | 'paused' | 'completed' | 'archived';

/** Statuses in which the relationship may still be actively worked. */
const WORKABLE: RelationshipStatus[] = ['invited', 'active', 'paused'];

export interface RelationshipGrant {
  /** practitioner_clients.id — THE canonical relationship key. */
  relationshipId: string;
  /** practitioners.id (NOT a member id). */
  practitionerId: string;
  /** The practitioner's member id, or null if the practitioner row has no member link. */
  practitionerMemberId: string | null;
  /** The client's member id, or null while the relationship is invited-but-unclaimed. */
  clientMemberId: string | null;
  fieldSlug: string | null;
  status: RelationshipStatus;
  writable: boolean;
  /** True when the client has not yet claimed the relationship (pre-account). */
  pending: boolean;
}

const GRANT_FROM = `
    FROM practitioner_clients pc
    JOIN practitioners p ON p.id = pc.practitioner_id
`;

const GRANT_COLS = `
         pc.id                AS relationship_id,
         pc.practitioner_id,
         p.member_id          AS practitioner_member_id,
         pc.member_id         AS client_member_id,
         pc.field_slug,
         pc.status
`;

function toGrant(r: any): RelationshipGrant {
  return {
    relationshipId: r.relationship_id,
    practitionerId: r.practitioner_id,
    practitionerMemberId: r.practitioner_member_id,
    clientMemberId: r.client_member_id,
    fieldSlug: r.field_slug,
    status: r.status,
    writable: WORKABLE.includes(r.status),
    pending: r.client_member_id === null,
  };
}

/**
 * Resolve a relationship FROM THE PRACTITIONER SIDE.
 *
 * `practitionerMemberId` must come from the session credential. There is deliberately no
 * parameter that lets a caller name a different practitioner: the tenancy key is the
 * credential, joined through `practitioners.member_id`, so a relationship id supplied by
 * the request can only ever narrow the result, never widen it.
 */
export async function resolveForPractitioner(
  practitionerMemberId: string,
  relationshipId: string,
): Promise<RelationshipGrant | null> {
  const { rows } = await query<any>(
    `SELECT ${GRANT_COLS} ${GRANT_FROM} WHERE pc.id = $1 AND p.member_id = $2`,
    [relationshipId, practitionerMemberId],
  );
  return rows.length ? toGrant(rows[0]) : null;
}

/**
 * Resolve a relationship FROM THE CLIENT SIDE.
 *
 * Requires a claimed relationship: an unclaimed row has no client member to authorize.
 * A client may read their own side regardless of status — a completed engagement's records
 * remain theirs to see — but `writable` still reflects whether the process is live.
 */
export async function resolveForClient(
  clientMemberId: string,
  relationshipId: string,
): Promise<RelationshipGrant | null> {
  const { rows } = await query<any>(
    `SELECT ${GRANT_COLS} ${GRANT_FROM} WHERE pc.id = $1 AND pc.member_id = $2`,
    [relationshipId, clientMemberId],
  );
  if (!rows.length) return null;
  const grant = toGrant(rows[0]);
  return { ...grant, writable: grant.status === 'active' };
}

/** Every relationship a client holds — their own view of who they work with. */
export async function listClientRelationships(
  clientMemberId: string,
): Promise<Array<RelationshipGrant & { practitionerName: string | null }>> {
  const { rows } = await query<any>(
    `SELECT ${GRANT_COLS}, pm.name AS practitioner_name
       ${GRANT_FROM}
       LEFT JOIN members pm ON pm.id = p.member_id
      WHERE pc.member_id = $1
      ORDER BY (pc.status = 'active') DESC, pc.created_at DESC`,
    [clientMemberId],
  );
  return rows.map((r) => ({ ...toGrant(r), practitionerName: r.practitioner_name ?? null }));
}

/**
 * Larry's caseload keys. Ordering puts live work first; it does NOT rank clients by
 * urgency, engagement, or any inferred property (founder ruling: no algorithmic ranking).
 */
export async function listPractitionerRelationships(
  practitionerMemberId: string,
): Promise<Array<RelationshipGrant & { clientLabel: string }>> {
  const { rows } = await query<any>(
    `SELECT ${GRANT_COLS}, pc.name AS client_label, pc.preferred_name
       ${GRANT_FROM}
      WHERE p.member_id = $1 AND pc.status <> 'archived'
      ORDER BY (pc.status = 'active') DESC, pc.name ASC`,
    [practitionerMemberId],
  );
  return rows.map((r) => ({
    ...toGrant(r),
    clientLabel: (r.preferred_name || r.client_label) as string,
  }));
}

/**
 * Is a process presently accessible to the client?
 *
 * Reads `access_revoked_at`, NOT status — a withdrawn or completed enrollment whose access
 * was revoked must disappear from the client's live surfaces immediately, even if a status
 * column elsewhere still reads 'completed'. Processes with no enrollment (individual
 * coaching, no named program) are accessible while the process is live.
 */
export async function isProcessAccessibleToClient(
  clientMemberId: string,
  processId: string,
): Promise<boolean> {
  const { rows } = await query<{ ok: boolean }>(
    `SELECT TRUE AS ok
       FROM coach_client_processes cp
       JOIN practitioner_clients pc ON pc.id = cp.relationship_id
       LEFT JOIN coach_program_enrollments e
              ON e.process_id = cp.id AND e.access_revoked_at IS NULL
      WHERE cp.id = $1
        AND pc.member_id = $2
        AND cp.status <> 'former'
        AND (cp.program_definition_id IS NULL OR e.id IS NOT NULL)
      LIMIT 1`,
    [processId, clientMemberId],
  );
  return rows.length > 0;
}

export class CoachFieldAccessError extends Error {
  readonly status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = 'CoachFieldAccessError';
    this.status = status;
  }
}

/** Guard for practitioner writes. Throws rather than returning null so it cannot be skipped. */
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
