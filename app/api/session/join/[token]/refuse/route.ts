import { NextRequest, NextResponse } from 'next/server';
import { loadJoinTokenContext, recordClientDecision } from '@/lib/session/joinTokenStore';
import { evaluateDecision } from '@/lib/session/ClientConsent';

/**
 * Client refuses the current agreement. Refusal is terminal for this agreement version — no link,
 * token marked refused. To request consent again the practitioner must revise the agreement
 * (new version => new token), which structurally prevents "ask again until yes."
 *
 * Design: docs/specs/SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const ctx = await loadJoinTokenContext(token);
  const gate = evaluateDecision(ctx ? ctx.tokenState : null, Date.now());
  if (gate.status !== 200) {
    return NextResponse.json({ error: gate.reason ?? 'forbidden' }, { status: gate.status });
  }
  const c = ctx!; // gate === 200 guarantees ctx is non-null

  await recordClientDecision({
    rawToken: token,
    sessionId: c.sessionId,
    clientId: c.clientId,
    agreementVersion: c.tokenState.currentAgreementVersion,
    decision: 'refuse',
  });

  // Practitioner notification: the refusal is durable in the ledger and surfaces on the
  // practitioner's session view. A push notification can hook here (deferred).
  console.log('[session-room] client refused agreement', {
    sessionId: c.sessionId,
    version: c.tokenState.currentAgreementVersion,
  });

  return NextResponse.json({ ok: true, state: 'refused' });
}
