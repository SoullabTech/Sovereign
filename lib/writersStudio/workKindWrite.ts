/** The ONLY writer of `living_works.kind`: the writer's own gesture. Ownership proven in the SQL. Not imported by the Ask route. */
import { query } from '@/lib/db/postgres';
import type { WorkKind } from './workKind';

/** `null` returns the Work to undeclared ("not now"). */
export async function declareWorkKind(memberId: string, livingWorkId: string, kind: WorkKind | null): Promise<boolean> {
  const r = await query<{ id: string }>(`UPDATE living_works SET kind = $3 WHERE id = $1 AND member_id = $2 RETURNING id`, [livingWorkId, memberId, kind]);
  return r.rows.length === 1;
}
