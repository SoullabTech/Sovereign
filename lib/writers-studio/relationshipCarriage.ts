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

export type PriorMaiaEditorialCarryRefusal =
  | 'relationship_not_found'
  | 'current_declaration_unavailable'
  | 'receiver_thread_invalid'
  | 'receiver_scope_unmeasured'
  | 'source_episode_not_found'
  | 'source_kind_not_editorial'
  | 'source_thread_invalid'
  | 'source_turn_not_found'
  | 'source_turn_not_maia'
  | 'source_unavailable'
  | 'same_thread_source'
  | 'scope_widening_forbidden';

export interface ResolvedPriorMaiaEditorialCarry {
  readonly kind: 'PRIOR_MAIA_EDITORIAL_TURN';
  readonly relationshipId: string;
  readonly sourceEpisodeSequence: number;
  readonly sourceThreadId: string;
  readonly sourceMaiaTurnIndex: number;
  readonly sourceBody: string;
  readonly sourceTemporal: 'CURRENT_FROZEN_LOCUS';
  readonly sourceScope: ManuscriptLocusScope;
  readonly receiverThreadId: string;
  readonly receiverScope: ManuscriptLocusScope;
  readonly producerId: 'system.writer_relationship_prior_editorial_turn';
}

export type PriorMaiaEditorialCarryResult =
  | { readonly ok: true; readonly carry: ResolvedPriorMaiaEditorialCarry }
  | { readonly ok: false; readonly reason: PriorMaiaEditorialCarryRefusal };

/**
 * A2-11 — resolve one explicitly selected earlier MAIA Editorial turn.
 * The client names only relationship + episode sequence + current receiver thread.
 * Every source fact is re-derived from durable custody and the authoritative
 * ask_turns store before the member's current act is persisted.
 */
export async function resolvePriorMaiaEditorialCarry(input: {
  memberId: string;
  relationshipId: string;
  receiverThreadId: string;
  sourceEpisodeSequence: number;
}): Promise<PriorMaiaEditorialCarryResult> {
  const relationship = await ownedRelationship(input.memberId, input.relationshipId);
  if (!relationship) return { ok: false, reason: 'relationship_not_found' };
  if (!(await hasCurrentDeclaration(relationship))) {
    return { ok: false, reason: 'current_declaration_unavailable' };
  }

  const receiver = await query<{
    manuscript_id: string;
    proposal_chain_id: string | null;
    locus_scope_kind: ManuscriptLocusScope | null;
  }>(
    `SELECT th.manuscript_id, th.proposal_chain_id, pc.locus_scope_kind
       FROM ask_threads th
       LEFT JOIN proposal_chains pc ON pc.id = th.proposal_chain_id
      WHERE th.id = $1 AND th.member_id = $2`,
    [input.receiverThreadId, input.memberId],
  );
  if (receiver.rows.length !== 1) return { ok: false, reason: 'receiver_thread_invalid' };
  const current = receiver.rows[0]!;
  if (current.manuscript_id !== relationship.manuscript_id || current.proposal_chain_id === null) {
    return { ok: false, reason: 'receiver_thread_invalid' };
  }
  if (current.locus_scope_kind === null) {
    return { ok: false, reason: 'receiver_scope_unmeasured' };
  }

  const episode = await query<{
    child_kind: string;
    manuscript_scope_requested: ManuscriptLocusScope | null;
    manuscript_scope_executed: ManuscriptLocusScope | null;
    temporal_posture: string;
    editorial_thread_id: string | null;
    editorial_maia_turn_index: number | null;
  }>(
    `SELECT child_kind, manuscript_scope_requested, manuscript_scope_executed,
            temporal_posture, editorial_thread_id, editorial_maia_turn_index
       FROM writer_editorial_relationship_episodes
      WHERE relationship_id = $1 AND sequence = $2`,
    [input.relationshipId, input.sourceEpisodeSequence],
  );
  if (episode.rows.length !== 1) return { ok: false, reason: 'source_episode_not_found' };
  const source = episode.rows[0]!;
  if (source.child_kind !== 'EDITORIAL_TURN') return { ok: false, reason: 'source_kind_not_editorial' };
  if (
    source.temporal_posture !== 'CURRENT_FROZEN_LOCUS'
    || source.manuscript_scope_requested === null
    || source.manuscript_scope_executed === null
    || source.manuscript_scope_requested !== source.manuscript_scope_executed
    || source.editorial_thread_id === null
    || source.editorial_maia_turn_index === null
  ) return { ok: false, reason: 'source_kind_not_editorial' };
  if (source.editorial_thread_id === input.receiverThreadId) {
    return { ok: false, reason: 'same_thread_source' };
  }

  const sourceThread = await query<{ manuscript_id: string; proposal_chain_id: string | null }>(
    `SELECT manuscript_id, proposal_chain_id FROM ask_threads
      WHERE id = $1 AND member_id = $2`,
    [source.editorial_thread_id, input.memberId],
  );
  if (
    sourceThread.rows.length !== 1
    || sourceThread.rows[0]!.manuscript_id !== relationship.manuscript_id
    || sourceThread.rows[0]!.proposal_chain_id === null
  ) return { ok: false, reason: 'source_thread_invalid' };

  const sourceTurn = await query<{ speaker: string; body: string | null }>(
    `SELECT speaker, body FROM ask_turns
      WHERE thread_id = $1 AND turn_index = $2`,
    [source.editorial_thread_id, source.editorial_maia_turn_index],
  );
  if (sourceTurn.rows.length !== 1) return { ok: false, reason: 'source_turn_not_found' };
  if (sourceTurn.rows[0]!.speaker !== 'maia') return { ok: false, reason: 'source_turn_not_maia' };
  const body = sourceTurn.rows[0]!.body;
  if (typeof body !== 'string') return { ok: false, reason: 'source_unavailable' };

  const sourceScope = source.manuscript_scope_requested;
  const receiverScope = current.locus_scope_kind;
  if (sourceScope === 'passage' && receiverScope === 'section') {
    return { ok: false, reason: 'scope_widening_forbidden' };
  }

  return {
    ok: true,
    carry: {
      kind: 'PRIOR_MAIA_EDITORIAL_TURN',
      relationshipId: relationship.id,
      sourceEpisodeSequence: input.sourceEpisodeSequence,
      sourceThreadId: source.editorial_thread_id,
      sourceMaiaTurnIndex: Number(source.editorial_maia_turn_index),
      sourceBody: body,
      sourceTemporal: 'CURRENT_FROZEN_LOCUS',
      sourceScope,
      receiverThreadId: input.receiverThreadId,
      receiverScope,
      producerId: 'system.writer_relationship_prior_editorial_turn',
    },
  };
}

