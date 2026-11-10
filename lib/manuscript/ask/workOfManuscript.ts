/**
 * The ONE lookup of the Living Work the member declared over a manuscript. Deterministic: a manuscript declared in more than one Work resolves to the
 * earliest declaration every time, so a grant, a revoke, a decision and an Ask can never land on different Works (independent review, 2026-11-08).
 * ⛔ Member-scoped in the SQL.
 */
import { query } from '@/lib/db/postgres';

export async function livingWorkIdForManuscript(manuscriptId: string, memberId: string): Promise<string | null> {
  const r = await query<{ living_work_id: string }>(
    `SELECT e.living_work_id
       FROM living_work_expressions e
       JOIN member_manuscripts m ON m.id = e.expression_id
      WHERE e.expression_type = 'manuscript' AND e.expression_id = $1 AND m.member_id = $2
      ORDER BY e.declared_at ASC, e.id ASC
      LIMIT 1`, [manuscriptId, memberId]);
  return r.rows[0]?.living_work_id ?? null;
}
