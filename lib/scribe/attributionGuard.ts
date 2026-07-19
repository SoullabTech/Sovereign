/**
 * Speaker-attribution provenance guard (Kelly ruling, 2026-07-19).
 *
 * The 2026-07-19 recording-provenance audit found that scribe sessions are
 * captured as ONE undiarized audio stream (studio_session_room tab audio):
 * every transcript line carries the same speaker label even when several
 * people were in the room. Any "Speaker 2" in a generated review is therefore
 * an inference from conversational structure, not captured attribution — and
 * inferred dialogue must never be presented as captured attribution.
 *
 * The gate is derived from the transcript itself, not a deploy constant: when
 * dual-track capture / diarization ships (Native Session Room Phase B),
 * distinct speaker labels appear in the transcript and the guard turns off
 * with no code change.
 */

/**
 * True when the transcript carries no speaker distinctions — every line has
 * the same label. An empty transcript is NOT single-speaker: there is no
 * attribution to qualify.
 */
export function isSingleSpeakerTranscript(speakers: string[]): boolean {
  return speakers.length > 0 && new Set(speakers).size === 1;
}

/**
 * Appended to review prompts (digest, synthesis, and the simple single-call
 * path) when the source transcript is single-speaker. Aligns with the
 * Said/Observed/Tentative epistemic-label discipline of the Elemental view.
 */
export const SINGLE_SPEAKER_ATTRIBUTION_GUARD = `

# Speaker Attribution — single undiarized stream

This transcript was recorded as ONE audio stream without speaker diarization: every line carries the same speaker label, even where more than one person was in the room. Any distinction between participants is an INFERENCE from conversational structure, not captured attribution.
- Never write "Speaker 2 said…" or attribute a quote to a specific second participant as though it were recorded.
- Use inference-honest phrasing instead: "the other participant appears to say…", "a second voice is inferable from the conversational structure", "what reads as the practitioner's question…".
- Where epistemic labels are in use (Said / Observed / Tentative), any cross-participant attribution is at most Tentative — never Said.`;
