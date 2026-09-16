/**
 * SOURCE-CUSTODY-PII-01 · ACT 2 — server-side admission for onboarding keys.
 *
 * WHY THIS ROUTE EXISTS. Before this repair, `SacredSoulInduction` and
 * `BetaTesterGateway` were `'use client'` modules that VALUE-imported
 * `ganeshaContacts` and decided admission in the browser. That shipped the
 * identified human records — name, email, joinDate, status, groups, tags and
 * 48 passcodes — into the client bundle, and made the gate decision on data
 * the visitor already held.
 *
 * ⛔ THE FORMAT-ONLY PATH IS GONE, AND THAT IS THE POINT. The client read
 *   `if (validKeys.includes(key) || isValidFormat)`
 * which is precisely the defect the 2026-09-06 founder ruling closed in
 * `lib/auth/passkeyAdmission.ts`: *a prefix determines whether a passkey has
 * an ACCEPTABLE FORMAT; it never determines AUTHORIZATION.* That repair
 * reached `/api/members/check` and `/api/members/register`; it never reached
 * onboarding, so the bypass stayed live on the surface members actually use.
 * Admission here is a real contact record or `resolveAdmission()` — never a
 * shape.
 *
 * ⛔ A REFUSAL IS NOT AN OCCASION TO DISCLOSE. The response carries a boolean
 * and, only on a match, THAT PERSON'S OWN name. No list, no count, no reason,
 * no echo of the submitted key. A caller learns whether the key they already
 * hold is recognized, and nothing about anybody else.
 *
 * ⚠️ TWO RESIDUALS, NAMED RATHER THAN QUIETLY LEFT (ACT 2A):
 *
 * (1) CREDENTIALS CAN STILL REACH SERVER LOGS, AND NOT FROM THIS FILE.
 *     `resolveAdmission` passes the submitted key as a query parameter, and
 *     `lib/db/postgres.ts` logs `SQL` and `Params` on any query error before
 *     rethrowing. So a database fault during admission emits the submitted
 *     credential. This route adds no logging of its own and swallows the throw
 *     rather than re-emitting it — but the emission happens upstream, inside a
 *     helper shared by the whole system. ⛔ Not repaired here: the lawful fix
 *     is an opt-in credential-safe path through that shared helper, which the
 *     S3 lane already identified and which is a founder call. §4 of ACT 2A is
 *     therefore PARTIALLY discharged, and saying so is the point.
 *
 * (2) TIMING. A contact-record hit returns from memory; a miss continues to a
 *     database lookup. The difference is observable and is an enumeration
 *     signal that rate limiting narrows but does not remove. Constant-time
 *     admission is a redesign, which this act is not.
 */
import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { ganeshaContacts } from '@/lib/ganesha/contacts';
import { resolveAdmission } from '@/lib/auth/passkeyAdmission';
import { checkRateLimit, getClientIP, buildRateLimitHeaders } from '@/lib/auth/rateLimiter';

/**
 * ACT 2A — this endpoint is an AUTHORIZATION ORACLE, so it is rate limited.
 *
 * A caller submits one candidate credential and learns whether it admits, and
 * on a match receives that person's name. Without abuse control that is a
 * guessing machine with a name attached to each success.
 *
 * `checkRateLimit` is reused rather than reinvented: it is already founder-
 * reasoned to fail to a small in-process ceiling and then BLOCK when the
 * durable limiter is unavailable — never to fail open.
 */
const RATE_LIMIT_ENDPOINT = 'onboarding/recognize-key';

/**
 * ⛔ ONE REFUSAL, NO VARIETIES. Bad JSON, empty key, unknown key, bad format,
 * no invite, expired invite, revoked invite, unreadable invite table and
 * throttled all return THIS EXACT BODY. A caller can distinguish admitted from
 * not-admitted — that is the endpoint's purpose — and nothing finer. Anything
 * finer is an enumeration aid.
 */
const REFUSAL = { recognized: false, name: null } as const;

/** Never cache an admission answer, at any layer. */
const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
} as const;

/**
 * Shared, non-personal keys that previously sat in client source. They confer
 * admission only; they identify nobody. Server-side so the bundle carries no
 * credential at all.
 */
const SHARED_ADMISSION_KEYS = new Set([
  'CONSCIOUSNESS2025',
  'DAIMON',
  'SOULLAB',
  'ORACLE',
  'MAIA',
  'BETA-TESTER-2025',
]);

export type RecognizeKeyResponse = {
  /** Whether this key admits. Never a reason — see the refusal law above. */
  recognized: boolean;
  /** The matched person's OWN display name, when there is one. Never a list. */
  name: string | null;
};

const refuse = (status = 200, extraHeaders: Record<string, string> = {}) =>
  NextResponse.json(REFUSAL, { status, headers: { ...NO_STORE, ...extraHeaders } });

const admit = (name: string | null) =>
  NextResponse.json<RecognizeKeyResponse>({ recognized: true, name }, { headers: NO_STORE });

export async function POST(request: NextRequest) {
  /* Throttle BEFORE reading the body, so a malformed request costs an attempt
     too. Otherwise the cheapest way to probe is to send garbage. */
  const limit = await checkRateLimit(getClientIP(request), 'ip', RATE_LIMIT_ENDPOINT);
  if (!limit.allowed) {
    return refuse(429, buildRateLimitHeaders(limit));
  }

  let key: unknown;
  try {
    ({ key } = await request.json());
  } catch {
    return refuse();
  }

  if (typeof key !== 'string' || key.trim().length === 0) {
    return refuse();
  }

  const normalized = key.toUpperCase().trim();

  // 1. A real contact record carrying this passcode.
  const contact = ganeshaContacts.find(
    (c) => c.status === 'active' && c.metadata.passcode === normalized,
  );
  if (contact) return admit(contact.name);

  // 2. A shared admission key.
  if (SHARED_ADMISSION_KEYS.has(normalized)) return admit(null);

  // 3. The ruled authority: a real pending, unexpired invite — or an existing
  //    member. Anything else, including a well-formed key with no invite
  //    behind it, refuses. `resolveAdmission` already fails closed when the
  //    invites table cannot be read.
  //
  //    ⛔ It is called INSIDE a try: not to swallow the error, but so that a
  //    thrown lookup cannot turn into a 500 whose shape differs from a plain
  //    refusal. The error is not logged here — logging it would risk echoing
  //    the submitted credential, which is the whole point of §4.
  let admission: Awaited<ReturnType<typeof resolveAdmission>>;
  try {
    admission = await resolveAdmission(normalized);
  } catch {
    return refuse();
  }

  if (admission.kind === 'admit') return admit(null);
  if (admission.kind === 'existing_member') {
    return admit((admission.member.name as string | null) ?? null);
  }

  return refuse();
}
