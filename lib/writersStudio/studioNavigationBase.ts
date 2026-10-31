/**
 * Canonical Writer navigation normally converges on `/writers-studio`.
 *
 * Founder-local review is deliberately different: it runs on a loopback-only
 * dev route with a process-scoped capability. Leaving that route would discard
 * the bounded authority and send the ephemeral manuscript into normal account
 * admission. Keep the current dev Writer pathname only while the explicit
 * local-review query is present; every ordinary session uses the canonical URL.
 */
export function studioNavigationBase(
  pathname: string | null | undefined,
  localReview: boolean,
): string {
  if (localReview && pathname?.startsWith('/dev/writers-studio')) return pathname;
  return '/writers-studio';
}
