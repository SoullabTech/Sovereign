/**
 * Governed Retrieval — Personal Wisdom Library increment 1
 *
 * The constitutional core: retrieval admits items by AUTHORITY FIRST, then ranks
 * by similarity. This is the inversion that separates a Personal Wisdom Library
 * from naïve RAG — a more-similar item the member marked `store_only` must never
 * beat an admitted `use_in_guidance` item, because it was never admitted.
 *
 * Usage authority is the §4 monotonic ladder of MAIA's INITIATIVE:
 *   store_only(0) < only_when_i_ask(1) < reflect_with_me(2) < use_in_guidance(3)
 * Each retrieval PURPOSE entails a minimum initiative; an item is admitted when
 * its granted authority meets or exceeds it:
 *   guidance (proactive, directive)     → min 3  → only use_in_guidance
 *   reflection (proactive mirror)        → min 2  → reflect, use_in_guidance
 *   explicit_recall (member asked)       → min 1  → everything but store_only
 *
 * Note the asymmetry that satisfies the spec's intent: a `reflect_with_me` item is never
 * *proactively* used in guidance, but DOES surface when the member explicitly
 * asks for it (their own authority). `only_when_i_ask` surfaces ONLY on explicit
 * recall. `store_only` never surfaces through any retrieval.
 *
 * Pure module — no DB, no app imports — so it is unit-testable in isolation and
 * also emits the exact SQL fragment LibraryService appends to its WHERE clause.
 *
 * Architecture: docs/architecture/PERSONAL_WISDOM_LIBRARY.md §4
 * Spec:         docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md §4
 */

export type Scope = 'platform' | 'practitioner' | 'member';
export type UsageAuthority = 'store_only' | 'only_when_i_ask' | 'reflect_with_me' | 'use_in_guidance';
export type RetrievalPurpose = 'guidance' | 'explicit_recall' | 'reflection';

/** Default usage authority for a freshly kept item (impl §5). Low end of the ladder. */
export const DEFAULT_USAGE_AUTHORITY: UsageAuthority = 'only_when_i_ask';

/** Initiative rank of each authority level. Unknown / null / store_only → 0 (never admitted). */
export const AUTHORITY_RANK: Record<UsageAuthority, number> = {
  store_only: 0,
  only_when_i_ask: 1,
  reflect_with_me: 2,
  use_in_guidance: 3,
};

/** Minimum initiative each retrieval purpose entails. */
export const PURPOSE_MIN_RANK: Record<RetrievalPurpose, number> = {
  explicit_recall: 1,
  reflection: 2,
  guidance: 3,
};

export function authorityRank(authority?: string | null): number {
  return AUTHORITY_RANK[(authority ?? '') as UsageAuthority] ?? 0;
}

export interface GovernedItem {
  scope: Scope | string;
  ownerId?: string | null;
  usageAuthority?: UsageAuthority | string | null;
}

export interface RetrievalContext {
  /** The member doing the retrieving (server-derived). Undefined ⇒ anonymous ⇒ platform only. */
  viewerId?: string | null;
  purpose: RetrievalPurpose;
}

/**
 * The governance gate. Returns whether `item` may enter retrieval for `ctx`.
 * Platform scope is admitted unconditionally (it is curated canon, governed by
 * review/visibility, not by member usage-authority). Practitioner scope is
 * deferred → fail-closed. Member scope is private to its owner and gated by the
 * authority ladder.
 */
export function isAdmitted(item: GovernedItem, ctx: RetrievalContext): boolean {
  if (item.scope === 'platform') return true;
  if (item.scope === 'member') {
    if (!ctx.viewerId || item.ownerId !== ctx.viewerId) return false; // privacy: own items only
    return authorityRank(item.usageAuthority) >= PURPOSE_MIN_RANK[ctx.purpose];
  }
  return false; // practitioner (and anything unknown) — fail closed until governed
}

/**
 * SQL fragment for LibraryService.semanticSearch / fullTextSearch. Appended to
 * the existing `WHERE s.ingestion_status='completed' AND ...`. Mirrors isAdmitted()
 * exactly. Parameters are bound (no interpolation of viewer id).
 *
 * @param ctx            viewer + purpose
 * @param nextParamIndex the next free $N placeholder index in the caller's params array
 * @returns clause (SQL string), params (to append, in order), nextIndex (first free index after)
 */
export function authorizationPredicateSql(
  ctx: RetrievalContext,
  nextParamIndex: number,
): { clause: string; params: any[]; nextIndex: number } {
  const viewerIdx = nextParamIndex;
  const minRankIdx = nextParamIndex + 1;
  const clause = `
        AND (
          s.scope = 'platform'
          OR (
            s.scope = 'member'
            AND s.owner_id = $${viewerIdx}
            AND (CASE s.usage_authority
                   WHEN 'use_in_guidance' THEN 3
                   WHEN 'reflect_with_me' THEN 2
                   WHEN 'only_when_i_ask' THEN 1
                   ELSE 0
                 END) >= $${minRankIdx}
          )
        )`;
  return {
    clause,
    params: [ctx.viewerId ?? null, PURPOSE_MIN_RANK[ctx.purpose]],
    nextIndex: nextParamIndex + 2,
  };
}
