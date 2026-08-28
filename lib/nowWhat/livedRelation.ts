/**
 * Now What? V1 — the lived return's relation (NW-V1-CLIENT-01).
 *
 * THE ONE NEW BEHAVIOR IN V1. The member chose something, lived it, came back,
 * said what happened, and kept that. What she keeps stays RELATED to the act it
 * answers. Everything else in the return loop already existed.
 *
 * It lives here rather than in the route for the reason NW-I01 extracted the
 * response grammar: a Next.js App Router `route.ts` may export only route
 * handlers, so a rule left inside one cannot be tested. A member-scoping check
 * that cannot be tested is not a boundary, it is an intention.
 *
 * ── WHAT THE RELATION IS ─────────────────────────────────────────────────
 * "The member wrote this in answer to that." One sentence, and nothing more.
 *
 * ── WHAT IT IS NOT ───────────────────────────────────────────────────────
 * Not an outcome, result, score, completion, or success/failure judgement.
 * Not a journey stage, progress state, or step in a sequence. Not an inference
 * of any kind — it exists only because the member walked back through the
 * lived doorway carrying one of her own acts and then made a keep gesture.
 * Nothing downstream may read it as progress.
 *
 * ── WHY REFUSAL IS SILENT AND TOTAL ──────────────────────────────────────
 * A false link is worse than no link: it would assert a relation between two
 * acts the member never connected, which is exactly the fabricated-authorship
 * failure the provenance architecture exists to prevent. So an id that is
 * malformed, someone else's, or released resolves to null, and the kept thread
 * simply stands alone — which is honest.
 */

import { query } from '@/lib/db/postgres';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve the prior member act a lived return is answering.
 *
 * @returns the thread id when it is THIS member's own live thread, else null.
 */
export async function resolveRespondsTo(
  memberId: string | null | undefined,
  raw: unknown,
): Promise<string | null> {
  // Anonymity is not ownership. Without an identified member there is no one
  // whose act this could be, so nothing resolves and nothing is queried.
  if (!memberId) return null;
  if (typeof raw !== 'string') return null;
  const candidate = raw.trim();
  if (!UUID_RE.test(candidate)) return null;

  try {
    // Member-scoped by construction: the member_id predicate is what makes a
    // forwarded or guessed id inert rather than a cross-member link. The
    // released_at predicate keeps a released act from being silently revived
    // as the anchor of a new one.
    const res = await query<{ id: string }>(
      `SELECT id FROM member_field_note_threads
        WHERE id = $1 AND member_id = $2 AND released_at IS NULL
        LIMIT 1`,
      [candidate, memberId],
    );
    return res.rows[0]?.id ?? null;
  } catch (err) {
    // Non-fatal: a relation is provenance, never a precondition for the member
    // keeping her own words. Losing the link is survivable; losing her keep is not.
    console.warn('[NowWhat/field-note] responds-to resolution failed (non-fatal):', err);
    return null;
  }
}
