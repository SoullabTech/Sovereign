/**
 * Direct Recall Resolver — public entry points.
 *
 * Spec: docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md
 *
 *   locateMemoryObjects(memberId, query, context)  → MemoryObjectRef[]
 *   materializeMemoryObject(memberId, ref, context) → MaterializedMemoryObject | null
 *
 * Headless and read-only. No conversational wiring, no prompt influence, no
 * writes. Gated behind DIRECT_RECALL_ENABLED (default OFF) and disabled entirely
 * during Sanctuary sessions.
 *
 * Do not teach MAIA to sound like it can retrieve. Give it a retrieval verb.
 */

import { ADAPTERS, validateAdapters } from './adapters';
import type { MaterializedMemoryObject, MemoryObjectRef, RecallContext } from './types';

// Invariant #1: refuse to operate with an adapter that lacks owner-scoping.
validateAdapters();

/** Feature flag — default OFF. Read-only either way. */
export function isDirectRecallEnabled(): boolean {
  const v = process.env.DIRECT_RECALL_ENABLED;
  return v === '1' || v === 'true';
}

/**
 * Direct recall: the member explicitly asks for something they saved. Federates
 * across all eligible member-owned sources and returns provenance-aware refs
 * (title/excerpt only — never full content). Sorted by confidence, then recency.
 */
export async function locateMemoryObjects(
  memberId: string,
  query: string,
  context: RecallContext = {},
): Promise<MemoryObjectRef[]> {
  if (!isDirectRecallEnabled()) return [];
  if (!memberId || !query || !query.trim()) return [];
  // Mirror the route's MemoryBundle skip: no recall during a Sanctuary session.
  if (context.isSanctuary) return [];

  const perSource = await Promise.all(
    ADAPTERS.map((a) =>
      a.locate(memberId, query, context).catch((err) => {
        console.warn(
          `[DirectRecall] adapter "${a.source}" locate failed:`,
          err instanceof Error ? err.message : String(err),
        );
        return [] as MemoryObjectRef[];
      }),
    ),
  );

  const flat = perSource.flat();
  flat.sort(
    (a, b) => b.confidence - a.confidence || b.createdAt.getTime() - a.createdAt.getTime(),
  );
  return flat;
}

/**
 * Materialize the actual object the member chose. Ownership is re-checked here
 * AND inside the adapter SQL (defense in depth). Returns null if the ref is not
 * owned by `memberId`, is ineligible, or no longer exists.
 */
export async function materializeMemoryObject(
  memberId: string,
  ref: MemoryObjectRef,
  context: RecallContext = {},
): Promise<MaterializedMemoryObject | null> {
  if (!isDirectRecallEnabled()) return null;
  if (!memberId || !ref) return null;
  if (ref.memberId !== memberId) return null; // ownership re-check (cross-member guard)
  if (context.isSanctuary) return null;

  const adapter = ADAPTERS.find((a) => a.source === ref.source);
  if (!adapter) return null;

  try {
    return await adapter.materialize(memberId, ref);
  } catch (err) {
    console.warn(
      `[DirectRecall] adapter "${ref.source}" materialize failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}
