export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent } from '@/lib/security/authAudit';
import { resolveAdmission } from '@/lib/auth/passkeyAdmission';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
} as const;

const invalid = (status: number, headers: Record<string, string> = {}) =>
  NextResponse.json(
    { valid: false, message: 'Invalid invitation code' },
    { status, headers: { ...NO_STORE, ...headers } },
  );

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(getClientIP(request), 'ip', 'beta/validate-passcode');
  if (!limit.allowed) return invalid(429, buildRateLimitHeaders(limit));

  let passcode: unknown;
  try {
    ({ passcode } = await request.json());
  } catch {
    return invalid(400);
  }

  if (typeof passcode !== 'string' || passcode.trim().length === 0) return invalid(400);

  try {
    const admission = await resolveAdmission(passcode);
    const valid = admission.kind === 'admit';

    await logAuthEvent({
      action: valid ? 'passcode_valid' : 'passcode_invalid',
      resourceType: 'beta_passcode',
      result: valid ? 'success' : 'failure',
      ...(valid ? {} : { errorMessage: 'invalid_passcode' }),
    }, request);

    if (!valid) return invalid(401);
    return NextResponse.json(
      { valid: true, message: 'Welcome to the sacred space' },
      { headers: NO_STORE },
    );
  } catch {
    return NextResponse.json(
      { valid: false, message: 'Validation service temporarily unavailable' },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405, headers: NO_STORE });
}
