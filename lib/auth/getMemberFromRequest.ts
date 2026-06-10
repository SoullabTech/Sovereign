import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/postgres';
import { validateSessionToken } from '@/lib/auth/session';

/**
 * Extract member ID from a request — hardened 2026-06-09 (Track #9, Step 2).
 *
 * Priority (authoritative first — token-derived identity ALWAYS wins over a
 * bare identifier):
 *   1. x-session-token header → auth_sessions (native/Safari bearer)
 *   2. maia_session cookie    → auth_sessions (web)
 *   3. [DEPRECATED bridge] x-member-id header    → existence only
 *   4. [DEPRECATED bridge] maia_member_id cookie → existence only
 *
 * Paths 3-4 trust a bare, non-secret member id and exist ONLY as a temporary
 * compatibility bridge. They are NOT a security boundary and are slated for
 * removal once telemetry shows real tokens are issued + persisted across all
 * login/native paths. Governing spec: docs/specs/AUTH_IDENTITY_HARDENING_2026-06-09.md.
 *
 * ── P0 telemetry (observe-first) ─────────────────────────────────────────
 * REDACTION HARD RULE: presence + classification ONLY. Never log token values,
 * member IDs (not even prefixes), phone/email, message content, or any raw path
 * that can contain UUIDs. Deduped per classification-tuple (no member id is ever
 * stored or logged) to enumerate distinct identifier-usage patterns without
 * flooding. Purpose is find + classify, not count volume. No behavior change.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Exact static route words allowed into telemetry. A path segment is emitted only
// if it is a UUID (masked to :id) or an explicitly-known static word; ANYTHING else
// (team slugs, usernames, field names, unknown segments) collapses the tail to /* —
// so no human-readable slug or workspace/team/member identifier can ever be emitted.
const STATIC_SEGMENTS = new Set<string>([
  'api', 'team', 'channels', 'dm', 'stream', 'members', 'admin', 'session', 'sessions',
  'sovereign', 'app', 'maia', 'list', 'atoms', 'orientation', 'breakthrough',
  'studio', 'calendar', 'sync', 'settings', 'services', 'scheduling',
  'auth', 'signin', 'register', 'magic-link', 'whoami', 'refresh-and-redirect', 'exchange',
  'focus', 'process-reminders', 'cron', 'session-reminders', 'stripe', 'webhook',
  'notifications', 'health', 'comms', 'oracle', 'voice', 'practitioner',
]);

type CredentialSource =
  | 'x_session_token'
  | 'maia_session_cookie'
  | 'x_member_id'
  | 'maia_member_id';

function classifyTraffic(request: NextRequest): 'sse' | 'native' | 'browser' {
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/event-stream')) return 'sse';
  if (request.headers.get('x-capacitor-app') === 'true') return 'native';
  const ua = request.headers.get('user-agent') || '';
  // iOS WKWebView UA includes "Mobile" but not "Safari"
  if (ua.includes('Mobile') && !ua.includes('Safari') && (ua.includes('iPhone') || ua.includes('iPad'))) {
    return 'native';
  }
  return 'browser';
}

/**
 * Coarse route bucket for telemetry — locates the caller family WITHOUT exposing
 * workspace/team/member semantics. Query string dropped; UUIDs → :id; any segment
 * not in STATIC_SEGMENTS collapses the rest of the path to /* (so slugs never leak).
 *   /api/team/channels/<uuid>/stream  → /api/team/channels/:id/stream
 *   /api/sovereign/app/maia/list      → /api/sovereign/app/maia/list
 *   /api/team/<slug>/...              → /api/team/*
 */
function routeBucket(request: NextRequest): string {
  const segs = (request.nextUrl?.pathname || '/').split('/').filter(Boolean);
  if (segs.length === 0) return '/';
  const out: string[] = [];
  for (const seg of segs) {
    if (UUID_RE.test(seg)) { out.push(':id'); continue; }
    if (STATIC_SEGMENTS.has(seg)) { out.push(seg); continue; }
    out.push('*');
    break; // collapse the tail at the first segment not provably static
  }
  return '/' + out.join('/');
}

