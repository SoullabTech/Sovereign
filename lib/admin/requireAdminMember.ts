// Cookie/session-based admin gate for the Feedback Inbox.
//
// Why not isAdminRequest (x-admin-password header)? Inline screenshots are loaded via
// <img src=…>, which cannot send a custom header — only the session cookie. So the
// admin surface that serves images must authorize from the request's member session,
// the same shape A's team-attachment serve route uses (getMemberIdFromRequest), gated
// to the 'admin' role. Using one cookie-based mechanism keeps list / PATCH / image-serve
// consistent. Self-contained: depends only on clean-main helpers.

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export interface AdminMember {
  memberId: string;
}

/** members.roles may be a text[], a JSON string, or a CSV string — normalize all. */
function normalizeRoles(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* not JSON */
    }
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Authorize an admin member from the request session. Returns identity on success, or a
 * NextResponse (401/403) to return immediately. Cookie-driven, so it works for <img> loads.
 */
export async function requireAdminMember(
  req: NextRequest
): Promise<AdminMember | NextResponse> {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const r = await query<{ roles: unknown }>(
      'SELECT roles FROM members WHERE id = $1',
      [memberId]
    );
    if (normalizeRoles(r.rows[0]?.roles).includes('admin')) {
      return { memberId };
    }
  } catch {
    // fall through to forbidden
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function isAdminGateResponse(
  x: AdminMember | NextResponse
): x is NextResponse {
  return x instanceof NextResponse;
}
