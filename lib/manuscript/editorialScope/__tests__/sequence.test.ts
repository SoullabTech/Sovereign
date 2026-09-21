/**
 * WS-EDITORIAL-SCOPE-01 · SEQUENCE FALSIFIERS.
 *
 * ⭐ Q2 and Q3 are the ruling's exact limits: latitude 2 is ungated, and the
 * override is the writer's.
 */

import {
  ALL_OUTCOME_KINDS, DISCUSSION_ONLY_KINDS, SEQUENCE_REFUSAL_DETAIL,
  availableOutcomeKinds, sequenceGateActive, sequenceInstruction,
} from '../sequence';
import type { EditorialLatitude } from '../contract';

const gate = (
  latitude: EditorialLatitude, mayProposeImmediately: boolean, hasPriorMaiaTurn: boolean,
) => sequenceGateActive({
  declaration: { latitude, mayProposeImmediately }, hasPriorMaiaTurn,
});

describe('WS-EDITORIAL-SCOPE-01 · sequence', () => {
  it('Q1 · ⭐ active on the first exchange at latitude 1', () => {
    expect(gate(1, false, false)).toBe(true);
  });

  it('Q2 · ⭐⭐ LATITUDE 2 IS UNGATED — the ruling named 1, exactly', () => {
    for (const l of [2, 3, 4, 5] as const) expect(gate(l, false, false)).toBe(false);
  });

  it('Q3 · ⭐⭐ the writer\'s override releases it, at latitude 1', () => {
    expect(gate(1, true, false)).toBe(false);
  });

  it('Q4 · once MAIA has answered, the gate is spent', () => {
    expect(gate(1, false, true)).toBe(false);
  });

  it('Q5 · ⛔ the member\'s own current act is not an exchange', () => {
    /* The gate reads hasPriorMaiaTurn, never "are there any turns" — otherwise
       the writer's own first message would release it. */
    expect(gate(1, false, false)).toBe(true);
  });

  it('Q6 · ⭐ reply_with_direction survives the gate; proposal does not', () => {
    expect(availableOutcomeKinds(true)).toEqual(DISCUSSION_ONLY_KINDS);
    expect(availableOutcomeKinds(true)).toContain('reply_with_direction');
    expect(availableOutcomeKinds(true)).not.toContain('reply_with_proposal');
  });

  it('Q7 · ⛔ the available set is never empty, gated or not', () => {
    expect(availableOutcomeKinds(true).length).toBeGreaterThan(0);
    expect(availableOutcomeKinds(false)).toEqual(ALL_OUTCOME_KINDS);
  });

  it('Q8 · ungated turns offer every kind', () => {
    expect(availableOutcomeKinds(false)).toContain('reply_with_proposal');
  });

  it('Q9 · the instruction exists only when the gate is on', () => {
    expect(sequenceInstruction(false)).toBeNull();
    expect(sequenceInstruction(true)).toMatch(/do not propose wording this turn/);
  });

  it('Q10 · ⛔ neither the instruction nor the refusal scolds', () => {
    expect(sequenceInstruction(true)).toMatch(/not a judgement about your suggestion/);
    expect(SEQUENCE_REFUSAL_DETAIL).toMatch(/Nothing was changed/);
    expect(SEQUENCE_REFUSAL_DETAIL).not.toMatch(/should not|must not|wrong|violat/i);
  });

  it('Q11 · ⭐ the refusal names the control the writer would flip', () => {
    expect(SEQUENCE_REFUSAL_DETAIL).toMatch(/suggest wording straight away/);
    expect(SEQUENCE_REFUSAL_DETAIL).toMatch(/this Work/);
  });
});
