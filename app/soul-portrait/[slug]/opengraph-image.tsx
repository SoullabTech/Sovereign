import { ImageResponse } from 'next/og';
import { getPortrait, listPortraitSlugs } from '@/lib/soulPortrait/registry';
import { ogCard, accentForElement, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/ogCard';
import type { ElementKey } from '@/lib/soulPortrait/schema';

// Colocated file-based OG image. Next.js auto-injects this into the page's
// `openGraph.images` + `twitter.images`, so a shared portrait link shows the
// person's name — identifiable by whoever receives it — instead of the shared
// root Soullab card. Only the name is rendered; no inner portrait content
// leaves the card.

export const alt = 'A Spiralogic Soul Portrait';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Pre-render one card per known portrait; also satisfies the iOS static-export
// patch (routes under a dynamic segment need generateStaticParams).
export function generateStaticParams() {
  return listPortraitSlugs().map((slug) => ({ slug }));
}

/** First declared elemental accent — a visual signature, not a ranking. */
function accentSlug(portrait: ReturnType<typeof getPortrait>): ElementKey | null {
  if (portrait && 'elementalProfile' in portrait && portrait.elementalProfile?.length) {
    return portrait.elementalProfile[0].element;
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portrait = getPortrait(slug);

  // Name is derived from REGISTERED portrait data only — an unknown or
  // manufactured slug renders the generic title, never arbitrary URL text.
  // Minors get first-name-only in the preview to minimize what a link unfurl
  // exposes (the recipient already has full access via the link itself).
  const fullName = portrait?.person.name ?? 'Soul Portrait';
  const name = portrait?.person.isMinor ? fullName.split(' ')[0] : fullName;
  const accent = accentForElement(accentSlug(portrait));

  return new ImageResponse(
    ogCard({
      eyebrow: 'Soul Portrait',
      title: name,
      subtitle: 'A human-centered, symbolic reading — patterns to work with, never a prediction.',
      accent,
    }),
    { ...size },
  );
}
