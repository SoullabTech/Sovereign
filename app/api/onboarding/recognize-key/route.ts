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
 * ⚠️ Rate limiting is NOT added here — out of this act's authorized scope. The
 * enumeration surface is narrower than before (one key per request instead of
 * the whole list at once) but it is not zero, and naming it is not fixing it.
 */
import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { ganeshaContacts } from '@/lib/ganesha/contacts';
import { resolveAdmission } from '@/lib/auth/passkeyAdmission';

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

export async function POST(request: NextRequest) {
  let key: unknown;
  try {
    ({ key } = await request.json());
  } catch {
    return NextResponse.json({ recognized: false, name: null }, { status: 400 });
  }

  if (typeof key !== 'string' || key.trim().length === 0) {
    return NextResponse.json({ recognized: false, name: null }, { status: 400 });
  }

  const normalized = key.toUpperCase().trim();

  // 1. A real contact record carrying this passcode.
  const contact = ganeshaContacts.find(
    (c) => c.status === 'active' && c.metadata.passcode === normalized,
  );
  if (contact) {
    return NextResponse.json<RecognizeKeyResponse>({ recognized: true, name: contact.name });
  }

  // 2. A shared admission key.
  if (SHARED_ADMISSION_KEYS.has(normalized)) {
    return NextResponse.json<RecognizeKeyResponse>({ recognized: true, name: null });
  }

  // 3. The ruled authority: a real pending, unexpired invite — or an existing
  //    member. Anything else, including a well-formed key with no invite
  //    behind it, refuses. `resolveAdmission` already fails closed when the
  //    invites table cannot be read.
  const admission = await resolveAdmission(normalized);
  if (admission.kind === 'admit') {
    return NextResponse.json<RecognizeKeyResponse>({ recognized: true, name: null });
  }
  if (admission.kind === 'existing_member') {
    const name = (admission.member.name as string | null) ?? null;
    return NextResponse.json<RecognizeKeyResponse>({ recognized: true, name });
  }

  return NextResponse.json<RecognizeKeyResponse>({ recognized: false, name: null });
}
