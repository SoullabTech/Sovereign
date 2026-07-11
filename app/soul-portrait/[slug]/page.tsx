import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPortrait, listPortraitSlugs } from '@/lib/soulPortrait/registry';
import { SoulPortraitRenderer } from '@/components/soulPortrait/SoulPortraitRenderer';
import { ReturnToSoullab } from '@/components/soulPortrait/ReturnToSoullab';

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
  const title = `${portrait.person.name} — A Spiralogic Soul Portrait`;
  const description =
    'A human-centered, symbolic soul portrait — patterns to work with, never a prediction.';
  // openGraph/twitter text so the share card reads as this portrait, not the
  // inherited root Soullab card. The card image itself is supplied by the
  // colocated opengraph-image.tsx, which Next.js injects automatically.
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
    twitter: { card: 'summary_large_image', title, description },
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
  return (
    <>
      <SoulPortraitRenderer portrait={portrait} />
      {/* Gift-only, member-only coda: a quiet door home for someone who already has
          a Soullab account. Non-members (and non-gift portraits) see nothing — the
          gift stays finished. A link, not a binding: no MAIA / memory / Path B. */}
      {portrait.offeredBy && <ReturnToSoullab />}
    </>
  );
}
