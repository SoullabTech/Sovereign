import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const LOCAL_REVIEW_COOKIE = 'soullab_ws_local_review';

export type LocalReviewAuthority =
  | { ok: true }
  | { ok: false; status: 403 | 404; error: string };

function hostnameOnly(value: string): string {
  const first = value.split(',', 1)[0]!.trim();
  if (!first) return '';
  if (first.startsWith('[')) {
    const close = first.indexOf(']');
    return close >= 0 ? first.slice(1, close).toLowerCase() : first.toLowerCase();
  }
  return first.replace(/:\d+$/, '').toLowerCase();
}

function isLoopbackName(value: string): boolean {
  const host = hostnameOnly(value);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function sameToken(expected: string, presented: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(presented, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Fail-closed capability check for founder-local review routes.
 *
 * The process flag alone is never sufficient. The dedicated launcher binds the
 * server to 127.0.0.1, generates a fresh high-entropy token, and installs that
 * token as an HttpOnly-equivalent browser-context cookie. Raw Host and
 * X-Forwarded-Host are checked because Next may normalize nextUrl.hostname.
 */
export function verifyLocalReviewAuthority(request: NextRequest): LocalReviewAuthority {
  if (process.env.WS_FOUNDER_LOCAL_REVIEW !== '1') {
    return { ok: false, status: 404, error: 'Not found' };
  }
  const expected = process.env.WS_FOUNDER_LOCAL_REVIEW_TOKEN ?? '';
  if (expected.length < 32) {
    return { ok: false, status: 404, error: 'Not found' };
  }

  const claimedHosts = [
    request.nextUrl.hostname,
    request.headers.get('host') ?? '',
    request.headers.get('x-forwarded-host') ?? '',
  ].filter(Boolean);
  if (!claimedHosts.length || claimedHosts.some((host) => !isLoopbackName(host))) {
    return { ok: false, status: 403, error: 'Local review is available only on this Mac.' };
  }

  const presented = request.cookies.get(LOCAL_REVIEW_COOKIE)?.value
    ?? request.headers.get('x-soullab-local-review-token')
    ?? '';
  if (!presented || !sameToken(expected, presented)) {
    return { ok: false, status: 404, error: 'Not found' };
  }
  return { ok: true };
}
