/**
 * Coach Field — the practitioner's projection of a client relationship.
 *
 * This module answers exactly one question:
 *
 *     Given an authenticated practitioner and a relationship, what is that
 *     practitioner allowed to know?
 *
 * WHY THIS IS NOT A "CLIENT RECORD"
 * The platform holds three simultaneous fields, and the mistake every adjacent
 * product category makes is collapsing them into one database — CRMs turn a
 * person into a record, coaching tools turn them into goals, journals turn them
 * into content. The separation is the product:
 *
 *   1. CLIENT SOVEREIGN FIELD   — "what is alive for me"      authority: the client
 *   2. RELATIONSHIP FIELD       — "what we work with together" authority: co-created
 *   3. PRACTITIONER FIELD       — "how do I accompany well"    authority: the practitioner
 *
 * This module projects **field 2 only**. Field 1 is not filtered out of the
 * result — it is never reachable from here at all (see UNREACHABLE below).
 * Field 3 (preparation, observations, professional notes) is a different seam
 * and deliberately not merged in: a practitioner's private thinking is not part
 * of what the relationship holds.
 *
 * The system organizes the relationship without owning the meaning.
 *
 * IDENTITY (Invariant 2)
 * Scope derives from the authenticated actor, server-side. A caller never
 * submits an authoritative `practitioner_id` — that would let the caller assert
 * the very thing being checked. The only translation from member identity to
 * practice identity lives in ./identity.
 */

import { query } from '@/lib/db/postgres';
import {
  authorizePractitionerClientRelationship,
  resolvePractitionerRecordFromMember,
  asRelationshipId,
  type MemberId,
  type RelationshipId,
} from './identity';

/**
 * Tables this projection reads. Every one is RELATIONSHIP FIELD: it exists
 * because a professional relationship exists, not because a person exists.
 */
export const RELATIONSHIP_FIELD_SOURCES = [
  'practitioner_clients',
  'coach_client_processes',
  'coach_program_enrollments',
  'coach_program_definitions',
  'coach_program_stages',
] as const;

/**
 * CLIENT SOVEREIGN FIELD — never reachable from a practitioner projection.
 *
 * There is deliberately no denylist here. Naming the protected tables in order
 * to forbid them would still be naming them, and a module that names a table is
 * one edit away from joining it — which is exactly what the repository's
 * member-owned boundary harness flags, correctly, as a reader.
 *
 * So the boundary is stated where it can be enforced without being touched:
 * the roster lives in `scripts/verify-practitioner-projection.ts`, which fails
 * if this module's source so much as mentions one of those tables. A guard
 * clause can be forgotten at a new call site; a join that was never written
 * cannot be forgotten into existence.
 *
 * The sharpest case is the client's selected focus: it is keyed on the member,
 * carries no `relationship_id`, and therefore has no column by which a
 * relationship-scoped query could reach it. The client's attention is the
 * client's — structurally, not by permission.
 */

/** One piece of work the two of them are explicitly holding together. */
export interface SharedWork {
  processId: string;
  status: string;
  program: { id: string; title: string; description: string | null };
  /** Where the practitioner has placed this process. Null until a stage is set. */
  stage: { id: string; label: string } | null;
}

/**
 * What a practitioner may know about a client relationship.
 *
 * Read this type as the contract. There is no `focus`, no `reflections`, no
 * `notes`, no `atoms` — not set to null, not omitted at serialization time:
 * absent from the shape. A field that does not exist cannot later be "shown
 * because it was already there".
 */
export interface PractitionerClientProjection {
  relationship: {
    id: string;
    status: 'pending' | 'active' | 'paused' | 'ended';
    /** False while an invitation is outstanding — there is no person yet. */
    linked: boolean;
  };
  /** Null while pending: an invited person who has not claimed is not yet a member. */
  client: { memberId: string; displayName: string | null } | null;
  sharedWork: SharedWork[];
}

/**
 * The seam. Returns null — never throws — when the actor has no standing, so a
 * caller cannot distinguish "does not exist" from "not yours" and leak the
 * difference by timing or message.
 */
