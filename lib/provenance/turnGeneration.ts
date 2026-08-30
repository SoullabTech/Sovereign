/**
 * TurnGeneration — server-resolved classification of the process that produced
 * a member-side turn's stored representation.
 *
 * Contract: MAIA-TURN-GENERATION-VOCABULARY-01, implementing the trust boundary
 * settled in MAIA-MEMBER-ACTION-TRUST-BOUNDARY-01.
 *
 * ⛔ THE DEFECT THIS CLOSES. `mintTurnProvenance` derived generation from
 * `role` alone: `role === 'user'` minted `generatedBy: 'member-utterance'`. But
 * `role` is an interaction-side field, and an interaction side cannot establish
 * what produced the characters. So every member turn — typed, spoken,
 * hallucinated by a transcription model, or captured from a television — was
 * recorded as the member having directly produced the text.
 *
 * ⛔ AUTHORITY SHAPE, copied deliberately from TurnPosture. A client may
 * EXPRESS the action class it performed; only the server RESOLVES it and only
 * the server mints provenance. The nominal class with a private constructor is
 * the same forgery barrier: `'member-utterance'` does not typecheck as a
 * TurnGeneration, so no layer — not a route, not a store, not a JS caller
 * bypassing types — can inject a generation value it did not resolve here.
 *
 * ⛔ WHY A CALLER MAY DECLARE THE DIRECT-MEMBER CLASS. Because for typed input
 * the authenticated action IS the authorship: the submitted characters are the
 * artifact the member produced, so the declaration is not a report about some
 * external event — it is the event. This is the same authority by which an
 * authenticated member act sets `member_response_status` or `is_breakthrough`
 * without the server verifying the member's physical act or sincerity.
 * A compromised authenticated client is out of scope here and always was: it
 * can already POST arbitrary text as an ordinary message without declaring
 * anything. The threat this substrate is built against is forged provenance and
 * unauthenticated injection, not authorship mechanism.
 */

import type { GeneratedBy } from './provenance';

/**
 * The action classes a client may express. Deliberately tiny, and deliberately
 * NOT a modality or transport vocabulary: every speech transport — Desktop
 * sovereign Whisper, Firefox/Zen web-whisper, Android-Chrome recovery, legacy
 * Web Speech, PWA, iOS/Capacitor — produces the same generation class, because
 * the same kind of process produced the characters.
 */
export type MemberActionClass =
  /** The member composed and submitted these characters themselves. */
  | 'direct-composition'
  /** The member produced audio; a speech-transcription process produced these characters. */
  | 'speech-transcription';

const ACTION_CLASSES: readonly string[] = ['direct-composition', 'speech-transcription'];

/** The key a client uses to express its action class. */
export const MEMBER_ACTION_CLASS_KEY = 'memberActionClass';

/**
 * Generation values this resolver may produce for a MEMBER-side turn.
 * Assistant turns do not pass through here — their generation is `synthesis`
 * and is unchanged by this unit.
 */
export type MemberTurnGeneratedBy = Extract<
  GeneratedBy,
  'member-utterance' | 'speech-transcription' | 'unknown-generation'
>;

/**
 * Nominal, frozen, server-resolved. Obtainable only via `TurnGeneration.resolve`.
 */
export class TurnGeneration {
  readonly generatedBy: MemberTurnGeneratedBy;
  readonly resolvedAtIso: string;

  private constructor(generatedBy: MemberTurnGeneratedBy) {
    this.generatedBy = generatedBy;
    this.resolvedAtIso = new Date().toISOString();
    Object.freeze(this);
  }

  /**
   * Resolve the generation class from the route/service `meta` object.
   *
   * ⛔ ABSENCE IS UNKNOWN, NOT DIRECT-MEMBER. This is the load-bearing rule.
   * Preserving the old fallback (`role:'user'` → `member-utterance`) would keep
   * every un-updated voice client over-claiming for as long as it exists — and
   * cached PWAs and store-gated Capacitor builds update on no schedule the
   * server controls. Defaulting to transcription would be the mirror lie for
   * typed input. Absence establishes nothing, so the server says nothing.
   *
   * ⛔ NOTHING ELSE IN THE REQUEST MAY BE CONSULTED. Not role, not message
   * content, not transcript length, not sameAsPrevious, not the user agent,
   * not timing, not voice telemetry, not includeAudio or voiceProfile (those
   * describe whether MAIA should SPEAK, not whether the member did), not
   * maiaMode, not conversation mode. None of them establishes what produced
   * the characters, and inferring from any of them would fabricate the
   * certainty this value exists to refuse.
   *
   * An unrecognised value is treated as absent: a client asserting something
   * this server does not understand has not told it anything it can act on.
   */
  static resolve(meta: unknown): TurnGeneration {
    const m = (meta ?? {}) as Record<string, unknown>;
    const nested = (m['meta'] ?? {}) as Record<string, unknown>;
    const raw = m[MEMBER_ACTION_CLASS_KEY] ?? nested[MEMBER_ACTION_CLASS_KEY];

    if (typeof raw !== 'string' || !ACTION_CLASSES.includes(raw)) {
      return new TurnGeneration('unknown-generation');
    }

    return new TurnGeneration(
      raw === 'speech-transcription' ? 'speech-transcription' : 'member-utterance'
    );
  }

  /**
   * Resolve from a route whose own identity establishes the action class —
   * server-observed evidence rather than a caller declaration. Used by the
   * voice-persist lane, whose contract is that its member content is a resolved
   * transcript.
   */
  static fromServerKnownAction(action: MemberActionClass): TurnGeneration {
    return new TurnGeneration(
      action === 'speech-transcription' ? 'speech-transcription' : 'member-utterance'
    );
  }
}
