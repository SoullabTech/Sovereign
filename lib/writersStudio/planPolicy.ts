/**
 * Writer's Studio Free/Pro product inclusion.
 *
 * This is a product definition, not a purchase, public enrollment grant, Work
 * ownership decision, or release of independently held operations. During the
 * invitation-only beta, the existing server-side pilot authority receives the
 * approved Pro experience at no charge; everyone else remains outside the
 * Studio while the meaningful Free product is preserved for later admission.
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

export const WRITER_ALWAYS_PROTECTED = [
  'author_owned_writing',
  'author_controlled_edits',
  'essential_export',
  'privacy_and_deletion',
] as const satisfies readonly WriterStudioFeature[];

/** These remain governed by their own release and custody decisions. */
export const WRITER_INDEPENDENT_RELEASE_HOLDS = [
  'new_original_file_ingest',
  'member_pdf_epub_delivery',
  'cloud_offline_sync',
  'automatic_publisher_submission',
] as const;

export type WriterStudioPlanDecision = Readonly<{
  plan: WriterStudioPlan;
  basis: WriterStudioPlanBasis;
  pilotEligible: boolean;
  complimentary: boolean;
  publicEnrollmentEnabled: false;
  paymentEnabled: false;
  included: Readonly<Record<WriterStudioFeature, boolean>>;
}>;

function includedFor(plan: WriterStudioPlan): Record<WriterStudioFeature, boolean> {
  return Object.fromEntries(
    (Object.keys(WRITER_STUDIO_FEATURE_INCLUSION) as WriterStudioFeature[])
      .map((feature) => [feature, WRITER_STUDIO_FEATURE_INCLUSION[feature][plan]]),
  ) as Record<WriterStudioFeature, boolean>;
}

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
