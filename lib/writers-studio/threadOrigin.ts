/**
 * Content-free first-open provenance, not an authorization service.
 * Call only inside the caller's transaction, before loading historical prose.
 * Current consent, session, Source, posture and per-operation revision checks
 * are additional requirements; this result must never stand in for them.
 * Not yet connected to editorial open/Save routes in this local increment.
 */
import type { TransactionClient } from '@/lib/db/postgres';
import type { ManuscriptLocusScope } from './relationshipCustody';

export interface EditorialThreadOrigin {
  readonly id: string;
  readonly threadId: string;
  readonly proposalChainId: string;
  readonly memberId: string;
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly relationshipId: string;
  readonly creationExpressionId: string;
  readonly draftId: string;
  readonly targetSectionId: string;
  readonly draftVersion: number;
  readonly draftRevisionCount: number;
  readonly locusScopeKind: ManuscriptLocusScope;
}

interface OriginRow {
  id: string; thread_id: string; proposal_chain_id: string; member_id: string;
  living_work_id: string; manuscript_id: string; relationship_id: string;
  creation_expression_id: string; draft_id: string; target_section_id: string;
  draft_version: number | string; draft_revision_count: number | string;
  locus_scope_kind: ManuscriptLocusScope;
}
const COLUMNS = `o.id, o.thread_id, o.proposal_chain_id, o.member_id,
  o.living_work_id, o.manuscript_id, o.relationship_id, o.creation_expression_id,
  o.draft_id, o.target_section_id, o.draft_version, o.draft_revision_count, o.locus_scope_kind`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idKeys = ['id', 'threadId', 'proposalChainId', 'memberId', 'livingWorkId',
  'manuscriptId', 'relationshipId', 'creationExpressionId', 'draftId', 'targetSectionId'] as const;
function valid(o: EditorialThreadOrigin): boolean {
  return idKeys.every(k => typeof o[k] === 'string' && UUID.test(o[k]))
    && Number.isSafeInteger(o.draftVersion) && o.draftVersion >= 0
    && Number.isSafeInteger(o.draftRevisionCount) && o.draftRevisionCount >= 0
    && (o.locusScopeKind === 'section' || o.locusScopeKind === 'passage');
}
function hydrate(r: OriginRow): EditorialThreadOrigin {
  return { id: r.id, threadId: r.thread_id, proposalChainId: r.proposal_chain_id,
    memberId: r.member_id, livingWorkId: r.living_work_id, manuscriptId: r.manuscript_id,
    relationshipId: r.relationship_id, creationExpressionId: r.creation_expression_id,
    draftId: r.draft_id, targetSectionId: r.target_section_id,
    draftVersion: Number(r.draft_version), draftRevisionCount: Number(r.draft_revision_count),
    locusScopeKind: r.locus_scope_kind };
}
function equal(a: EditorialThreadOrigin, b: EditorialThreadOrigin): boolean {
  return idKeys.every(k => a[k] === b[k]) && a.draftVersion === b.draftVersion
    && a.draftRevisionCount === b.draftRevisionCount && a.locusScopeKind === b.locusScopeKind;
}

/**
 * The server first inserts its new thread with this same origin id, then calls
 * this seam in that SAME transaction. Deferred reciprocal FKs refuse partial
 * commit. Database triggers validate exact current metadata and refuse legacy
 * attachment or origin replacement. No ON CONFLICT success or automatic retry.
 */
export async function recordEditorialThreadOriginWithClient(
  tx: TransactionClient, origin: EditorialThreadOrigin,
): Promise<EditorialThreadOrigin> {
  if (!valid(origin)) throw new Error('editorial_origin_invalid');
  const result = await tx.query<OriginRow>(
    `INSERT INTO writer_editorial_thread_origins AS o
       (id, thread_id, proposal_chain_id, member_id, living_work_id, manuscript_id,
        relationship_id, creation_expression_id, draft_id, target_section_id,
        draft_version, draft_revision_count, locus_scope_kind)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING ${COLUMNS}`,
    [origin.id, origin.threadId, origin.proposalChainId, origin.memberId,
     origin.livingWorkId, origin.manuscriptId, origin.relationshipId,
     origin.creationExpressionId, origin.draftId, origin.targetSectionId,
     origin.draftVersion, origin.draftRevisionCount, origin.locusScopeKind],
  );
  if (result.rows.length !== 1) throw new Error('editorial_origin_receipt_unconfirmed');
  const stored = hydrate(result.rows[0]!);
  if (!valid(stored) || !equal(stored, origin)) throw new Error('editorial_origin_receipt_unconfirmed');
  return stored;
}

