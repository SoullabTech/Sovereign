import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export interface AdminIdentity {
  memberId: string;
}

/**
 * Server-side admin gate for beta-tester write / review endpoints.
 *
 * Authoritative check against members.roles (set at login by setAccessCookies),
 * rather than trusting the maia_roles cookie alone — defense in depth behind the
 * access-matrix rule that already gates /api/admin/beta-testers to
 * rolesAnyOf:['admin']. An env allowlist (BETA_ADMIN_MEMBER_IDS, comma-separated
 * member ids) is honored as an override for bootstrap / ops.
 *
 * We deliberately do NOT replicate the unauthenticated write pattern found in
 * app/api/admin/command-center/* — every admin write here is authorized.
 *
 * Returns identity on success, or a NextResponse (401/403) to return immediately.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AdminIdentity | NextResponse> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowlist = (process.env.BETA_ADMIN_MEMBER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowlist.includes(memberId)) {
    return { memberId };
  }

  try {
    const result = await query<{ roles: unknown }>(
      'SELECT roles FROM members WHERE id = $1',
      [memberId]
    );
    if (normalizeRoles(result.rows[0]?.roles).includes('admin')) {
      return { memberId };
    }
  } catch {
    // fall through to forbidden
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/** members.roles may be text[], a JSON string, or a CSV string — normalize all. */
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

export function isGateResponse(
  x: AdminIdentity | NextResponse
): x is NextResponse {
  return x instanceof NextResponse;
}
