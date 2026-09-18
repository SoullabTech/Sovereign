import { transaction, query } from '@/lib/db/postgres';
import { saveSectionInTransaction } from '@/lib/manuscript/sections/saveSection';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

export interface ApplicationRecovery {
  authorizationId: string; versionId: string; resultingVersion: number;
  undone: boolean; canUndo: boolean;
}
export async function readApplicationRecovery(memberId: string, threadId: string): Promise<ApplicationRecovery | null> {
  const result = await query<{
    id: string; proposal_version_id: string; resulting_version: number;
    undone_at: Date | null; current_version: number; has_snapshot: boolean;
  }>(`SELECT a.id, a.proposal_version_id, a.resulting_version, r.undone_at,
      d.version AS current_version, (r.authorization_id IS NOT NULL) AS has_snapshot
    FROM ask_threads t JOIN manuscript_revision_authorizations a
      ON a.proposal_chain_id = t.proposal_chain_id AND a.member_id = t.member_id
    JOIN manuscript_working_drafts d ON d.id = a.draft_id AND d.member_id = a.member_id
    LEFT JOIN manuscript_application_recovery r ON r.authorization_id = a.id
    WHERE t.id = $1 AND t.member_id = $2 AND a.accepted_at IS NOT NULL
    ORDER BY a.resulting_version DESC LIMIT 1`, [threadId, memberId]);
  const row = result.rows[0];
  return row ? { authorizationId: row.id, versionId: row.proposal_version_id,
    resultingVersion: Number(row.resulting_version), undone: row.undone_at !== null,
    canUndo: row.has_snapshot && row.undone_at === null && Number(row.current_version) === Number(row.resulting_version) } : null;
}
export type RecoveryOutcome =
  | { kind: 'undone'; resultingVersion: number }
  | { kind: 'refused'; reason: 'unknown_application' | 'already_undone' | 'work_moved' | 'section_unreadable' | 'write_refused' };
/** The gesture supplies only a receipt id; all text and location come from server custody.
 * Lock order matches application: authorization, then draft. The section writer,
 * receipt and reversal are one transaction. Later writes cause refusal, never rollback.
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
    const draft = await tx.query<{ version: number }>(
      'SELECT version FROM manuscript_working_drafts WHERE id = $1 AND member_id = $2 FOR UPDATE', [a.draft_id, memberId]);
    if (!draft.rows[0] || Number(draft.rows[0].version) !== Number(a.resulting_version))
      return { kind: 'refused', reason: 'work_moved' };
    const section = await tx.query<{ text: string; heading: string | null }>(
      `SELECT s.text, ms.heading FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
       WHERE s.id = $1 AND s.draft_id = $2`, [a.target_section_id, a.draft_id]);
    const row = section.rows[0];
    const split = row && splitStoredSection(row.text, row.heading);
    if (!split) return { kind: 'refused', reason: 'section_unreadable' };
    if (split.body !== a.after_body) return { kind: 'refused', reason: 'work_moved' };
    const saved = await saveSectionInTransaction(tx, a.work_id, memberId, a.target_section_id, a.before_body, Number(a.resulting_version));
    if (saved.status !== 'saved' || saved.version === undefined) return { kind: 'refused', reason: 'write_refused' };
    await tx.query('UPDATE manuscript_application_recovery SET undone_at = now(), resulting_version = $2 WHERE authorization_id = $1', [a.id, saved.version]);
    return { kind: 'undone', resultingVersion: saved.version };
  });
}
