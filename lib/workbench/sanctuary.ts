/**
 * Uniform Sanctuary check for the Workbench.
 *
 * Spec invariant: Sanctuary captures cannot enter the Workbench (Spec §4.1, §5.3).
 * This check is the belt-and-suspenders layer — adapters apply Sanctuary filtering
 * inside their search queries, and this helper guards individual resolve() calls
 * for any code path that fetches a single ref.
 *
 * Slice 1: only the `uploaded` source is implemented. Slice 3 adds the other
 * source-specific sanctuary checks (each capture surface has its own model for
 * marking sessions/items as Sanctuary).
 */

import { query } from '@/lib/db/postgres';
import type { WorkbenchSourceKind } from './sources/types';

export async function isSanctuary(
  source: WorkbenchSourceKind,
  ref: string,
): Promise<boolean> {
  if (source === 'uploaded') {
    const result = await query<{ sanctuary: boolean }>(
      'SELECT sanctuary FROM workbench_uploads WHERE id = $1',
      [ref],
    );
    return result.rows[0]?.sanctuary ?? false;
  }

  // Slice 3 sources not yet wired. Returning false here is safe because
  // adapters for those sources do not exist yet — there is no path that
  // can reach this branch in Slice 1.
  return false;
}
