import {
  decideWriterStudioPlan,
  WRITER_ALWAYS_PROTECTED,
  WRITER_INDEPENDENT_RELEASE_HOLDS,
  WRITER_STUDIO_FEATURE_INCLUSION,
} from '../planPolicy';

describe('Writer Studio Free/Pro product policy', () => {
  const outsider = decideWriterStudioPlan({ eligible: false, basis: 'not_in_pilot' });
  const beta = decideWriterStudioPlan({ eligible: true, basis: 'active_beta_tester' });
  const founder = decideWriterStudioPlan({ eligible: true, basis: 'founder_witness' });

  it('grants the full approved Pro inclusion set to an active pilot at no charge', () => {
    expect(beta).toMatchObject({
      plan: 'pro',
      basis: 'active_beta_tester',
      pilotEligible: true,
      complimentary: true,
      paymentEnabled: false,
      publicEnrollmentEnabled: false,
    });
    expect(Object.values(beta.included).every(Boolean)).toBe(true);
  });

  it('preserves founder witness without calling it beta enrollment', () => {
    expect(founder).toMatchObject({
      plan: 'pro', basis: 'founder_witness', pilotEligible: true, complimentary: true,
    });
  });

  it('keeps the meaningful Free product defined without opening public enrollment', () => {
    expect(outsider).toMatchObject({
      plan: 'free',
      basis: 'public_not_launched',
      pilotEligible: false,
      complimentary: false,
      paymentEnabled: false,
      publicEnrollmentEnabled: false,
    });
    expect(outsider.included.author_owned_writing).toBe(true);
    expect(outsider.included.basic_develop).toBe(true);
    expect(outsider.included.advanced_develop).toBe(false);
    expect(outsider.included.expanded_maia).toBe(false);
  });

  it('protects author rights in both plans', () => {
    for (const feature of WRITER_ALWAYS_PROTECTED) {
      expect(WRITER_STUDIO_FEATURE_INCLUSION[feature]).toEqual({ free: true, pro: true });
    }
  });

  it('does not let a plan decision release independently held operations', () => {
    expect(WRITER_INDEPENDENT_RELEASE_HOLDS).toEqual(expect.arrayContaining([
      'new_original_file_ingest',
      'member_pdf_epub_delivery',
      'cloud_offline_sync',
      'automatic_publisher_submission',
    ]));
  });

  it('returns fresh inclusion objects so callers cannot mutate policy', () => {
    (beta.included as Record<string, boolean>).advanced_review = false;
    expect(decideWriterStudioPlan({ eligible: true, basis: 'active_beta_tester' })
      .included.advanced_review).toBe(true);
  });
});