export type CurrentOriginBinding =
  | { readonly ok: false; readonly reason: 'origin_unavailable' }
  | { readonly ok: true; readonly evidence: 'PROVENANCE_ONLY'; readonly origin: EditorialThreadOrigin };

/**
 * Metadata only. Withholds unknown/foreign/reparented/withdrawn/redeclared
 * origins before any historical content query. SHARE locks fence the checked
 * rows against deletion AND non-key ownership/declaration changes until the
 * surrounding transaction ends. A later request must repeat these checks.
 */
export async function lockCurrentEditorialOriginWithClient(
  tx: TransactionClient,
  input: { readonly memberId: string; readonly relationshipId: string; readonly threadId: string },
): Promise<CurrentOriginBinding> {
  const refuse = { ok: false, reason: 'origin_unavailable' } as const;
  if (![input.memberId, input.relationshipId, input.threadId].every(x => typeof x === 'string' && UUID.test(x))) return refuse;
  const statement = `SELECT ${COLUMNS}
    FROM writer_editorial_thread_origins o
    JOIN writer_editorial_chain_origins co
      ON co.proposal_chain_id = o.proposal_chain_id
     AND co.member_id = o.member_id AND co.living_work_id = o.living_work_id
     AND co.manuscript_id = o.manuscript_id AND co.relationship_id = o.relationship_id
     AND co.creation_expression_id = o.creation_expression_id
     AND co.draft_id = o.draft_id AND co.target_section_id = o.target_section_id
     AND co.draft_version = o.draft_version
     AND co.draft_revision_count = o.draft_revision_count
     AND co.locus_scope_kind = o.locus_scope_kind
    JOIN ask_threads th ON th.id = o.thread_id AND th.editorial_origin_id = o.id
      AND th.member_id = o.member_id AND th.manuscript_id = o.manuscript_id
      AND th.proposal_chain_id = o.proposal_chain_id
    JOIN proposal_chains pc ON pc.id = o.proposal_chain_id
      AND pc.member_id = o.member_id AND pc.work_id = o.manuscript_id
      AND pc.draft_id = o.draft_id AND pc.target_section_id = o.target_section_id
      AND pc.base_version = o.draft_revision_count AND pc.locus_scope_kind = o.locus_scope_kind
    WHERE o.thread_id = $1 AND o.member_id = $2 AND o.relationship_id = $3`;
  const args = [input.threadId, input.memberId, input.relationshipId];
  const first = await tx.query<OriginRow>(statement, args);
  if (first.rows.length !== 1) return refuse;
  const origin = hydrate(first.rows[0]!);
  if (!valid(origin) || origin.memberId !== input.memberId || origin.threadId !== input.threadId
      || origin.relationshipId !== input.relationshipId) return refuse;

  const checks: Array<[string, string[]]> = [
    ['SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR SHARE',
      [origin.livingWorkId, origin.memberId]],
    ['SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR SHARE',
      [origin.manuscriptId, origin.memberId]],
    [`SELECT id FROM living_work_expressions WHERE id = $1 AND living_work_id = $2
       AND expression_type = 'manuscript' AND expression_id = $3 AND declared_by = $4 FOR SHARE`,
      [origin.creationExpressionId, origin.livingWorkId, origin.manuscriptId, origin.memberId]],
    [`SELECT id FROM writer_editorial_relationships WHERE id = $1 AND member_id = $2
       AND living_work_id = $3 AND manuscript_id = $4 AND creation_expression_id = $5
       AND contract_version = 'A2-1' FOR SHARE`,
      [origin.relationshipId, origin.memberId, origin.livingWorkId,
       origin.manuscriptId, origin.creationExpressionId]],
  ];
  for (const [sql, parameters] of checks) {
    const checked = await tx.query<{ id: string }>(sql, parameters);
    if (checked.rows.length !== 1 || checked.rows[0]!.id !== parameters[0]) return refuse;
  }
  const final = await tx.query<OriginRow>(statement + ' FOR SHARE OF o, co, th, pc', args);
  if (final.rows.length !== 1 || !equal(hydrate(final.rows[0]!), origin)) return refuse;
  return { ok: true, evidence: 'PROVENANCE_ONLY', origin };
}
