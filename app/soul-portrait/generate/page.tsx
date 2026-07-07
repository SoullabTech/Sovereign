import type { Metadata } from 'next';
import { GeneratePortraitForm } from '@/components/soulPortrait/GeneratePortraitForm';

/**
 * Practitioner-only generate surface — /soul-portrait/generate
 *
 * Auth-gated by config/accessMatrix.ts ({ prefix: '/soul-portrait/', minTier: 'free' }).
 * The generate API enforces owner = the authenticated member. Produces a DRAFT for
 * private preview + in-session use. Not a client path; publishes nothing.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Generate a Soul Portrait',
};

export default function GeneratePortraitPage() {
  return <GeneratePortraitForm />;
}
