import { NextRequest, NextResponse } from 'next/server';
import { loadJoinTokenContext, loadClientLedger } from '@/lib/session/joinTokenStore';
import { evaluateLinkReveal, evaluateDecision } from '@/lib/session/ClientConsent';

/**
 * Client join surface — view the agreement, see the decision state, and get the video link
 * ONLY if the consent ledger says this client accepted the current agreement version.
 *
 * Design: docs/specs/SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md
 * Token-authenticated (no login). Returns only agreement statements + decision state —
 * never practitioner notes, transcripts, or session history.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const ctx = await loadJoinTokenContext(token);
  if (!ctx) return NextResponse.json({ error: 'invalid link' }, { status: 401 });

  const ledger = await loadClientLedger(ctx.sessionId);
  const reveal = evaluateLinkReveal(ctx.tokenState, ledger, Date.now());
  const decision = evaluateDecision(ctx.tokenState, Date.now());

  const relevant = ledger
    .filter((e) => e.agreementVersion === ctx.tokenState.currentAgreementVersion)
    .sort((a, b) => a.createdAt - b.createdAt);
  const latest = relevant[relevant.length - 1];
  const state = latest?.action === 'accept' ? 'accepted' : latest?.action === 'refuse' ? 'refused' : 'pending';

  return NextResponse.json({
    ok: true,
    agreement: {
      version: ctx.tokenState.currentAgreementVersion,
      maiaRetention: ctx.agreementText,
      providerNotice: ctx.providerNotice,
      provider: ctx.videoProvider,
    },
    state,
    canDecide: decision.status === 200,
    decideReason: decision.status === 200 ? null : decision.reason ?? null,
    // Governed by the ledger reveal gate, never by token existence.
    videoLink: reveal.revealLink ? ctx.videoLink : null,
    linkBlockedReason: reveal.revealLink ? null : reveal.reason ?? null,
  });
}
