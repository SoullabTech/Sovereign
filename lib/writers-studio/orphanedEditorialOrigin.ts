/**
 * WS-DELETE-01 · RETAINED EDITORIAL THREADS — the one definition of an ORPHANED origin.
 *
 * Removing a Work deletes its editorial relationship (`wer_work_member_fk … ON DELETE CASCADE`). The editorial threads about the
 * writing are bound to the manuscript, carry no Work id, and stay — together with the content-free origin rows, which name the
 * Work and the relationship but have no foreign key to either. The member-facing paths (open, read, turn, version, Save-working)
 * refuse such a thread because `lockCurrentEditorialOriginWithClient` needs the originating relationship to exist. Two further
 * routes, the editorial ADOPTION gesture and the RELATIONSHIPS list, took the retained ids with no such check (measured on
 * PostgreSQL 16: docs/programme/WS-DELETE-01_R-SHARED_RETAINED_EDITORIAL_THREADS_FINDING_AND_OPTIONS_2026-11-08.md). This
 * module is the check they now share.
 *
 * ⭐ WHAT "ORPHANED" MEANS, EXACTLY (founder-chosen option b-narrow, 2026-11-08):
 *
 *     the thread HAS an origin row, AND the relationship that origin names NO LONGER EXISTS.
 *
 * ⛔ A thread with NO origin row is not orphaned. Threads opened before `20261020000001_writer_editorial_thread_origins` were
 * never backfilled; they behave as they always did (the 2026-11-01 ruling and its notice for older conversations are untouched).
 * ⛔ This is not `lockCurrentEditorialOriginWithClient`: it takes no relationshipId from the caller (no contract change), checks
 * no declaration or draft, and refuses nothing for an origin that is still current.
 * ⚠️ NOT COVERED, AND NAMED: a Work that still exists but withdrew the writing's declaration (the expressions route deletes the
 * `living_work_expressions` row and nothing else) leaves its relationship in place, so the thread is not orphaned by this
 * definition even though the gated paths refuse it. Widening the definition is a founder ruling, not a refactor.
 *
 * ⭐ ONE DEFINITION. The list embeds the SQL predicate; adoption asks the function. Both come from `orphanedOriginSql`, so the two
 * can never disagree about what an orphan is.
 *
 * ⚠️ THIS IS A PRE-CHECK, NOT THE MUTATION BOUNDARY. A Remove that commits between the check and the write lets one adoption
 * through. Here that is not a safety defect (the act is the owner's explicit gesture on their own writing, and nothing is
 * minted that the member could not already do by editing), and moving the check inside `executeAuthorization`'s transaction
 * would change a function shared by other callers. The window is stated, not hidden.
 */
import { query } from '@/lib/db/postgres';

/** The thread reference must be a plain column reference or a numbered parameter: it is spliced into SQL text, never user input. */
const THREAD_REF = /^(?:[a-z_]+\.[a-z_]+|\$\d+)$/;

/**
 * SQL boolean expression: TRUE when the thread named by `threadRef` has an origin row whose relationship row is gone.
 * `threadRef` is a column such as `th.id` or a parameter such as `$1`, and nothing else.
 */
export function orphanedOriginSql(threadRef: string): string {
  if (!THREAD_REF.test(threadRef)) throw new Error('orphanedOriginSql: threadRef must be a column or a parameter');
  return `EXISTS (
    SELECT 1 FROM writer_editorial_thread_origins o
     WHERE o.thread_id = ${threadRef}
       AND NOT EXISTS (
         SELECT 1 FROM writer_editorial_relationships r
          WHERE r.id = o.relationship_id AND r.member_id = o.member_id))`;
}

/**
 * True when the member's thread has an origin whose relationship no longer exists. ⛔ No blanket `catch`: a database that cannot
 * answer must say so, never read as "not orphaned" (which would let the adoption through) or as "orphaned".
 */
export async function threadOriginIsOrphaned(memberId: string, threadId: string): Promise<boolean> {
  const r = await query<{ orphaned: boolean }>(
    `SELECT ${orphanedOriginSql('$2')} AS orphaned
       FROM ask_threads th WHERE th.id = $2 AND th.member_id = $1`,
    [memberId, threadId]);
  return r.rows.length === 1 && r.rows[0]!.orphaned === true;
}
