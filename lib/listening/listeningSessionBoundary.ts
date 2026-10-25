/**
 * LISTEN-41 browser-web admission policy.
 *
 * This module is deliberately pure so route and response parsing can be
 * reviewed without mounting React, opening audio, or contacting a server.
 */
export const ONLINE_LISTENING_ROUTE_PREFIXES = [
  '/listen',
  '/home',
  '/house',
  '/maia',
  '/writers-studio',
  '/journal',
  '/astrology',
] as const;

const MEMBER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isOnlineListeningRoute(pathname: string | null | undefined): boolean {
  if (!pathname || pathname[0] !== '/') return false;
  return ONLINE_LISTENING_ROUTE_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Consume only the minimum identity receipt needed by the transport.
 * The endpoint may return additional profile-adjacent fields for existing
 * callers; the listening boundary deliberately ignores them.
 */
export function verifiedListeningMemberKey(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const session = payload as { authenticated?: unknown; member?: unknown };
  if (session.authenticated !== true || !session.member || typeof session.member !== 'object')
    return null;
  const id = (session.member as { id?: unknown }).id;
  if (typeof id !== 'string') return null;
  const normalized = id.trim().toLowerCase();
  return MEMBER_UUID.test(normalized) ? normalized : null;
}
