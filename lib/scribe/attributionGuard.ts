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

import { CHANNEL_LABELS, UNATTRIBUTED_LABEL } from '@/lib/studio/audioChannels';

/**
 * True when the transcript carries no speaker distinctions — every line has
 * the same label. An empty transcript is NOT single-speaker: there is no
 * attribution to qualify.
 */
export function isSingleSpeakerTranscript(speakers: string[]): boolean {
  return speakers.length > 0 && new Set(speakers).size === 1;
}

/**
 * Display-time re-presentation of transcripts recorded before dual-channel
 * capture (2026-08-04).
 *
 * Those sessions were captured as one mixed waveform and every chunk was
 * uploaded with a hardcoded `Speaker 1`. The stored label is therefore not a
 * weak attribution — it is a claim nothing ever determined. Rendering it makes
 * the transcript assert, to the practitioner and to anyone they export it to,
 * that one identified person said all of it.
 *
 * This corrects the PRESENTATION only. Stored rows are left exactly as they
 * are: the transcript text is the record of what was said, and the stale label
 * is the evidence that made this correction necessary. Overwriting it would
 * destroy both the provenance trail and the ability to tell a genuinely
 * single-speaker session from a mixed one.
 *
 * Derived from the transcript, not from a flag or a date — the same design as
 * SINGLE_SPEAKER_ATTRIBUTION_GUARD above. A session whose segments carry two
 * distinct capture-channel labels is left untouched, so this turns itself off
 * for dual-channel sessions with no code change.
 */
export function shouldRepresentAsUnattributed(speakers: string[]): boolean {
  if (!isSingleSpeakerTranscript(speakers)) return false;
  const only = speakers[0];
  // A single-lane session that legitimately recorded one channel (only the
  // practitioner ever spoke) already carries a true, provenance-derived label.
  // Leave it alone; it is not a mixed stream.
  if (only === CHANNEL_LABELS.practitioner || only === CHANNEL_LABELS.participants) {
    return false;
  }
  return true;
}

/**
 * Speaker label to render for a segment, given the labels present across the
 * whole transcript. Callers must pass the full set — the judgement is about
 * the session, not the line.
 */
export function displaySpeakerLabel(speaker: string, allSpeakers: string[]): string {
  return shouldRepresentAsUnattributed(allSpeakers) ? UNATTRIBUTED_LABEL : speaker;
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
