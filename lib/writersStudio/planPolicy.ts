/**
 * Writer's Studio Free/Pro product inclusion.
 *
 * This is a product definition, not a purchase, public enrollment grant, Work
 * ownership decision, or release of independently held operations. During the
 * invitation-only beta, the existing server-side pilot authority receives the
 * approved Pro experience at no charge. A writer whose dated beta grant expired
 * or was revoked keeps the Free Studio (founder rulings 2026-11-13, #1800;
 * design #2263). Everyone else remains outside the Studio while the meaningful
 * Free product is preserved for later admission.
 *
 * Free never limits the writer's own Works or words (founder ruling 2026-11-13,
 * "meter MAIA instead"): `multiple_active_works` is Free. The Free/Pro line is
 * `writing.wholeWork` plus a metered MAIA reading allowance (not built yet).
 */
import type { WritersStudioStanding } from './betaAccessServer';

export type WriterStudioPlan = 'free' | 'pro';
export type WriterStudioPlanBasis =
  | 'active_beta_tester'
  | 'founder_witness'
  | 'dated_beta_grant'
  | 'grant_lapsed'
  | 'grant_revoked'
  | 'public_not_launched';

export type WriterStudioFeature =
  | 'author_owned_writing'
  | 'inspiration_compass'
  | 'basic_develop'
  | 'basic_review'
  | 'basic_maia'
  | 'author_controlled_edits'
  | 'author_owned_text_copy'
  | 'privacy_controls'
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
  author_owned_text_copy: { free: true, pro: true },
  privacy_controls: { free: true, pro: true },
  academy_foundations: { free: true, pro: true },
  advanced_develop: { free: false, pro: true },
  advanced_review: { free: false, pro: true },
  whole_work_continuity: { free: false, pro: true },
  multiple_active_works: { free: true, pro: true },
  expanded_maia: { free: false, pro: true },
  advanced_academy: { free: false, pro: true },
  listen: { free: false, pro: true },
  publish_preparation: { free: false, pro: true },
};

export const WRITER_ALWAYS_PROTECTED = [
  'author_owned_writing',
  'author_controlled_edits',
  'author_owned_text_copy',
  'privacy_controls',
] as const satisfies readonly WriterStudioFeature[];

/**
 * These operations remain governed by their own release, custody, consent and
 * recovery decisions. Plan inclusion must never imply that they are available.
 */
export const WRITER_INDEPENDENT_RELEASE_HOLDS = [
  'new_original_file_ingest',
  'member_pdf_epub_delivery',
  'live_provider_inference',
  'deletion_safe_recovery',
  'cloud_offline_sync',
  'automatic_publisher_submission',
] as const;

export type WriterStudioPlanDecision = Readonly<{
  plan: WriterStudioPlan;
  basis: WriterStudioPlanBasis;
  /** May this member be in the Studio corridor. Admission reads this, never `plan`. */
  admitted: boolean;
  /** Holds complimentary beta Pro (active pilot, dated grant, or founder witness). */
  pilotEligible: boolean;
  /** Dated beta Pro: when it runs out. */
  expiresAt?: string;
  /** Free after a dated grant: when the grant ended (null if not recorded). */
  endedAt?: string | null;
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
  standing: WritersStudioStanding,
): WriterStudioPlanDecision {
  if (standing.admitted && standing.plan === 'pro') {
    return {
      plan: 'pro',
      basis: standing.basis,
      admitted: true,
      pilotEligible: true,
      ...(standing.basis === 'dated_beta_grant' ? { expiresAt: standing.expiresAt } : {}),
      complimentary: true,
      publicEnrollmentEnabled: false,
      paymentEnabled: false,
      included: includedFor('pro'),
    };
  }
  if (standing.admitted && standing.plan === 'free') {
    return {
      plan: 'free',
      basis: standing.basis,
      admitted: true,
      pilotEligible: false,
      endedAt: standing.endedAt,
      complimentary: false,
      publicEnrollmentEnabled: false,
      paymentEnabled: false,
      included: includedFor('free'),
    };
  }
  return {
    plan: 'free',
    basis: 'public_not_launched',
    admitted: false,
    pilotEligible: false,
    complimentary: false,
    publicEnrollmentEnabled: false,
    paymentEnabled: false,
    included: includedFor('free'),
  };
}
