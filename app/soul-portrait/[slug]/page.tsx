import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPortrait, listPortraitSlugs } from '@/lib/soulPortrait/registry';
import { SoulPortraitRenderer } from '@/components/soulPortrait/SoulPortraitRenderer';

/**
 * Spiralogic Soul Portrait — /soul-portrait/[slug]
 *
 * Template-driven today (slug → static SoulPortrait via the registry), and
 * ready to become generator-driven without touching this route. Portraits are
 * unlisted and marked noindex: they may describe minors and must not be
 * broadly reachable. A multi-user version must add auth/consent gating.
 */

export function generateStaticParams() {
  return listPortraitSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const portrait = getPortrait(slug);
  if (!portrait) return { title: 'Soul Portrait' };
  return {
    title: `${portrait.person.name} — A Spiralogic Soul Portrait`,
    description:
      'A human-centered, symbolic soul portrait — patterns to work with, never a prediction.',
    robots: { index: false, follow: false },
  };
}

export default async function SoulPortraitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portrait = getPortrait(slug);
  if (!portrait) notFound();
  return <SoulPortraitRenderer portrait={portrait} />;
}
