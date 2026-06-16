import { NextRequest, NextResponse } from 'next/server';
import { loadJoinTokenContext, loadClientLedger, recordClientDecision } from '@/lib/session/joinTokenStore';
import { evaluateDecision, isClientConsentActive } from '@/lib/session/ClientConsent';

/**
 * Client accepts the current agreement. Records a `client/accept` ledger event, then returns the
 * video link — revealed only because acceptance is now recorded for the current version.
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
    decision: 'accept',
  });

  const ledger = await loadClientLedger(c.sessionId);
  const active = isClientConsentActive(ledger, c.tokenState.currentAgreementVersion);
  return NextResponse.json({ ok: true, state: 'accepted', videoLink: active ? c.videoLink : null });
}
