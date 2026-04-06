/**
 * Tests for expression profile selection.
 */

import { describe, it, expect } from 'vitest';
import { getExpressionProfile } from '../../lib/trust/getExpressionProfile';

describe('getExpressionProfile', () => {
  it('returns minimal for confidential privacy mode', () => {
    expect(getExpressionProfile({
      channel: 'oracle', inferenceType: 'relational_inference',
      expansionLevel: 'moderate', relationship: 'self',
      privacyMode: 'confidential', aiPermitted: true,
    })).toBe('minimal');
  });

  it('returns protective_external for sensitive + outward comms', () => {
    expect(getExpressionProfile({
      channel: 'comms', inferenceType: 'structured_summary',
      expansionLevel: 'low', relationship: 'parent_guardian',
      privacyMode: 'sensitive', aiPermitted: true,
    })).toBe('protective_external');
  });

  it('returns minimal when AI not permitted', () => {
    expect(getExpressionProfile({
      channel: 'oracle', inferenceType: 'relational_inference',
      expansionLevel: 'moderate', relationship: 'self',
      privacyMode: 'standard', aiPermitted: false,
    })).toBe('minimal');
  });

  it('returns reflective_internal for oracle self', () => {
    expect(getExpressionProfile({
      channel: 'oracle', inferenceType: 'relational_inference',
      expansionLevel: 'moderate', relationship: 'self',
      privacyMode: 'standard', aiPermitted: true,
    })).toBe('reflective_internal');
  });

  it('returns protective_external for comms to parent/guardian', () => {
    expect(getExpressionProfile({
      channel: 'comms', inferenceType: 'structured_summary',
      expansionLevel: 'low', relationship: 'parent_guardian',
      privacyMode: 'standard', aiPermitted: true,
    })).toBe('protective_external');
  });

  it('returns neutral_clinical for studio to care_team', () => {
    expect(getExpressionProfile({
      channel: 'studio', inferenceType: 'structured_summary',
      expansionLevel: 'low', relationship: 'care_team',
      privacyMode: 'standard', aiPermitted: true,
    })).toBe('neutral_clinical');
  });

  it('returns protective_external for comms high expansion', () => {
    expect(getExpressionProfile({
      channel: 'comms', inferenceType: 'outward_recommendation',
      expansionLevel: 'high', relationship: 'practitioner_to_client',
      privacyMode: 'standard', aiPermitted: true,
    })).toBe('protective_external');
  });

  it('returns relationally_gentle for oracle sensitive_synthesis', () => {
    expect(getExpressionProfile({
      channel: 'oracle', inferenceType: 'sensitive_synthesis',
      expansionLevel: 'moderate', relationship: 'practitioner_to_client',
      privacyMode: 'standard', aiPermitted: true,
    })).toBe('relationally_gentle');
  });
});
