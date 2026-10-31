/**
 * AUTH-RETURN-01 — request-origin and return-destination authority.
 *
 * A browser-supplied destination is a suggestion, never a redirect authority.
 * Mutating authentication routes also require a same-origin browser request.
 * Native/server callers that do not send Origin remain admissible unless the
 * Fetch Metadata header explicitly says the request is cross-site.
 */

export interface HeaderReader {
  get(name: string): string | null;
}

export interface AuthRequestLike {
  headers: HeaderReader;
  nextUrl?: { origin: string };
  url?: string;
}

export class AuthOriginError extends Error {
  readonly code = 'AUTH_ORIGIN_REFUSED';

  constructor(message = 'Authentication request origin was refused') {
    super(message);
    this.name = 'AuthOriginError';
  }
}

function configuredOrigins(): ReadonlySet<string> {
  const configured = (process.env.AUTH_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set(configured.flatMap((value) => {
    try {
      return [new URL(value).origin];
    } catch {
      return [];
    }
  }));
}

export function requestOrigin(request: AuthRequestLike): string | null {
  if (request.nextUrl?.origin) return request.nextUrl.origin;
  if (!request.url) return null;
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

export function isSameOriginAuthMutation(request: AuthRequestLike): boolean {
  const site = request.headers.get('sec-fetch-site')?.toLowerCase();
  if (site === 'cross-site') return false;

  const originHeader = request.headers.get('origin');
  if (!originHeader || originHeader === 'null') {
    // Native applications and server-to-server witnesses do not always send an
    // Origin header. Their absence is not converted into browser authority; a
    // Fetch Metadata declaration of cross-site was already refused above.
    return originHeader !== 'null';
  }

  let supplied: string;
  try {
    supplied = new URL(originHeader).origin;
  } catch {
    return false;
  }

  const expected = requestOrigin(request);
  if (expected && supplied === expected) return true;
  const allowed = configuredOrigins();
  if (allowed.has(supplied)) return true;
  warnIfOriginsUnconfigured(allowed.size, supplied, expected);
  return false;
}

let warnedUnconfigured = false;

/**
 * Behind a reverse proxy the framework's own origin is the container address,
 * so a correct browser request is refused unless AUTH_ALLOWED_ORIGINS names the
 * public origin. Say so once, naming only origins (never headers or bodies).
 */
function warnIfOriginsUnconfigured(configuredCount: number, supplied: string, expected: string | null): void {
  if (configuredCount > 0 || warnedUnconfigured || process.env.NODE_ENV !== 'production') return;
  warnedUnconfigured = true;
  console.warn(
    `[auth] same-origin check refused Origin ${supplied} (expected ${expected ?? 'unknown'}) and AUTH_ALLOWED_ORIGINS is unset. ` +
      'Behind a proxy, set AUTH_ALLOWED_ORIGINS to the public origin(s), comma-separated.',
  );
}

/** Test seam: reset the once-only warning latch. */
export function resetOriginWarningForTests(): void {
  warnedUnconfigured = false;
}

export function requireSameOriginAuthMutation(request: AuthRequestLike): void {
  if (!isSameOriginAuthMutation(request)) throw new AuthOriginError();
}

function safeReturnDestination(candidate: unknown): string | null {
  if (typeof candidate !== 'string') return null;
  if (candidate.includes('\\') || /[\u0000-\u001f\u007f]/.test(candidate)) return null;
  const value = candidate.trim();
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  // Encoded leading separators can become a scheme-relative URL after decoding.
  if (/^\/%(?:2f|5c|25)/i.test(value)) return null;
  try {
    const base = new URL('https://return.soullab.invalid');
    const parsed = new URL(value, base);
    if (parsed.origin !== base.origin || parsed.username || parsed.password) return null;
    // Dot-segment normalization can expose a leading separator; check again.
    if (parsed.pathname.startsWith('//') || /^\/%(?:2f|5c|25)/i.test(parsed.pathname)) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function normalizeReturnDestination(candidate: unknown, fallback = '/home'): string {
  return safeReturnDestination(candidate) ?? safeReturnDestination(fallback) ?? '/home';
}
