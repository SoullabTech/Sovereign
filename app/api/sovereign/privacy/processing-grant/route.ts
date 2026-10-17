/**
 * RF01 S1-B: content-free external processor grant, separate from remembrance.
 * Candidate ONLY. Default-off and never overrides S1-A Sanctuary Send hold.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';
import {
  requireExistingOwnedSession, SessionOwnershipRefusal,
} from '@/lib/sovereign/memberSessionOwnership';
import { validExchangeId } from '@/lib/sanctuary/explicitTurnConsent';
import {
  issueAnthropicTurnGrant, S1B_PROVIDER, S1B_PURPOSE, S1B_DISCLOSURE,
} from '@/lib/sanctuary/externalProcessingGrant';

const refusal = (code: string, status: number) =>
  NextResponse.json(
    { ok: false, error: code },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );

export async function POST(request: NextRequest) {
  // No new processing grant can be minted without an independently approved
  // release gate. This flag is off unless deliberately enabled in the fixture
  // or a separately approved release.
  if (process.env.RF01_S1B_GRANT_WRITES_ENABLED !== '1') {
    return refusal('EXTERNAL_PROCESSING_GRANTS_HELD', 503);
  }
  const actor = await resolvePrivacyActor(request);
  if (!actor.ok) return refusal(actor.code, actor.status);

  let body: unknown;
  try { body = await request.json(); }
  catch { return refusal('INVALID_JSON', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return refusal('INVALID_PROCESSING_REQUEST', 400);
  }
  const input = body as Record<string, unknown>;
  // This is a content-free authority request, not a second message channel.
  const allowedFields = new Set([
    'memberId', 'sessionId', 'exchangeId', 'processor', 'purpose',
    'disclosureVersion', 'explicitProcessorAuthorization',
  ]);
  if (Object.keys(input).some(key => !allowedFields.has(key))) {
    return refusal('UNSUPPORTED_PROCESSING_FIELD', 400);
  }
  if (!matchingClaim(input.memberId, actor.memberId)) {
    return refusal('MEMBER_CLAIM_MISMATCH', 403);
  }
  if (typeof input.sessionId !== 'string' || !input.sessionId.trim() ||
      input.sessionId.length > 200 || !validExchangeId(input.exchangeId)) {
    return refusal('INVALID_PROCESSING_IDENTITY', 400);
  }
  if (input.processor !== S1B_PROVIDER || input.purpose !== S1B_PURPOSE) {
    return refusal('UNAPPROVED_PROCESSOR_OR_PURPOSE', 400);
  }
  if (input.disclosureVersion !== S1B_DISCLOSURE ||
      input.explicitProcessorAuthorization !== true) {
    return refusal('EXPLICIT_PROVIDER_PERMISSION_REQUIRED', 428);
  }

  try {
    await requireExistingOwnedSession(input.sessionId, actor.memberId);
    const result = await issueAnthropicTurnGrant({
      memberId: actor.memberId,
      sessionId: input.sessionId,
      exchangeId: input.exchangeId,
      disclosureVersion: S1B_DISCLOSURE,
      explicitProcessorAuthorization: true,
    });
    if (!result.ok) {
      return refusal(result.code,
        result.code === 'PROCESSING_GRANT_STORE_UNAVAILABLE' ? 503 : 409);
    }
    return NextResponse.json({
      ok: true,
      processor: result.processor,
      purpose: S1B_PURPOSE,
      exchangeId: input.exchangeId,
      expiresAt: result.expiresAt,
      sanctuaryProcessingAvailable: false,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof SessionOwnershipRefusal) {
      return refusal('SESSION_NOT_OWNED', 409);
    }
    return refusal('PROCESSING_GRANT_UNAVAILABLE', 503);
  }
}
