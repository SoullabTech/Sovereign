import { query } from '@/lib/db/postgres';

/**
 * Build and run a parameterized UPDATE for an allowlisted set of columns.
 *
 * SAFETY: `table` and the column names (keys of `fields`) come only from the
 * route handler's own allowlist — never from request input — so they are not an
 * injection vector. Values are always parameterized.
 */
export async function updateById(
  table: string,
  id: string,
  fields: Record<string, unknown>,
  opts: { touchUpdatedAt?: boolean } = {}
): Promise<Record<string, unknown> | null> {
  const cols = Object.keys(fields);
  if (cols.length === 0) return null;

  const sets = cols.map((c, idx) => `${c} = $${idx + 1}`);
  const vals: unknown[] = cols.map((c) => fields[c]);
  if (opts.touchUpdatedAt) sets.push('updated_at = NOW()');
  vals.push(id);

  const result = await query(
    `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`,
    vals
  );
  return result.rows[0] ?? null;
}
