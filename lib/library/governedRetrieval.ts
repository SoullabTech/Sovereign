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

export type OwnerType = 'platform' | 'practitioner' | 'member';
export type Visibility = 'private' | 'shared' | 'published';

/**
 * Visibilities a practitioner-scope object may carry. For owner self-view — the only
 * practitioner path wired (ratified 2026-06-27) — any of these admits the owner; visibility
 * becomes a gate for OTHERS only when cross-practitioner grants land (deferred). Unknown or
 * null ⇒ fail closed.
 */
export const PRACTITIONER_VISIBILITIES: ReadonlySet<string> = new Set(['private', 'shared', 'published']);

export interface GovernedItem {
  scope: Scope | string;
  ownerId?: string | null;
  /** Who authored/owns the item. For the practitioner branch this MUST be 'practitioner'. */
  ownerType?: OwnerType | string | null;
  /** private | shared | published. A known value is required for practitioner-scope admission. */
  visibility?: Visibility | string | null;
  usageAuthority?: UsageAuthority | string | null;
}

export interface RetrievalContext {
  /** The member doing the retrieving (server-derived). Undefined ⇒ anonymous ⇒ platform only. */
  viewerId?: string | null;
  /**
   * The practitioner doing the retrieving (server-derived; practitioners.id — a DISTINCT id
   * space from viewerId). Set ONLY on practitioner-facing prep/recap flows. Undefined ⇒
   * practitioner-scope items stay fail-closed, so member-facing retrieval never admits them.
   */
  practitionerId?: string | null;
  purpose: RetrievalPurpose;
}

/**
 * The governance gate. Returns whether `item` may enter retrieval for `ctx`.
 *
 * Three scopes, three authority rules over ONE substrate:
 *   • platform     — curated canon, admitted unconditionally (governed by review/visibility).
 *   • member       — private to its owner, gated by the §4 usage-authority ladder.
 *   • practitioner — private to its owning practitioner, governed by OWNERSHIP + VISIBILITY,
 *                    NOT the usage-authority ladder and NOT purpose (ratified 2026-06-27).
 *                    Self-view only; cross-practitioner sharing is deferred.
 * Anything else fails closed.
 */
export function isAdmitted(item: GovernedItem, ctx: RetrievalContext): boolean {
  if (item.scope === 'platform') return true;
  if (item.scope === 'member') {
    if (!ctx.viewerId || item.ownerId !== ctx.viewerId) return false; // privacy: own items only
    return authorityRank(item.usageAuthority) >= PURPOSE_MIN_RANK[ctx.purpose];
  }
  if (item.scope === 'practitioner') {
    // Practitioner resources: governed by ownership + visibility — no usage-authority ladder,
    // no purpose gating. The owner_type guard means a member-owned row can never enter here;
    // requiring ctx.practitionerId means member-facing retrieval (which carries none) keeps
    // practitioner rows fail-closed. No grants path ⇒ no cross-practitioner sharing.
    if (!ctx.practitionerId) return false;
    if (item.ownerType !== 'practitioner') return false;
    if (item.ownerId !== ctx.practitionerId) return false; // own items only
    return PRACTITIONER_VISIBILITIES.has((item.visibility ?? '') as string);
  }
  return false; // unknown scope — fail closed until governed
}

/**
 * SQL fragment for LibraryService.semanticSearch / fullTextSearch. Appended to
 * the existing `WHERE s.ingestion_status='completed' AND ...`. Mirrors isAdmitted()
 * exactly. Parameters are bound (no interpolation of viewer/practitioner id).
 *
 * The practitioner branch is emitted ONLY when ctx.practitionerId is set; otherwise the
 * clause and params are exactly the prior platform+member predicate — back-compatible for
 * existing member-facing callers, and practitioner rows stay fail-closed.
 *
 * @param ctx            viewer + optional practitioner + purpose
 * @param nextParamIndex the next free $N placeholder index in the caller's params array
 * @returns clause (SQL string), params (to append, in order), nextIndex (first free index after)
 */
export function authorizationPredicateSql(
  ctx: RetrievalContext,
  nextParamIndex: number,
): { clause: string; params: any[]; nextIndex: number } {
  const viewerIdx = nextParamIndex;
  const minRankIdx = nextParamIndex + 1;
  const params: any[] = [ctx.viewerId ?? null, PURPOSE_MIN_RANK[ctx.purpose]];
  let nextIndex = nextParamIndex + 2;

  // Practitioner-scope self-view: ownership + visibility, no usage-authority CASE. Emitted
  // only with a practitionerId so member-facing callers get the unchanged predicate above.
  let practitionerClause = '';
  if (ctx.practitionerId) {
    const practitionerIdx = nextIndex;
    practitionerClause = `
          OR (
            s.scope = 'practitioner'
            AND s.owner_type = 'practitioner'
            AND s.owner_id = $${practitionerIdx}
            AND s.visibility IN ('private', 'shared', 'published')
          )`;
    params.push(ctx.practitionerId);
    nextIndex += 1;
  }

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
          )${practitionerClause}
        )`;
  return { clause, params, nextIndex };
}
