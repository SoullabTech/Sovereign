import { NextRequest, NextResponse } from 'next/server';
import { loadJoinTokenContext, loadClientLedger } from '@/lib/session/joinTokenStore';
import { evaluateLinkReveal, evaluateDecision } from '@/lib/session/ClientConsent';
import { resolveRetentionProfile, type AgreementMode } from '@/lib/session/SessionAgreements';

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
    // Retention the Lobby displays — derived from the accepted agreement, never client-editable.
    retention: buildRetention(ctx.agreementMode, ctx.consentFlags),
    state,
    canDecide: decision.status === 200,
    decideReason: decision.status === 200 ? null : decision.reason ?? null,
    // Governed by the ledger reveal gate, never by token existence.
    videoLink: reveal.revealLink ? ctx.videoLink : null,
    linkBlockedReason: reveal.revealLink ? null : reveal.reason ?? null,
  });
}

function normTranscript(v: unknown): 'none' | 'temporary' | 'kept' {
  if (v === true || v === 'kept') return 'kept';
  if (v === 'temporary') return 'temporary';
  return 'none';
}

/**
 * Resolve the retention summary the Lobby renders. Prefers the consent_flags frozen at consent;
 * falls back to the preset for the agreement mode. Returns null until a mode is chosen.
 */
function buildRetention(mode: string | null, flags: Record<string, unknown> | null) {
  if (!mode) return null;
  const hasFlags = flags && typeof flags === 'object' && Object.keys(flags).length > 0;
  const base = hasFlags
    ? {
        recording: !!(flags as Record<string, unknown>).recording,
        transcript: normTranscript((flags as Record<string, unknown>).transcript),
        summary: !!(flags as Record<string, unknown>).summary,
        memory: !!(flags as Record<string, unknown>).memory,
      }
    : (() => {
        const p = resolveRetentionProfile(mode as AgreementMode);
        return { recording: p.recording, transcript: p.transcript, summary: p.summary, memory: p.memory };
      })();
  return { mode, ...base, sanctuary: mode === 'sanctuary' };
}
