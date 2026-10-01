/**
 * WRITERS-STUDIO-NEXT-01 / A2-4 — durable relationship custody.
 *
 * This is content-free relational custody. It stores no manuscript prose and no
 * child answer/finding/proposal text. The parent grants no cognition, disclosure,
 * memory, place, proposal, adoption, or Work-mutation authority.
 *
 * V1 child kinds: EDITORIAL_TURN and REVIEW_DISCUSS only. Focus is deliberately
 * excluded until its Work/manuscript identity and durable completion law close.
 */
import { query, transaction, type TransactionClient } from '@/lib/db/postgres';

export const A2_RELATIONSHIP_CONTRACT_VERSION = 'A2-1' as const;
export type ManuscriptLocusScope = 'passage' | 'section';
export type RelationshipChildKind = 'EDITORIAL_TURN' | 'REVIEW_DISCUSS';

export type RelationshipCustodyRefusal =
  | 'work_not_owned'
  | 'manuscript_not_owned'
  | 'current_declaration_unavailable'
  | 'relationship_not_found'
  | 'relationship_binding_changed'
  | 'editorial_child_invalid'
  | 'review_child_invalid'
  | 'child_already_attached_elsewhere'
  | 'sequence_conflict';

export class RelationshipCustodyRefused extends Error {
  constructor(readonly reason: RelationshipCustodyRefusal) {
    super(reason);
    this.name = 'RelationshipCustodyRefused';
  }
}

export interface EditorialRelationshipCustody {
  readonly id: string;
  readonly memberId: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly creationExpressionId: string;
  readonly contractVersion: typeof A2_RELATIONSHIP_CONTRACT_VERSION;
  readonly createdAt: Date;
}
export type EditorialRelationshipEpisode =
  | {
      readonly id: string;
      readonly sequence: number;
      readonly childKind: 'EDITORIAL_TURN';
      readonly manuscriptLocusScope: ManuscriptLocusScope;
      readonly temporalPosture: 'CURRENT_FROZEN_LOCUS';
      readonly historyPolicy: 'CHILD_LOCAL_MULTI_TURN';
      readonly continuationAuthorized: true;
      readonly authorityClass: 'EDITORIAL_CHAIN';
      readonly carryPolicy: 'PRESENTATION_ONLY';
      readonly admittedAt: Date;
      readonly threadId: string;
      readonly proposalChainId: string;
      readonly memberTurnIndex: number;
      readonly maiaTurnIndex: number;
    }
  | {
      readonly id: string;
      readonly sequence: number;
      readonly childKind: 'REVIEW_DISCUSS';
      readonly temporalPosture: 'AS_READ';
      readonly historyPolicy: 'NONE';
      readonly continuationAuthorized: false;
      readonly authorityClass: 'R2_DISCLOSURE';
      readonly carryPolicy: 'PRESENTATION_ONLY';
      readonly admittedAt: Date;
      readonly threadId: string;
      readonly maiaTurnIndex: number;
      readonly authorizationId: string;
      readonly readingId: string;
      readonly observationKey: string;
    };

export interface RelationshipWithEpisodes {
  readonly relationship: EditorialRelationshipCustody;
  readonly episodes: readonly EditorialRelationshipEpisode[];
}

interface RelationshipRow {
  id: string;
  member_id: string;
  living_work_id: string;
  manuscript_id: string;
  creation_expression_id: string;
  contract_version: typeof A2_RELATIONSHIP_CONTRACT_VERSION;
  created_at: Date;
}
interface EpisodeRow {
  id: string;
  sequence: number;
  child_kind: RelationshipChildKind;
  manuscript_scope_requested: ManuscriptLocusScope | null;
  manuscript_scope_executed: ManuscriptLocusScope | null;
  temporal_posture: string;
  history_policy: string;
  continuation_authorized: boolean;
  authority_class: string;
  carry_policy: 'PRESENTATION_ONLY';
  admitted_at: Date;
  editorial_thread_id: string | null;
  editorial_proposal_chain_id: string | null;
  editorial_member_turn_index: number | null;
  editorial_maia_turn_index: number | null;
  review_thread_id: string | null;
  review_maia_turn_index: number | null;
  review_authorization_id: string | null;
  review_reading_id: string | null;
  review_observation_key: string | null;
}

