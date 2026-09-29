/**
 * WS-CONVERGENCE-01 / C3 — canonical Writer's Studio route compatibility.
 *
 * Pure navigation grammar only. No redirect is mounted by this module.
 *
 * The unified host will live at /writers-studio. Existing route identities are
 * reconciled here before any public route can be promoted.
 */

export const CANONICAL_STUDIO_PATH = '/writers-studio';

export type CanonicalStudioMode = 'home' | 'write' | 'develop' | 'review';

export type CanonicalRouteDecision =
  | {
      kind: 'canonical';
      href: string;
      mode: CanonicalStudioMode;
      from: string;
    }
  | {
      kind: 'retain-legacy';
      href: string;
      reason:
        | 'structure-proposal-review-is-not-saved-review'
        | 'canvas-has-distinct-semantics'
        | 'source-intake-is-auxiliary';
    }
  | {
      kind: 'outside-studio';
      href: string;
    };

function searchOf(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

function hrefFor(mode: CanonicalStudioMode, search: string): string {
  const query = searchOf(search);
  query.set('mode', mode);
  const encoded = query.toString();
  return encoded ? CANONICAL_STUDIO_PATH + '?' + encoded : CANONICAL_STUDIO_PATH;
}

/**
 * Translate only routes whose meaning is already equivalent.
 *
 * /writers-studio/review?m=...&p=... is the historical structure-proposal
 * review instrument. A proposal id "p" is not a saved Review run identity and
 * must never be silently reinterpreted as one.
 *
 * Canvas remains a distinct historical surface until separately retired.
 * Source Intake is auxiliary material custody, not a primary Studio mode.
 */
export function canonicalStudioRoute(
  pathname: string,
  search: string,
): CanonicalRouteDecision {
  if (pathname === CANONICAL_STUDIO_PATH) {
    const query = searchOf(search);
    const requested = query.get('mode');
    const mode: CanonicalStudioMode =
      requested === 'write' || requested === 'develop' || requested === 'review'
        ? requested
        : 'home';
    return {
      kind: 'canonical',
      href: hrefFor(mode, search),
      mode,
      from: pathname,
    };
  }

  if (pathname === '/writers-studio/rebuild') {
    return {
      kind: 'canonical',
      href: hrefFor('write', search),
      mode: 'write',
      from: pathname,
    };
  }

  if (pathname === '/writers-studio/develop') {
    return {
      kind: 'canonical',
      href: hrefFor('develop', search),
      mode: 'develop',
      from: pathname,
    };
  }

  if (pathname === '/writers-studio/review') {
    return {
      kind: 'retain-legacy',
      href: pathname + search,
      reason: 'structure-proposal-review-is-not-saved-review',
    };
  }

  if (pathname === '/writers-studio/canvas') {
    return {
      kind: 'retain-legacy',
      href: pathname + search,
      reason: 'canvas-has-distinct-semantics',
    };
  }

  if (pathname === '/writers-studio/sources') {
    return {
      kind: 'retain-legacy',
      href: pathname + search,
      reason: 'source-intake-is-auxiliary',
    };
  }

  return { kind: 'outside-studio', href: pathname + search };
}
