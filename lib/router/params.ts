/**
 * Router parameter helpers
 *
 * Safely extract route params from Next.js App Router.
 */

/**
 * Extract first value from a param that may be string | string[] | undefined
 */
export function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Require a param value, throwing if missing
 */
export function requireParam(v: string | string[] | undefined, name: string): string {
  const value = firstParam(v);
  if (!value) {
    throw new Error(`Missing required route parameter: ${name}`);
  }
  return value;
}
