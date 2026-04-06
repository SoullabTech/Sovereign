/**
 * Tests for meaning expansion level scoring.
 */

import { describe, it, expect } from 'vitest';
import { getMeaningExpansionLevel } from '../../lib/trust/getMeaningExpansionLevel';

describe('getMeaningExpansionLevel', () => {
  it('returns none for direct_restatement', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'direct_restatement', channel: 'oracle',
      multiSource: false, outwardBound: false,
    })).toBe('none');
  });

  it('returns high for outward_recommendation', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'outward_recommendation', channel: 'comms',
      multiSource: false, outwardBound: true,
    })).toBe('high');
  });

  it('returns high for sensitive_synthesis + outward', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'sensitive_synthesis', channel: 'comms',
      multiSource: true, outwardBound: true,
    })).toBe('high');
  });

  it('returns moderate for sensitive_synthesis internal', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'sensitive_synthesis', channel: 'oracle',
      multiSource: true, outwardBound: false,
    })).toBe('moderate');
  });

  it('returns high for relational_inference + multi-source + outward', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'relational_inference', channel: 'comms',
      multiSource: true, outwardBound: true,
    })).toBe('high');
  });

  it('returns moderate for relational_inference without multi-source outward', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'relational_inference', channel: 'studio',
      multiSource: false, outwardBound: false,
    })).toBe('moderate');
  });

  it('returns low for structured_summary internal', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'structured_summary', channel: 'studio',
      multiSource: false, outwardBound: false,
    })).toBe('low');
  });

  it('returns moderate for structured_summary outward', () => {
    expect(getMeaningExpansionLevel({
      inferenceType: 'structured_summary', channel: 'comms',
      multiSource: false, outwardBound: true,
    })).toBe('moderate');
  });
});
