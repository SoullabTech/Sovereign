/**
 * R3 — "we looked and do not know" is not the same statement as "we never
 * looked, because the process stopped before that question existed."
 *
 * Falsified at the boundary that erased the difference, not at the renderer.
 */
import { CAUSE_UNKNOWN, type RefusalCause } from '../../developmentalReader/contract';
import { axesForRecord, axesForWire } from '../refusalAxes';
import { CAUSE_UNKNOWN_LINE, OUTCOME_SENTENCE, causeLine, causeLineFor }
  from '../../../writersStudio/developRefusalCopy';
import { refusalSentence } from '../../../../app/writers-studio/develop/DevelopRoom';

const KNOWN: RefusalCause = {
  completion: 'truncated', attribution: 'system', stopReason: 'max_tokens',
  inputTokens: 1200, outputTokens: 400, readerVersion: 'r2', promptHash: 'abc',
};

describe('R3 · the route boundary preserves absence', () => {
  it('R3-1 · a capture-stage refusal carries no cause — absence is preserved', () => {
    expect(axesForWire(undefined)).toEqual({});
    expect(axesForRecord(undefined).completion).toBeNull();
    expect(axesForRecord(undefined).attribution).toBeNull();
  });

  it('R3-2 · a capture-stage refusal must NOT become CAUSE_UNKNOWN', () => {
    const wire = axesForWire(undefined);
    expect(wire.completion).toBeUndefined();
    expect(wire.attribution).toBeUndefined();
    expect(wire.completion).not.toBe(CAUSE_UNKNOWN.completion);
    expect(axesForRecord(undefined).attribution).not.toBe(CAUSE_UNKNOWN.attribution);
  });

  it('R3-3 · a cause sought but unresolved is CAUSE_UNKNOWN, and stays so', () => {
    expect(axesForWire(CAUSE_UNKNOWN))
      .toEqual({ completion: 'unknown', attribution: 'unknown' });
    expect(axesForRecord(CAUSE_UNKNOWN).completion).toBe('unknown');
  });

  it('R3-4 · a known cause is preserved exactly', () => {
    expect(axesForWire(KNOWN)).toEqual({ completion: 'truncated', attribution: 'system' });
    const rec = axesForRecord(KNOWN);
    expect(rec).toMatchObject({
      completion: 'truncated', attribution: 'system', stopReason: 'max_tokens',
      inputTokens: 1200, outputTokens: 400, readerVersion: 'r2', promptHash: 'abc',
    });
  });

  it('R3-5 · round-trip — absent stays absent, unknown stays unknown', () => {
    const trip = (c: RefusalCause | null | undefined) =>
      JSON.parse(JSON.stringify({ refusal: 'x', ...axesForWire(c) }));
    expect('completion' in trip(undefined)).toBe(false);
    expect('attribution' in trip(undefined)).toBe(false);
    expect(trip(CAUSE_UNKNOWN).completion).toBe('unknown');
    expect(trip(KNOWN).completion).toBe('truncated');
    /* And the two must never serialize alike — the whole point. */
    expect(JSON.stringify(trip(undefined))).not.toBe(JSON.stringify(trip(CAUSE_UNKNOWN)));
  });
});

describe('R3 · end to end, boundary through copy', () => {
  const named = refusalSentence({ ok: false, refusal: 'revision_not_current',
                                  stage: 'capture' } as never);

  it('capture-stage refusal, no cause → named sentence only, no unknown-cause line', () => {
    const wire = axesForWire(undefined);
    expect(causeLineFor(named, wire)).toBeNull();
    expect(causeLine(wire)).toBeNull();
  });

  /* ⭐ O-3, protected by the same test file that protects structural absence.
     These two must not be repaired into each other. */
  it('neutral outcome, cause genuinely assessed but unknown → outcome AND cause line', () => {
    const wire = axesForWire(CAUSE_UNKNOWN);
    expect(causeLineFor(OUTCOME_SENTENCE, wire)).toBe(CAUSE_UNKNOWN_LINE);
  });
});