export interface PreparedRelationshipAppend {
  readonly relationshipId: string;
  readonly memberId: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
}

function mapRelationship(r: RelationshipRow): EditorialRelationshipCustody {
  return {
    id: r.id,
    memberId: r.member_id,
    livingWorkId: r.living_work_id,
    manuscriptId: r.manuscript_id,
    creationExpressionId: r.creation_expression_id,
    contractVersion: r.contract_version,
    createdAt: r.created_at,
  };
}

function mapEpisode(r: EpisodeRow): EditorialRelationshipEpisode {
  if (r.child_kind === 'EDITORIAL_TURN') {
    return {
      id: r.id, sequence: Number(r.sequence), childKind: 'EDITORIAL_TURN',
      manuscriptLocusScope: r.manuscript_scope_requested!, temporalPosture: 'CURRENT_FROZEN_LOCUS',
      historyPolicy: 'CHILD_LOCAL_MULTI_TURN', continuationAuthorized: true,
      authorityClass: 'EDITORIAL_CHAIN', carryPolicy: 'PRESENTATION_ONLY',
      admittedAt: r.admitted_at,
      threadId: r.editorial_thread_id!, proposalChainId: r.editorial_proposal_chain_id!,
      memberTurnIndex: Number(r.editorial_member_turn_index),
      maiaTurnIndex: Number(r.editorial_maia_turn_index),
    };
  }
  return {
    id: r.id, sequence: Number(r.sequence), childKind: 'REVIEW_DISCUSS',
    temporalPosture: 'AS_READ',
    historyPolicy: 'NONE', continuationAuthorized: false,
    authorityClass: 'R2_DISCLOSURE', carryPolicy: 'PRESENTATION_ONLY',
    admittedAt: r.admitted_at,
    threadId: r.review_thread_id!, maiaTurnIndex: Number(r.review_maia_turn_index),
    authorizationId: r.review_authorization_id!, readingId: r.review_reading_id!,
    observationKey: r.review_observation_key!,
  };
}
export async function createEditorialRelationshipCustody(input: {
  memberId: string;
  livingWorkId: string;
  manuscriptId: string;
}): Promise<
  | { readonly ok: true; readonly relationship: EditorialRelationshipCustody }
  | { readonly ok: false; readonly reason: RelationshipCustodyRefusal }
> {
  try {
    return await transaction(async (tx) => {
      const work = await tx.query<{ id: string }>(
        `SELECT id FROM living_works
          WHERE id = $1 AND member_id = $2
          FOR KEY SHARE`,
        [input.livingWorkId, input.memberId],
      );
      if (work.rows.length !== 1) throw new RelationshipCustodyRefused('work_not_owned');

      const manuscript = await tx.query<{ id: string }>(
        `SELECT id FROM member_manuscripts
          WHERE id = $1 AND member_id = $2
          FOR KEY SHARE`,
        [input.manuscriptId, input.memberId],
      );
      if (manuscript.rows.length !== 1) throw new RelationshipCustodyRefused('manuscript_not_owned');

      const declaration = await tx.query<{ id: string }>(
        `SELECT id FROM living_work_expressions
          WHERE living_work_id = $1
            AND expression_type = 'manuscript'
            AND expression_id = $2
            AND declared_by = $3
          FOR KEY SHARE`,
        [input.livingWorkId, input.manuscriptId, input.memberId],
      );
      if (declaration.rows.length !== 1) {
        throw new RelationshipCustodyRefused('current_declaration_unavailable');
      }

      const created = await tx.query<RelationshipRow>(
        `INSERT INTO writer_editorial_relationships
           (member_id, living_work_id, manuscript_id, creation_expression_id, contract_version)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, member_id, living_work_id, manuscript_id,
                   creation_expression_id, contract_version, created_at`,
        [input.memberId, input.livingWorkId, input.manuscriptId,
         declaration.rows[0]!.id, A2_RELATIONSHIP_CONTRACT_VERSION],
      );
      return { ok: true as const, relationship: mapRelationship(created.rows[0]!) };
    });
  } catch (error) {
    if (error instanceof RelationshipCustodyRefused) {
      return { ok: false, reason: error.reason };
    }
    throw error;
  }
}
export interface EditorialRelationshipSummary {
  readonly id: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly createdAt: Date;
  readonly episodeCount: number;
}

