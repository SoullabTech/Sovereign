// VOICE-CAPTURE-PROVENANCE-01 — how an utterance arrived, carried with it.
//
// THE DEFECT. On 2026-08-28 the Desktop capture path emitted text that was
// accepted, persisted and answered as though the member had said it. Two
// specimens in the member's canonical thread: a repeated apology loop, and a
// wall of a single letter. The member's own account, in the thread: "that was
// not me." MAIA answered both in good faith, because the system told her the
// member said this when it only knew the capture stack emitted this.
//
// ⭐ THE ARCHITECTURAL POINT, stated once:
//
//     A canonical event does not imply a trusted autobiographical assertion.
//
// Canonical history can faithfully record that the capture stack produced X at
// time Y without asserting that the member said X. The memory layer already
// separates member-marked from system-inferred — `is_breakthrough` is true only
// because a member marked it. This module extends that same discipline one
// layer earlier, to the input boundary, which carried no marking at all.
//
// ⛔ WHAT THIS IS NOT. It is not a content filter. Repetition, apology,
// fragments and long runs of a single letter can all be intentional human
// speech. The specimens that exposed this defect are indistinguishable, as
// text, from things a member might genuinely say — and the same thread holds
// the proof in both directions: a coherent product name that was NOT the
// member, and a rambling dictated sentence that WAS. Hence:
//
//     Textual plausibility cannot establish authorship provenance.
//
// Nothing here inspects what was said. It records only how it arrived.
//
// SHAPE. Deliberately modelled on `lib/sanctuary/turnPosture.ts`, which solved
// the same problem for Sanctuary: a frozen value resolved ONCE at the serving
// boundary, with a private constructor so a downstream caller cannot forge one
// — `{ memberAuthored: true }` does not typecheck against this class, and a JS
// caller bypassing types fails the `instanceof` check inside the gate.

/** How the text reached the system. */
export type InputModality = 'text' | 'speech' | 'unknown';

/**
 * What the capture layer itself claims about this text. `unknown` is the
 * honest default for a surface that does not yet declare provenance — it is
 * not a synonym for `accepted`.
 */
export type CaptureStatus = 'accepted' | 'suspect' | 'rejected' | 'unknown';

export class CaptureProvenance {
  readonly inputModality: InputModality;
  readonly captureProvider: string | null;
  readonly captureSessionId: string | null;
  readonly captureConfidence: number | null;
  readonly captureStatus: CaptureStatus;

  /**
   * ⭐ Evidence-based, never asserted by the caller.
   *
   * True only where the member's own action produced the characters — typing.
   * Speech is authorship *claimed by a recognizer*, and a recognizer that is
   * right most of the time is exactly the one that needs a trust field: a
   * channel that failed every time would be obvious.
   *
   * `unknown` modality is NOT member-authored either. That is the fail-closed
   * direction: absence of evidence is not evidence of authorship.
   */
  readonly memberAuthored: boolean;

  readonly resolvedAtIso: string;
  readonly source: 'request-meta';

  private constructor(
    inputModality: InputModality,
    captureProvider: string | null,
    captureSessionId: string | null,
    captureConfidence: number | null,
    captureStatus: CaptureStatus,
  ) {
    this.inputModality = inputModality;
    this.captureProvider = captureProvider;
    this.captureSessionId = captureSessionId;
    this.captureConfidence = captureConfidence;
    this.captureStatus = captureStatus;

    // Derived here, never accepted from the wire. A client cannot declare
    // itself authored — it can only report how it captured, and this decides.
    this.memberAuthored = inputModality === 'text';

    this.resolvedAtIso = new Date().toISOString();
    this.source = 'request-meta';
    Object.freeze(this);
  }

  /**
   * Resolve once, at the serving boundary, from request meta. Every field is
   * validated; anything unrecognised degrades to the honest default rather
   * than to the permissive one.
   */
  static resolve(meta?: Record<string, unknown> | null): CaptureProvenance {
    const m = meta ?? {};

    const modality: InputModality =
      m.inputModality === 'text' || m.inputModality === 'speech'
        ? m.inputModality
        : 'unknown';

    const status: CaptureStatus =
      m.captureStatus === 'accepted' ||
      m.captureStatus === 'suspect' ||
      m.captureStatus === 'rejected'
        ? m.captureStatus
        : 'unknown';

    const str = (v: unknown, max: number): string | null =>
      typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;

    // A confidence outside [0,1] is a bug in the reporter, not a low score.
    // Discard it rather than let a malformed number read as certainty.
    const conf =
      typeof m.captureConfidence === 'number' &&
      Number.isFinite(m.captureConfidence) &&
      m.captureConfidence >= 0 &&
      m.captureConfidence <= 1
        ? m.captureConfidence
        : null;

    return new CaptureProvenance(
      modality,
      str(m.captureProvider, 64),
      str(m.captureSessionId, 64),
      conf,
      status,
    );
  }

  /** Stable, loggable summary. Never includes the utterance itself. */
  describe(): Record<string, string | number | boolean | null> {
    return {
      inputModality: this.inputModality,
      captureProvider: this.captureProvider,
      captureSessionId: this.captureSessionId,
      captureConfidence: this.captureConfidence,
      captureStatus: this.captureStatus,
      memberAuthored: this.memberAuthored,
    };
  }
}

/**
 * ⛔ THE TRUST GATE.
 *
 * Answers one question: may this turn be treated as a trusted autobiographical
 * assertion by the member — eligible to be recalled later as something they
 * said?
 *
 * Returns false ONLY where the capture layer positively declared untrusted
 * capture. An unknown provenance keeps today's behaviour, because every
 * surface that does not yet declare (web, PWA, iOS) would otherwise lose
 * memory eligibility in a single deploy — a far larger harm than the one being
 * repaired. That permissiveness is a MIGRATION POSTURE, not a resting state:
 * it narrows as each surface begins declaring.
 *
 * A forged or absent provenance object fails closed to untrusted — the only
 * way to obtain one is `CaptureProvenance.resolve()` at the boundary.
 */
export function trustedAsMemberSpeech(
  provenance: CaptureProvenance | undefined | null,
  where: string,
  sessionId?: string,
): boolean {
  if (!(provenance instanceof CaptureProvenance)) {
    console.warn(
      `[capture-provenance] no resolvable provenance at ${where}` +
        (sessionId ? ` (session ${sessionId})` : '') +
        ' — treating as untrusted',
    );
    return false;
  }

  // Declared and rejected by the capture layer: never the member's speech.
  if (provenance.captureStatus === 'rejected') return false;

  // Declared suspect: the capture layer itself is unsure. Recorded, not trusted.
  if (provenance.captureStatus === 'suspect') return false;

  // Typed by the member — their own keystrokes produced the characters.
  if (provenance.memberAuthored) return true;

  // Speech accepted by a declaring surface. Trusted for now; this is the seam
  // where a confidence threshold or a member confirmation would attach.
  if (provenance.inputModality === 'speech' && provenance.captureStatus === 'accepted') {
    return true;
  }

  // Undeclared surface — migration posture (see above).
  return provenance.inputModality === 'unknown' && provenance.captureStatus === 'unknown';
}
