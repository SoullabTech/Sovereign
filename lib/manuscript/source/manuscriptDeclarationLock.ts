/**
 * WS-DELETE-01 — one writing cannot be declared into a Work and erased at the
 * same time.
 *
 * ── The state this exists to prevent ─────────────────────────────────────
 * The founder ruling forbids a *detached* Work: a declaration
 * (`living_work_expressions`) that names a writing which no longer exists.
 * `living_work_expressions.expression_id` has NO foreign key to
 * `member_manuscripts` (open by ratified design), so the database will not stop
 * it. Two transactions can each be correct on their own and still produce it:
 *
 *   declare  checks the writing exists ........... inserts the declaration
 *   erase                  deletes the writing, commits
 *
 * and the mirror, which a lock on the manuscript row alone does NOT close:
 *
 *   erase    reads who declares the writing (`claims`) ........ deletes it
 *   declare                       declares it, commits
 *
 * In the mirror the erase's DELETE merely waits for the declaration's row lock,
 * then proceeds with a `claims` read taken BEFORE the declaration committed. The
 * declaration is left naming absent material, and — because `claims` is also the
 * shared-writing refusal's evidence — the erase can run over a writing that has
 * just become shared, without the refusal ever seeing it.
 *
 * ── Why an advisory lock and not another row lock ────────────────────────
 * The cure for the mirror is for the erase to take something the declaration
 * holds BEFORE it reads `claims`. The obvious candidate, the manuscript row, is
 * wrong: the established row order in this codebase is Work → manuscript
 * (`eraseManuscript`'s claims-then-DELETE, and `threadOrigin`'s FOR SHARE walk),
 * and an erase that locked the manuscript first would form a cycle with any
 * transaction holding a Work row and asking for the manuscript.
 *
 * An advisory lock adds no row-lock edge at all. Both sides take it FIRST, before
 * any row lock, so neither can hold a row another is waiting for while waiting
 * on it, and the row orders already in use are untouched.
 *
 *   declare   shared      — any number of declarations proceed together
 *   erase     exclusive   — waits for in-flight declarations, then holds all new ones
 *
 * The key is scoped to (member, manuscript). The manuscript id alone would let a
 * different member's request, which is destined for a 404, delay the owner's
 * Delete; with the member in the key a foreign id contends with nothing real.
 *
 * Transaction-scoped: released at COMMIT or ROLLBACK, never leaked by a crash.
 *
 * ── What this does NOT do ────────────────────────────────────────────────
 * It is a serialisation point, not an authority. Ownership is still decided by
 * the member-scoped row predicates, and the declaration route still takes the
 * Work and manuscript rows `FOR SHARE` behind it. Both layers are deliberate.
 */

import type { TransactionClient } from '@/lib/db/postgres';

const KEY_NAMESPACE = 'soullab:writers-studio:manuscript-declaration:v1';

/*
 * `$2::uuid::text` / `$3::uuid::text` canonicalise the ids (lower-case,
 * hyphenated) so 'AAAA…' and 'aaaa…' cannot hash to different keys and quietly
 * defeat the serialisation. A malformed id raises 22P02 — the same failure the
 * statements that follow would have raised anyway.
 */
const KEY_EXPRESSION =
  `hashtextextended($1::text || ':' || $2::uuid::text || ':' || $3::uuid::text, 0)`;

/** Taken by a declaration: many may hold it at once, none while an erase does. */
export async function holdManuscriptDeclarationShared(
  tx: TransactionClient,
  memberId: string,
  manuscriptId: string,
): Promise<void> {
  await tx.query(`SELECT pg_advisory_xact_lock_shared(${KEY_EXPRESSION})`, [
    KEY_NAMESPACE,
    memberId,
    manuscriptId,
  ]);
}

/** Taken by an erase, after the recovery-capture lock and before any row lock. */
export async function holdManuscriptDeclarationExclusive(
  tx: TransactionClient,
  memberId: string,
  manuscriptId: string,
): Promise<void> {
  await tx.query(`SELECT pg_advisory_xact_lock(${KEY_EXPRESSION})`, [
    KEY_NAMESPACE,
    memberId,
    manuscriptId,
  ]);
}
