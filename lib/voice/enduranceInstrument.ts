/**
 * Voice endurance instrument — OBSERVABILITY ONLY.
 *
 * ⚠️ This module changes NO voice behaviour. It starts nothing, stops nothing,
 * restarts nothing and decides nothing. The behaviour under test remains
 * commit 13af35bf2; this layer exists so an hour of real use produces a
 * readable trace instead of a memory of one.
 *
 * WHY IT EXISTS
 * The 60-minute claim — "MAIA carries a conversation without dropping hearing
 * or responding" — does not exist until a phone has actually done the hour.
 * Every artifact so far proves mechanism (unit tests), root cause (production
 * SQL) or identity (unpacked IPA). None of them is endurance evidence.
 *
 * DESIGN RULES
 *  1. OBSERVE EXISTING AUTHORITY. The mic state machine and its authority guard
 *     already exist. This reads `micState` and the native recognizer status; it
 *     never forms a second opinion about whether the mic is live. A parallel
 *     interpretation would be a new source of truth, and the failure this whole
 *     programme keeps hitting is two components disagreeing about one truth.
 *  2. NEVER RECORD CONTENT. Transcript text never enters a sample — only
 *     lengths, ids and technical state. Sanctuary and the log-containment rules
 *     apply to diagnostics exactly as they apply to memory.
 *  3. STATE CHANGES + A SLOW HEARTBEAT. Transitions are the signal; the
 *     heartbeat only proves the session was still alive between them. A
 *     one-second poll would bury the transitions in its own noise and add load
 *     to the very thing under observation.
 *  4. CLIENT DOES NOT DIAGNOSE THE SERVER. A 37-second wait for the model is
 *     not a microphone defect. This records that the mic was closed and for how
 *     long; correlating that with `llm_first_chunk` happens later, off-device,
 *     against server logs. The instrument must not editorialise.
 */

import { logVoiceEvent } from './voiceDiagnostics';

/** How often the heartbeat fires. Slow on purpose — see design rule 3. */
export const HEARTBEAT_INTERVAL_MS = 45_000;

/**
 * A single observation. Every field is technical state read from an existing
 * authority; none is derived by this module and none carries member content.
 */
export interface EnduranceSample {
  /** ms since the instrument started — the x-axis of the whole witness. */
  elapsedMs: number;
  /** Authoritative mic state, read from the state machine. */
  micState: string;
  /** Push-to-talk vs continuous, as the UI understands it. */
  listeningMode: string | null;
  isListening: boolean;
  isRecording: boolean;
  /** Native recognizer's own last reported status: 'started' | 'stopped'. */
  nativeStatus: string | null;
  /** Does the member still want continuous conversation? */
  wantsContinuous: boolean;
  /** Restart bookkeeping — the path that ends in "user must tap mic". */
  restartAttempts: number;
  backoffStep: number;
  restartInFlight: boolean;
  /** Staleness: how long since real audio / recognized speech, in ms. */
  lastAudioFrameAgeMs: number | null;
  lastSpeechAgeMs: number | null;
  /** Utterance accounting for the session so far. */
  utteranceAdmissions: number;
  utteranceRefusals: number;
  lastUtteranceId: string | null;
}

/** Everything the instrument needs, supplied by the component that owns it. */
export type EnduranceProbe = () => Omit<EnduranceSample, 'elapsedMs'>;

type Counters = { admissions: number; refusals: number; lastUtteranceId: string | null };

/**
 * Matches the diagnostics transport's `Meta` shape exactly: flat primitives
 * only. Deliberate — a nested or free-form payload is how transcript content
 * leaks into telemetry by accident, and this instrument must never carry any.
 */
type EmitExtra = Record<string, string | number | boolean | null>;

export class VoiceEnduranceInstrument {
  private startedAt = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private probe: EnduranceProbe | null = null;
  private lastMicState: string | null = null;
  private counters: Counters = { admissions: 0, refusals: 0, lastUtteranceId: null };
  /** Wall-clock ms the mic has spent unable to hear, cumulatively. */
  private closedSinceMs: number | null = null;

  /** True only between start() and stop(). */
  get running(): boolean {
    return this.timer !== null;
  }

  get elapsedMs(): number {
    return this.startedAt ? Date.now() - this.startedAt : 0;
  }

  start(probe: EnduranceProbe): void {
    if (this.timer) return; // idempotent — a second start must not double-sample
    this.probe = probe;
    this.startedAt = Date.now();
    this.counters = { admissions: 0, refusals: 0, lastUtteranceId: null };
    this.lastMicState = null;
    this.closedSinceMs = null;

    this.emit('voice_endurance_session_started');
    this.timer = setInterval(() => this.emit('voice_endurance_heartbeat'), HEARTBEAT_INTERVAL_MS);
  }

  stop(reason: string): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
    this.emit('voice_endurance_session_ended', { reason });
    this.probe = null;
  }

  /**
   * A mic state transition. Called from the state machine's own setter so the
   * instrument sees exactly what the authority decided, including its `source`.
   */
  noteMicStateChange(next: string, source: string): void {
    if (!this.running) return;
    const prev = this.lastMicState;
    this.lastMicState = next;

    // Track how long the mic spends unable to hear. Recorded, not interpreted:
    // a long closure may be a defect OR a slow inference, and this module is
    // deliberately not the thing that decides which.
    const CAN_HEAR = next === 'LISTENING';
    if (!CAN_HEAR && this.closedSinceMs === null) {
      this.closedSinceMs = Date.now();
    }
    let closedForMs: number | null = null;
    if (CAN_HEAR && this.closedSinceMs !== null) {
      closedForMs = Date.now() - this.closedSinceMs;
      this.closedSinceMs = null;
    }

    this.emit('voice_endurance_mic_transition', {
      from: prev,
      to: next,
      source,
      closedForMs,
    });
  }

  /** An utterance admission decision, mirrored from the submission guard. */
  noteUtterance(admitted: boolean, utteranceId: string | null, source: string): void {
    if (!this.running) return;
    if (admitted) this.counters.admissions++;
    else this.counters.refusals++;
    if (utteranceId) this.counters.lastUtteranceId = utteranceId;
    this.emit('voice_endurance_utterance', { admitted, utteranceId, source });
  }

  /**
   * The fallback that ends a conversation: the mic stops and will not resume
   * until the member taps. This is the single most important event in a
   * 60-minute witness, because it is "MAIA stopped hearing me" by design.
   */
  noteTapRequiredFallback(reason: string, restartAttempts: number): void {
    if (!this.running) return;
    this.emit('voice_endurance_tap_required', { reason, restartAttempts });
  }

  private emit(event: string, extra: EmitExtra = {}): void {
    const base = this.probe?.();
    const sample: EmitExtra = {
      elapsedMs: this.elapsedMs,
      elapsedMin: Math.round(this.elapsedMs / 60_000),
      ...(base ?? {}),
      utteranceAdmissions: this.counters.admissions,
      utteranceRefusals: this.counters.refusals,
      lastUtteranceId: this.counters.lastUtteranceId,
      ...extra,
    };
    // eslint-disable-next-line no-console
    console.log(`⏱️ [endurance] ${event}`, sample);
    logVoiceEvent(event as never, sample);
  }
}

/** One instrument per app instance. */
export const voiceEndurance = new VoiceEnduranceInstrument();