// Dedup key holds ONLY classification fields — never a member id.
const seenTelemetry = new Set<string>();

function logAuthTelemetry(
  request: NextRequest,
  credentialSource: CredentialSource,
  flags: {
    xSessionTokenHeaderPresent: boolean;
    maiaSessionCookiePresent: boolean;
    deprecatedIdentifierPresent: boolean;
  }
): void {
  const tokenDerived =
    credentialSource === 'x_session_token' || credentialSource === 'maia_session_cookie';
  const usedDeprecatedIdentifier = !tokenDerived;
  const credentialConflictPresent = tokenDerived && flags.deprecatedIdentifierPresent;

  // Only migration-relevant requests: a deprecated identifier was used, or a
  // validated credential coexisted with one (impersonation / stale-client signal).
  if (!usedDeprecatedIdentifier && !credentialConflictPresent) return;

  const trafficClass = classifyTraffic(request);
  const bucket = routeBucket(request);
  const key = [
    credentialSource,
    trafficClass,
    bucket,
    flags.xSessionTokenHeaderPresent,
    flags.maiaSessionCookiePresent,
    flags.deprecatedIdentifierPresent,
    credentialConflictPresent,
  ].join('|');
  if (seenTelemetry.has(key)) return;
  seenTelemetry.add(key);

  console.log(
    `[AuthP0] auth_telemetry ` +
      `credentialSource=${credentialSource} ` +
      `trafficClass=${trafficClass} ` +
      `routeBucket=${bucket} ` +
      `xSessionTokenHeaderPresent=${flags.xSessionTokenHeaderPresent} ` +
      `maiaSessionCookiePresent=${flags.maiaSessionCookiePresent} ` +
      `deprecatedIdentifierPresent=${flags.deprecatedIdentifierPresent} ` +
      `credentialConflictPresent=${credentialConflictPresent}`
  );
}

export async function getMemberIdFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const flags = {
    xSessionTokenHeaderPresent: request.headers.get('x-session-token') != null,
    maiaSessionCookiePresent: cookieStore.get('maia_session')?.value != null,
    deprecatedIdentifierPresent:
      request.headers.get('x-member-id') != null ||
      cookieStore.get('maia_member_id')?.value != null,
  };

  // 1. Session token header (native/Safari bearer) — authoritative
  const headerToken = request.headers.get('x-session-token');
  if (headerToken) {
    const memberId = await validateSessionToken(headerToken);
    if (memberId) {
      logAuthTelemetry(request, 'x_session_token', flags);
      return memberId;
    }
  }

  // 2. Session cookie (web) — authoritative
  const cookieToken = cookieStore.get('maia_session')?.value;
  if (cookieToken) {
    const memberId = await validateSessionToken(cookieToken);
    if (memberId) {
      logAuthTelemetry(request, 'maia_session_cookie', flags);
      return memberId;
    }
  }

  // 3. [DEPRECATED bridge] bare x-member-id — existence only
  const headerMemberId = request.headers.get('x-member-id');
  if (headerMemberId) {
    const r = await query('SELECT id FROM members WHERE id = $1', [headerMemberId]);
    if (r.rows.length > 0) {
      logAuthTelemetry(request, 'x_member_id', flags);
      return headerMemberId;
    }
  }

  // 4. [DEPRECATED bridge] bare maia_member_id cookie — existence only
  const cookieMemberId = cookieStore.get('maia_member_id')?.value;
  if (cookieMemberId) {
    const r = await query('SELECT id FROM members WHERE id = $1', [cookieMemberId]);
    if (r.rows.length > 0) {
      logAuthTelemetry(request, 'maia_member_id', flags);
      return cookieMemberId;
    }
  }

  return null;
}
