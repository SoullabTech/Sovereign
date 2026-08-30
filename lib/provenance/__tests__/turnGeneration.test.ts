/**
 * MAIA-TURN-GENERATION-PROVENANCE-IMPLEMENTATION-01 — a turn must say what
 * produced its characters.
 *
 * ⛔ THE DEFECT. `mintTurnProvenance` derived generation from `role` alone:
 * `role === 'user'` minted `generatedBy: 'member-utterance'`, which means the
 * member directly produced the stored representation. So every member turn —
 * typed, spoken, hallucinated by a transcription model, or captured from a
 * television — was durably recorded as the member having produced the text.
 * `role` is an interaction-side field; it cannot establish what generated
 * characters, and it was never asked to until it was.
 *
 * These are written as attempts to make the record claim more than the request
 * establishes.
 */

import { describe, it, expect } from '@jest/globals';
import { TurnGeneration, MEMBER_ACTION_CLASS_KEY } from '../turnGeneration';

describe('TurnGeneration.resolve — the server maps an action class to a process', () => {
  it('a declared typed composition resolves to direct-member generation', () => {
    expect(TurnGeneration.resolve({ memberActionClass: 'direct-composition' }).generatedBy)
      .toBe('member-utterance');
  });

  it('a declared speech transcription resolves to the transcription process', () => {
    expect(TurnGeneration.resolve({ memberActionClass: 'speech-transcription' }).generatedBy)
      .toBe('speech-transcription');
  });

  it('reads the class from nested meta, as posture resolution does', () => {
    expect(TurnGeneration.resolve({ meta: { memberActionClass: 'speech-transcription' } }).generatedBy)
      .toBe('speech-transcription');
  });

  it('NO classification resolves to present-tense unknown, never to member-utterance', () => {
    // ⛔ THE LOAD-BEARING CASE. Preserving the old fallback would keep every
    // un-updated voice client over-claiming for as long as it exists — and
    // cached PWAs and store-gated Capacitor builds update on no schedule the
    // server controls.
    expect(TurnGeneration.resolve({}).generatedBy).toBe('unknown-generation');
    expect(TurnGeneration.resolve(undefined).generatedBy).toBe('unknown-generation');
    expect(TurnGeneration.resolve(null).generatedBy).toBe('unknown-generation');
  });

  it('an unrecognised class is absence, not a guess', () => {
    expect(TurnGeneration.resolve({ memberActionClass: 'telepathy' }).generatedBy)
      .toBe('unknown-generation');
    expect(TurnGeneration.resolve({ memberActionClass: 42 }).generatedBy)
      .toBe('unknown-generation');
  });

  it('a caller cannot name a provenance value — only an action class is read', () => {
    // The client expresses what it DID; it never supplies what gets recorded.
    expect(TurnGeneration.resolve({ generatedBy: 'member-utterance' }).generatedBy)
      .toBe('unknown-generation');
    expect(TurnGeneration.resolve({ generatedBy: 'inference' }).generatedBy)
      .toBe('unknown-generation');
    expect(TurnGeneration.resolve({ provenance: { generatedBy: 'member-utterance' } }).generatedBy)
      .toBe('unknown-generation');
  });

  it('nothing but the action class is consulted', () => {
    // ⛔ None of these establishes what produced the characters. includeAudio
    // and voiceProfile describe whether MAIA should SPEAK, not whether the
    // member did — a member may type while asking for spoken replies.
    const decoys = [
      { role: 'user' },
      { includeAudio: true, voiceProfile: 'maya' },
      { maiaMode: { mode: 'care' } },
      { mode: 'dialogue' },
      { type: 'voice' },
      { message: 'I said this out loud' },
    ];
    for (const meta of decoys) {
      expect(TurnGeneration.resolve(meta).generatedBy).toBe('unknown-generation');
    }
  });

  it('server-known route identity resolves without any caller declaration', () => {
    expect(TurnGeneration.fromServerKnownAction('speech-transcription').generatedBy)
      .toBe('speech-transcription');
  });

  it('a resolved generation is frozen and cannot be retyped after the fact', () => {
    const g = TurnGeneration.resolve({ memberActionClass: 'speech-transcription' });
    expect(Object.isFrozen(g)).toBe(true);
    expect(() => {
      (g as unknown as { generatedBy: string }).generatedBy = 'member-utterance';
    }).toThrow();
  });

  it('exposes the key the client uses, so the wire contract has one source', () => {
    expect(MEMBER_ACTION_CLASS_KEY).toBe('memberActionClass');
  });
});
