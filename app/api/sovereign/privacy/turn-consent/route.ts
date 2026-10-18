/**
 * RF01 S0-B: explicit per-turn consent, before the member's words arrive.
 * Request contains no conversation content. Authentication and session
 * ownership are separate preconditions. No generated or cached default is
 * treated as member authorship.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';
import {
  ensureOwnedMemberSession, SessionOwnershipRefusal, normalizedSessionId,
} from '@/lib/sovereign/memberSessionOwnership';
import {
  establishExplicitTurnConsent, validExchangeId, type PrivacyChoice,
} from '@/lib/sanctuary/explicitTurnConsent';

const refuse = (code: string, status: number) =>
  NextResponse.json({ ok: false, error: code }, { status });

export async function POST(request: NextRequest) {
  const actor = await resolvePrivacyActor(request);
  if (!actor.ok) return refuse(actor.code, actor.status);
  let body: unknown;
  try { body = await request.json(); }
  catch { return refuse('INVALID_JSON', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return refuse('INVALID_PRIVACY_CHOICE', 400);
  }
  const input = body as Record<string, unknown>;
  if (!matchingClaim(input.memberId, actor.memberId)) {
    return refuse('MEMBER_CLAIM_MISMATCH', 403);
  }
  if (!validExchangeId(input.exchangeId) ||
      typeof input.sessionId !== 'string' || !input.sessionId.trim()) {
    return refuse('INVALID_CONSENT_IDENTITY', 400);
  }
  if (input.privacyChoice !== 'continuity' && input.privacyChoice !== 'sanctuary') {
    return refuse('PRIVACY_CHOICE_REQUIRED', 428);
  }
  if (input.explicitChoice !== true) {
    return refuse('EXPLICIT_MEMBER_CHOICE_REQUIRED', 428);
  }
  // A separate, affirmative checkbox/control authorizes remembrance; neither
  // a cached default nor session style can substitute.
  if (input.privacyChoice === 'continuity' && input.explicitRemembrance !== true) {
    return refuse('REMEMBRANCE_CONSENT_REQUIRED', 428);
  }
  try {
    const ownedId = normalizedSessionId(input.sessionId);
    await ensureOwnedMemberSession(ownedId, actor.memberId);
    const result = await establishExplicitTurnConsent({
      memberId: actor.memberId,
      sessionId: ownedId,
      exchangeId: input.exchangeId,
      privacyChoice: input.privacyChoice as PrivacyChoice,
      explicitRemembrance: input.explicitRemembrance === true,
    });
    if (!result.ok) {
      return refuse(result.code, result.code === 'CONSENT_IDENTITY_CONFLICT' ? 409 : 503);
    }
    return NextResponse.json({
      ok: true,
      exchangeId: input.exchangeId,
      sessionId: ownedId,
      privacyChoice: input.privacyChoice,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof SessionOwnershipRefusal) {
      return refuse(err.code, err.code === 'SESSION_ID_INVALID' ? 400 : 409);
    }
    return refuse('CONSENT_UNAVAILABLE', 503);
  }
}
