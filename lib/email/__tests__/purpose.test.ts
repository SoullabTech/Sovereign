/**
 * PURPOSE + PRIORITY — the classification contract.
 *
 * The property that matters is not "every purpose has a lane" — it is that an
 * UNCLASSIFIED purpose cannot land in P0. If it could, the protected identity
 * lane would be reachable by anything that simply forgot to register, and every
 * guarantee built on P0 would be decorative.
 */
import { describe, it, expect } from '@jest/globals';
import {
  resolvePriority,
  isRegisteredPurpose,
  purposesInLane,
  DEFAULT_PRIORITY,
  EMAIL_PURPOSE_LANES,
} from '../purpose';

describe('resolvePriority', () => {
  it('a registered purpose gets its declared lane', () => {
    expect(resolvePriority('auth:email-code')).toBe('P0');
    expect(resolvePriority('invite:team')).toBe('P1');
    expect(resolvePriority('reminder:session')).toBe('P2');
    expect(resolvePriority('broadcast:update')).toBe('P3');
  });

  it('an unregistered purpose inherits its FAMILY lane', () => {
    expect(isRegisteredPurpose('auth:some-future-flow')).toBe(false);
    expect(resolvePriority('auth:some-future-flow')).toBe('P0');
    expect(resolvePriority('broadcast:some-future-campaign')).toBe('P3');
  });

  it('a purpose with no family at all falls to the default lane', () => {
    expect(resolvePriority('completely-unknown')).toBe(DEFAULT_PRIORITY);
    expect(resolvePriority('nonsense:thing')).toBe(DEFAULT_PRIORITY);
  });

  it('THE PROPERTY: an unclassified purpose can never reach P0', () => {
    // P0 is the lane member sign-in depends on. Nothing may enter it by
    // accident — only by being registered, or by being in a family that is
    // deliberately P0-wide.
    expect(DEFAULT_PRIORITY).not.toBe('P0');
    for (const purpose of ['', 'x', 'unknown:thing', 'marketing-blast', 'notify:anything']) {
      expect(resolvePriority(purpose)).not.toBe('P0');
    }
  });

  it('never throws on degenerate input', () => {
    expect(() => resolvePriority('')).not.toThrow();
    expect(() => resolvePriority(':')).not.toThrow();
    expect(() => resolvePriority('a:b:c:d')).not.toThrow();
  });
});

describe('the vocabulary itself', () => {
  it('identity purposes are in P0 and nothing else is', () => {
    const p0 = purposesInLane('P0');
    expect(p0).toContain('auth:email-code');
    expect(p0).toContain('auth:magic-link');
    expect(p0).toContain('auth:password-reset');
    // Bulk and notification traffic must never be registered into P0.
    for (const purpose of p0) {
      expect(purpose.startsWith('auth:') || purpose.startsWith('security:')).toBe(true);
    }
  });

  it('every registered purpose is family-prefixed, so family fallback works', () => {
    for (const purpose of Object.keys(EMAIL_PURPOSE_LANES)) {
      expect(purpose).toContain(':');
    }
  });

  it('CONTROL: the lanes are not all the same value', () => {
    // A vocabulary that put everything in one lane would pass every test above
    // while providing no separation at all.
    const lanes = new Set(Object.values(EMAIL_PURPOSE_LANES));
    expect(lanes.size).toBe(4);
  });
});
