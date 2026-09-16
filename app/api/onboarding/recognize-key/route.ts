/**
 * SOURCE-CUSTODY-PII-01 · R12 — invitation recognition without credential corpora.
 *
 * This endpoint answers one question only: does this submitted credential name
 * a real pending, unexpired invitation? Existing-member passkeys are not
 * admission credentials; returning members use the member check/sign-in path.
 */
import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { resolveAdmission } from '@/lib/auth/passkeyAdmission';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

const RATE_LIMIT_ENDPOINT = 'onboarding/recognize-key';
const REFUSAL = { recognized: false, name: null } as const;
const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
} as const;

export type RecognizeKeyResponse = {
  recognized: boolean;
  name: null;
};

const refuse = (status = 200, extraHeaders: Record<string, string> = {}) =>
  NextResponse.json(REFUSAL, { status, headers: { ...NO_STORE, ...extraHeaders } });

const admit = () =>
  NextResponse.json<RecognizeKeyResponse>({ recognized: true, name: null }, { headers: NO_STORE });

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(getClientIP(request), 'ip', RATE_LIMIT_ENDPOINT);
  if (!limit.allowed) return refuse(429, buildRateLimitHeaders(limit));

  let key: unknown;
  try {
    ({ key } = await request.json());
  } catch {
    return refuse();
  }

  if (typeof key !== 'string' || key.trim().length === 0) return refuse();

  try {
    const admission = await resolveAdmission(key);
    return admission.kind === 'admit' ? admit() : refuse();
  } catch {
    return refuse();
  }
}
