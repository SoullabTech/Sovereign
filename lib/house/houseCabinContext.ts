/**
 * HOUSE-CABIN-CONTEXT-SPINE-01
 *
 * The House is not a FacetCrossing endpoint. This is therefore an arrival
 * context contract, not a second crossing registry.
 *
 * The contract carries only context that the source surface is actually
 * authorized to establish. The destination remains responsible for resolving
 * its own local identity and ambiguity.
 *
 * Current supported continuity:
 *   House -> Writer's Studio: explicit Work identity only.
 *
 * Deliberately absent:
 *   - member id (destination already has authenticated identity)
 *   - manuscript id (Studio owns manuscript resolution)
 *   - inferred question, memory, relationship, or interpretation
 *   - opaque serialized context blobs in the URL
 *
 * This makes the contract portable for a future Cabin package while keeping
 * the online platform's existing local laws authoritative.
 */

export const HOUSE_CONTEXT_SCHEMA = 'soullab.house-context.v1' as const;

export type HouseContextDestination =
  | 'writers-studio'
  | 'maia'
  | 'living-field';

export interface HouseWorkContext {
  id: string;
  authority: 'member_explicit';
}

export interface HouseContinuityContext {
  schema: typeof HOUSE_CONTEXT_SCHEMA;
  source: {
    kind: 'house';
    returnHref: '/house';
  };
  destination: HouseContextDestination;
  work: HouseWorkContext | null;
}

export function houseContinuityContext(
  destination: HouseContextDestination,
  workId?: string | null,
): HouseContinuityContext {
  return {
    schema: HOUSE_CONTEXT_SCHEMA,
    source: {
      kind: 'house',
      returnHref: '/house',
    },
    destination,
    work: workId
      ? {
          id: workId,
          authority: 'member_explicit',
        }
      : null,
  };
}

/**
 * The URL carries only the explicit Work identity. It never carries a
 * manuscript identity because the Studio must establish that locally.
 */
export function houseWriterStudioHref(workId: string): string {
  const params = new URLSearchParams({
    from: 'house',
    work: workId,
  });
  return '/writers-studio?' + params.toString();
}

/**
 * Portable JSON representation for a future local Cabin package.
 *
 * This is intentionally ordinary JSON rather than an opaque token so the
 * package remains inspectable, migratable, and versionable across runtimes.
 */
export function serializeHouseContinuity(
  context: HouseContinuityContext,
): string {
  return JSON.stringify(context);
}

export function parseHouseContinuity(
  serialized: string,
): HouseContinuityContext | null {
  try {
    const value: unknown = JSON.parse(serialized);
    if (!value || typeof value !== 'object') return null;

    const candidate = value as Record<string, unknown>;
    if (candidate.schema !== HOUSE_CONTEXT_SCHEMA) return null;

    const source = candidate.source;
    if (!source || typeof source !== 'object') return null;
    const sourceRecord = source as Record<string, unknown>;
    if (
      sourceRecord.kind !== 'house' ||
      sourceRecord.returnHref !== '/house'
    ) {
      return null;
    }

    const destination = candidate.destination;
    if (
      destination !== 'writers-studio' &&
      destination !== 'maia' &&
      destination !== 'living-field'
    ) {
      return null;
    }

    const work = candidate.work;
    if (work === null) {
      return {
        schema: HOUSE_CONTEXT_SCHEMA,
        source: { kind: 'house', returnHref: '/house' },
        destination,
        work: null,
      };
    }

    if (!work || typeof work !== 'object') return null;
    const workRecord = work as Record<string, unknown>;
    if (
      typeof workRecord.id !== 'string' ||
      workRecord.id.length === 0 ||
      workRecord.authority !== 'member_explicit'
    ) {
      return null;
    }

    return {
      schema: HOUSE_CONTEXT_SCHEMA,
      source: { kind: 'house', returnHref: '/house' },
      destination,
      work: {
        id: workRecord.id,
        authority: 'member_explicit',
      },
    };
  } catch {
    return null;
  }
}
