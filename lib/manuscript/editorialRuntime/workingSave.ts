import { transaction, type TransactionClient } from '@/lib/db/postgres';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { projectEditorialSelection } from './selection';
import {
  openEditorialRelationshipWithClient,
  type OpenEditorialRefusal,
} from './thread';
import { lockCurrentEditorialOriginWithClient } from '@/lib/writers-studio/threadOrigin';
import { appendAuthoredVersionWithExecutor, type AppendRefusal } from '../proposalChain/store';
import type { VerifiedIdentity } from './turn';
import type { CraftSaveRequest } from '@/lib/writersStudio/craftSaveContractR1';

export type WorkingSaveRefusal = OpenEditorialRefusal
  | AppendRefusal
  | 'invalid_identity'
  | 'invalid_predecessor'
  | 'settled_choices_not_persisted'
  | 'idempotency_conflict'
  | 'origin_unavailable'
  | 'selection_stale'
  | 'selection_invalid'
  | 'selection_ambiguous';

export type WorkingSaveResult =
  | {
      readonly ok: true;
      readonly replayed: boolean;
      readonly threadId: string;
      readonly chainId: string;
      readonly versionId: string;
      readonly supersedes: string | null;
      readonly sectionId: string;
    }
  | { readonly ok: false; readonly reason: WorkingSaveRefusal };

interface SaveReceiptRow {
  relationship_id: string;
  thread_id: string;
  proposal_chain_id: string;
  proposal_version_id: string;
  target_section_id: string;
  supersedes: string | null;
  formulation: string;
  stored_supersedes: string | null;
}

