'use client';

/**
 * CloudVoiceConsentPrompt — VOICE-SOVEREIGNTY-03.
 *
 * The member-facing half of the consent gesture. Founder ruling 2026-08-29:
 * choosing MAIA's voice identity is not the same act as consenting to cloud
 * egress. This component is where the second act happens.
 *
 * ⛔ WHAT THIS IS NOT. Not a paywall, not a gate, not an error state. MAIA is
 *    already speaking locally when this appears. Nothing is being withheld and
 *    nothing is waiting on the answer — the ask is additive. If it ever reads as
 *    a toll, the copy is wrong.
 *
 * ⛔ IT DOES NOT REPLAY THE TURN. Answering records a preference that takes
 *    effect on the NEXT turn. Re-synthesising words the member already heard is
 *    not what they agreed to.
 *
 * The prompt names the voice and the provider plainly, because a consent
 * question that hides where the data goes is not consent. It says "cloud
 * synthesis", not "enhanced voice" — the member is agreeing to their words
 * leaving the machine, and the sentence they read should be the sentence that
 * is true.
 *
 * ⛔ THE COPY MUST NOT OVERCLAIM, and it took two passes to stop doing so.
 *
 *    Draft 1: "your own words are not sent" — false. MAIA's reply can quote the
 *    member, so consenting does put some of their words on the wire.
 *
 *    Draft 2: "your audio stays on this machine" — false in the general case,
 *    and a subtler error because it sounds like a privacy guarantee. Desktop
 *    sovereign STT posts microphone audio to the first-party
 *    /api/voice/transcribe-simple. In the witness that server happens to be the
 *    same Mac, but the PRODUCT CONTRACT must not turn a first-party transport
 *    guarantee into a physical-locality promise: a deployment where the app and
 *    Whisper sit on different hosts would make the sentence a lie without anyone
 *    editing this file.
 *
 *    ⭐ The claim must be about the boundary the member is actually consenting
 *      to — OpenAI — not about topology we do not control. Hence the narrower
 *      true sentence: their microphone audio is not sent TO OPENAI for this
 *      synthesis. A consent prompt that overstates the guarantee is worse than
 *      no prompt, because it obtains agreement to something other than what
 *      happens.
 */

import type { CloudVoiceConsentRequest } from '@/hooks/useStreamingVoice';

interface CloudVoiceConsentPromptProps {
  request: CloudVoiceConsentRequest | null;
  onAnswer: (allow: boolean) => void;
}

export function CloudVoiceConsentPrompt({ request, onAnswer }: CloudVoiceConsentPromptProps) {
  if (!request) return null;

  // The member-facing name, never the internal archetype ID. `voiceArchetype`
  // ('maia_core') exists on the payload for telemetry and is deliberately not
  // rendered — lib/voice/voiceArchetypes.ts:14 is explicit that DB IDs are
  // internal and never shown to members.
  const voiceName = request.voiceLabel || 'this voice';
  const providerName = request.provider === 'openai' ? 'OpenAI' : request.provider;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cloud-voice-consent-title"
      className="mx-auto mb-3 max-w-md rounded-xl border border-amber-500/25 bg-neutral-900/70 px-4 py-3 text-sm text-neutral-200 backdrop-blur"
    >
      <p id="cloud-voice-consent-title" className="mb-1 font-medium text-amber-200/90">
        {voiceName} uses {providerName} for this voice
      </p>
      <p className="mb-3 text-neutral-400">
        Allowing this sends the text of MAIA&apos;s spoken replies to {providerName}
        so they can be read aloud. Your microphone audio is not sent to{' '}
        {providerName} for this voice synthesis. MAIA keeps speaking either way.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAnswer(true)}
          className="rounded-lg bg-amber-500/20 px-3 py-1.5 font-medium text-amber-100 transition hover:bg-amber-500/30"
        >
          Allow cloud voice
        </button>
        <button
          type="button"
          onClick={() => onAnswer(false)}
          className="rounded-lg bg-neutral-700/50 px-3 py-1.5 text-neutral-300 transition hover:bg-neutral-700/70"
        >
          Keep voice local
        </button>
      </div>
      {/*
        ⭐ THE LABEL MUST MATCH WHAT THE BUTTON DOES. This read "Not now", which
        described a deferral. It is not one: allow:false durably stores
        tts_provider='local' and the member is never asked again. That
        anti-attrition behaviour is correct — but a durable choice labelled as a
        temporary one misrepresents the act at the moment of consent, which is
        the worst possible moment to be imprecise. If we truly meant "Not now" we
        would have to leave the preference unresolved and ask again later, which
        is exactly the repetition the storage design avoids.

        "Keep voice local" also says what the member GETS, not merely what they
        decline. Declining is not going without: MAIA keeps speaking, in af_kore.
      */}
      <p className="mt-2 text-xs text-neutral-500">
        You can change this any time in voice settings.
      </p>
    </div>
  );
}
