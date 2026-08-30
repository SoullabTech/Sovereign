/**
 * Read the transcript out of a `/api/voice/transcribe-simple` response.
 *
 * ⛔ VOICE-TRANSCRIBE-RESPONSE-SHAPE-01 — `transcription` FIRST, because it is
 * what our own endpoint actually sends.
 *
 * The comment that used to sit at the call site said "/api/voice/transcribe-simple
 * … return a `text` field", and that was simply wrong: the route returns
 * `{ success, transcription, … }` (transcribe-simple/route.ts:160). So this
 * reader accepted two shapes, neither of which its own endpoint uses, and every
 * successful transcription was read as blank and discarded as `empty_transcript`.
 *
 * ⛔ DEVICE-WITNESSED, 2026-08-29. Faster-Whisper returned HTTP 200 with English
 * at p=0.99 and non-empty text — 35 chars, then 81 — and both were thrown away
 * here. The member had spoken; MAIA had heard; the transcript died one field
 * name from becoming a turn.
 *
 * ⛔ THIS WAS NEVER DESKTOP-ONLY. This module is the sovereign transport for
 * three surfaces — the Android-Chrome recovery, the Firefox/Zen web-whisper
 * branch, and (since DESKTOP-SOVEREIGN-STT-01) Desktop. None of them could ever
 * have produced a voice turn through it.
 *
 * `text` and `transcript` are kept: the underlying Whisper service speaks the
 * OpenAI shape (`{ text }`), so a caller pointed straight at it still works. The
 * order reflects which shape this function actually meets.
 *
 * ⛔ EXPORTED so the contract can be exercised directly. The surrounding
 * function needs MediaRecorder and a live stream; this boundary needs neither,
 * and it is the boundary that failed.
 */
export function readTranscript(payload: unknown): string {
  const p = payload as Record<string, unknown> | null | undefined;
  const value = p?.transcription ?? p?.text ?? p?.transcript;
  return typeof value === 'string' ? value.trim() : '';
}
