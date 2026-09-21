import { transaction, query } from '@/lib/db/postgres';
import { saveSectionInTransaction } from '@/lib/manuscript/sections/saveSection';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';

/**
 * ⭐⭐ WHY UNDO IS UNAVAILABLE, NOT MERELY THAT IT IS.
 *
 * The 2026-09-21 live witness found the inline desk showing an applied
 * revision with no undo control and no reason, and ⛔ nothing anywhere could
 * say whether the control was withheld or simply never wired — `canUndo`
 * collapsed three distinct facts into one boolean and discarded which.
 *
 *     ok             undo is available
 *     work_moved     the writer has written here since
 *     already_undone it has already been taken back
 *     no_snapshot    applied before recovery custody existed
 */
export type UndoAvailability = 'ok' | 'work_moved' | 'already_undone' | 'no_snapshot';

export interface ApplicationRecovery {
  authorizationId: string; versionId: string; resultingVersion: number;
  undone: boolean; canUndo: boolean;
  /** ⛔ Never inferred by a surface. The reason is read where it is known. */
  undoAvailability: UndoAvailability;
}
/**
 * ⭐⭐ THE PREDICATE, PURE AND SEPARATELY FALSIFIABLE.
 *
 * ⛔ ORDER IS THE RULING, and it matches `undoApplication` below: custody
 * first, then the act, then the state of the work. A row with no snapshot is
 * never reported as *the work moved* — nothing was ever kept to move from,
 * and telling a writer their own writing cost them the undo would be false.
 *
 * ⛔ It is a pure function so the mapping can be falsified without a database.
 * The three failing causes were collapsed into one boolean for as long as this
 * code existed, which is why the live witness could not tell them apart.
 */
export function classifyUndoAvailability(state: {
  hasSnapshot: boolean; undone: boolean; currentVersion: number; resultingVersion: number;
}): UndoAvailability {
  if (!state.hasSnapshot) return 'no_snapshot';
  if (state.undone) return 'already_undone';
  if (state.currentVersion !== state.resultingVersion) return 'work_moved';
  return 'ok';
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
  if (!row) return null;
  const undoAvailability = classifyUndoAvailability({
    hasSnapshot: row.has_snapshot,
    undone: row.undone_at !== null,
    currentVersion: Number(row.current_version),
    resultingVersion: Number(row.resulting_version),
  });
  return { authorizationId: row.id, versionId: row.proposal_version_id,
    resultingVersion: Number(row.resulting_version), undone: row.undone_at !== null,
    /* ⛔ Kept derived, never stored twice: one predicate, two readings. */
    canUndo: undoAvailability === 'ok', undoAvailability };
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
