import { transaction, query } from '@/lib/db/postgres';
import { saveSectionInTransaction } from '@/lib/manuscript/sections/saveSection';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

export interface ApplicationRecovery {
  authorizationId: string; versionId: string; resultingVersion: number;
  undone: boolean; canUndo: boolean;
}

export interface UndoVersionState {
  currentVersion: number;
  resultingVersion: number;
  lastIdempotencyOp: string | null;
  lastIdempotencyResponse: unknown;
}

/**
 * Undo normally requires the draft to remain at the application version.
 * One exception is a single server checkpoint taken immediately afterwards so
 * Review can read the applied text. A checkpoint snapshots bytes but does not
 * author new wording. Any other version movement still refuses.
 */
export function undoBaseVersion(state: UndoVersionState): number | null {
  if (state.currentVersion === state.resultingVersion) return state.currentVersion;
  if (state.currentVersion !== state.resultingVersion + 1) return null;
  if (state.lastIdempotencyOp !== 'save') return null;
  const response = state.lastIdempotencyResponse;
  if (!response || typeof response !== 'object' || Array.isArray(response)) return null;
  const record = response as Record<string, unknown>;
  if (record.checkpointed !== true || Number(record.revisionId) !== state.currentVersion) return null;
  return state.currentVersion;
}

export async function readApplicationRecovery(memberId: string, threadId: string): Promise<ApplicationRecovery | null> {
  const result = await query<{
    id: string; proposal_version_id: string; resulting_version: number;
    undone_at: Date | null; current_version: number; has_snapshot: boolean;
    last_idempotency_op: string | null; last_idempotency_response: unknown;
  }>(`SELECT a.id, a.proposal_version_id, a.resulting_version, r.undone_at,
      d.version AS current_version, d.last_idempotency_op, d.last_idempotency_response,
      (r.authorization_id IS NOT NULL) AS has_snapshot
    FROM ask_threads t JOIN manuscript_revision_authorizations a
      ON a.proposal_chain_id = t.proposal_chain_id AND a.member_id = t.member_id
    JOIN manuscript_working_drafts d ON d.id = a.draft_id AND d.member_id = a.member_id
    LEFT JOIN manuscript_application_recovery r ON r.authorization_id = a.id
    WHERE t.id = $1 AND t.member_id = $2 AND a.accepted_at IS NOT NULL
    ORDER BY a.resulting_version DESC LIMIT 1`, [threadId, memberId]);
  const row = result.rows[0];
  const base = row ? undoBaseVersion({
    currentVersion: Number(row.current_version),
    resultingVersion: Number(row.resulting_version),
    lastIdempotencyOp: row.last_idempotency_op,
    lastIdempotencyResponse: row.last_idempotency_response,
  }) : null;
  return row ? { authorizationId: row.id, versionId: row.proposal_version_id,
    resultingVersion: Number(row.resulting_version), undone: row.undone_at !== null,
    canUndo: row.has_snapshot && row.undone_at === null && base !== null } : null;
}
export type RecoveryOutcome =
  | { kind: 'undone'; resultingVersion: number }
  | { kind: 'refused'; reason: 'unknown_application' | 'already_undone' | 'work_moved' | 'section_unreadable' | 'write_refused' };
/** The gesture supplies only a receipt id; all text and location come from server custody.
 * Lock order matches application: authorization, then draft. The section writer,
 * receipt and reversal are one transaction. Later authored writes cause refusal;
 * one immediate server checkpoint for Review does not masquerade as new writing.
 */
export async function undoApplication(memberId: string, authorizationId: string): Promise<RecoveryOutcome> {
  return transaction(async tx => {
    const result = await tx.query<{
      id: string; work_id: string; draft_id: string; target_section_id: string; resulting_version: number;
      before_body: string; after_body: string; undone_at: Date | null;
    }>(`SELECT a.id, a.work_id, a.draft_id, a.target_section_id, a.resulting_version,
        r.before_body, r.after_body, r.undone_at
      FROM manuscript_revision_authorizations a
      JOIN manuscript_application_recovery r ON r.authorization_id = a.id
      WHERE a.id = $1 AND a.member_id = $2 AND a.accepted_at IS NOT NULL
      FOR UPDATE OF a, r`, [authorizationId, memberId]);
    const a = result.rows[0];
    if (!a) return { kind: 'refused', reason: 'unknown_application' };
    if (a.undone_at) return { kind: 'refused', reason: 'already_undone' };
    const draft = await tx.query<{
      version: number; last_idempotency_op: string | null; last_idempotency_response: unknown;
    }>(
      `SELECT version, last_idempotency_op, last_idempotency_response
         FROM manuscript_working_drafts
        WHERE id = $1 AND member_id = $2 FOR UPDATE`, [a.draft_id, memberId]);
    const current = draft.rows[0];
    const baseVersion = current ? undoBaseVersion({
      currentVersion: Number(current.version),
      resultingVersion: Number(a.resulting_version),
      lastIdempotencyOp: current.last_idempotency_op,
      lastIdempotencyResponse: current.last_idempotency_response,
    }) : null;
    if (baseVersion === null) return { kind: 'refused', reason: 'work_moved' };
    const section = await tx.query<{ text: string; heading: string | null }>(
      `SELECT s.text, ms.heading FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
       WHERE s.id = $1 AND s.draft_id = $2`, [a.target_section_id, a.draft_id]);
    const row = section.rows[0];
    const split = row && splitStoredSection(row.text, row.heading);
    if (!split) return { kind: 'refused', reason: 'section_unreadable' };
    if (split.body !== a.after_body) return { kind: 'refused', reason: 'work_moved' };
    const saved = await saveSectionInTransaction(
      tx, a.work_id, memberId, a.target_section_id, a.before_body, baseVersion,
    );
    if (saved.status !== 'saved' || saved.version === undefined) return { kind: 'refused', reason: 'write_refused' };
    await tx.query('UPDATE manuscript_application_recovery SET undone_at = now(), resulting_version = $2 WHERE authorization_id = $1', [a.id, saved.version]);
    return { kind: 'undone', resultingVersion: saved.version };
  });
}
