import { query } from '@/lib/db/postgres';
import type { ManuscriptLocusScope } from './relationshipCustody';

export type RelationshipCarriageRefusal =
  | 'relationship_not_found'
  | 'relationship_mismatch'
  | 'current_declaration_unavailable'
  | 'editorial_child_invalid'
  | 'editorial_scope_unmeasured';

export type RelationshipPreflight =
  | { readonly ok: true; readonly relationshipId: string; readonly manuscriptId: string }
  | { readonly ok: false; readonly reason: RelationshipCarriageRefusal };

export type EditorialRelationshipPreflight =
  | {
      readonly ok: true;
      readonly relationshipId: string;
      readonly manuscriptId: string;
      readonly proposalChainId: string;
      readonly manuscriptLocusScope: ManuscriptLocusScope;
    }
  | { readonly ok: false; readonly reason: RelationshipCarriageRefusal };

interface RelationshipRow {
  id: string;
  member_id: string;
  living_work_id: string;
  manuscript_id: string;
}

async function ownedRelationship(
  memberId: string, relationshipId: string,
): Promise<RelationshipRow | null> {
  const r = await query<RelationshipRow>(
    `SELECT id, member_id, living_work_id, manuscript_id
       FROM writer_editorial_relationships
      WHERE id = $1 AND member_id = $2`,
    [relationshipId, memberId],
  );
  return r.rows[0] ?? null;
}

async function hasCurrentDeclaration(r: RelationshipRow): Promise<boolean> {
  const d = await query(
    `SELECT id FROM living_work_expressions
      WHERE living_work_id = $1
        AND expression_type = 'manuscript'
        AND expression_id = $2
        AND declared_by = $3`,
    [r.living_work_id, r.manuscript_id, r.member_id],
  );
  return d.rows.length === 1;
}

export async function preflightRelationshipForManuscript(input: {
  memberId: string;
  relationshipId: string;
  manuscriptId: string;
}): Promise<RelationshipPreflight> {
  const r = await ownedRelationship(input.memberId, input.relationshipId);
  if (!r) return { ok: false, reason: 'relationship_not_found' };
  if (r.manuscript_id !== input.manuscriptId) {
    return { ok: false, reason: 'relationship_mismatch' };
  }
  if (!(await hasCurrentDeclaration(r))) {
    return { ok: false, reason: 'current_declaration_unavailable' };
  }
  return { ok: true, relationshipId: r.id, manuscriptId: r.manuscript_id };
}

export async function preflightEditorialRelationshipCarriage(input: {
  memberId: string;
  relationshipId: string;
  threadId: string;
}): Promise<EditorialRelationshipPreflight> {
  const r = await ownedRelationship(input.memberId, input.relationshipId);
  if (!r) return { ok: false, reason: 'relationship_not_found' };
  if (!(await hasCurrentDeclaration(r))) {
    return { ok: false, reason: 'current_declaration_unavailable' };
  }
  const child = await query<{
    manuscript_id: string;
    proposal_chain_id: string | null;
    locus_scope_kind: ManuscriptLocusScope | null;
  }>(
    `SELECT th.manuscript_id, th.proposal_chain_id, pc.locus_scope_kind
       FROM ask_threads th
       LEFT JOIN proposal_chains pc ON pc.id = th.proposal_chain_id
      WHERE th.id = $1 AND th.member_id = $2`,
    [input.threadId, input.memberId],
  );
  if (child.rows.length !== 1) return { ok: false, reason: 'editorial_child_invalid' };
  const c = child.rows[0]!;
  if (c.manuscript_id !== r.manuscript_id || c.proposal_chain_id === null) {
    return { ok: false, reason: 'relationship_mismatch' };
  }
  if (c.locus_scope_kind === null) {
    return { ok: false, reason: 'editorial_scope_unmeasured' };
  }
  return {
    ok: true,
    relationshipId: r.id,
    manuscriptId: r.manuscript_id,
    proposalChainId: c.proposal_chain_id,
    manuscriptLocusScope: c.locus_scope_kind,
  };
}

