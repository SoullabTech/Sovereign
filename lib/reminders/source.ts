/**
 * Creation-time source validation for SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * Two gates, both fail-closed.
 *
 * OWNERSHIP — a member may only schedule the return of their OWN material. The
 * member id comes from the verified session, never from the request body, so a
 * caller cannot name someone else's atom.
 *
 * SACRED_PROTECTED — an atom carrying the 'sacred_protected' register is
 * excluded from ambient recall by refusal R04. Scheduling one into the member's
 * inbox would route around that exclusion through a different door, so creation
 * is refused with the same SQL-level predicate idiom R04 uses. Spec §6.6.
 *
 * SANCTUARY — deliberately NOT checked here, and that is correct rather than an
 * omission. Sanctuary is enforced at the WRITE boundary
 * (lib/sanctuary/turnPosture.ts contentWritable(), refusal R21): sanctuary
 * content never becomes an atom or an anchor at all. A row existing in these
 * tables is already proof of non-sanctuary origin, and a redundant flag check
 * here would imply a guarantee this unit does not itself provide. For
 * 'member_note' the member types their own words — an authored act, not an
 * extraction; detecting whether they re-typed something from a sanctuary
 * session would require reading sanctuary, which is itself the violation.
 */

import { query } from '@/lib/db/postgres';
import type { ReminderSourceType } from './types';

export type SourceCheck =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404; error: string };

export async function verifyReminderSource(
  memberId: string,
  sourceType: ReminderSourceType,
  sourceId: string | null,
): Promise<SourceCheck> {
  if (sourceType === 'member_note') {
    if (sourceId) {
      return { ok: false, status: 400, error: 'member_note carries no source id' };
    }
    return { ok: true };
  }

  if (!sourceId) {
    return { ok: false, status: 400, error: 'sourceId required for this source type' };
  }

  if (sourceType === 'memory_atom') {
    // Ownership AND the sacred_protected exclusion in ONE predicate, so a row
    // that is sacred_protected is indistinguishable from one that does not
    // exist. The refusal reveals nothing about which case occurred.
    const res = await query<{ id: string }>(
      `SELECT id
         FROM member_memory_atoms
        WHERE id = $1
          AND member_id = $2
          AND NOT ('sacred_protected' = ANY(registers))
        LIMIT 1`,
      [sourceId, memberId],
    );
    if (res.rows.length === 0) {
      return { ok: false, status: 404, error: 'Source not available' };
    }
    return { ok: true };
  }

  const res = await query<{ id: string }>(
    `SELECT id FROM member_daily_anchors WHERE id = $1 AND member_id = $2 LIMIT 1`,
    [sourceId, memberId],
  );
  if (res.rows.length === 0) {
    return { ok: false, status: 404, error: 'Source not available' };
  }
  return { ok: true };
}