export async function listEditorialRelationshipCustody(input: {
  memberId: string;
  livingWorkId: string;
  manuscriptId: string;
}): Promise<readonly EditorialRelationshipSummary[]> {
  const rows = await query<{
    id: string;
    living_work_id: string;
    manuscript_id: string;
    created_at: Date;
    episode_count: string | number;
  }>(
    `SELECT r.id, r.living_work_id, r.manuscript_id, r.created_at,
            count(e.id)::text AS episode_count
       FROM writer_editorial_relationships r
       LEFT JOIN writer_editorial_relationship_episodes e
         ON e.relationship_id = r.id
      WHERE r.member_id = $1
        AND r.living_work_id = $2
        AND r.manuscript_id = $3
      GROUP BY r.id, r.living_work_id, r.manuscript_id, r.created_at
      ORDER BY r.created_at ASC, r.id ASC`,
    [input.memberId, input.livingWorkId, input.manuscriptId],
  );
  return rows.rows.map((r) => ({
    id: r.id,
    livingWorkId: r.living_work_id,
    manuscriptId: r.manuscript_id,
    createdAt: r.created_at,
    episodeCount: Number(r.episode_count),
  }));
}

export async function readEditorialRelationshipCustody(
  memberId: string,
  relationshipId: string,
): Promise<RelationshipWithEpisodes | null> {
  const rel = await query<RelationshipRow>(
    `SELECT id, member_id, living_work_id, manuscript_id,
            creation_expression_id, contract_version, created_at
       FROM writer_editorial_relationships
      WHERE id = $1 AND member_id = $2`,
    [relationshipId, memberId],
  );
  if (rel.rows.length === 0) return null;

  const episodes = await query<EpisodeRow>(
    `SELECT *
       FROM writer_editorial_relationship_episodes
      WHERE relationship_id = $1
      ORDER BY sequence ASC`,
    [relationshipId],
  );
  return {
    relationship: mapRelationship(rel.rows[0]!),
    episodes: episodes.rows.map(mapEpisode),
  };
}

/**
 * Lock the A2 relationship in the only order a future child-completion
 * transaction may use: Work → manuscript → current declaration → parent.
 *
 * Call this BEFORE writing the child completion. The returned token is a
 * transaction-local proof of the locked binding; it carries no authority
 * outside the caller-supplied transaction.
 */
export async function prepareRelationshipForAppendWithClient(
  tx: TransactionClient,
  input: { memberId: string; relationshipId: string },
): Promise<PreparedRelationshipAppend> {
  const initial = await tx.query<RelationshipRow>(
    `SELECT id, member_id, living_work_id, manuscript_id,
            creation_expression_id, contract_version, created_at
       FROM writer_editorial_relationships
      WHERE id = $1 AND member_id = $2`,
    [input.relationshipId, input.memberId],
  );
  if (initial.rows.length !== 1) throw new RelationshipCustodyRefused('relationship_not_found');
  const r = initial.rows[0]!;
  const work = await tx.query(
    `SELECT id FROM living_works
      WHERE id = $1 AND member_id = $2
      FOR KEY SHARE`,
    [r.living_work_id, input.memberId],
  );
  if (work.rows.length !== 1) throw new RelationshipCustodyRefused('work_not_owned');

  const manuscript = await tx.query(
    `SELECT id FROM member_manuscripts
      WHERE id = $1 AND member_id = $2
      FOR KEY SHARE`,
    [r.manuscript_id, input.memberId],
  );
  if (manuscript.rows.length !== 1) throw new RelationshipCustodyRefused('manuscript_not_owned');

  const declaration = await tx.query(
    `SELECT id FROM living_work_expressions
      WHERE living_work_id = $1
        AND expression_type = 'manuscript'
        AND expression_id = $2
        AND declared_by = $3
      FOR KEY SHARE`,
    [r.living_work_id, r.manuscript_id, input.memberId],
  );
  if (declaration.rows.length !== 1) {
    throw new RelationshipCustodyRefused('current_declaration_unavailable');
  }

  const locked = await tx.query<RelationshipRow>(
    `SELECT id, member_id, living_work_id, manuscript_id,
            creation_expression_id, contract_version, created_at
       FROM writer_editorial_relationships
      WHERE id = $1 AND member_id = $2
      FOR UPDATE`,
    [input.relationshipId, input.memberId],
  );
  if (locked.rows.length !== 1) throw new RelationshipCustodyRefused('relationship_not_found');
  const now = locked.rows[0]!;
  if (now.living_work_id !== r.living_work_id || now.manuscript_id !== r.manuscript_id) {
    throw new RelationshipCustodyRefused('relationship_binding_changed');
  }

  return {
    relationshipId: now.id,
    memberId: now.member_id,
    livingWorkId: now.living_work_id,
    manuscriptId: now.manuscript_id,
  };
}

