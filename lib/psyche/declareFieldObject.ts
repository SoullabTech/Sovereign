/**
 * Declaration: a reviewed capsule becomes an enduring Field Object.
 *
 * Governed by `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`.
 *
 * ── The ruling this implements ───────────────────────────────────────────
 * A capsule is a *developed conversational artifact*. A Field Object (a Keep
 * atom) is an *enduring member insight*. They are different records with
 * different lifetimes, and one does not become the other by accident:
 *
 *   > Capsule → Field Object promotion is an explicit member act.
 *
 * Nothing in the capture path calls this. Distilling a conversation, saving a
 * capsule, editing it, or bringing it into the Lab all leave the Field
 * untouched. Only a member choosing "Keep in my Field" reaches here. There is
 * no backfill and no trigger — historical capsules stay capsules until their
 * owner says otherwise.
 *
 * ── Why the atom carries the summary in `body` ───────────────────────────
 * Sourced atoms usually leave `body` NULL and let the source row hold the
 * detail. Keep is the exception, and deliberately so: the Workbench Keep
 * adapter (`lib/workbench/sources/keep.ts`) resolves card content from the
 * atom itself, because for Keeps "the atom IS the object the gesture created".
 * A NULL body would put a blank card on the Shelf. The text written here is
 * the member's own reviewed summary — copied, never inferred — and provenance
 * back to the capsule is preserved in (source_type, source_id).
 *
 * ── Idempotency ──────────────────────────────────────────────────────────
 * Declaring twice returns the first atom. Two layers hold that: a pre-read on
 * (member_id, 'reflection', capsuleId), and — for the concurrent case that
 * slips past it — the unique index `idx_memory_atoms_unique_source`, whose
 * 23505 is caught and resolved to the winning row. A member who taps twice, or
 * retries on a flaky connection, ends up with exactly one Field Object.
 */

import { getCapsuleById } from '@/lib/capsules';
import { getAtomBySource, keepSource } from '@/lib/psyche/portfolio';
import type { CrystallizedMemory } from '@/lib/psyche/types';

/** Capsules enter the Field as `reflection`-sourced atoms. */
const CAPSULE_SOURCE_TYPE = 'reflection' as const;

export interface DeclarationResult {
  atom: CrystallizedMemory;
  /** false when the capsule was already a Field Object — not an error. */
  created: boolean;
}

/**
 * Compose the atom's body from the member's reviewed capsule.
 *
 * Summary first, then any gold lines as quoted lines. Both are the member's
 * material as it stood at declaration time; nothing is summarized again.
 */
function composeBody(summary: string, goldLines: { text: string }[]): string | null {
  const parts: string[] = [];
  const trimmedSummary = summary?.trim();
  if (trimmedSummary) parts.push(trimmedSummary);

  const quotes = goldLines
    .map((gl) => gl.text?.trim())
    .filter((t): t is string => Boolean(t))
    .map((t) => `"${t}"`);
  if (quotes.length > 0) parts.push(quotes.join('\n'));

  const body = parts.join('\n\n');
  return body.length > 0 ? body : null;
}

/**
 * The declaration act.
 *
 * Returns `null` when the capsule does not exist or does not belong to this
 * member — the caller renders that as 404, never as "created". The capsule is
 * read but never mutated: it stays intact and distinct after the declaration.
 */
export async function declareCapsuleAsFieldObject(
  memberId: string,
  capsuleId: string,
): Promise<DeclarationResult | null> {
  // Ownership is established against the capsule's own table, not the request.
  const capsule = await getCapsuleById({ userId: memberId, capsuleId });
  if (!capsule) return null;

  const existing = await getAtomBySource(memberId, CAPSULE_SOURCE_TYPE, capsuleId);
  if (existing) return { atom: existing, created: false };

  const title = capsule.title?.trim() || 'Kept from a conversation';

  try {
    const atom = await keepSource(memberId, {
      memberId,
      sourceType: CAPSULE_SOURCE_TYPE,
      sourceId: capsuleId,
      title,
      body: composeBody(capsule.summary, capsule.goldLines),
    });
    return { atom, created: true };
  } catch (err: unknown) {
    // 23505 = the unique-source index fired: a concurrent declaration won.
    // Return that atom rather than surfacing a conflict the member did not make.
    if ((err as { code?: string })?.code === '23505') {
      const raced = await getAtomBySource(memberId, CAPSULE_SOURCE_TYPE, capsuleId);
      if (raced) return { atom: raced, created: false };
    }
    throw err;
  }
}

/**
 * Read-only: is this capsule already a Field Object?
 *
 * Lets a review surface show the declaration's standing without performing it.
 */
export async function getCapsuleFieldObject(
  memberId: string,
  capsuleId: string,
): Promise<CrystallizedMemory | null> {
  return getAtomBySource(memberId, CAPSULE_SOURCE_TYPE, capsuleId);
}
