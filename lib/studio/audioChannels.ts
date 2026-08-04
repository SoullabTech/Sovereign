/**
 * audioChannels — capture-channel identity for Session Room transcription.
 *
 * Speaker attribution in the Session Room is derived from PROVENANCE, not
 * inference. We do not fingerprint voices and we do not guess. Each audio
 * channel is a physically distinct capture source, and the label follows the
 * source:
 *
 *   - the practitioner's microphone  → 'practitioner'
 *   - the shared meeting tab's audio → 'participants'
 *
 * What this buys us and what it does not:
 *
 *   It DOES let us say, with certainty, that a given utterance did not come
 *   from the practitioner's microphone. That is a fact about the wire, not a
 *   judgement about a person.
 *
 *   It does NOT identify anyone. The meeting tab may carry one remote person
 *   or six; the channel cannot tell them apart. The label is therefore
 *   'Participants' (plural, unnamed) and never a member's name. Naming who
 *   spoke is a separate act with a separate authority — it belongs to the
 *   practitioner reviewing the transcript, not to the capture layer.
 *
 * When only the microphone is captured (in-person sessions, or the
 * practitioner declined tab-audio sharing) both people land in one waveform
 * and NO attribution is possible. That case is labeled UNATTRIBUTED_LABEL.
 * It must never be labeled "Speaker 1" — a single-speaker label on a
 * multi-speaker mix is a claim the system cannot support.
 */

/** A physically distinct capture source. */
export type CaptureChannel = 'practitioner' | 'participants';

/** Every channel value accepted over the wire. */
export const CAPTURE_CHANNELS: readonly CaptureChannel[] = [
  'practitioner',
  'participants',
] as const;

/**
 * Speaker label persisted for each channel. Deliberately structural:
 * a role for the mic (whose owner is known — they are holding the session)
 * and an unnamed plural for the far end (whose composition is not known).
 */
export const CHANNEL_LABELS: Record<CaptureChannel, string> = {
  practitioner: 'Practitioner',
  participants: 'Participants',
};

/**
 * Label for audio that carries more than one person with no way to separate
 * them. Distinct from 'unknown' (which means "the client sent us nothing") —
 * this means "we recorded it and honestly cannot attribute it".
 */
export const UNATTRIBUTED_LABEL = 'Unattributed';

export function isCaptureChannel(value: unknown): value is CaptureChannel {
  return typeof value === 'string' && (CAPTURE_CHANNELS as readonly string[]).includes(value);
}

/** Persisted speaker label for a channel, or UNATTRIBUTED_LABEL when absent. */
export function speakerLabelForChannel(channel: CaptureChannel | null): string {
  return channel ? CHANNEL_LABELS[channel] : UNATTRIBUTED_LABEL;
}

/**
 * Per-lane keying for in-memory state that is currently keyed by sessionId
 * alone (the segment gate's candidate buffer, the Whisper prompt-continuity
 * flags). Two channels streaming into one session MUST NOT share these:
 * a merged candidate buffer would splice the practitioner's half-sentence
 * onto the client's, and a shared prompt tail would seed Whisper with the
 * other speaker's words.
 */
export function laneKey(sessionId: string, channel: CaptureChannel | null): string {
  return channel ? `${sessionId}::${channel}` : sessionId;
}

/**
 * Chunk-index striping.
 *
 * supervision_transcript_segments carries
 *   ON CONFLICT (session_id, chunk_index) WHERE chunk_index >= 0 DO NOTHING
 * so a chunk index is globally unique per session. Each lane runs its own
 * MediaRecorder with its own counter starting at 0, so without striping the
 * two lanes' chunk 0 would collide and the second one would be silently
 * dropped — losing a real utterance with no error anywhere.
 *
 * Interleaving by stride keeps every index unique without a migration.
 * Display ordering uses start_ms, not chunk_index, so the stripe is invisible
 * downstream.
 */
const CHANNEL_STRIDE = 2;
const CHANNEL_OFFSET: Record<CaptureChannel, number> = {
  practitioner: 0,
  participants: 1,
};

export function stripedChunkIndex(channel: CaptureChannel | null, sequence: number): number {
  if (!channel) return sequence;
  return sequence * CHANNEL_STRIDE + CHANNEL_OFFSET[channel];
}
