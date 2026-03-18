import { describe, it, expect } from 'vitest';
import {
  buildFlowTelemetry,
  detectClarificationQuestion,
  detectRepairSignal,
} from '../../lib/consciousness/flowTelemetry';

const smoothInput = {
  stateResolverFired: true,
  resolverRule: 'either_or' as const,
  resolverConfidence: 0.93,
  clarificationBlocked: true,
  modelAskedClarification: false,
  clarificationWasNeeded: false,
  repairSignal: false,
};

describe('buildFlowTelemetry', () => {
  it('classifies smooth turns', () => {
    const result = buildFlowTelemetry(smoothInput);
    expect(result.flowOutcome).toBe('smooth');
    expect(result.flowConfidence).toBeGreaterThan(0.85);
    expect(result.stateResolverFired).toBe(true);
  });

  it('classifies frictional turns', () => {
    const result = buildFlowTelemetry({
      stateResolverFired: true,
      resolverRule: 'pronoun',
      resolverConfidence: 0.8,
      clarificationBlocked: true,
      modelAskedClarification: true,
      clarificationWasNeeded: true,
      repairSignal: false,
    });
    expect(result.flowOutcome).toBe('frictional');
  });

  it('classifies repair turns — repair takes priority over smooth', () => {
    const result = buildFlowTelemetry({
      ...smoothInput,
      repairSignal: true,
    });
    expect(result.flowOutcome).toBe('repair');
    expect(result.flowConfidence).toBeGreaterThanOrEqual(0.9);
  });

  it('classifies unknown turns when resolver did not fire', () => {
    const result = buildFlowTelemetry({
      stateResolverFired: false,
      resolverRule: 'none',
      resolverConfidence: 0,
      clarificationBlocked: false,
      modelAskedClarification: false,
      clarificationWasNeeded: false,
      repairSignal: false,
    });
    expect(result.flowOutcome).toBe('unknown');
  });

  it('frictional when resolver fired but model still asked for clarification', () => {
    const result = buildFlowTelemetry({
      stateResolverFired: true,
      resolverRule: 'yes_no',
      resolverConfidence: 0.9,
      clarificationBlocked: true,
      modelAskedClarification: true,
      clarificationWasNeeded: false,
      repairSignal: false,
    });
    expect(result.flowOutcome).toBe('frictional');
  });

  it('passes through all fields regardless of outcome', () => {
    const result = buildFlowTelemetry(smoothInput);
    expect(result.resolverRule).toBe('either_or');
    expect(result.resolverConfidence).toBe(0.93);
    expect(result.clarificationBlocked).toBe(true);
  });
});

describe('detectClarificationQuestion', () => {
  it('detects "can you clarify"', () => {
    expect(detectClarificationQuestion('Can you clarify which one you mean?')).toBe(true);
  });

  it('detects "what do you mean by"', () => {
    expect(detectClarificationQuestion('What do you mean by design?')).toBe(true);
  });

  it('detects "are you referring to"', () => {
    expect(detectClarificationQuestion('Are you referring to the first part?')).toBe(true);
  });

  it('does not false-positive on normal text', () => {
    expect(detectClarificationQuestion('That makes sense. Let me share what I notice.')).toBe(false);
  });
});

describe('detectRepairSignal', () => {
  it('detects "no, i meant"', () => {
    expect(detectRepairSignal('No, I meant the architecture section.')).toBe(true);
  });

  it('detects "the other one"', () => {
    expect(detectRepairSignal('Actually the other one, not this.')).toBe(true);
  });

  it('detects "you misunderstood"', () => {
    expect(detectRepairSignal('You misunderstood what I was asking.')).toBe(true);
  });

  it('does not false-positive on normal text', () => {
    expect(detectRepairSignal('Yes that resonates, thank you.')).toBe(false);
  });
});
