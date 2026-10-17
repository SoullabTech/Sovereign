/**
 * Next.js may return a null pathname while route identity is unresolved.
 * That is not an authorized native route and is not a meaningful Web hatch.
 *
 * No member entitlement, Studio role or browser redirect can be inferred from
 * a missing path. An absolute, single-slash pathname is a precondition for
 * classifying a native route against the existing allowlist.
 */
export function isResolvedMobileRoutePath(pathname: string | null): pathname is string {
  return typeof pathname === 'string' &&
    pathname.startsWith('/') && !pathname.startsWith('//');
}
