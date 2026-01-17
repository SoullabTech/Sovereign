/**
 * Practitioner Portal Home Page
 *
 * The main landing page for a practitioner's branded astrology portal.
 * Accessed via subdomain (loralee.soullab.life) or custom domain.
 */

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  getPractitionerBySlug,
  getPractitionerByDomain,
  getPractitionerTheme,
  getAICompanionConfig,
} from '@/lib/practitioner/practitionerService';
import type { PractitionerProfile } from '@/lib/practitioner/types';
import PortalHomeClient from './PortalHomeClient';

interface PortalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PortalHomePage({ params }: PortalPageProps) {
  const { slug } = await params;
  const headersList = await headers();

  // Check if this is a custom domain request
  const practitionerSlug = headersList.get('x-practitioner-slug');
  const isCustomDomain = headersList.get('x-practitioner-custom-domain') === 'true';

  // Resolve practitioner
  let practitioner: PractitionerProfile | null = null;

  if (isCustomDomain && practitionerSlug) {
    // Look up by custom domain
    practitioner = await getPractitionerByDomain(practitionerSlug);
  } else if (slug && slug !== 'custom') {
    // Look up by subdomain/slug
    practitioner = await getPractitionerBySlug(slug);
  }

  if (!practitioner) {
    notFound();
  }

  // Check if portal is active
  if (practitioner.status !== 'active' && practitioner.status !== 'building') {
    notFound();
  }

  // Get theme and AI config
  const [theme, aiConfig] = await Promise.all([
    getPractitionerTheme(practitioner.id),
    getAICompanionConfig(practitioner.id),
  ]);

  return (
    <PortalHomeClient
      practitioner={practitioner}
      theme={theme}
      aiConfig={aiConfig}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PortalPageProps) {
  const { slug } = await params;
  const practitioner = await getPractitionerBySlug(slug);

  if (!practitioner) {
    return {
      title: 'Portal Not Found',
    };
  }

  const aiConfig = await getAICompanionConfig(practitioner.id);

  return {
    title: practitioner.businessName || practitioner.name,
    description: practitioner.tagline || `${practitioner.name}'s Astrology Practice`,
    openGraph: {
      title: practitioner.businessName || practitioner.name,
      description: practitioner.tagline,
      type: 'website',
    },
  };
}
