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
 * ⛔ THE COPY MUST NOT OVERCLAIM. An earlier draft read "your own words are not
 *    sent". That is false: MAIA's reply can quote the member, so consenting does
 *    put some of their words on the wire. What is true is narrower and is what
 *    the prompt now says — the text of her spoken replies goes out; the audio
 *    does not. A consent prompt that overstates the guarantee is worse than no
 *    prompt, because it obtains agreement to something other than what happens.
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
        so they can be read aloud. Your audio stays on this machine. MAIA keeps
        speaking either way &mdash; declining keeps her local voice.
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
          Not now
        </button>
      </div>
      {/*
        ⭐ "Not now" is a real answer, stored as 'local' — not a dismissal that
        leaves the question open. That is what stops the surface asking again on
        every turn, which would turn a refusal into attrition. It is revisitable
        in voice settings, where a decision is changed deliberately rather than
        by repetition.
      */}
      <p className="mt-2 text-xs text-neutral-500">
        You can change this any time in voice settings.
      </p>
    </div>
  );
}