async function nextSequence(tx: TransactionClient, relationshipId: string): Promise<number> {
  const r = await tx.query<{ next_sequence: number }>(
    `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_sequence
       FROM writer_editorial_relationship_episodes
      WHERE relationship_id = $1`,
    [relationshipId],
  );
  return Number(r.rows[0]!.next_sequence);
}
async function existingEditorialEpisode(
  tx: TransactionClient, threadId: string, maiaTurnIndex: number,
): Promise<{ id: string; relationship_id: string; sequence: number } | null> {
  const r = await tx.query<{ id: string; relationship_id: string; sequence: number }>(
    `SELECT id, relationship_id, sequence
       FROM writer_editorial_relationship_episodes
      WHERE child_kind = 'EDITORIAL_TURN'
        AND editorial_thread_id = $1
        AND editorial_maia_turn_index = $2`,
    [threadId, maiaTurnIndex],
  );
  return r.rows[0] ?? null;
}

async function existingReviewEpisode(
  tx: TransactionClient, authorizationId: string,
): Promise<{ id: string; relationship_id: string; sequence: number } | null> {
  const r = await tx.query<{ id: string; relationship_id: string; sequence: number }>(
    `SELECT id, relationship_id, sequence
       FROM writer_editorial_relationship_episodes
      WHERE child_kind = 'REVIEW_DISCUSS'
        AND review_authorization_id = $1`,
    [authorizationId],
  );
  return r.rows[0] ?? null;
}

async function validateEditorialChild(
  tx: TransactionClient,
  prepared: PreparedRelationshipAppend,
  input: {
    threadId: string; proposalChainId: string;
    memberTurnIndex: number; maiaTurnIndex: number;
    manuscriptLocusScope: ManuscriptLocusScope;
  },
): Promise<void> {
  const subject = await tx.query(
    `SELECT th.id
       FROM ask_threads th
       JOIN proposal_chains pc ON pc.id = th.proposal_chain_id
      WHERE th.id = $1
        AND th.member_id = $2
        AND th.manuscript_id = $3
        AND th.proposal_chain_id = $4
        AND pc.id = $4
        AND pc.member_id = $2
        AND pc.work_id = $3
        AND pc.locus_scope_kind = $5`,
    [input.threadId, prepared.memberId, prepared.manuscriptId, input.proposalChainId,
     input.manuscriptLocusScope],
  );
  if (subject.rows.length !== 1) throw new RelationshipCustodyRefused('editorial_child_invalid');

  const turns = await tx.query<{ turn_index: number; speaker: 'author' | 'maia' }>(
    `SELECT turn_index, speaker
       FROM ask_turns
      WHERE thread_id = $1 AND turn_index IN ($2, $3)`,
    [input.threadId, input.memberTurnIndex, input.maiaTurnIndex],
  );
  const member = turns.rows.some(
    t => Number(t.turn_index) === input.memberTurnIndex && t.speaker === 'author',
  );
  const maia = turns.rows.some(
    t => Number(t.turn_index) === input.maiaTurnIndex && t.speaker === 'maia',
  );
  if (!member || !maia) throw new RelationshipCustodyRefused('editorial_child_invalid');
}
async function validateReviewChild(
  tx: TransactionClient,
  prepared: PreparedRelationshipAppend,
  input: {
    threadId: string; maiaTurnIndex: number; authorizationId: string;
    readingId: string; observationKey: string;
  },
): Promise<void> {
  const r = await tx.query<{
    completed_at: Date | null; completion_ref: string | null; speaker: string;
  }>(
    `SELECT c.completed_at, c.completion_ref, t.speaker
       FROM ask_authorization_acts a
       JOIN ask_authorization_consumptions c ON c.act_id = a.id
       JOIN ask_threads th ON th.id = a.thread_id
       JOIN ask_turns t
         ON t.thread_id = a.thread_id
        AND t.turn_index = $6
      WHERE a.id = $1
        AND a.member_id = $2
        AND a.manuscript_id = $3
        AND a.thread_id = $4
        AND a.reading_id = $5
        AND a.observation_key = $7
        AND th.member_id = $2
        AND th.manuscript_id = $3
        AND th.reading_identity ->> 'kind' = 'review_discuss_r2_1'
        AND th.reading_identity ->> 'readingId' = $5::text
        AND th.reading_identity ->> 'observationKey' = $7`,
    [input.authorizationId, prepared.memberId, prepared.manuscriptId,
     input.threadId, input.readingId, input.maiaTurnIndex, input.observationKey],
  );
  if (r.rows.length !== 1) throw new RelationshipCustodyRefused('review_child_invalid');
  const row = r.rows[0]!;
  if (
    row.completed_at === null ||
    row.completion_ref !== `${input.threadId}:${input.maiaTurnIndex}` ||
    row.speaker !== 'maia'
  ) {
    throw new RelationshipCustodyRefused('review_child_invalid');
  }
}

