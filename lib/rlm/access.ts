/**
 * RLM Access Guard
 *
 * Shared access control for RLM endpoints.
 * Dev: always allowed
 * Prod: requires RLM_ENABLED=1 and valid x-rlm-key header
 */

export function isRlmAllowed(req: Request): boolean {
  // Dev: always on
  if (process.env.NODE_ENV !== 'production') return true;

  // Prod: require explicit enable + key
  if (process.env.RLM_ENABLED !== '1') return false;

  const expected = process.env.RLM_DEVTOOLS_KEY;
  if (!expected) return false;

  const got = req.headers.get('x-rlm-key');
  return Boolean(got && got === expected);
}
