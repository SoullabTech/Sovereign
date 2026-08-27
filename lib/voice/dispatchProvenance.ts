/**
 * VOICE-CAPTURE-01B-OBS — which client boundary actually produced the turn?
 *
 * THE CENSUS THAT JUSTIFIES THIS MODULE
 * -------------------------------------
 * `processAccumulatedTranscript()` is not the send boundary. It is ONE of
 * eight. As of 64c2b7c07, `components/voice/ContinuousConversation.tsx` calls
 * `onTranscript(...)` from eight distinct live sites, and only the one inside
 * `processAccumulatedTranscript` passes through the two dedup guards:
 *
 *   process_accumulated   ← the ONLY dedup-guarded path
 *   fallback              android post-no-speech recovery
 *   android_fallback      android native fallback recorder
 *   native_silence        native partial-result silence timeout
 *   native_audio_silence  native audio-level silence timeout
 *   native_stop           native listeningState === 'stopped'
 *   web_whisper           web MediaRecorder → local whisper
 *   manual_stop           stopListening() flushing its accumulator
 *
 * Seven paths bypass Check 1 and Check 2 entirely. Any dedup heuristic tuned
 * on the guarded path therefore cannot, even in principle, suppress a
 * duplicate produced by the other seven. That is why this unit measures
 * instead of widening a window: the mechanism must be named before it is
 * repaired.
 *
 * WHAT THIS MODULE IS AND IS NOT
 * ------------------------------
 * It is a counter and a comparison. It does not suppress, delay, reorder, or
 * alter any dispatch. `sameAsPrevious` is REPORTED, never acted on. If a
 * caller ever branches on a value from here, this stops being an observation
 * and becomes an unreviewed behavior change.
 *
 * PRIVACY
 * -------
 * The previous transcript is held in a module-local variable for exactly as
 * long as it takes the next one to arrive, so the two can be compared. Only
 * the BOOLEAN leaves this module. No transcript text is returned, emitted,
 * logged, or persisted — the same in-memory holding class as
 * `accumulatedTranscript`, and a strictly shorter lifetime.
 *
 * The three orderings this makes readable in `docker logs`:
 *
 *   CASE 1 — dedup works
 *     voice_dedup_blocked dedupKind=exact
 *     → exactly one voice_transcript_dispatched
 *
 *   CASE 2 — same path, duplicate escapes the time window
 *     dispatched id=41 source=process_accumulated sameAsPrevious=false
 *     dispatched id=42 source=process_accumulated sameAsPrevious=true
 *                      msSincePrevious > 2000
 *
 *   CASE 3 — competing send boundaries  ← the census says this is possible
 *     dispatched id=41 source=process_accumulated
 *     dispatched id=42 source=native_stop   sameAsPrevious=true
 */

/**
 * Every live `onTranscript(...)` call site in ContinuousConversation, named.
 *
 * Adding a send path means adding a member here. The contract test in
 * `__tests__/voice-capture-01b-dispatch-provenance.test.ts` fails if a call
 * site exists without a witness, so a new path cannot become invisible by
 * omission — which is the failure mode that produced this lane.
 */
export type TranscriptDispatchSource =
  | 'process_accumulated'
  | 'fallback'
  | 'android_fallback'
  | 'native_silence'
  | 'native_audio_silence'
  | 'native_stop'
  | 'web_whisper'
  | 'manual_stop'
  | 'other';

/** Why this boundary was reached. Mirrors `UtteranceSendTrigger` vocabulary. */
export type TranscriptDispatchTrigger =
  | 'vad'
  | 'silence_timer'
  | 'manual'
  | 'fallback'
  | 'native_stop'
  | 'other';

export interface DispatchProvenance {
  /** Monotonic, client-local, resets with the mic session. */
  dispatchId: number;
  /** Length only — never the words. */
  charCount: number;
  /** Normalized-equality against the previous dispatch. False for the first. */
  sameAsPrevious: boolean;
  /** ms since the previous dispatch; -1 when this is the first. */
  msSincePrevious: number;
}

/** Same normalization the dedup guards use, so the boolean is comparable. */
function normalize(text: string): string {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

let dispatchCounter = 0;
let previousNormalized = '';
let previousAt = 0;

/**
 * Record a dispatch and return its provenance. Call this immediately BEFORE
 * `onTranscript(...)`, never after — an exception thrown downstream must not
 * be able to erase the evidence that the dispatch was attempted.
 *
 * Not pure by design (it is a sequence witness), but the ordering it produces
 * is deterministic and `resetDispatchProvenance()` makes it testable.
 */
export function recordDispatch(transcript: string, now: number): DispatchProvenance {
  const normalized = normalize(transcript);
  const provenance: DispatchProvenance = {
    dispatchId: ++dispatchCounter,
    charCount: (transcript || '').length,
    // The first dispatch of a session has nothing to be the same as. Reporting
    // it as `false` rather than `null` keeps the field a clean boolean for log
    // filtering; `msSincePrevious === -1` is the unambiguous first marker.
    sameAsPrevious: previousAt > 0 && normalized.length > 0 && normalized === previousNormalized,
    msSincePrevious: previousAt > 0 ? Math.max(0, now - previousAt) : -1,
  };

  previousNormalized = normalized;
  previousAt = now;
  return provenance;
}

/**
 * Clear the comparison state.
 *
 * LIFETIME: one deliberate voice-conversation engagement — NOT one microphone
 * stream, and not the browser process.
 *
 * This was originally called beside `resetVoiceSession()` on every successful
 * `getUserMedia`. Production at 92bc2a9df disproved that scope: six
 * consecutive hands-free turns each re-acquired the mic and each reported
 * `dispatchId=1, msSincePrevious=-1`, so a duplicate that reappeared across a
 * re-acquisition boundary could never be seen. The design assumed
 * "mic engagement ~ conversation"; production says "mic engagement ~ utterance".
 *
 * Callers are now the engagement boundaries in `ContinuousConversation.tsx`:
 * component mount, component unmount, and explicit `userExitMode` exit. The
 * reset still matters at those points — without it a later engagement whose
 * first phrase happens to repeat the last of a previous one would report a
 * duplicate across a boundary that has none.
 */
export function resetDispatchProvenance(): void {
  dispatchCounter = 0;
  previousNormalized = '';
  previousAt = 0;
}
