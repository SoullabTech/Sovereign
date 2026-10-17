/**
 * RF01 R1-D: verified, idempotent member-session registration.
 *
 * Ownership and auth come from the verified web or native session token,
 * never a user-provided memberId or a guessed session identifier.
 * Starting/touching a session never grants Continuity or Sanctuary processing.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';
import {
  ensureOwnedMemberSession, normalizedSessionId, SessionOwnershipRefusal,
} from '@/lib/sovereign/memberSessionOwnership';
import { assertMemberInfluenceAllowed, influenceHoldResponse } from '@/lib/sanctuary/memberInfluenceHold';

const refuse = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });

export async function POST(request: NextRequest) {
  const actor = await resolvePrivacyActor(request);
  if (!actor.ok) return refuse(actor.code, actor.status);
  let parsed: unknown;
  try { parsed = await request.json(); }
  catch { return refuse('INVALID_JSON', 400); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return refuse('INVALID_SESSION_REGISTRATION', 400);
  }
  const input = parsed as Record<string, unknown>;
  if (typeof input.sessionId !== 'string' ||
      !input.sessionId.startsWith('session_') ||
      input.sessionId.length > 100 ||
      !matchingClaim(input.memberId, actor.memberId)) {
    return refuse('INVALID_OR_FOREIGN_SESSION', 403);
  }
  // Legacy onboarding callers can send optional visual style hints; these
  // must not modify privacy, mode, memory, owner or any content field.
  const allowed = new Set([
    'sessionId','memberId','privacyMode','maiaMode','voiceEnabled',
  ]);
  if (Object.keys(input).some(field => !allowed.has(field))) {
    return refuse('UNSUPPORTED_SESSION_FIELD', 400);
  }
  try {
    await assertMemberInfluenceAllowed(actor.memberId);
    const sessionId = normalizedSessionId(input.sessionId);
    await ensureOwnedMemberSession(sessionId, actor.memberId);
    return NextResponse.json({
      ok:true,sessionId,status:'active',
      privacyChoice:null,remembranceAuthorized:false,
    }, { headers:{'Cache-Control':'no-store'} });
  } catch (err) {
    if (err instanceof SessionOwnershipRefusal) {
      return refuse(err.code, err.code === 'SESSION_ID_INVALID' ? 400 : 409);
    }
    if (err && typeof err === 'object' && 'code' in err &&
        String((err as {code:unknown}).code).startsWith('MEMBER_INFLUENCE_')) {
      return NextResponse.json({ok:false,...influenceHoldResponse(err)},
        {status:503,headers:{'Cache-Control':'no-store'}});
    }
    return refuse('SESSION_REGISTRATION_UNAVAILABLE', 503);
  }
}
