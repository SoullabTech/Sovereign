/**
 * REPAIR 2 — a named refusal explains itself. Nothing is appended to it.
 *
 * `refusalSentence` answers named refusals with a complete sentence that
 * states its own cause. The cause line was written to accompany the NEUTRAL
 * outcome, which names no culprit. Rendered beneath a named sentence it does
 * not add a fact — it contradicts one.
 *
 * ⛔ Falsified independently of Repair 1. Repair 1 makes today's production
 * path unreachable, so a test that only exercised `unknown/unknown` would go
 * green whether or not this law holds. Every case here therefore also runs
 * with a GENUINELY KNOWN cause, which Repair 1 does not silence.
 */
import { refusalSentence } from '../../../app/writers-studio/develop/DevelopRoom';
import { CAUSE_TRUNCATED, CAUSE_UNKNOWN_LINE, OUTCOME_SENTENCE, causeLineFor }
  from '../developRefusalCopy';

const outcome = (o: Record<string, unknown>) => o as never;
const KNOWN = { completion: 'truncated' as const, attribution: 'unknown' as const };
const UNKNOWN = { completion: 'unknown' as const, attribution: 'unknown' as const };

describe('a named refusal renders its sentence alone', () => {
  const named = refusalSentence(outcome({ ok: false, refusal: 'revision_not_current',
                                          stage: 'capture', ...KNOWN }));

  it('revision_not_current is a NAMED sentence, not the neutral outcome', () => {
    expect(named).not.toBe(OUTCOME_SENTENCE);
    expect(named).toContain('since the last version you kept');
  });

  it('revision_not_current + a KNOWN cause → the named sentence only', () => {
    expect(causeLineFor(named, KNOWN)).toBeNull();
  });

  it('revision_not_current + an unknown cause → the named sentence only', () => {
    expect(causeLineFor(named, UNKNOWN)).toBeNull();
  });
});

describe('the neutral outcome keeps its cause line', () => {
  it('neutral + a known cause → outcome and cause', () => {
    expect(causeLineFor(OUTCOME_SENTENCE, KNOWN)).toBe(CAUSE_TRUNCATED);
  });

  /* ⭐ O-3 STANDS, and this is it working. "An unknown cause is named as
     unknown" — beneath the NEUTRAL sentence, which names no culprit, saying
     the cause is undetermined adds a true fact rather than contradicting one.
     The production defect was never this pairing; it was this line appearing
     beneath a sentence that had already named the cause. */
  it('neutral + unknown/unknown → outcome and the unknown-cause line (O-3)', () => {
    expect(causeLineFor(OUTCOME_SENTENCE, UNKNOWN)).toBe(CAUSE_UNKNOWN_LINE);
  });
});
