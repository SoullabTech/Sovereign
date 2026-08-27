/**
 * AUTH-BOUNDARY-01B — Signed Access Context.
 *
 * WHAT THIS IS FOR.
 *
 * `middleware.ts` runs on the Edge runtime and cannot reach Postgres, so it
 * cannot validate a session token against `auth_sessions`. Until now it took
 * roles and tier from the `maia_roles` / `maia_tier` cookies. AUTH-BOUNDARY-01A
 * removed the *header* sources; the cookies remained, and a cookie is
 * server-ISSUED but not server-VERIFIED on arrival. `httpOnly` constrains
 * browser JS, not a non-browser client sending its own `Cookie:` line — so
 * `Cookie: maia_roles=["admin"]` still satisfied every `rolesAnyOf` gate.
 *
 * This module closes that: the server signs a minimal context at login, and
 * middleware verifies the signature with Web Crypto before believing any of it.
 *
 * WHAT THIS IS NOT.
 *
 * It is NOT a replacement for the session record. It is an Edge-verifiable
 * assertion *derived from* authoritative session/member data at issue time. The
 * canonical resolver (`lib/auth/getMemberFromRequest.ts`) still validates
 * against `auth_sessions` for anything that matters. A signed context proves
 * "the server said this at time T and it has not been altered" — not "this
 * session is still live." That is why `exp` is short relative to the session.
 *
 * REVOCATION IS THE KNOWN LIMIT, named rather than hidden: a context signed
 * before a role was removed or a session was revoked stays cryptographically
 * valid until `exp`. Route handlers that must not honour a stale role re-derive
 * from the database; they do not read this.
 *
 * Runtime: uses `globalThis.crypto.subtle`, present in both the Edge runtime and
 * Node 18+, so one implementation serves issuance (Node route handlers) and
 * verification (Edge middleware).
 */

export const ACCESS_CONTEXT_COOKIE = 'maia_ctx';

/** Bumping this invalidates every context in the wild. */
export const ACCESS_CONTEXT_VERSION = 1;

/** Default lifetime. Short relative to the 30-day session — see revocation note. */
export const ACCESS_CONTEXT_TTL_SECONDS = 60 * 60 * 12;

export interface AccessContextPayload {
  /** Canonical member id, from the session — never from a client claim. */
  sub: string;
  /** Canonical roles, from the member record. */
  roles: string[];
  /** Canonical tier, from the member record. */
  tier: string;
  /** Issued-at, seconds since epoch. */
  iat: number;
  /** Expiry, seconds since epoch. */
  exp: number;
  /** Context version. */
  ver: number;
}

function secret(): string | null {
  const s = process.env.AUTH_CONTEXT_SECRET;
  // A short secret is not a secret. Refuse rather than sign weakly.
  if (!s || s.length < 32) return null;
  return s;
}

const encoder = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string, key: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return new Uint8Array(sig);
}

/** Length-independent, value-constant comparison. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Sign an access context. Returns `null` when no usable secret is configured —
 * the caller then issues no context cookie, and middleware falls through to the
 * bounded compatibility path rather than locking everyone out.
 */
export async function signAccessContext(input: {
  sub: string;
  roles: string[];
  tier: string;
  ttlSeconds?: number;
}): Promise<string | null> {
  const key = secret();
  if (!key) {
    console.warn(
      '[auth/context] AUTH_CONTEXT_SECRET missing or under 32 chars — issuing NO signed context. Role/tier gates fall back to the bounded compatibility path.'
    );
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AccessContextPayload = {
    sub: input.sub,
    roles: input.roles?.length ? input.roles : ['member'],
    tier: input.tier || 'free',
    iat: now,
    exp: now + (input.ttlSeconds ?? ACCESS_CONTEXT_TTL_SECONDS),
    ver: ACCESS_CONTEXT_VERSION,
  };

  const body = b64urlEncode(encoder.encode(JSON.stringify(payload)));
  const sig = b64urlEncode(await hmac(body, key));
  return `${body}.${sig}`;
}

export type VerifyFailure =
  | 'absent'
  | 'no_secret'
  | 'malformed'
  | 'bad_signature'
  | 'expired'
  | 'wrong_version';

export type VerifyResult =
  | { ok: true; payload: AccessContextPayload }
  | { ok: false; reason: VerifyFailure };

/**
 * Verify a signed access context.
 *
 * Fails closed on every path: a missing secret, a malformed token, a bad
 * signature, an expired context and a version mismatch all return `ok: false`.
 * The signature is checked BEFORE the payload is trusted for anything, so a
 * forged `exp` cannot buy a longer life.
 */
export async function verifyAccessContext(raw: string | null | undefined): Promise<VerifyResult> {
  if (!raw) return { ok: false, reason: 'absent' };

  const key = secret();
  if (!key) return { ok: false, reason: 'no_secret' };

  const dot = raw.indexOf('.');
  if (dot <= 0 || dot === raw.length - 1) return { ok: false, reason: 'malformed' };
  const body = raw.slice(0, dot);
  const provided = raw.slice(dot + 1);

  let providedBytes: Uint8Array;
  try {
    providedBytes = b64urlDecode(provided);
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  // SIGNATURE FIRST. Nothing in the payload is read until it is authenticated.
  const expected = await hmac(body, key);
  if (!timingSafeEqual(expected, providedBytes)) return { ok: false, reason: 'bad_signature' };

  let payload: AccessContextPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (payload.ver !== ACCESS_CONTEXT_VERSION) return { ok: false, reason: 'wrong_version' };
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' };
  }
  if (typeof payload.sub !== 'string' || !payload.sub) return { ok: false, reason: 'malformed' };
  if (!Array.isArray(payload.roles)) return { ok: false, reason: 'malformed' };

  return { ok: true, payload };
}

/**
 * THE BOUNDED COMPATIBILITY WINDOW.
 *
 * Sessions issued before this unit have no `maia_ctx`. Failing them closed
 * immediately would strip every existing practitioner, steward and admin of
 * role-gated access until they re-logged in — repairing the boundary by
 * removing capability, which this unit is explicitly not allowed to do.
 *
 * So unsigned sessions keep their cookie-derived roles until the retirement
 * instant below, each use is logged, and after it role/tier gates fail closed
 * (authentication is unaffected — only elevated roles are withdrawn).
 *
 * Override with AUTH_CONTEXT_COMPAT_UNTIL (ISO-8601) to shorten or extend
 * deliberately. Shortening is the direction of travel.
 */
export const ACCESS_CONTEXT_COMPAT_UNTIL_DEFAULT = '2026-09-26T00:00:00Z';

export function compatWindowOpen(now: Date = new Date()): boolean {
  const raw = process.env.AUTH_CONTEXT_COMPAT_UNTIL || ACCESS_CONTEXT_COMPAT_UNTIL_DEFAULT;
  const until = Date.parse(raw);
  if (Number.isNaN(until)) {
    // An unparseable date must not silently mean "forever".
    console.warn(`[auth/context] AUTH_CONTEXT_COMPAT_UNTIL unparseable (${raw}) — treating window as CLOSED.`);
    return false;
  }
  return now.getTime() < until;
}
