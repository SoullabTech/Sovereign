/**
 * Acceptance tests — Personal Wisdom Library increment 1 (governed retrieval).
 *
 * These are Kelly's six up-front acceptance criteria, expressed against the pure
 * governance gate isAdmitted(). The full SQL predicate is proven separately
 * against real Postgres in scripts/repro/governed_retrieval_sql_proof.sql.
 *
 * Acceptance criterion: "Can a member keep one item privately, assign a usage
 * authority, and have governed retrieval honor that authority?" Nothing else.
 */

import {
  isAdmitted,
  DEFAULT_USAGE_AUTHORITY,
  AUTHORITY_RANK,
  PURPOSE_MIN_RANK,
  type RetrievalPurpose,
  type UsageAuthority,
} from '../governedRetrieval';

const VIEWER = 'member-aaaa';
const OTHER = 'member-bbbb';

const member = (usageAuthority: UsageAuthority, ownerId = VIEWER) => ({
  scope: 'member' as const,
  ownerId,
  usageAuthority,
});
const platform = { scope: 'platform' as const };

const PURPOSES: RetrievalPurpose[] = ['guidance', 'reflection', 'explicit_recall'];

describe('Personal Wisdom Library — governed retrieval acceptance', () => {
  // 1. A kept item defaults to only_when_i_ask.
  it('1: a kept item defaults to only_when_i_ask', () => {
    expect(DEFAULT_USAGE_AUTHORITY).toBe('only_when_i_ask');
  });

  // 2. store_only is never surfaced through ordinary retrieval (nor any purpose).
  it('2: store_only is never surfaced through any retrieval purpose', () => {
    for (const purpose of PURPOSES) {
      expect(isAdmitted(member('store_only'), { viewerId: VIEWER, purpose })).toBe(false);
    }
  });

  // 3. Explicit recall retrieves only_when_i_ask.
  it('3: explicit recall retrieves only_when_i_ask (and ordinary guidance does not)', () => {
    expect(isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'explicit_recall' })).toBe(true);
    expect(isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'guidance' })).toBe(false);
    expect(isAdmitted(member('only_when_i_ask'), { viewerId: VIEWER, purpose: 'reflection' })).toBe(false);
  });

  // 4. reflect is available only through the reflective path (never proactively in guidance).
  //    It also surfaces on explicit member recall — the member exercising their own authority.
  it('4: reflect is available in reflection, never proactively in guidance', () => {
    expect(isAdmitted(member('reflect_with_me'), { viewerId: VIEWER, purpose: 'reflection' })).toBe(true);
    expect(isAdmitted(member('reflect_with_me'), { viewerId: VIEWER, purpose: 'guidance' })).toBe(false);
    expect(isAdmitted(member('reflect_with_me'), { viewerId: VIEWER, purpose: 'explicit_recall' })).toBe(true);
  });

  // 5. use_in_guidance is eligible for ordinary guidance.
  it('5: use_in_guidance is eligible for ordinary guidance (and every lower purpose)', () => {
    for (const purpose of PURPOSES) {
      expect(isAdmitted(member('use_in_guidance'), { viewerId: VIEWER, purpose })).toBe(true);
    }
  });

  // 6. Existing platform knowledge continues to work unchanged (admitted in every purpose).
  it('6: platform knowledge is admitted unchanged in every purpose', () => {
    for (const purpose of PURPOSES) {
      expect(isAdmitted(platform, { viewerId: VIEWER, purpose })).toBe(true);
      expect(isAdmitted(platform, { viewerId: undefined, purpose })).toBe(true); // even anonymous
    }
  });

  // Privacy (constitutional, beyond the six): a member's items are private to the owner.
  it('privacy: member items are never admitted for a non-owner or anonymous viewer', () => {
    for (const purpose of PURPOSES) {
      expect(isAdmitted(member('use_in_guidance', OTHER), { viewerId: VIEWER, purpose })).toBe(false);
      expect(isAdmitted(member('use_in_guidance'), { viewerId: undefined, purpose })).toBe(false);
    }
  });

  // Ladder sanity — the monotonic invariant the whole gate rests on.
  it('ladder: authority and purpose ranks are monotonic', () => {
    expect(AUTHORITY_RANK.store_only).toBeLessThan(AUTHORITY_RANK.only_when_i_ask);
    expect(AUTHORITY_RANK.only_when_i_ask).toBeLessThan(AUTHORITY_RANK.reflect_with_me);
    expect(AUTHORITY_RANK.reflect_with_me).toBeLessThan(AUTHORITY_RANK.use_in_guidance);
    expect(PURPOSE_MIN_RANK.explicit_recall).toBeLessThan(PURPOSE_MIN_RANK.reflection);
    expect(PURPOSE_MIN_RANK.reflection).toBeLessThan(PURPOSE_MIN_RANK.guidance);
  });
});
