/**
 * WS-DEVELOP-STUDIO — the kind of Work the WRITER declared (read side). Undeclared = null = neutral wording. Never inferred from text.
 * ⛔ Member-scoped in the SQL. A missing column (migrate-before-swap) reads as undeclared, never as an error.
 */
import { query } from '@/lib/db/postgres';

import { WORK_KINDS, type WorkKind } from './workKindShared';
export { WORK_KINDS, startersFor, type WorkKind } from './workKindShared';

export async function livingWorkKind(memberId: string, livingWorkId: string): Promise<WorkKind | null> {
  try {
    const r = await query<{ kind: string | null }>(`SELECT kind FROM living_works WHERE id = $1 AND member_id = $2`, [livingWorkId, memberId]);
    const k = r.rows[0]?.kind ?? null;
    return k && (WORK_KINDS as readonly string[]).includes(k) ? (k as WorkKind) : null;
  } catch (e) {
    if ((e as { code?: string })?.code === '42703' || (e as { code?: string })?.code === '42P01') return null;
    throw e;
  }
}

