/**
 * Reads the authorized Work. ⛔ CALLED ONLY AFTER `may_cross`.
 *
 * The writer's selection range travels in the REQUEST — it is their act — and is
 * deliberately absent from the receipt, where an offset would be a locator.
 * *Provenance may be rendered into prose. It may never be recovered from prose.*
 */

import { query } from '@/lib/db/postgres';
import { memberRef } from '@/lib/privacy/memberRef';
import type { FocusAssembler } from './focusCrossing';
import { loaded, materializationFailed, invariantFailed } from './focusMaterialization';

export const assembleFocus: FocusAssembler = async ({ scope, scopeKind, sectionRef, range }) => {
  /* ⭐ Identifiers DERIVED FROM AN ALREADY-BOUND SCOPE (A1 use law). They cannot
     establish authority themselves; the scope already did. */
  const { memberId, workRef } = scope;

  /* ⭐ BW-03 REPAIR (authorized after the known-bad run). The join was
     `manuscripts m … m.user_id` — a table and a column that exist nowhere in
     `database/migrations/`. `manuscript_sections.manuscript_id` references
     `member_manuscripts(id)`, whose owner column is `member_id`. The old query
     threw on every call and the throw became `null`, so an authorized focus was
     reported as nothing-there for the life of the feature (BW-01R · W7).
     ⛔ The repair is NOT what makes this safe — the classification below is.
     A wrong query can no longer impersonate a truthful answer. */

  /* ⛔ BW-03 · NO BLANKET CATCH. The previous shape swallowed every error into
     `null`, which is how W7 — a JOIN on a table that does not exist — presented
     for the life of the feature as "there is nothing here". Each failure is now
     classified at the stage it occurred. */
  let rows: { body: string }[];
  try {
    if (scopeKind === 'whole_work') {
      const r = await query<{ body: string }>(
        `SELECT s.body FROM manuscript_sections s
           JOIN member_manuscripts m ON m.id = s.manuscript_id
          WHERE s.manuscript_id = $1 AND m.member_id = $2
          ORDER BY s.position ASC`, [workRef, memberId]);
      rows = r.rows;
    } else {
      const r = await query<{ body: string }>(
        `SELECT s.body FROM manuscript_sections s
           JOIN member_manuscripts m ON m.id = s.manuscript_id
          WHERE s.manuscript_id = $1 AND m.member_id = $2 AND s.id = $3`,
        [workRef, memberId, sectionRef ?? null]);
      rows = r.rows;
    }
  } catch (err) {
    /* ⛔ The operator gets the exact fault; the writer never does. */
    console.error('[FOCUS] materialization failed', {
      memberRef: memberRef(memberId), scopeKind,
      error: err instanceof Error ? err.message : 'unknown',
    });
    return materializationFailed('query', err);
  }

  if (scopeKind === 'whole_work') return loaded(rows.map((x) => x.body).join('\n\n'));

  const body = rows[0]?.body;
  if (body === undefined) return { kind: 'empty' };
  if (scopeKind === 'section') return loaded(body);

  if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end)) {
    /* A passage scope with no usable range is a contract violation by the
       caller, not a database fault — and never a claim that the Work is empty. */
    return invariantFailed('range', `passage scope with unusable range ${JSON.stringify(range ?? null)}`);
  }
  return loaded([...body].slice(Math.max(0, range.start), Math.max(0, range.end)).join(''));
};
