/**
 * WS-TIERS-R1 — Writer's Studio product inclusion model.
 *
 * This describes what Free/Pro should include. It does NOT open feature flags,
 * confer ownership of a Work, bypass independent R20 holds, establish a paid
 * purchase, or authorize public enrollment. Server-side operations must keep
 * their own authenticated membership, Work ownership and release checks.
 */
import type { WritersStudioBetaAccess } from './betaAccessServer';

export type WriterStudioPlan = 'free' | 'pro';
export type WriterStudioPlanBasis =
  | 'active_beta_tester'
  | 'founder_witness'
  | 'public_not_launched';

export type WriterStudioFeature =
  | 'author_owned_writing'
  | 'inspiration_compass'
  | 'basic_develop'
  | 'basic_review'
  | 'basic_maia'
  | 'author_controlled_edits'
  | 'essential_export'
  | 'privacy_and_deletion'
  | 'academy_foundations'
  | 'advanced_develop'
  | 'advanced_review'
  | 'whole_work_continuity'
  | 'multiple_active_works'
  | 'expanded_maia'
  | 'advanced_academy'
  | 'listen'
  | 'publish_preparation';

export const WRITER_STUDIO_FEATURE_INCLUSION: Readonly<
  Record<WriterStudioFeature, Readonly<{ free: boolean; pro: boolean }>>
> = {
  author_owned_writing: { free: true, pro: true },
  inspiration_compass: { free: true, pro: true },
  basic_develop: { free: true, pro: true },
  basic_review: { free: true, pro: true },
  basic_maia: { free: true, pro: true },
  author_controlled_edits: { free: true, pro: true },
  essential_export: { free: true, pro: true },
  privacy_and_deletion: { free: true, pro: true },
  academy_foundations: { free: true, pro: true },
  advanced_develop: { free: false, pro: true },
  advanced_review: { free: false, pro: true },
  whole_work_continuity: { free: false, pro: true },
  multiple_active_works: { free: false, pro: true },
  expanded_maia: { free: false, pro: true },
  advanced_academy: { free: false, pro: true },
  listen: { free: false, pro: true },
  publish_preparation: { free: false, pro: true },
};

/** Core author rights are available without a subscription, even after downgrade. */
export const WRITER_ALWAYS_PROTECTED = [
  'author_owned_writing',
  'author_controlled_edits',
  'essential_export',
  'privacy_and_deletion',
] as const satisfies readonly WriterStudioFeature[];

/** Separate release authorities can keep these unavailable for every plan. */
export const WRITER_INDEPENDENT_RELEASE_HOLDS = [
  'new_original_file_ingest',
  'member_pdf_epub_delivery',
  'cloud_offline_sync',
  'automatic_publisher_submission',
] as const;

/** Price exploration only; no checkout, invoice, renewal or paid grant created. */
export const WRITER_STUDIO_PRICE_PROPOSAL = {
  proMonthlyUsd: 19,
  proAnnualUsd: 180,
  paymentEnabled: false,
  publicEnrollmentEnabled: false,
  verifiedPaidProResolverEnabled: false,
} as const;

export type WriterStudioPlanDecision = Readonly<{
  plan: WriterStudioPlan;
  basis: WriterStudioPlanBasis;
  /** Eligibility from the existing private small-beta authority, not a new grant. */
  pilotEligible: boolean;
  complimentary: boolean;
  publicEnrollmentEnabled: false;
  paymentEnabled: false;
  /** Feature inclusion ONLY, not a claim that the gated feature is operable. */
  included: Readonly<Record<WriterStudioFeature, boolean>>;
}>;

function includedFor(plan: WriterStudioPlan): Record<WriterStudioFeature, boolean> {
  return Object.fromEntries(
    (Object.keys(WRITER_STUDIO_FEATURE_INCLUSION) as WriterStudioFeature[])
      .map((key) => [key, WRITER_STUDIO_FEATURE_INCLUSION[key][plan]]),
  ) as Record<WriterStudioFeature, boolean>;
}

/**
 * An invited and server-confirmed pilot writer receives the whole Pro product
 * inclusion set at no charge. No beta query parameter, generic 'tester' bit,
 * general Soullab subscription, or client-controlled role can call this grant.
 *
 * Until independent public admission, every other member sees only the
 * informational Free inclusion proposal; that does not open the Studio.
 */
export function decideWriterStudioPlan(
  pilot: WritersStudioBetaAccess,
): WriterStudioPlanDecision {
  if (pilot.eligible) {
    return {
      plan: 'pro',
      basis: pilot.basis,
      pilotEligible: true,
      complimentary: true,
      publicEnrollmentEnabled: false,
      paymentEnabled: false,
      included: includedFor('pro'),
    };
  }
  return {
    plan: 'free',
    basis: 'public_not_launched',
    pilotEligible: false,
    complimentary: false,
    publicEnrollmentEnabled: false,
    paymentEnabled: false,
    included: includedFor('free'),
  };
}
