/**
 * Tests for inference classification.
 */

import { describe, it, expect } from 'vitest';
import { classifyInference } from '../../lib/trust/classifyInference';

describe('classifyInference', () => {
  it('returns direct_restatement for read actions', () => {
    expect(classifyInference({
      action: 'read', channel: 'oracle', resourceType: 'session',
      aiAssisted: true, multiSource: true, outwardBound: false,
    })).toBe('direct_restatement');
  });

  it('returns direct_restatement when no AI', () => {
    expect(classifyInference({
      action: 'generate', channel: 'studio', resourceType: 'artifact',
      aiAssisted: false, multiSource: true, outwardBound: true,
    })).toBe('direct_restatement');
  });

  it('returns outward_recommendation for AI + outward + generate', () => {
    expect(classifyInference({
      action: 'generate', channel: 'comms', resourceType: 'message',
      aiAssisted: true, multiSource: false, outwardBound: true,
    })).toBe('outward_recommendation');
  });

  it('returns outward_recommendation for AI + outward + send', () => {
    expect(classifyInference({
      action: 'send', channel: 'comms', resourceType: 'message',
      aiAssisted: true, multiSource: false, outwardBound: true,
    })).toBe('outward_recommendation');
  });

  it('returns sensitive_synthesis for multi-source AI', () => {
    expect(classifyInference({
      action: 'generate', channel: 'studio', resourceType: 'artifact',
      aiAssisted: true, multiSource: true, outwardBound: false,
    })).toBe('sensitive_synthesis');
  });

  it('returns relational_inference for AI on session content', () => {
    expect(classifyInference({
      action: 'generate', channel: 'oracle', resourceType: 'session',
      aiAssisted: true, multiSource: false, outwardBound: false,
    })).toBe('relational_inference');
  });

  it('returns relational_inference for AI on transcript content', () => {
    expect(classifyInference({
      action: 'generate', channel: 'studio', resourceType: 'transcript',
      aiAssisted: true, multiSource: false, outwardBound: false,
    })).toBe('relational_inference');
  });

  it('returns structured_summary for AI single-source generate on artifact', () => {
    expect(classifyInference({
      action: 'generate', channel: 'studio', resourceType: 'artifact',
      aiAssisted: true, multiSource: false, outwardBound: false,
    })).toBe('structured_summary');
  });
});
