/**
 * WS-DELETE-01 — declaring a writing into a Work, atomic with the writing.
 *
 * `POST /living-works/:id/expressions` used to check that the manuscript exists
 * and then insert the declaration as two separate statements with nothing held
 * between them. A Delete of that writing committing in the gap left a Work
 * naming absent material — the *detached* state the founder ruling forbids by
 * name. `living_work_expressions` has no foreign key to `member_manuscripts` by
 * ratified design, so the database cannot refuse it; this transaction has to.
 *
 * ── Order, and why it is this order ──────────────────────────────────────
 *   1  advisory lock, SHARED   per (member, manuscript) — see manuscriptDeclarationLock.ts
 *   2  the Work row            FOR SHARE, member-scoped
 *   3  the manuscript row      FOR SHARE, member-scoped
 *   4  the insert
 *
 * 2 before 3 is the order `eraseManuscript` and `threadOrigin` already use
 * (Work → manuscript). 1 is what makes the erase wait for this transaction and
 * re-read who declares the writing afterwards; a row lock on the manuscript
 * alone does not (the erase's DELETE would wait, then run on a stale read).
 * FOR SHARE on 2 also turns "the Work was deleted between my check and my
 * insert" from a foreign-key error into the plain 404 it is.
 *
 * ── What stays the same ──────────────────────────────────────────────────
 * Nothing about what is declared, who may declare it, or what a repeat means:
 * declaring twice is the member saying something already true, absorbed by the
 * unique constraint. A foreign or absent id on either side is `not_found` — a
 * foreign id learns nothing.
 */

import { transaction } from '@/lib/db/postgres';
import { holdManuscriptDeclarationShared } from '@/lib/manuscript/source/manuscriptDeclarationLock';

export interface DeclaredExpressionRow {
  readonly id: string;
  readonly expression_type: string;
  readonly expression_id: string;
  readonly declared_at: string;
}

export type DeclareManuscriptOutcome =
  | { readonly kind: 'declared'; readonly expression: DeclaredExpressionRow }
  | { readonly kind: 'already_declared' }
  | { readonly kind: 'not_found' };

export async function declareManuscriptExpression(input: {
  readonly livingWorkId: string;
  readonly manuscriptId: string;
  readonly memberId: string;
}): Promise<DeclareManuscriptOutcome> {
  const { livingWorkId, manuscriptId, memberId } = input;

  return transaction(async (tx): Promise<DeclareManuscriptOutcome> => {
    await holdManuscriptDeclarationShared(tx, memberId, manuscriptId);

    const work = await tx.query<{ id: string }>(
      `SELECT id FROM living_works WHERE id = $1 AND member_id = $2 FOR SHARE`,
      [livingWorkId, memberId],
    );
    if (work.rows.length === 0) return { kind: 'not_found' };

    const manuscript = await tx.query<{ id: string }>(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR SHARE`,
      [manuscriptId, memberId],
    );
    if (manuscript.rows.length === 0) return { kind: 'not_found' };

    // Declaring twice is not an error — the member is saying something already
    // true. The unique constraint absorbs it; the outcome says which happened.
    const inserted = await tx.query<DeclaredExpressionRow>(
      `INSERT INTO living_work_expressions
         (living_work_id, expression_type, expression_id, declared_by)
       VALUES ($1, 'manuscript', $2, $3)
       ON CONFLICT (living_work_id, expression_type, expression_id) DO NOTHING
       RETURNING id, expression_type, expression_id, declared_at`,
      [livingWorkId, manuscriptId, memberId],
    );
    const row = inserted.rows[0];
    return row ? { kind: 'declared', expression: row } : { kind: 'already_declared' };
  });
}
