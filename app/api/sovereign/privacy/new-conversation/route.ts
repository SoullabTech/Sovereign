/**
 * RF01 R1-D — server-minted, authenticated, independent conversation.
 *
 * This endpoint does not write message content, infer memory permission, copy
 * history or mutate an existing conversation. It returns a previously unused
 * session identity with one verified owner, or refuses the request.
 */
export const dynamic = 'force-dynamic';
import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolvePrivacyActor } from '@/lib/auth/privacyMemberGuard';
import { assertMemberInfluenceAllowed, influenceHoldResponse } from '@/lib/sanctuary/memberInfluenceHold';

const refusal = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });

export async function POST(request: NextRequest) {
  const actor = await resolvePrivacyActor(request);
  if (!actor.ok) return refusal(actor.code, actor.status);
  try {
    // A New Conversation action may not carry free-text, owner, an existing
    // session ID, privacy mode, or an invented session registration claim.
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body) ||
        Object.keys(body).length !== 0) {
      return refusal('NEW_SESSION_MUST_BE_SERVER_MINTED', 400);
    }
  } catch {
    return refusal('INVALID_NEW_SESSION_BODY', 400);
  }

  try {
    await assertMemberInfluenceAllowed(actor.memberId);
    const sessionId = 'session_' + randomUUID();
    const result = await query<{ id: string }>(
      'INSERT INTO maia_sessions (id,member_id) VALUES ($1,$2) ' +
      'ON CONFLICT (id) DO NOTHING RETURNING id',
      [sessionId, actor.memberId],
    );
    if (result.rows[0]?.id !== sessionId) {
      return refusal('NEW_SESSION_COLLISION', 409);
    }
    return NextResponse.json({
      ok: true, sessionId, privacyChoice: null, remembranceAuthorized: false,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error &&
        String((error as {code:unknown}).code).startsWith('MEMBER_INFLUENCE_')) {
      return NextResponse.json({
        ok: false, ...influenceHoldResponse(error),
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    return refusal('NEW_SESSION_UNAVAILABLE', 503);
  }
}
