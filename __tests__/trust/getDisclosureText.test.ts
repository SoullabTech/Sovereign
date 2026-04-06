/**
 * Tests for the shared disclosure text generator.
 */

import { describe, it, expect } from 'vitest';
import { getDisclosureText, isDisclosureRequired } from '../../lib/trust/getDisclosureText';

describe('getDisclosureText', () => {
  it('returns empty string when no disclosure needed', () => {
    expect(getDisclosureText({
      aiAssisted: false,
      relationalContext: false,
      sessionDerived: false,
      channel: 'comms',
    })).toBe('');
  });

  it('includes AI disclosure when AI assisted', () => {
    const text = getDisclosureText({
      aiAssisted: true,
      relationalContext: false,
      sessionDerived: false,
      channel: 'comms',
    });
    expect(text).toContain('AI assistance');
  });

  it('includes session-derived disclosure', () => {
    const text = getDisclosureText({
      aiAssisted: false,
      relationalContext: false,
      sessionDerived: true,
      channel: 'studio',
    });
    expect(text).toContain('session material');
  });

  it('includes relational context disclosure', () => {
    const text = getDisclosureText({
      aiAssisted: false,
      relationalContext: true,
      sessionDerived: false,
      channel: 'comms',
    });
    expect(text).toContain('relational context');
  });

  it('combines AI + session disclosures', () => {
    const text = getDisclosureText({
      aiAssisted: true,
      relationalContext: false,
      sessionDerived: true,
      channel: 'studio',
    });
    expect(text).toContain('AI assistance');
    expect(text).toContain('session material');
  });

  it('prefers session-derived over relational when both true', () => {
    const text = getDisclosureText({
      aiAssisted: false,
      relationalContext: true,
      sessionDerived: true,
      channel: 'studio',
    });
    expect(text).toContain('session material');
    expect(text).not.toContain('relational context');
  });
});

describe('isDisclosureRequired', () => {
  it('returns false when nothing flagged', () => {
    expect(isDisclosureRequired({
      aiAssisted: false,
      relationalContext: false,
      sessionDerived: false,
      channel: 'comms',
    })).toBe(false);
  });

  it('returns true when AI assisted', () => {
    expect(isDisclosureRequired({
      aiAssisted: true,
      relationalContext: false,
      sessionDerived: false,
      channel: 'comms',
    })).toBe(true);
  });

  it('returns true when session derived', () => {
    expect(isDisclosureRequired({
      aiAssisted: false,
      relationalContext: false,
      sessionDerived: true,
      channel: 'studio',
    })).toBe(true);
  });
});
