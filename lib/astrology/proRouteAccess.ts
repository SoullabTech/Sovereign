/**
 * Shared session and access decision for Astrology Pro saved-chart routes.
 * The owner is always the verified session member; no route accepts a member
 * id from the browser.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { proMemberAllowed, proPreviewEnabled } from '@/lib/astrology/proAccess';
import { proChartWriteOriginAllowed } from '@/lib/astrology/proRequestGuard';

export const PRO_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function proError(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: PRO_RESPONSE_HEADERS });
}

export type ProOwner = { ok: true; memberId: string } | { ok: false; response: NextResponse };

/** Resolves the verified Pro member, refusing writes from a foreign origin. */
export async function resolveProOwner(request: NextRequest, write: boolean): Promise<ProOwner> {
  if (!proPreviewEnabled(process.env)) return { ok: false, response: proError(404, 'preview_unavailable') };
  if (write && request.headers.get('sec-fetch-site') === 'cross-site') {
    return { ok: false, response: proError(403, 'cross_site_request_refused') };
  }
  let memberId: string | null;
  try {
    memberId = await getMemberIdFromRequest(request);
  } catch {
    return { ok: false, response: proError(503, 'session_verification_unavailable') };
  }
  if (!memberId) return { ok: false, response: proError(401, 'session_required') };
  if (!(await proMemberAllowed(memberId, process.env))) {
    return { ok: false, response: proError(403, 'preview_access_required') };
  }
  if (write && !(await proChartWriteOriginAllowed(request, memberId))) {
    return { ok: false, response: proError(403, 'cross_origin_request_refused') };
  }
  return { ok: true, memberId };
}

/** Re-checks, after awaited work, that the same member still holds access. */
export async function proOwnerStillCurrent(request: NextRequest, memberId: string): Promise<boolean> {
  try {
    const current = await getMemberIdFromRequest(request);
    return current === memberId && proPreviewEnabled(process.env) &&
      (await proMemberAllowed(memberId, process.env));
  } catch {
    return false;
  }
}
