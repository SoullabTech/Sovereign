// DESKTOP-VOICE-SHAPE-01 — the audio wire contract, in one place.
//
// Two contracts met here and disagreed silently.
//
//   synthesizeMaiaVoice()  →  Promise<Buffer>          raw mp3 bytes
//   /api/sovereign/app/maia/list  read  .audioBase64   an older object shape
//
// A Buffer is truthy and has no `.audioBase64`, so the route's guard passed,
// every field it read was `undefined`, JSON.stringify dropped them, and the
// wire carried `"audio": {}`. The server logged `+ audio` truthfully (it had a
// real Buffer) while Desktop reported no voice truthfully (`data.audio
// .audioBase64` was undefined). Both ends were honest; the contract between
// them was not.
//
// ⭐ This module is a pure shape normalizer. It knows nothing about providers,
// voices, prosody or routing, and it must stay that way — the provider defect
// (DESKTOP-VOICE-PROVIDER-01) is a separate open finding, deliberately left
// unrepaired here. Changing what voice is synthesized does not belong in a
// serialization fix.
//
// ⛔ It never fabricates audio. Absent, empty, or unrecognizable input returns
// null so the caller omits the key entirely, rather than emitting an empty
// object that reads as "audio present" to a truthiness check one layer up.
// That empty object is precisely what made this defect invisible.

export type AudioResponsePayload = {
  /** base64-encoded audio bytes. Absent only when a legacy payload carried a URL instead. */
  audioBase64?: string;
  /**
   * Container format. Set to mp3 for raw bytes, because that is what
   * synthesizeMaiaVoice currently emits. Absent for a legacy payload that did
   * not declare one — a URL's format is not ours to assume.
   */
  format?: string;
  audioUrl?: string;
  voiceProfile?: string;
  synthesisTimeMs?: number;
};

const DEFAULT_FORMAT = 'mp3';

const nonEmptyString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

/**
 * Normalize whatever the orchestrator produced into the shape the HTTP response
 * promises. Returns null when there is no audio to report — callers should then
 * omit the `audio` key rather than send an empty object.
 */
export function toAudioResponsePayload(audio: unknown): AudioResponsePayload | null {
  if (!audio) return null;

  // Current contract: raw bytes from synthesizeMaiaVoice.
  // Buffer is a Uint8Array, so the second test also covers non-Buffer byte views.
  const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(audio);
  if (isBuffer || audio instanceof Uint8Array) {
    const bytes = audio as Uint8Array;
    if (bytes.length === 0) return null; // synthesis produced nothing — say nothing
    const buf = isBuffer ? (audio as Buffer) : Buffer.from(bytes);
    return { audioBase64: buf.toString('base64'), format: DEFAULT_FORMAT };
  }

  // Legacy contract: an already-shaped object. Preserved, not rewritten — some
  // callers carried a URL instead of bytes, and this repair must not drop them.
  // ⛔ `format` is carried only if it was declared. Defaulting it to mp3 here
  // would state a fact about someone else's bytes that this module cannot know:
  // mp3 is true of what synthesizeMaiaVoice emits, not of an arbitrary URL.
  if (typeof audio === 'object') {
    const o = audio as Record<string, unknown>;
    const audioBase64 = nonEmptyString(o.audioBase64);
    const audioUrl = nonEmptyString(o.audioUrl);
    if (!audioBase64 && !audioUrl) return null; // an empty object is not audio

    const out: AudioResponsePayload = {};
    const format = nonEmptyString(o.format);
    if (format) out.format = format;
    if (audioBase64) out.audioBase64 = audioBase64;
    if (audioUrl) out.audioUrl = audioUrl;

    const voiceProfile = nonEmptyString(o.voiceProfile);
    if (voiceProfile) out.voiceProfile = voiceProfile;
    if (typeof o.synthesisTimeMs === 'number') out.synthesisTimeMs = o.synthesisTimeMs;

    return out;
  }

  return null;
}