class SaveRefused extends Error {
  constructor(readonly reason: WorkingSaveRefusal) { super(reason); }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function verifyExistingThreadLocus(
  tx: TransactionClient,
  memberId: string,
  input: CraftSaveRequest,
  origin: {
    proposalChainId: string; draftId: string; targetSectionId: string;
    draftVersion: number; draftRevisionCount: number; locusScopeKind: 'section' | 'passage';
  },
): Promise<void> {
  if (origin.targetSectionId !== input.sectionId || origin.locusScopeKind !== 'passage') {
    throw new SaveRefused('origin_unavailable');
  }
  const rows = await tx.query<{
    version: string; revision_count: number; text: string; heading: string | null;
    expected_text: string;
  }>(`SELECT d.version, d.revision_count, s.text, ms.heading, pc.expected_text
        FROM manuscript_working_drafts d
        JOIN manuscript_draft_sections s ON s.draft_id = d.id
        LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
        JOIN proposal_chains pc ON pc.id = $4 AND pc.member_id = d.member_id
       WHERE d.id = $1 AND d.member_id = $2 AND s.id = $3
       FOR SHARE OF d, s, pc`,
    [origin.draftId, memberId, input.sectionId, origin.proposalChainId]);
  const row = rows.rows[0];
  if (rows.rows.length !== 1 || !row
      || Number(row.version) !== input.revisionNumber
      || Number(row.version) !== origin.draftVersion
      || Number(row.revision_count) !== origin.draftRevisionCount) {
    throw new SaveRefused('selection_stale');
  }
  const split = splitStoredSection(row.text, row.heading);
  if (!split) throw new SaveRefused('selection_invalid');
  const selected = projectEditorialSelection(split.body, input.range);
  if (!selected.ok) {
    throw new SaveRefused(selected.reason === 'selection_ambiguous'
      ? 'selection_ambiguous' : 'selection_invalid');
  }
  if (selected.text !== row.expected_text) throw new SaveRefused('selection_stale');
}

async function replayReceipt(
  tx: TransactionClient,
  identity: VerifiedIdentity,
  input: CraftSaveRequest,
): Promise<WorkingSaveResult | null> {
  const result = await tx.query<SaveReceiptRow>(
    `SELECT r.relationship_id, r.thread_id, r.proposal_chain_id,
            r.proposal_version_id, r.target_section_id, r.supersedes,
            v.formulation, v.supersedes AS stored_supersedes
       FROM writer_editorial_save_receipts r
       JOIN proposal_versions v
         ON v.chain_id = r.proposal_chain_id AND v.id = r.proposal_version_id
      WHERE r.member_id = $1 AND r.idempotency_key = $2
      FOR UPDATE OF r`,
    [identity.memberId, input.idempotencyKey]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0]!;
  if (result.rows.length !== 1
      || row.relationship_id !== input.relationshipId
      || row.target_section_id !== input.sectionId
      || row.supersedes !== input.supersedes
      || row.stored_supersedes !== input.supersedes
      || row.formulation !== input.replacementText
      || (input.threadId !== null && row.thread_id !== input.threadId)) {
    throw new SaveRefused('idempotency_conflict');
  }
  const current = await lockCurrentEditorialOriginWithClient(tx, {
    memberId: identity.memberId, relationshipId: input.relationshipId,
    threadId: row.thread_id,
  });
  if (!current.ok || current.origin.proposalChainId !== row.proposal_chain_id
      || current.origin.targetSectionId !== input.sectionId) {
    throw new SaveRefused('origin_unavailable');
  }
  return {
    ok: true, replayed: true, threadId: row.thread_id,
    chainId: row.proposal_chain_id, versionId: row.proposal_version_id,
    supersedes: row.supersedes, sectionId: row.target_section_id,
  };
}

/** One explicit member Save. No MAIA turn, no Apply, no automatic retry. */
export async function saveWorkingEditorialVersion(input: {
  identity: VerifiedIdentity;
  posture: TurnPosture;
  request: CraftSaveRequest;
}): Promise<WorkingSaveResult> {
  const { identity, posture, request } = input;
  if (identity.status !== 'verified' || !UUID.test(identity.memberId)
      || !UUID.test(request.relationshipId) || !UUID.test(request.idempotencyKey)) {
    return { ok: false, reason: 'invalid_identity' };
  }
  if (!(posture instanceof TurnPosture)) return { ok: false, reason: 'posture_required' };
  if (posture.sanctuary) return { ok: false, reason: 'sanctuary_unavailable' };
  if (request.kept && request.kept.length > 0) {
    return { ok: false, reason: 'settled_choices_not_persisted' };
  }
  if (request.threadId === null && request.supersedes !== null) {
    return { ok: false, reason: 'invalid_predecessor' };
  }

  try {
    return await transaction(async (tx) => {
      // Serialize this member's exact gesture without storing a prose digest.
      await tx.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [identity.memberId + ':' + request.idempotencyKey]);
      const replay = await replayReceipt(tx, identity, request);
      if (replay) return replay;

      let threadId = request.threadId;
      let chainId: string;
      if (threadId === null) {
        const opened = await openEditorialRelationshipWithClient(tx, {
          identity, sectionId: request.sectionId,
          relationshipId: request.relationshipId, posture,
        }, { range: request.range, revisionNumber: request.revisionNumber });
        if (!opened.ok) throw new SaveRefused(opened.reason);
        threadId = opened.threadId;
        chainId = opened.chainId;
      } else {
        const current = await lockCurrentEditorialOriginWithClient(tx, {
          memberId: identity.memberId,
          relationshipId: request.relationshipId,
          threadId,
        });
        if (!current.ok) throw new SaveRefused('origin_unavailable');
        await verifyExistingThreadLocus(tx, identity.memberId, request, current.origin);
        chainId = current.origin.proposalChainId;
      }

      const appended = await appendAuthoredVersionWithExecutor(tx, identity.memberId, chainId, {
        author: 'member', supersedes: request.supersedes,
        replacementText: request.replacementText,
      });
      if (appended.outcome !== 'appended') throw new SaveRefused(appended.reason);

      await tx.query(
        `INSERT INTO writer_editorial_save_receipts
          (member_id, idempotency_key, relationship_id, thread_id,
           proposal_chain_id, proposal_version_id, target_section_id, supersedes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [identity.memberId, request.idempotencyKey, request.relationshipId,
         threadId, chainId, appended.version.id, request.sectionId, request.supersedes]);
      return {
        ok: true as const, replayed: false, threadId, chainId,
        versionId: appended.version.id, supersedes: appended.version.supersedes,
        sectionId: request.sectionId,
      };
    });
  } catch (e) {
    if (e instanceof SaveRefused) return { ok: false, reason: e.reason };
    throw e;
  }
}
