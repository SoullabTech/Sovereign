/**
 * Reads the authorized Work. ⛔ CALLED ONLY AFTER `may_cross`.
 *
 * The writer's selection range travels in the REQUEST — it is their act — and is
 * deliberately absent from the receipt, where an offset would be a locator.
 * *Provenance may be rendered into prose. It may never be recovered from prose.*
 */

import { query } from '@/lib/db/postgres';
import type { FocusAssembler } from './focusCrossing';

export const assembleFocus: FocusAssembler = async ({ memberId, workRef, scopeKind, sectionRef, range }) => {
  try {
    // Ownership is part of the read, not a separate check a later edit could drop.
    if (scopeKind === 'whole_work') {
      const r = await query<{ body: string }>(
        `SELECT s.body FROM manuscript_sections s
           JOIN manuscripts m ON m.id = s.manuscript_id
          WHERE s.manuscript_id = $1 AND m.user_id = $2
          ORDER BY s.position ASC`, [workRef, memberId]);
      return r.rows.length ? r.rows.map(x => x.body).join('\n\n') : null;
    }

    const r = await query<{ body: string }>(
      `SELECT s.body FROM manuscript_sections s
         JOIN manuscripts m ON m.id = s.manuscript_id
        WHERE s.manuscript_id = $1 AND m.user_id = $2 AND s.id = $3`,
      [workRef, memberId, sectionRef ?? null]);
    const body = r.rows[0]?.body;
    if (!body) return null;
    if (scopeKind === 'section') return body;

    if (!range || !Number.isFinite(range.start) || !Number.isFinite(range.end)) return null;
    const text = [...body].slice(Math.max(0, range.start), Math.max(0, range.end)).join('');
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error('[FOCUS] assembly failed', {
      memberIdPrefix: memberId.slice(0, 8),
      error: err instanceof Error ? err.message : 'unknown',
    });
    return null;
  }
};
