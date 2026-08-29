/**
 * Cloud voice consent — the member act.
 *
 * VOICE-SOVEREIGNTY-03, founder ruling 2026-08-29 (DESKTOP-TTS-ALLOY-POLICY-
 * MISMATCH-01): choosing MAIA's voice identity is not the same act as consenting
 * to cloud egress. This route is where the second act happens, and the only
 * place it can happen.
 *
 *   POST { allow: true }   → tts_provider = 'cloud'
 *   POST { allow: false }  → tts_provider = 'local'
 *
 * ⛔ WHY THIS EXISTS RATHER THAN A FIELD ON /api/settings/voice.
 *    That route is a full-replace upsert: it writes every column, nulling the
 *    ones it did not receive. A consent post there would clear the member's
 *    `voice_id_override` and `voice_archetype` — granting cloud voice would
 *    erase which voice they had chosen. The ruling's whole content is that
 *    identity and egress are separate axes, so the write that records consent
 *    must be incapable of touching identity. `setMemberTtsProvider` updates one
 *    column and no other.
 *
 * ⛔ Declining ("Keep voice local") stores 'local', not null. Null is `auto` —
 *    the absence of an answer — and would make the surface ask again on the next
 *    turn. A member who declined has answered; re-asking would turn a refusal
 *    into attrition. The button is labelled for the durable choice it makes, not
 *    as a deferral it is not.
 *    They can still change it in voice settings, which is where a decision gets
 *    revisited deliberately rather than by repetition.
 *
 * ⛔ This route grants nothing by itself. `MAIA_ALLOW_CLOUD_VOICE=1` remains a
 *    separate deployment permission and both gates must be open — an operator
 *    cannot consent for a member, and a member cannot open egress on a
 *    deployment that forbids it. See lib/tts/cloudVoicePolicy.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { setMemberTtsProvider } from '@/lib/voice/voiceControlsService';
import { cloudVoicePermitted } from '@/lib/tts/cloudVoicePolicy';
import { memberRef } from '@/lib/privacy/memberRef';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const body = await request.json().catch(() => null);
    // Strictly boolean. A missing or non-boolean `allow` is not read as either
    // answer — consent is never arrived at by omission or by coercing a value.
    if (typeof body?.allow !== 'boolean') {
      return NextResponse.json(
        { error: 'Body must be { allow: boolean }.' },
        { status: 400 },
      );
    }

    const allow: boolean = body.allow;
    const pref = allow ? 'cloud' : 'local';

    await setMemberTtsProvider(memberId, pref);

    // Recorded verbatim, and deliberately naming BOTH gates: a member who
    // consented on a deployment that forbids cloud voice should not later find
    // an audit trail implying their choice was the thing that opened egress.
    console.info('[voice.consent]', JSON.stringify({
      // ⛔ NOT a truncated member ID. A UUID fragment is not a derivation — it
      //    still points at the member. memberRef() is a one-way hash, so the log
      //    can correlate one member's actions without the log itself becoming a
      //    way to name them. Caught by scripts/guards/member-id-log-gate.ts,
      //    which was right.
      memberRef: memberRef(memberId),
      allow,
      storedPreference: pref,
      deploymentPermitsCloud: cloudVoicePermitted(),
    }));

    return NextResponse.json({
      ok: true,
      storedPreference: pref,
      // Truthful to the member: consenting does not by itself mean MAIA will
      // now speak in the cloud voice. If the deployment forbids it, say so here
      // rather than letting the next silent turn deliver the news.
      cloudVoiceAvailable: allow && cloudVoicePermitted(),
    });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[voice.consent] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