export async function getPractitionerClientProjection(
  actorMemberId: MemberId,
  relationshipId: RelationshipId
): Promise<PractitionerClientProjection | null> {
  const auth = await authorizePractitionerClientRelationship(actorMemberId, relationshipId);
  if (!auth) return null;

  // This projection is the PRACTITIONER's view. A client reading their own
  // relationship is a different surface with different contents, so refuse here
  // rather than quietly returning a shape built for someone else.
  if (auth.role !== 'practitioner') return null;

  // An ended relationship revokes present access. History is not deleted; it
  // simply stops being reachable through this grant.
  if (auth.status === 'ended') return null;

  const { rows: relRows } = await query<{
    id: string;
    relationship_status: 'pending' | 'active' | 'paused' | 'ended';
    member_id: string | null;
    display_name: string | null;
  }>(
    `SELECT pc.id,
            pc.relationship_status,
            pc.member_id,
            m.name AS display_name
       FROM practitioner_clients pc
       LEFT JOIN members m ON m.id = pc.member_id
      WHERE pc.id = $1`,
    [relationshipId]
  );
  if (relRows.length === 0) return null;
  const rel = relRows[0];

  // Shared work: the programs and stages the practitioner has placed into THIS
  // relationship. Program title/description and stage label are catalogue
  // metadata a practitioner writes about their own offering — the same text that
  // appears on an invitation. They are not about a person.
  const { rows: workRows } = await query<{
    process_id: string;
    status: string;
    program_id: string;
    program_title: string;
    program_description: string | null;
    stage_id: string | null;
    stage_label: string | null;
  }>(
    `SELECT ccp.id            AS process_id,
            ccp.status        AS status,
            cpd.id            AS program_id,
            cpd.title         AS program_title,
            cpd.description   AS program_description,
            cps.id            AS stage_id,
            cps.label         AS stage_label
       FROM coach_client_processes ccp
       JOIN coach_program_definitions cpd ON cpd.id = ccp.program_definition_id
       LEFT JOIN coach_program_enrollments cpe ON cpe.process_id = ccp.id
       LEFT JOIN coach_program_stages cps ON cps.id = cpe.current_stage_id
      WHERE ccp.relationship_id = $1
      ORDER BY ccp.started_at ASC`,
    [relationshipId]
  );

  return {
    relationship: {
      id: rel.id,
      status: rel.relationship_status,
      linked: rel.member_id !== null,
    },
    client: rel.member_id
      ? { memberId: rel.member_id, displayName: rel.display_name }
      : null,
    sharedWork: workRows.map((w) => ({
      processId: w.process_id,
      status: w.status,
      program: {
        id: w.program_id,
        title: w.program_title,
        description: w.program_description,
      },
      stage: w.stage_id && w.stage_label ? { id: w.stage_id, label: w.stage_label } : null,
    })),
  };
}

/**
 * The relationships an authenticated practitioner may reach.
 *
 * Exists so a caller never has to name a `practitioner_id` to find their own
 * caseload — the identity translation happens here, once, behind ./identity.
 * Returns [] for a member who holds no practice record.
 */
export async function listPractitionerRelationships(
  actorMemberId: MemberId
): Promise<Array<{ relationshipId: RelationshipId; status: string; linked: boolean }>> {
  const practitionerRecordId = await resolvePractitionerRecordFromMember(actorMemberId);
  if (!practitionerRecordId) return [];

  const { rows } = await query<{
    id: string;
    relationship_status: string;
    member_id: string | null;
  }>(
    `SELECT id, relationship_status, member_id
       FROM practitioner_clients
      WHERE practitioner_id = $1
        AND relationship_status <> 'ended'
      ORDER BY created_at ASC`,
    [practitionerRecordId]
  );

  return rows.map((r) => ({
    relationshipId: asRelationshipId(r.id),
    status: r.relationship_status,
    linked: r.member_id !== null,
  }));
}
