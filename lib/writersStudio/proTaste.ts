/**
 * The taste of Pro: one complimentary whole-book editorial pass per Free writer (step C2).
 *
 * Founder rulings 2026-11-13 (docs/programme/WRITERS-STUDIO_FREE_STUDIO_STEP_C_DESIGN_2026-11-13.md §5):
 *   one pass, on a Work of their choosing; the letter is theirs forever; no timer; nothing taken away afterwards;
 *   former beta testers (anyone with dated-grant history) do not receive another.
 * Pro is never "better MAIA": the taste is the same pass Pro writers run, nothing more.
 *
 * Built dark: nothing is read or written unless WS_PRO_TASTE_ENABLED is exactly "true".
 * Lookup failures throw; callers refuse (never read an outage as "has a taste").
 */
import { query } from '@/lib/db/postgres';
import { holdsWholeWork } from '@/lib/auth/entitlements';

export function proTasteEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.WS_PRO_TASTE_ENABLED === 'true';
}

/** 'claimed_here' = the taste is claimed for THIS manuscript (and not returned) · 'available' = unclaimed · 'none'. */
export type TasteStanding = 'claimed_here' | 'available' | 'none';

/** Pure decision from the member's taste row and beta-grant history. */
export function decideTaste(input: {
  enabled: boolean;
  row: { manuscript_id: string; completed_at: Date | null; returned_at: Date | null } | null;
  hadBetaGrant: boolean;
  manuscriptId: string | null;
}): TasteStanding {
  if (!input.enabled) return 'none';
  const r = input.row;
  if (r && !r.returned_at) {
    // Claimed (in progress) or spent. Only an in-progress claim on this same manuscript still admits it.
    return !r.completed_at && input.manuscriptId !== null && r.manuscript_id === input.manuscriptId ? 'claimed_here' : 'none';
  }
  if (input.hadBetaGrant) return 'none';
  return 'available'; // never claimed, or claimed and given back
}

export async function tasteStanding(memberId: string, manuscriptId: string | null): Promise<TasteStanding> {
  if (!proTasteEnabled()) return 'none';
  const [row, grant] = await Promise.all([
    query<{ manuscript_id: string; completed_at: Date | null; returned_at: Date | null }>(
      'SELECT manuscript_id, completed_at, returned_at FROM writers_studio_pro_tastes WHERE member_id = $1', [memberId]),
    query('SELECT 1 FROM writers_studio_beta_grant_events WHERE member_id = $1 LIMIT 1', [memberId]),
  ]);
  return decideTaste({ enabled: true, row: row.rows[0] ?? null, hadBetaGrant: grant.rows.length > 0, manuscriptId });
}

/**
 * Atomically claim the taste for one manuscript. True when claimed (or already claimed for this manuscript and still in
 * progress); false when it is spent, claimed elsewhere, or the member had a beta grant. Two simultaneous claims cannot
 * both succeed (primary key + conditional upsert).
 */
export async function claimTaste(memberId: string, manuscriptId: string): Promise<boolean> {
  if (!proTasteEnabled()) return false;
  const standing = await tasteStanding(memberId, manuscriptId);
  if (standing === 'claimed_here') return true;
  if (standing !== 'available') return false;
  const r = await query(
    `INSERT INTO writers_studio_pro_tastes (member_id, manuscript_id) VALUES ($1, $2)
     ON CONFLICT (member_id) DO UPDATE
        SET manuscript_id = EXCLUDED.manuscript_id, claimed_at = now(), completed_at = NULL, returned_at = NULL
      WHERE writers_studio_pro_tastes.returned_at IS NOT NULL
     RETURNING member_id`,
    [memberId, manuscriptId],
  );
  return r.rows.length === 1;
}

/** The pass ended without a letter (failed, stopped, cancelled): give the taste back. */
export async function returnTaste(memberId: string, manuscriptId: string): Promise<void> {
  if (!proTasteEnabled()) return;
  await query(
    `UPDATE writers_studio_pro_tastes SET returned_at = now()
      WHERE member_id = $1 AND manuscript_id = $2 AND completed_at IS NULL AND returned_at IS NULL`,
    [memberId, manuscriptId],
  );
}

/** The letter was kept: the taste is spent. The letter stays the writer's, forever. */
export async function completeTaste(memberId: string, manuscriptId: string): Promise<void> {
  if (!proTasteEnabled()) return;
  await query(
    `UPDATE writers_studio_pro_tastes SET completed_at = now()
      WHERE member_id = $1 AND manuscript_id = $2 AND completed_at IS NULL AND returned_at IS NULL`,
    [memberId, manuscriptId],
  );
}

/** The whole-book pass for THIS manuscript: Pro (writing.wholeWork), or the taste claimed for this manuscript. */
export async function wholeWorkForManuscript(memberId: string, manuscriptId: string): Promise<boolean> {
  if (await holdsWholeWork(memberId)) return true;
  return (await tasteStanding(memberId, manuscriptId)) === 'claimed_here';
}
