/**
 * VOICE-RECOGNITION-ENGINE-01 · M6 — human turn authority above the recognizer.
 *
 * Every recognition engine (SFSpeechRecognizer, SpeechAnalyzer/SpeechTranscriber,
 * DictationTranscriber, anything later) reports two things about text:
 *
 *   stability     volatile | finalized     "will I still revise these words?"
 *   composition   cumulative | incremental "is this the whole utterance so far,
 *                                           or a chunk to stitch?"
 *
 * Neither is an opinion about the person. A `finalized` segment means the
 * engine is done revising — it never means the human has finished the thought.
 * The contemplative pause, the mid-sentence breath, the "…and" that comes three
 * seconds later: those are MAIA's to hold, and they are decided here, by an
 * explicit `closeTurn()` from silence / turn authority, and nowhere else.
 *
 *   engine says:  "these words are now stable"
 *          ≠
 *   MAIA says:    "the human's thought is finished"
 *
 * This module is the seam that enforces the inequality. It is pure and
 * platform-free so the invariant is unit-testable without a device.
 */

import type {
  HumanTurnState,
  RecognitionEngineKind,
  TranscriptComposition,
  TranscriptStability,
  VoiceTranscript,
} from '../contract/MAIAVoiceProvider';

export type TurnCloseReason = 'silence' | 'explicit' | 'interrupt' | 'session_end';

export interface UtteranceView {
  /** Identity of the utterance being assembled. Rotates on every close. */
  utteranceId: string;
  /** Text the recognizer has finalized (will not revise). */
  committed: string;
  /** Volatile tail the recognizer may still revise. */
  pending: string;
  /** committed + pending, normalised for display / dispatch. */
  text: string;
  /** Always 'open' while assembling. Only closeTurn() produces 'complete'. */
  turn: HumanTurnState;
  /** Count of segments admitted (duplicates excluded). */
  admitted: number;
  /** Engine that produced the last admitted segment, if any. */
  engine: RecognitionEngineKind | null;
  /** Wall-clock of the last finalized admission, or null. */
  lastFinalizedAt: number | null;
  /** Wall-clock of the last admission of any stability, or null. */
  lastAdmittedAt: number | null;
}

export interface ClosedTurn {
  utteranceId: string;
  text: string;
  reason: TurnCloseReason;
  /** Whether the recognizer had finalized everything at close time. Informational only. */
  hadPendingVolatile: boolean;
  closedAt: number;
}

export type AdmissionOutcome = 'admitted' | 'duplicate' | 'stale' | 'empty';

export interface AdmissionResult {
  outcome: AdmissionOutcome;
  view: UtteranceView;
}

interface AssemblerOptions {
  now?: () => number;
  idFactory?: () => string;
}

const defaultId = (): string =>
  `utt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function normalise(committed: string, pending: string): string {
  return `${committed} ${pending}`.replace(/\s+/g, ' ').trim();
}

/**
 * Assembles one utterance from recognition segments and refuses, structurally,
 * to close the human turn on the recognizer's say-so.
 */
export class HumanTurnAssembler {
  private readonly now: () => number;
  private readonly idFactory: () => string;

  private utteranceId: string;
  private committed = '';
  private pending = '';
  private admitted = 0;
  private engine: RecognitionEngineKind | null = null;
  private lastFinalizedAt: number | null = null;
  private lastAdmittedAt: number | null = null;

  /** Highest segmentId seen per (sessionId) — rejects stale / duplicate admission. */
  private highWater = new Map<string, number>();
  private lastAdmittedKey: string | null = null;

  constructor(opts: AssemblerOptions = {}) {
    this.now = opts.now ?? (() => Date.now());
    this.idFactory = opts.idFactory ?? defaultId;
    this.utteranceId = this.idFactory();
  }

  get view(): UtteranceView {
    return {
      utteranceId: this.utteranceId,
      committed: this.committed,
      pending: this.pending,
      text: normalise(this.committed, this.pending),
      turn: 'open',
      admitted: this.admitted,
      engine: this.engine,
      lastFinalizedAt: this.lastFinalizedAt,
      lastAdmittedAt: this.lastAdmittedAt,
    };
  }

  /**
   * Admit a recognition segment. Never closes the turn — not for `isFinal`,
   * not for `stability: 'finalized'`, not for any engine.
   */
  admit(t: VoiceTranscript): AdmissionResult {
    const stability: TranscriptStability = t.stability ?? (t.isFinal ? 'finalized' : 'volatile');
    const composition: TranscriptComposition = t.composition ?? 'cumulative';

    // Duplicate-admission protection (kept from the repairs, generalised):
    // the same segment, at the same stability, with the same text, is a no-op.
    const key = `${t.sessionId}|${t.segmentId ?? 'na'}|${stability}|${t.text}`;
    if (key === this.lastAdmittedKey) {
      return { outcome: 'duplicate', view: this.view };
    }

    // Ordering protection: a volatile segment that arrives after a higher
    // segmentId has already been finalized is stale and must not reopen the tail.
    if (typeof t.segmentId === 'number') {
      const hw = this.highWater.get(t.sessionId) ?? -1;
      if (t.segmentId < hw && stability === 'volatile') {
        return { outcome: 'stale', view: this.view };
      }
      if (t.segmentId > hw) this.highWater.set(t.sessionId, t.segmentId);
    }

    const text = t.text ?? '';
    if (text.trim().length === 0 && stability === 'volatile') {
      return { outcome: 'empty', view: this.view };
    }

    if (composition === 'cumulative') {
      // Engine re-sends the whole utterance so far (SFSpeechRecognizer).
      if (stability === 'finalized') {
        this.committed = text;
        this.pending = '';
      } else {
        this.pending = text;
      }
    } else {
      // Engine sends chunks (SpeechAnalyzer): finalized appends, volatile replaces the tail.
      if (stability === 'finalized') {
        this.committed = normalise(this.committed, text);
        this.pending = '';
      } else {
        this.pending = text;
      }
    }

    const at = this.now();
    this.admitted += 1;
    this.engine = t.engine ?? this.engine;
    this.lastAdmittedAt = at;
    if (stability === 'finalized') this.lastFinalizedAt = at;
    this.lastAdmittedKey = key;

    return { outcome: 'admitted', view: this.view };
  }

  /**
   * The only way a human turn becomes 'complete'. Called by MAIA's silence /
   * turn authority (or an explicit member act), never by a recognizer event.
   * Returns null when there is nothing to close.
   */
  closeTurn(reason: TurnCloseReason): ClosedTurn | null {
    const text = normalise(this.committed, this.pending);
    const hadPendingVolatile = this.pending.trim().length > 0;
    const closedId = this.utteranceId;
    const closedAt = this.now();

    this.rotate();

    if (text.length === 0) return null;
    return { utteranceId: closedId, text, reason, hadPendingVolatile, closedAt };
  }

  /** Discard the utterance in progress without producing a turn. */
  reset(): void {
    this.rotate();
  }

  private rotate(): void {
    this.utteranceId = this.idFactory();
    this.committed = '';
    this.pending = '';
    this.admitted = 0;
    this.engine = null;
    this.lastFinalizedAt = null;
    this.lastAdmittedAt = null;
    this.lastAdmittedKey = null;
    // highWater is per-session, not per-utterance: a late volatile from the
    // previous utterance must still be recognised as stale.
  }
}