async function recoverInsertedEpisode(
  tx: TransactionClient,
  relationshipId: string,
  child: { kind: 'EDITORIAL_TURN'; threadId: string; maiaTurnIndex: number }
    | { kind: 'REVIEW_DISCUSS'; authorizationId: string },
): Promise<{ id: string; sequence: number }> {
  const found = child.kind === 'EDITORIAL_TURN'
    ? await existingEditorialEpisode(tx, child.threadId, child.maiaTurnIndex)
    : await existingReviewEpisode(tx, child.authorizationId);
  if (!found) throw new RelationshipCustodyRefused('sequence_conflict');
  if (found.relationship_id !== relationshipId) {
    throw new RelationshipCustodyRefused('child_already_attached_elsewhere');
  }
  return { id: found.id, sequence: Number(found.sequence) };
}
export async function appendEditorialEpisodeWithClient(
  tx: TransactionClient,
  prepared: PreparedRelationshipAppend,
  input: {
    threadId: string;
    proposalChainId: string;
    memberTurnIndex: number;
    maiaTurnIndex: number;
    manuscriptLocusScope: ManuscriptLocusScope;
  },
): Promise<{ readonly id: string; readonly sequence: number; readonly existing: boolean }> {
  const before = await existingEditorialEpisode(tx, input.threadId, input.maiaTurnIndex);
  if (before) {
    if (before.relationship_id !== prepared.relationshipId) {
      throw new RelationshipCustodyRefused('child_already_attached_elsewhere');
    }
    return { id: before.id, sequence: Number(before.sequence), existing: true };
  }

  await validateEditorialChild(tx, prepared, input);
  const sequence = await nextSequence(tx, prepared.relationshipId);
  const inserted = await tx.query<{ id: string; sequence: number }>(
    `INSERT INTO writer_editorial_relationship_episodes
       (relationship_id, sequence, child_kind, manuscript_scope_requested, manuscript_scope_executed,
        temporal_posture, history_policy, continuation_authorized,
        authority_class, carry_policy,
        editorial_thread_id, editorial_proposal_chain_id,
        editorial_member_turn_index, editorial_maia_turn_index)
     VALUES
       ($1, $2, 'EDITORIAL_TURN', $3, $3,
        'CURRENT_FROZEN_LOCUS', 'CHILD_LOCAL_MULTI_TURN', TRUE,
        'EDITORIAL_CHAIN', 'PRESENTATION_ONLY',
        $4, $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING id, sequence`,
    [prepared.relationshipId, sequence, input.manuscriptLocusScope, input.threadId,
     input.proposalChainId, input.memberTurnIndex, input.maiaTurnIndex],
  );
  if (inserted.rows.length === 1) {
    return { id: inserted.rows[0]!.id, sequence: Number(inserted.rows[0]!.sequence), existing: false };
  }
  const recovered = await recoverInsertedEpisode(tx, prepared.relationshipId, {
    kind: 'EDITORIAL_TURN', threadId: input.threadId, maiaTurnIndex: input.maiaTurnIndex,
  });
  return { ...recovered, existing: true };
}
export async function appendReviewDiscussEpisodeWithClient(
  tx: TransactionClient,
  prepared: PreparedRelationshipAppend,
  input: {
    threadId: string;
    maiaTurnIndex: number;
    authorizationId: string;
    readingId: string;
    observationKey: string;
  },
): Promise<{ readonly id: string; readonly sequence: number; readonly existing: boolean }> {
  const before = await existingReviewEpisode(tx, input.authorizationId);
  if (before) {
    if (before.relationship_id !== prepared.relationshipId) {
      throw new RelationshipCustodyRefused('child_already_attached_elsewhere');
    }
    return { id: before.id, sequence: Number(before.sequence), existing: true };
  }

  await validateReviewChild(tx, prepared, input);
  const sequence = await nextSequence(tx, prepared.relationshipId);
  const inserted = await tx.query<{ id: string; sequence: number }>(
    `INSERT INTO writer_editorial_relationship_episodes
       (relationship_id, sequence, child_kind, manuscript_scope_requested, manuscript_scope_executed,
        temporal_posture, history_policy, continuation_authorized,
        authority_class, carry_policy,
        review_thread_id, review_maia_turn_index, review_authorization_id,
        review_reading_id, review_observation_key)
     VALUES
       ($1, $2, 'REVIEW_DISCUSS', NULL, NULL,
        'AS_READ', 'NONE', FALSE,
        'R2_DISCLOSURE', 'PRESENTATION_ONLY',
        $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING id, sequence`,
    [prepared.relationshipId, sequence, input.threadId,
     input.maiaTurnIndex, input.authorizationId, input.readingId, input.observationKey],
  );
  if (inserted.rows.length === 1) {
    return { id: inserted.rows[0]!.id, sequence: Number(inserted.rows[0]!.sequence), existing: false };
  }
  const recovered = await recoverInsertedEpisode(tx, prepared.relationshipId, {
    kind: 'REVIEW_DISCUSS', authorizationId: input.authorizationId,
  });
  return { ...recovered, existing: true };
}

