/**
 * Coach Field — practitioner identity translation.
 *
 * ─── THE NAMED SERVICE INVARIANT (founder ruling, 2026-08-02) ───────────────
 *
 *     A column named `practitioner_id` cannot be interpreted without its table
 *     contract.
 *
 * This is not a style preference. The live schema proves it:
 *
 *     practitioner_clients.practitioner_id       -> practitioners(id)
 *     practitioner_client_notes.practitioner_id  -> practitioners(id)
 *     client_invites.practitioner_id             -> MEMBERS(id)
 *     practitioner_sessions.practitioner_id      -> MEMBERS(id)
 *
 * Four tables, one column name, two different referents. Any code that compares
 * `a.practitioner_id = b.practitioner_id` across those tables is comparing a
 * practice record to a person and will silently authorize the wrong human.
 *
 * So the translation lives here, once, in typed functions. No route improvises it.
 * The branded types below make the two ids non-interchangeable at compile time:
 * passing a PractitionerRecordId where a MemberId is expected will not typecheck.
 */

import { query } from '@/lib/db/postgres';

/** A row in `practitioners` — the practice record. NOT a person. */
export type PractitionerRecordId = string & { readonly __brand: 'PractitionerRecordId' };
/** A row in `members` — the authenticated person. */
export type MemberId = string & { readonly __brand: 'MemberId' };
/** A row in `practitioner_clients` — the bounded professional relationship. */
export type RelationshipId = string & { readonly __brand: 'RelationshipId' };

export const asMemberId = (id: string) => id as MemberId;
export const asPractitionerRecordId = (id: string) => id as PractitionerRecordId;
export const asRelationshipId = (id: string) => id as RelationshipId;

export class IdentityTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdentityTranslationError';
  }
}

/**
 * members.id -> practitioners.id
 *
 * Returns null when this member holds no practice record. That is an ordinary
 * answer, not an error: most members are not practitioners.
 */
export async function resolvePractitionerRecordFromMember(
  memberId: MemberId
): Promise<PractitionerRecordId | null> {
  const { rows } = await query<{ id: string }>(
    `SELECT id FROM practitioners WHERE member_id = $1`,
    [memberId]
  );
  if (rows.length === 0) return null;
  if (rows.length > 1) {
    // One person holding several practice records is a real possibility we have
    // not modelled. Refuse rather than silently pick the first: picking would
    // decide which practice a request acts on, by accident of row order.
    throw new IdentityTranslationError(
      `Member ${memberId} holds ${rows.length} practitioner records. Practice selection is not ` +
        `modelled; refusing to choose one arbitrarily.`
    );
  }
  return rows[0].id as PractitionerRecordId;
}

/**
 * practitioners.id -> members.id
 *
 * Returns null when the practice record has no member behind it — which happens
 * for practices created before accounts existed. Callers must treat null as
 * "cannot act as this practitioner", never as "any member will do".
 */
export async function resolvePractitionerMemberFromRecord(
  practitionerRecordId: PractitionerRecordId
): Promise<MemberId | null> {
  const { rows } = await query<{ member_id: string | null }>(
    `SELECT member_id FROM practitioners WHERE id = $1`,
    [practitionerRecordId]
  );
  if (rows.length === 0) {
    throw new IdentityTranslationError(`No practitioner record ${practitionerRecordId}`);
  }
  return (rows[0].member_id as MemberId | null) ?? null;
}

export type RelationshipRole = 'practitioner' | 'client';

export interface RelationshipAuthorization {
  relationshipId: RelationshipId;
  role: RelationshipRole;
  /** practitioners.id — the practice on the other end of this relationship. */
  practitionerRecordId: PractitionerRecordId;
  /** members.id — null while the relationship is still pending. */
  clientMemberId: MemberId | null;
  status: 'pending' | 'active' | 'paused' | 'ended';
  /** May write practice records into this relationship. */
  canWrite: boolean;
  /** May read records the member owns and has shared. Never true while pending. */
  canReadMemberShared: boolean;
}

/**
 * The single authorization entry point for anything scoped to one relationship.
 *
 * `actorMemberId` MUST come from the session credential. There is deliberately no
 * parameter naming a practitioner or a client: the credential is the tenancy key,
 * so a request-supplied relationship id can only narrow the result, never widen it.
 *
 * Returns null — never throws — when the actor has no standing in this
 * relationship, so callers cannot accidentally distinguish "does not exist" from
 * "not yours" and leak the difference.
 */
export async function authorizePractitionerClientRelationship(
  actorMemberId: MemberId,
  relationshipId: RelationshipId
): Promise<RelationshipAuthorization | null> {
  const { rows } = await query<{
    id: string;
    practitioner_id: string;
    member_id: string | null;
    relationship_status: 'pending' | 'active' | 'paused' | 'ended';
    practitioner_member_id: string | null;
  }>(
    `SELECT pc.id,
            pc.practitioner_id,
            pc.member_id,
            pc.relationship_status,
            p.member_id AS practitioner_member_id
       FROM practitioner_clients pc
       JOIN practitioners p ON p.id = pc.practitioner_id
      WHERE pc.id = $1`,
    [relationshipId]
  );
  if (rows.length === 0) return null;
  const r = rows[0];

  // The join above is the whole point of this module: pc.practitioner_id is a
  // PRACTICE record, and only p.member_id turns it into a person we can compare
  // against a session credential.
  let role: RelationshipRole;
  if (r.practitioner_member_id && r.practitioner_member_id === actorMemberId) {
    role = 'practitioner';
  } else if (r.member_id && r.member_id === actorMemberId) {
    role = 'client';
  } else {
    return null;
  }

  // Ending a relationship revokes PRESENT access immediately. Historical practice
  // records are not deleted; they simply stop being reachable through this grant.
  const live = r.relationship_status === 'active' || r.relationship_status === 'paused';

  return {
    relationshipId: r.id as RelationshipId,
    role,
    practitionerRecordId: r.practitioner_id as PractitionerRecordId,
    clientMemberId: (r.member_id as MemberId | null) ?? null,
    status: r.relationship_status,
    // A paused relationship is readable but not writable: work is suspended, not erased.
    canWrite: r.relationship_status === 'active',
    // A pending relationship has no identified member, so there is nothing of
    // theirs to read. This is what stops an invitation from being a peephole.
    canReadMemberShared: live && r.member_id !== null,
  };
}
