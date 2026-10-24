import {
  decideWriterStudioPlan,
  WRITER_ALWAYS_PROTECTED,
  WRITER_INDEPENDENT_RELEASE_HOLDS,
  WRITER_STUDIO_FEATURE_INCLUSION,
  WRITER_STUDIO_PRICE_PROPOSAL,
} from '../planPolicy';

describe('WS-TIERS-R1: Free, Pro and complimentary beta', () => {
  const outsider = decideWriterStudioPlan({ eligible: false, basis: 'no_founder_approval' });
  const beta = decideWriterStudioPlan({ eligible: true, basis: 'founder_approved_beta', grantId: '11111111-1111-4111-8111-111111111111' });
  const founder = decideWriterStudioPlan({ eligible: true, basis: 'founder_witness' });

  it('grants all proposed Pro inclusions to the existing approved beta authority for free', () => {
    expect(beta).toMatchObject({
      plan: 'pro', basis: 'founder_approved_beta',
      pilotEligible: true, complimentary: true,
      paymentEnabled: false, publicEnrollmentEnabled: false,
    });
    expect(Object.values(beta.included).every(Boolean)).toBe(true);
  });

  it('preserves founder witness without treating the founder as an active beta tester', () => {
    expect(founder).toMatchObject({ plan: 'pro', basis: 'founder_witness', complimentary: true });
  });

  it('does not give unrelated accounts a Pro grant or open public enrollment', () => {
    expect(outsider).toMatchObject({
      plan: 'free', basis: 'public_not_launched',
      pilotEligible: false, complimentary: false,
      paymentEnabled: false, publicEnrollmentEnabled: false,
    });
    expect(outsider.included.advanced_develop).toBe(false);
    expect(outsider.included.expanded_maia).toBe(false);
    expect(outsider.included.inspiration_compass).toBe(true);
  });

  it('keeps core author rights in Free and Pro', () => {
    for (const feature of WRITER_ALWAYS_PROTECTED) {
      expect(WRITER_STUDIO_FEATURE_INCLUSION[feature]).toEqual({ free: true, pro: true });
    }
  });

  it('keeps advanced features as Pro inclusion without authorizing a held operation', () => {
    expect(WRITER_INDEPENDENT_RELEASE_HOLDS).toContain('new_original_file_ingest');
    expect(WRITER_INDEPENDENT_RELEASE_HOLDS).toContain('member_pdf_epub_delivery');
    expect(WRITER_STUDIO_PRICE_PROPOSAL.paymentEnabled).toBe(false);
    expect(WRITER_STUDIO_PRICE_PROPOSAL.verifiedPaidProResolverEnabled).toBe(false);
  });

  it('does not allow plan mutations to alter the canonical inclusion table', () => {
    (beta.included as Record<string, boolean>).advanced_review = false;
    expect(WRITER_STUDIO_FEATURE_INCLUSION.advanced_review.pro).toBe(true);
    expect(decideWriterStudioPlan({ eligible: true, basis: 'founder_approved_beta', grantId: '11111111-1111-4111-8111-111111111111' }).included.advanced_review).toBe(true);
  });
});