/**
 * Convenience wrappers for an already-completed child in the SAME transaction.
 * Future live A2 integration should prefer prepareRelationshipForAppendWithClient
 * before writing the child completion, then call the append function afterward.
 */
export async function appendExistingEditorialEpisodeWithClient(
  tx: TransactionClient,
  input: {
    memberId: string; relationshipId: string; threadId: string; proposalChainId: string;
    memberTurnIndex: number; maiaTurnIndex: number; manuscriptLocusScope: ManuscriptLocusScope;
  },
) {
  const existing = await existingEditorialEpisode(tx, input.threadId, input.maiaTurnIndex);
  if (existing) {
    if (existing.relationship_id !== input.relationshipId) {
      throw new RelationshipCustodyRefused('child_already_attached_elsewhere');
    }
    return { id: existing.id, sequence: Number(existing.sequence), existing: true as const };
  }
  const prepared = await prepareRelationshipForAppendWithClient(tx, input);
  return appendEditorialEpisodeWithClient(tx, prepared, input);
}
export async function appendExistingReviewDiscussEpisodeWithClient(
  tx: TransactionClient,
  input: {
    memberId: string; relationshipId: string; threadId: string; maiaTurnIndex: number;
    authorizationId: string; readingId: string; observationKey: string;
  },
) {
  const existing = await existingReviewEpisode(tx, input.authorizationId);
  if (existing) {
    if (existing.relationship_id !== input.relationshipId) {
      throw new RelationshipCustodyRefused('child_already_attached_elsewhere');
    }
    return { id: existing.id, sequence: Number(existing.sequence), existing: true as const };
  }
  const prepared = await prepareRelationshipForAppendWithClient(tx, input);
  return appendReviewDiscussEpisodeWithClient(tx, prepared, input);
}
