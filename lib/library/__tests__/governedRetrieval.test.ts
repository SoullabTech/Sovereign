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
  authorizationPredicateSql,
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

// ── Practitioner-scope admission (ratified 2026-06-27) ───────────────────────────
// Different authority rule, SAME substrate: practitioner resources are governed by
// OWNERSHIP + VISIBILITY, never the member usage-authority ladder, never purpose. Self-view
// only — cross-practitioner sharing and member content are excluded by construction.
const PRACTITIONER = 'practitioner-pppp';
const OTHER_PRACTITIONER = 'practitioner-qqqq';
const practitionerItem = (
  overrides: Partial<{ ownerId: string; ownerType: string; visibility: string; usageAuthority: string }> = {},
) => ({
  scope: 'practitioner' as const,
  ownerType: 'practitioner',
  ownerId: PRACTITIONER,
  visibility: 'private',
  ...overrides,
});

describe('Personal Wisdom Library — practitioner-scope admission', () => {
  // The owning practitioner retrieves their own items, in every purpose, at every visibility.
  it('admits the owning practitioner’s own items in every purpose and visibility', () => {
    for (const purpose of PURPOSES) {
      for (const visibility of ['private', 'shared', 'published']) {
        expect(isAdmitted(practitionerItem({ visibility }), { practitionerId: PRACTITIONER, purpose })).toBe(true);
      }
    }
  });

  // The usage-authority ladder does NOT apply: admitted even with a value that would be
  // fail-closed under the member rule. This is the load-bearing proof of the distinct rule.
  it('ignores the usage-authority ladder (a store_only value is irrelevant here)', () => {
    expect(
      isAdmitted(practitionerItem({ usageAuthority: 'store_only' }), { practitionerId: PRACTITIONER, purpose: 'guidance' }),
    ).toBe(true);
  });

  // Member-facing retrieval (no practitionerId in context) never admits practitioner rows.
  it('keeps practitioner items fail-closed for member-facing retrieval (no practitionerId)', () => {
    for (const purpose of PURPOSES) {
      expect(isAdmitted(practitionerItem(), { viewerId: VIEWER, purpose })).toBe(false);
    }
  });

  // No cross-practitioner sharing.
  it('never admits another practitioner’s items', () => {
    for (const purpose of PURPOSES) {
      expect(
        isAdmitted(practitionerItem({ ownerId: OTHER_PRACTITIONER }), { practitionerId: PRACTITIONER, purpose }),
      ).toBe(false);
    }
  });

  // owner_type guard — a member-owned row can never enter through the practitioner branch.
  it('never admits a non-practitioner-owned row via the practitioner branch', () => {
    expect(
      isAdmitted(practitionerItem({ ownerType: 'member' }), { practitionerId: PRACTITIONER, purpose: 'guidance' }),
    ).toBe(false);
  });

  // Unknown / missing visibility fails closed.
  it('fails closed on unknown or missing visibility', () => {
    expect(
      isAdmitted(practitionerItem({ visibility: 'bogus' }), { practitionerId: PRACTITIONER, purpose: 'guidance' }),
    ).toBe(false);
    expect(
      isAdmitted({ scope: 'practitioner', ownerType: 'practitioner', ownerId: PRACTITIONER }, { practitionerId: PRACTITIONER, purpose: 'guidance' }),
    ).toBe(false);
  });

  // A practitionerId in context must NOT relax the member ladder.
  it('does not let a practitionerId context relax the member rule', () => {
    expect(isAdmitted(member('store_only'), { viewerId: VIEWER, practitionerId: PRACTITIONER, purpose: 'explicit_recall' })).toBe(false);
    expect(isAdmitted(member('use_in_guidance'), { viewerId: VIEWER, practitionerId: PRACTITIONER, purpose: 'guidance' })).toBe(true);
  });
});

describe('Personal Wisdom Library — authorization SQL predicate', () => {
  // Back-compat: with no practitionerId the clause + params are exactly the prior predicate.
  it('omits the practitioner branch and is unchanged without a practitionerId', () => {
    const { clause, params, nextIndex } = authorizationPredicateSql({ viewerId: VIEWER, purpose: 'guidance' }, 1);
    expect(clause).not.toContain("s.scope = 'practitioner'");
    expect(params).toEqual([VIEWER, PURPOSE_MIN_RANK.guidance]);
    expect(nextIndex).toBe(3);
  });

  // With a practitionerId, emit a bound, ladder-free ownership+visibility branch.
  it('emits a bound, ladder-free practitioner branch when a practitionerId is present', () => {
    const { clause, params, nextIndex } = authorizationPredicateSql(
      { viewerId: VIEWER, practitionerId: PRACTITIONER, purpose: 'guidance' },
      1,
    );
    expect(clause).toContain("s.scope = 'practitioner'");
    expect(clause).toContain("s.owner_type = 'practitioner'");
    expect(clause).toContain('s.owner_id = $3');
    expect(clause).toContain("s.visibility IN ('private', 'shared', 'published')");
    expect(params).toEqual([VIEWER, PURPOSE_MIN_RANK.guidance, PRACTITIONER]);
    expect(nextIndex).toBe(4);
    // the practitioner branch carries no usage-authority gating
    const practitionerBranch = clause.slice(clause.indexOf("s.scope = 'practitioner'"));
    expect(practitionerBranch).not.toContain('usage_authority');
  });
});
