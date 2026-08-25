// MAIA Desktop — voice diagnostics.
//
// MAIA-D01. The founder's ruling was explicit: reuse the existing VoiceDiagEvent
// vocabulary where semantically applicable, and do NOT invent a parallel voice
// diagnostics language. The reason is comparability — MAIA-D00 §5.3 found an
// active browser voice programme (Units 1–2, V5 tail witness) instrumenting
// exactly this defect class. If the native path emitted different names for the
// same boundaries, the programme would produce two incomparable truths about
// one failure.
//
// So every event below is taken from lib/voice/voiceDiagnostics.ts, with ONE
// documented exception (`voice_tail_lost`, justified in NEW_EVENTS).
//
// Surface is carried as METADATA rather than as a name prefix. The iOS path uses
// an `ios_voice_*` prefix because the Capacitor plugin genuinely emits different
// things (it has no final-result event at all). Desktop crosses the same
// boundaries as the web path, so a prefix would assert a difference that does
// not exist and would break the comparison this instrumentation is for.
//
// ⛔ PRIVACY. No emitter here may carry transcript text. Recognized material is
// reported STRUCTURALLY — `chars` says material grew or shrank, never which
// words. This is the containment rule in
// docs/design/contracts/conversation-room-voice-capture.md, which exists because
// a previous surface wrote member speech verbatim to a console.

'use strict';

/** Events reused verbatim from the canonical VoiceDiagEvent union. */
const REUSED_EVENTS = Object.freeze([
  'voice_mic_granted',          // getUserMedia resolved
  'voice_listening_started',    // capture epoch opened (also: a restart)
  'voice_audio_started',        // first audio frame observed
  'voice_speech_started',       // VAD acknowledged speech
  'voice_result_interim',       // partial transcript
  'voice_result_final',         // final transcript
  'voice_transcribe_sent',      // audio dispatched to the transcription path
  'voice_transcribe_result',    // transcription returned (any text, even empty)
  'voice_transcribe_error',     // transcription failed
  'voice_recognition_ended',    // capture epoch closed (metadata carries why)
  'voice_transcript_salvaged',  // unfinished material was rescued at a boundary
  'voice_capture_lost',         // capture died
  'voice_turn_commit_requested',
  'voice_turn_committed',
  'voice_result_after_commit',  // a trailing result arrived after commit
]);

// ⚠️ THE ONE NEW EVENT, and the argument for it.
//
// The tail invariant requires that unfinished speech at an epoch boundary is
// either preserved OR *explicitly surfaced as lost*. The existing vocabulary can
// express the first half (`voice_transcript_salvaged`) but not the second.
//
// The near misses, and why each is wrong rather than merely awkward:
//   · voice_capture_lost       names the CAPTURE dying, not the MATERIAL being
//                              lost. The two are independent: capture can die
//                              with nothing pending, and material can be lost
//                              while capture is perfectly healthy.
//   · voice_transcript_salvaged with chars:0 would be a false statement.
//                              "Salvaged" asserts a rescue that did not happen.
//   · voice_result_after_commit is ordering F — a result arriving late — not an
//                              epoch ending with material still open.
//
// The browser path never needed this name because its salvage either succeeded
// or there was nothing pending; loss was never a reachable, nameable outcome.
// On the native path it is reachable, so it must be nameable. One event.
const NEW_EVENTS = Object.freeze(['voice_tail_lost']);

const KNOWN_EVENTS = Object.freeze([...REUSED_EVENTS, ...NEW_EVENTS]);

/** Metadata keys permitted to carry a string. Everything else must be non-text. */
// Each entry is a CLOSED VOCABULARY — a reason code, a device class, an error
// name. None can carry recognized speech. `tailOutcome` in particular is one of
// exactly three values (empty | salvaged | lost); it is named here rather than
// exempted, because an unlisted string is refused by default and that default is
// the point. (It caught this file's own first emission, which is the guard
// working: the fix was to review the field and list it, not to relax the rule.)
const STRING_META_ALLOWLIST = Object.freeze([
  'surface', 'reason', 'cause', 'reasonCode', 'errorName', 'phase', 'source', 'mime',
  'tailOutcome', 'outcome',
]);

/**
 * A privacy-safe diagnostic emitter.
 *
 * @param {(event: string, meta: object) => void} sink where events go
 * @param {object} [opts]
 * @param {string} [opts.surface='desktop']
 * @param {() => number} [opts.now] injected clock — no Date.now() in core logic,
 *        so tests are deterministic and a replay cannot drift.
 */
function createDiagnostics(sink, opts = {}) {
  const surface = opts.surface || 'desktop';
  const now = opts.now || (() => 0);
  const emitted = [];

  function emit(event, meta = {}) {
    if (!KNOWN_EVENTS.includes(event)) {
      // Refuse rather than pass through. An unknown event name is how a parallel
      // vocabulary starts: one call site, then five, then a second language.
      throw new Error(
        `unknown voice diagnostic event '${event}' — add it to REUSED_EVENTS ` +
        `(if it exists in the canonical union) or argue for it in NEW_EVENTS`
      );
    }
    for (const [k, v] of Object.entries(meta)) {
      if (typeof v === 'string' && !STRING_META_ALLOWLIST.includes(k)) {
        throw new Error(
          `voice diagnostics refused: meta key '${k}' carries a string. Transcript ` +
          `content must never enter telemetry — report structure (chars/count), not text.`
        );
      }
    }
    const record = { event, surface, at: now(), ...meta };
    emitted.push(record);
    try { sink(event, record); } catch { /* diagnostics never break capture */ }
    return record;
  }

  return { emit, emitted, KNOWN_EVENTS, REUSED_EVENTS, NEW_EVENTS };
}

module.exports = {
  createDiagnostics,
  KNOWN_EVENTS,
  REUSED_EVENTS,
  NEW_EVENTS,
  STRING_META_ALLOWLIST,
};
