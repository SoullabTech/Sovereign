/**
 * RF01 S0-A2 — the client may request an end, not authorize someone else's
 * deletion or remembrance. Owner is derived from verified session credentials.
 *
 * Per-turn Sanctuary deletion and mixed-session summary policy remain held
 * until S1/R1 qualification; a mutable isSanctuary flag cannot confer them.
 */
import { NextRequest, NextResponse } from 'next/server';
import { finalizeSession } from '@/lib/sovereign/sessionFinalizer';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';
import { SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';

const refusal = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, { status });

export async function POST(req: NextRequest) {
  try {
    const actor = await resolvePrivacyActor(req);
    if (!actor.ok) return refusal(actor.code, actor.status);

    let body: unknown;
    try { body = await req.json(); }
    catch { return refusal('INVALID_JSON', 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return refusal('INVALID_FINALIZE_BODY', 400);
    }
    const input = body as Record<string, unknown>;
    if (!matchingClaim(input.memberId, actor.memberId)) {
      return refusal('MEMBER_CLAIM_MISMATCH', 403);
    }
    if (typeof input.sessionId !== 'string' ||
        !input.sessionId.trim() || input.sessionId.length > 200) {
      return refusal('INVALID_SESSION_ID', 400);
    }
    if (typeof input.isSanctuary !== 'boolean') {
      return refusal('EXPLICIT_PRIVACY_POSTURE_REQUIRED', 400);
    }
    if (input.endedAt != null && (
        typeof input.endedAt !== 'string' ||
        !Number.isFinite(Date.parse(input.endedAt))
    )) return refusal('INVALID_END_TIME', 400);

    const result = await finalizeSession({
      memberId: actor.memberId,
      sessionId: input.sessionId,
      isSanctuary: input.isSanctuary,
      endedAt: (input.endedAt as string | undefined) ?? null,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (err) {
    if (err instanceof SessionOwnershipRefusal) {
      return refusal('SESSION_NOT_OWNED', 409);
    }
    return refusal('FINALIZATION_UNAVAILABLE', 500);
  }
}
