import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProAstrologyExperience from './ProAstrologyExperience';

/**
 * Explicitly opt-in isolated preview, not an entitlement or a public Pro tier.
 * Disabled by default, even if this branch were accidentally included in a build.
 * Real production access will require separate entitlement and privacy gates.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Astrology Pro · Relational Observatory Preview · Soullab',
  description: 'A member-authored, chart-first exploration of celestial and symbolic relationships. Private development preview.',
  robots: { index: false, follow: false },
};

export default function AstrologyProPreviewPage() {
  if (process.env.ASTRO_PRO_PREVIEW_ENABLED !== 'true') {
    notFound();
  }
  return <ProAstrologyExperience />;
}
